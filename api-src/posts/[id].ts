/**
 * Vercel serverless: GET/PATCH/DELETE /api/posts/:id
 * Erros seguros (sem detalhe interno no cliente).
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth } from "@pink-logic/api/services/auth.js";
import { ScheduledPostUpdateSchema } from "@pink-logic/shared";
import { getPost, updatePost, deletePost } from "@pink-logic/api/services/posts.js";
import { toPublicError } from "@pink-logic/api/services/http-errors.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = await requireAuth(req, res);
  if (!auth) return;
  const id = String(req.query.id || "");
  if (!id) return res.status(400).json({ error: "id em falta" });

  try {
    if (req.method === "GET") return res.status(200).json({ post: await getPost(auth, id) });
    if (req.method === "PATCH") {
      const parsed = ScheduledPostUpdateSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
      return res.status(200).json({ post: await updatePost(auth, id, parsed.data) });
    }
    if (req.method === "DELETE") {
      await deletePost(auth, id);
      return res.status(204).end();
    }
    return res.status(405).json({ error: "Só GET, PATCH ou DELETE" });
  } catch (err: any) {
    const pub = toPublicError(err);
    res.status(pub.status).json({ error: pub.message });
  }
}
