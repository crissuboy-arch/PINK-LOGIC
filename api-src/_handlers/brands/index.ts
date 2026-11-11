/**
 * Handler GET/POST /api/brands — servido pelo front-controller api/router.
 * Lista ou cria Brand Kits (tabela `brands`) do dono. Mesmo padrão de
 * /api/posts: auth + rate limit + schema zod + erros seguros.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth } from "@pink-logic/api/services/auth.js";
import { BrandCreateSchema, BrandListQuerySchema } from "@pink-logic/shared";
import { createBrand, listBrands } from "@pink-logic/api/services/brands.js";
import { generalLimiter, rateLimitKey, enforceRateLimit } from "@pink-logic/api/services/rate-limit.js";
import { toPublicError } from "@pink-logic/api/services/http-errors.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = await requireAuth(req, res);
  if (!auth) return;
  if (!enforceRateLimit(generalLimiter, rateLimitKey(auth), res)) return;

  try {
    if (req.method === "GET") {
      const parsed = BrandListQuerySchema.safeParse(req.query);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
      return res.status(200).json({ brands: await listBrands(auth, parsed.data) });
    }
    if (req.method === "POST") {
      const parsed = BrandCreateSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
      return res.status(201).json({ brand: await createBrand(auth, parsed.data) });
    }
    return res.status(405).json({ error: "Só GET ou POST" });
  } catch (err: any) {
    const pub = toPublicError(err);
    res.status(pub.status).json({ error: pub.message });
  }
}
