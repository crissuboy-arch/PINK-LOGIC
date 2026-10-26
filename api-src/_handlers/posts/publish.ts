/**
 * Handler POST /api/posts/:id/publish — servido pelo
 * front-controller api/router (não é função direta; vive em _handlers/).
 * Código INTACTO da consolidação Opção B.
 * Publica imediatamente (fora do cron) no Instagram e/ou Facebook, conforme
 * `platforms` do post. Desde a correção de segurança: SÓ a proprietária,
 * SÓ posts agendados COM aprovação humana (ver publishPostNow). Sem
 * META_PAGE_ACCESS_TOKEN configurado, falha com um erro claro — nunca
 * finge que publicou.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth } from "@pink-logic/api/services/auth.js";
import { publishPostNow } from "@pink-logic/api/services/posts.js";
import { toPublicError } from "@pink-logic/api/services/http-errors.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Só POST" });
  const auth = await requireAuth(req, res);
  if (!auth) return;
  const id = String(req.query.id || "");
  try {
    res.status(200).json({ post: await publishPostNow(auth, id) });
  } catch (err: any) {
    const pub = toPublicError(err);
    res.status(pub.status).json({ error: pub.message });
  }
}
