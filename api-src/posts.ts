/**
 * Vercel serverless: POST /api/posts
 * Cria post passando pela porta do Jev, persiste em pl_posts.
 * Precisa de SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY nas env vars.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth } from "@pink-logic/api/services/auth.js";
import { PostSchema } from "@pink-logic/shared";
import { approvePost } from "@pink-logic/api/services/jev-decider.js";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Só POST" });
  const auth = await requireAuth(req, res);
  if (!auth) return;
  const parsed = PostSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const decision = await approvePost(parsed.data as any);
  const status = decision.passed ? "SCHEDULED" : "PENDING_REVIEW";

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return res.status(501).json({
      error: "Falta SUPABASE_SERVICE_ROLE_KEY nas env vars da Vercel.",
      contract: { ...parsed.data, status, decision },
    });
  }

  try {
    const supabase = createClient(url, serviceKey);
    const { data, error } = await supabase
      .from("pl_posts")
      .insert({
        caption: parsed.data.caption,
        image_url: (parsed.data as any).imageUrl ?? null,
        hashtags: (parsed.data as any).hashtags ?? [],
        status,
        decision: decision as any,
        // Dono do post: o utilizador logado (a Athena/serviço cria sem dono por enquanto)
        user_id: auth.kind === "user" ? auth.userId : null,
      })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ post: data, decision });
  } catch (err: any) {
    res.status(500).json({ error: "Falha ao gravar post: " + err.message, decision });
  }
}
