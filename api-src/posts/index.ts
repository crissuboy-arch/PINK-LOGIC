/**
 * Vercel serverless: GET/POST /api/posts
 * Lista ou cria posts na mesma tabela (scheduled_posts) que o site usa.
 * Segurança (branch fix/pink-logic-seguranca-achados-1-5): rate limit por
 * chamador e erros seguros (sem detalhe interno no cliente).
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth } from "@pink-logic/api/services/auth.js";
import { ScheduledPostCreateSchema, ScheduledPostListQuerySchema } from "@pink-logic/shared";
import { createPost, listPosts } from "@pink-logic/api/services/posts.js";
import { generalLimiter, rateLimitKey, enforceRateLimit } from "@pink-logic/api/services/rate-limit.js";
import { toPublicError } from "@pink-logic/api/services/http-errors.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = await requireAuth(req, res);
  if (!auth) return;
  if (!enforceRateLimit(generalLimiter, rateLimitKey(auth), res)) return;

  try {
    if (req.method === "GET") {
      const parsed = ScheduledPostListQuerySchema.safeParse(req.query);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
      return res.status(200).json({ posts: await listPosts(auth, parsed.data) });
    }
    if (req.method === "POST") {
      const parsed = ScheduledPostCreateSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
      return res.status(201).json({ post: await createPost(auth, parsed.data) });
    }
    return res.status(405).json({ error: "Só GET ou POST" });
  } catch (err: any) {
    const pub = toPublicError(err);
    res.status(pub.status).json({ error: pub.message });
  }
}
