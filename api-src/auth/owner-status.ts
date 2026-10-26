/**
 * Vercel serverless: GET /api/auth/owner-status
 * Devolve apenas se a sessão de QUEM CHAMA é da proprietária:
 * `{ isOwner: boolean }`.
 *
 * Não revela o UUID do dono nem nenhum segredo — só diz se o próprio
 * chamador é o dono. Usado pela UI para mostrar/esconder o botão de
 * aprovação humana. A decisão real continua no servidor: o endpoint de
 * aprovação (approvePostHuman) impõe o dono via requireOwner, e esconder
 * o botão nunca substitui essa validação.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth } from "@pink-logic/api/services/auth.js";
import { isOwner } from "@pink-logic/api/services/ownership.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Só GET" });
  const auth = await requireAuth(req, res);
  if (!auth) return;
  res.status(200).json({ isOwner: isOwner(auth) });
}
