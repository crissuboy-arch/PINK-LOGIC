/**
 * Vercel serverless: GET /api/cron/publish
 * Chamado pelo Vercel Cron (vercel.json). Publica os posts agendados
 * vencidos. Protegido por CRON_SECRET — a Vercel envia automaticamente
 * `Authorization: Bearer $CRON_SECRET` nas chamadas de cron quando essa
 * variável existe; sem ela configurada, o endpoint recusa tudo (seguro
 * por omissão, nunca aberto por acidente).
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { publishDuePosts } from "@pink-logic/api/services/posts.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return res.status(503).json({ error: "CRON_SECRET não configurado." });
  if (req.headers.authorization !== `Bearer ${secret}`) return res.status(401).json({ error: "Não autorizado." });

  try {
    const outcomes = await publishDuePosts();
    res.status(200).json({ ok: true, processed: outcomes.length, outcomes });
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message });
  }
}
