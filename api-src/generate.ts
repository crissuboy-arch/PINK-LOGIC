/**
 * Vercel serverless: POST /api/generate
 * Motores reais do PINK-LOGIC (logo/sticker/qrcode grátis, copy via AIsa).
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GenerateRequestSchema } from "@pink-logic/shared";
import { generate } from "@pink-logic/api/services/generate.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Só POST" });
  const parsed = GenerateRequestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    res.status(200).json(await generate(parsed.data.module, parsed.data.prompt, parsed.data.options));
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message });
  }
}
