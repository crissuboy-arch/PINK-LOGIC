/**
 * Vercel serverless: GET /api/cron/publish
 * Chamado pelo Vercel Cron (vercel.json). Publica os posts agendados
 * vencidos DA PROPRIETÁRIA COM APROVAÇÃO HUMANA (ver publishDuePosts).
 * Protegido por CRON_SECRET em tempo constante (cron-auth.ts) — a
 * comparação anterior com `!==` era vulnerável a timing attack.
 * Sem CRON_SECRET configurado, o endpoint recusa tudo (seguro por omissão).
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { publishDuePosts } from "@pink-logic/api/services/posts.js";
import { isCronSecretValid } from "@pink-logic/api/services/cron-auth.js";
import { toPublicError } from "@pink-logic/api/services/http-errors.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return res.status(503).json({ error: "CRON_SECRET não configurado." });
  if (!isCronSecretValid(req.headers.authorization, secret)) return res.status(401).json({ error: "Não autorizado." });

  try {
    const outcomes = await publishDuePosts();
    res.status(200).json({ ok: true, processed: outcomes.length, outcomes });
  } catch (err: any) {
    const pub = toPublicError(err);
    res.status(pub.status).json({ error: pub.message });
  }
}
