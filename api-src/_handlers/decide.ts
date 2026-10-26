/**
 * Vercel serverless: POST /api/decide
 * Porta do Jev — decisão calibrada (modo manual seguro sem chave).
 * Segurança: rate limit + quota diária (o Jev é pago) e erros seguros.
 * O campo `error` do resultado é sanitizado: o detalhe cru do upstream
 * (até 300 chars) não sai para o cliente — fica só o facto de a decisão
 * ter caído para revisão manual.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth } from "@pink-logic/api/services/auth.js";
import { DecideRequestSchema } from "@pink-logic/shared";
import { decide } from "@pink-logic/api/services/jev-decider.js";
import { generationLimiter, dailyQuota, rateLimitKey, enforceRateLimit } from "@pink-logic/api/services/rate-limit.js";
import { toPublicError } from "@pink-logic/api/services/http-errors.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Só POST" });
  const auth = await requireAuth(req, res);
  if (!auth) return;
  if (!enforceRateLimit(generationLimiter, rateLimitKey(auth), res)) return;
  if (!enforceRateLimit(dailyQuota, rateLimitKey(auth), res)) return;
  const parsed = DecideRequestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const result = await decide(parsed.data);
    res.status(200).json({
      ...result,
      error: result.error ? "Decisão indisponível; revisão manual necessária." : undefined,
    });
  } catch (err: any) {
    const pub = toPublicError(err);
    res.status(pub.status).json({ error: pub.message });
  }
}
