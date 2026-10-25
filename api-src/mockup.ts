/**
 * Vercel serverless: POST /api/mockup
 * Gera um mockup (PNG 1080×1080) a partir de artwork + tipo.
 * Mesmos 9 tipos do Mockup Studio web. Render puro nos inputs → idempotente.
 * Segurança: rate limit por chamador, artwork com proteção SSRF
 * (fetchPublicImage) e erros seguros (sem detalhe interno).
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth } from "@pink-logic/api/services/auth.js";
import { MockupRequestSchema } from "@pink-logic/shared";
import { renderMockup, resolveArtwork } from "@pink-logic/api/services/mockup-render.js";
import { generationLimiter, rateLimitKey, enforceRateLimit } from "@pink-logic/api/services/rate-limit.js";
import { toPublicError } from "@pink-logic/api/services/http-errors.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Só POST" });
  const auth = await requireAuth(req, res);
  if (!auth) return;
  if (!enforceRateLimit(generationLimiter, rateLimitKey(auth), res)) return;
  const parsed = MockupRequestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "payload inválido", details: parsed.error.flatten() });

  try {
    const artwork = await resolveArtwork(parsed.data.artworkUrl);
    const png = await renderMockup({
      type: parsed.data.type,
      artworkUrl: artwork,
      projectName: parsed.data.projectName,
    });
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Length", png.length);
    res.setHeader("Cache-Control", "public, max-age=86400, immutable");
    return res.status(200).send(png);
  } catch (err: any) {
    const pub = toPublicError(err);
    return res.status(pub.status).json({ error: "falha ao gerar mockup", detail: pub.message, type: parsed.data.type });
  }
}
