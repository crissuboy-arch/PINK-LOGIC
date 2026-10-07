/**
 * Vercel serverless: POST /api/posts
 * Cria post passando pela porta do Jev.
 * Precisa da tabela pl_posts (migration) para persistir.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { PostSchema } from "../packages/shared/dist/index.js";
import { approvePost } from "../packages/api/dist/services/jev-decider.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Só POST" });
  const parsed = PostSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const decision = await approvePost(parsed.data as any);
  const status = decision.passed ? "SCHEDULED" : "PENDING_REVIEW";

  res.status(501).json({
    error: "Tabela `pl_posts` ainda não existe — aplica a migration no Supabase.",
    contract: { ...parsed.data, status, decision },
  });
}
