/**
 * Vercel serverless: POST /api/collect
 * Coleta AIsa (trends, reels). Precisa de AISA_API_KEY.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { CollectRequestSchema } from "@pink-logic/shared";
import { collect } from "@pink-logic/api/services/aisa.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Só POST" });
  const parsed = CollectRequestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    res.status(200).json(await collect(parsed.data));
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message });
  }
}
