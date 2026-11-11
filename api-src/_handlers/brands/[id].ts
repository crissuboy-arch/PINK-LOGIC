/**
 * Handler GET /api/brands/:id — servido pelo front-controller api/router.
 * Lê um Brand Kit do dono (404 se não existir ou não for da conta).
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth } from "@pink-logic/api/services/auth.js";
import { getBrand } from "@pink-logic/api/services/brands.js";
import { generalLimiter, rateLimitKey, enforceRateLimit } from "@pink-logic/api/services/rate-limit.js";
import { toPublicError } from "@pink-logic/api/services/http-errors.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = await requireAuth(req, res);
  if (!auth) return;
  if (!enforceRateLimit(generalLimiter, rateLimitKey(auth), res)) return;
  if (req.method !== "GET") return res.status(405).json({ error: "Só GET" });
  const id = String(req.query.id || "");
  try {
    res.status(200).json({ brand: await getBrand(auth, id) });
  } catch (err: any) {
    const pub = toPublicError(err);
    res.status(pub.status).json({ error: pub.message });
  }
}
