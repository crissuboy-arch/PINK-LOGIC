/**
 * Handler POST /api/media/import — servido pelo front-controller api/router.
 * Importa uma imagem de uma URL pública (ex.: link temporário que o
 * ChatGPT entrega nas Actions) para o Supabase Storage e devolve a URL
 * pública. Só POST (405 antes da auth, como approve/publish).
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth } from "@pink-logic/api/services/auth.js";
import { MediaImportRequestSchema } from "@pink-logic/shared";
import { importMedia } from "@pink-logic/api/services/media.js";
import { generalLimiter, rateLimitKey, enforceRateLimit } from "@pink-logic/api/services/rate-limit.js";
import { toPublicError } from "@pink-logic/api/services/http-errors.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Só POST" });
  const auth = await requireAuth(req, res);
  if (!auth) return;
  if (!enforceRateLimit(generalLimiter, rateLimitKey(auth), res)) return;
  const parsed = MediaImportRequestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    res.status(200).json(await importMedia(auth, parsed.data));
  } catch (err: any) {
    const pub = toPublicError(err);
    res.status(pub.status).json({ error: pub.message });
  }
}
