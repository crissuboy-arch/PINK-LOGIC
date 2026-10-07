/**
 * Vercel serverless: POST /api/decide
 * Porta do Jev — decisão calibrada (modo manual seguro sem chave).
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { DecideRequestSchema } from "@pink-logic/shared";
import { decide } from "@pink-logic/api/services/jev-decider.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Só POST" });
  const parsed = DecideRequestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    res.status(200).json(await decide(parsed.data));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
