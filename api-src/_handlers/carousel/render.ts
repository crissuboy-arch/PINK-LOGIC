/**
 * Vercel serverless: POST /api/carousel/render
 * Renderer híbrido estilo "maestro" — devolve PNG 1080×1080.
 * Segurança: schema com tetos (antes sem schema nenhum), rate limit
 * por chamador e erros seguros.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth } from "@pink-logic/api/services/auth.js";
import { CarouselRenderSchema } from "@pink-logic/shared";
import { renderSlide, flattenCarouselItems } from "@pink-logic/api/services/carousel-render.js";
import { generationLimiter, rateLimitKey, enforceRateLimit } from "@pink-logic/api/services/rate-limit.js";
import { toPublicError } from "@pink-logic/api/services/http-errors.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Só POST" });
  const auth = await requireAuth(req, res);
  if (!auth) return;
  if (!enforceRateLimit(generationLimiter, rateLimitKey(auth), res)) return;
  const parsed = CarouselRenderSchema.safeParse(req.body || {});
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const png = await renderSlide({
      title: parsed.data.title,
      items: flattenCarouselItems(parsed.data.items),
      footer: parsed.data.footer,
      handle: parsed.data.handle || "",
      counter: parsed.data.counter || "",
    });
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Length", png.length);
    res.status(200).send(png);
  } catch (err: any) {
    const pub = toPublicError(err);
    res.status(pub.status).json({ error: pub.message });
  }
}
