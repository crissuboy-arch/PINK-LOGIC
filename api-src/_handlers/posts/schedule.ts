/**
 * Handler POST /api/posts/:id/schedule — servido pelo
 * front-controller api/router (não é função direta; vive em _handlers/).
 * Código INTACTO da consolidação Opção B.
 * Body: { scheduledAt: string (ISO datetime) }
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { requireAuth } from "@pink-logic/api/services/auth.js";
import { schedulePost } from "@pink-logic/api/services/posts.js";

const BodySchema = z.object({ scheduledAt: z.string().datetime() });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Só POST" });
  const auth = await requireAuth(req, res);
  if (!auth) return;
  const id = String(req.query.id || "");
  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    res.status(200).json({ post: await schedulePost(auth, id, parsed.data.scheduledAt) });
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message });
  }
}
