/**
 * Vercel serverless: POST /api/generate
 * Motores reais do PINK-LOGIC (logo/sticker/qrcode grátis, copy via AIsa).
 * Segurança: rate limit + quota diária por chamador (teto de custo) e
 * erros seguros. Nota: brandId do schema não é usado pelo motor atual —
 * a geração não escreve em marcas, por isso não há o que validar aqui.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth } from "@pink-logic/api/services/auth.js";
import { GenerateRequestSchema } from "@pink-logic/shared";
import { generate } from "@pink-logic/api/services/generate.js";
import { generationLimiter, dailyQuota, rateLimitKey, enforceRateLimit } from "@pink-logic/api/services/rate-limit.js";
import { toPublicError } from "@pink-logic/api/services/http-errors.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Só POST" });
  const auth = await requireAuth(req, res);
  if (!auth) return;
  if (!enforceRateLimit(generationLimiter, rateLimitKey(auth), res)) return;
  if (!enforceRateLimit(dailyQuota, rateLimitKey(auth), res)) return;
  const parsed = GenerateRequestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    res.status(200).json(await generate(parsed.data.module, parsed.data.prompt, parsed.data.options));
  } catch (err: any) {
    const pub = toPublicError(err);
    res.status(pub.status).json({ error: pub.message });
  }
}
