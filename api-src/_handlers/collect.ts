/**
 * Vercel serverless: POST /api/collect
 * Coleta AIsa (trends, reels). Precisa de AISA_API_KEY.
 * Segurança: rate limit + quota diária (a coleta é paga) e erros seguros.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth } from "@pink-logic/api/services/auth.js";
import { CollectRequestSchema } from "@pink-logic/shared";
import { collect } from "@pink-logic/api/services/aisa.js";
import { generationLimiter, dailyQuota, rateLimitKey, enforceRateLimit } from "@pink-logic/api/services/rate-limit.js";
import { toPublicError } from "@pink-logic/api/services/http-errors.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Só POST" });
  const auth = await requireAuth(req, res);
  if (!auth) return;
  if (!enforceRateLimit(generationLimiter, rateLimitKey(auth), res)) return;
  if (!enforceRateLimit(dailyQuota, rateLimitKey(auth), res)) return;
  const parsed = CollectRequestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    res.status(200).json(await collect(parsed.data));
  } catch (err: any) {
    const pub = toPublicError(err);
    res.status(pub.status).json({ error: pub.message });
  }
}
