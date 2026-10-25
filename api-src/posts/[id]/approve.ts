/**
 * Vercel serverless: POST /api/posts/:id/approve
 * Aprovação humana (correção Achado 1): só a proprietária aprova, e só
 * rascunhos/agendados. É este registo (approved_by/approved_at) que
 * destrava a publicação direta e o cron. Sem aprovação = bloqueado.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth } from "@pink-logic/api/services/auth.js";
import { approvePostHuman } from "@pink-logic/api/services/posts.js";
import { toPublicError } from "@pink-logic/api/services/http-errors.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Só POST" });
  const auth = await requireAuth(req, res);
  if (!auth) return;
  const id = String(req.query.id || "");
  try {
    res.status(200).json({ post: await approvePostHuman(auth, id) });
  } catch (err: any) {
    const pub = toPublicError(err);
    res.status(pub.status).json({ error: pub.message });
  }
}
