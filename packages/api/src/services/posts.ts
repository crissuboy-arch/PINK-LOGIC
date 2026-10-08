/**
 * Posts (scheduled_posts) — CRUD + agendamento + publicação real.
 *
 * Usa a MESMA tabela que o site usa (Fase 2): um post criado pela Athena
 * aparece no Calendário do site, e vice-versa. Escreve com a service_role
 * (ignora RLS), por isso TODA filtragem por dono é feita aqui, à mão —
 * nunca confiar só na política do banco neste caminho.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { AuthContext } from "./auth.js";
import type { ScheduledPostCreate, ScheduledPostUpdate, ScheduledPostListQuery } from "@pink-logic/shared";
import { publishToPlatforms } from "./meta-graph.js";
import { approvePost } from "./jev-decider.js";

function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

let adminClient: SupabaseClient | null = null;
function admin(): SupabaseClient {
  if (adminClient) return adminClient;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw httpError(503, "Falta SUPABASE_SERVICE_ROLE_KEY nas variáveis de ambiente da Vercel.");
  adminClient = createClient(url, key, { auth: { persistSession: false } });
  return adminClient;
}

/** Dono efetivo da operação: o utilizador logado, ou — para a Athena/MCP — o dono configurado. */
async function resolveOwnerId(auth: AuthContext): Promise<string> {
  if (auth.kind === "user") return auth.userId;
  const ownerId = process.env.PINK_LOGIC_OWNER_USER_ID || "";
  if (!ownerId) {
    throw httpError(
      503,
      "PINK_LOGIC_OWNER_USER_ID não configurado — a Athena não sabe em nome de quem criar o post. " +
        "Defina-o com o UUID da sua conta (Supabase → Authentication → Users)."
    );
  }
  return ownerId;
}

/** Projeto alvo: o indicado (se for do dono), ou o primeiro projeto do dono. */
async function resolveProjectId(ownerId: string, projectId?: string): Promise<string> {
  const db = admin();
  if (projectId) {
    const { data, error } = await db.from("projects").select("id").eq("id", projectId).eq("user_id", ownerId).maybeSingle();
    if (error) throw httpError(500, "Falha ao validar o projeto: " + error.message);
    if (!data) throw httpError(404, "Projeto não encontrado (ou não pertence a esta conta).");
    return data.id;
  }
  const { data, error } = await db
    .from("projects")
    .select("id")
    .eq("user_id", ownerId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw httpError(500, "Falha ao procurar um projeto: " + error.message);
  if (!data) throw httpError(422, "Esta conta ainda não tem nenhum projeto — crie um no site antes de criar posts.");
  return data.id;
}

function rowToApi(row: any) {
  return {
    id: row.id,
    projectId: row.project_id,
    brandId: row.brand_id,
    campaignId: row.campaign_id,
    title: row.title,
    caption: row.caption,
    hashtags: row.hashtags || [],
    mediaUrl: row.media_url,
    aspectRatio: row.aspect_ratio,
    platforms: row.platforms || [],
    scheduledAt: row.scheduled_at,
    status: row.status,
    source: row.source,
    errorMessage: row.error_message,
    igMediaId: row.ig_media_id,
    fbPostId: row.fb_post_id,
    publishResults: row.publish_results,
    decision: row.decision,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createPost(auth: AuthContext, input: ScheduledPostCreate) {
  const ownerId = await resolveOwnerId(auth);
  const projectId = await resolveProjectId(ownerId, input.projectId);

  // Porta do Jev: só para posts criados pela Athena/MCP (um humano no site já revê
  // o que escreve antes de agendar). Reprovado → fica rascunho, nunca agenda sozinho.
  let status = input.scheduledAt ? "agendado" : "rascunho";
  let decision = input.decision ?? null;
  if (auth.kind === "service" && input.scheduledAt && !input.decision) {
    const result = await approvePost({ caption: input.caption, hashtags: input.hashtags, imageUrl: input.mediaUrl });
    decision = result as any;
    if (!result.passed) status = "rascunho";
  }

  const { data, error } = await admin()
    .from("scheduled_posts")
    .insert({
      user_id: ownerId,
      project_id: projectId,
      brand_id: input.brandId ?? null,
      campaign_id: input.campaignId ?? null,
      title: input.title,
      caption: input.caption,
      hashtags: input.hashtags ?? [],
      media_url: input.mediaUrl ?? null,
      aspect_ratio: input.aspectRatio ?? null,
      platforms: input.platforms,
      scheduled_at: input.scheduledAt ?? null,
      status,
      source: auth.kind === "service" ? "mcp" : "web",
      decision,
    })
    .select()
    .single();
  if (error) throw httpError(500, "Falha ao criar o post: " + error.message);
  return rowToApi(data);
}

export async function listPosts(auth: AuthContext, query: ScheduledPostListQuery) {
  const ownerId = await resolveOwnerId(auth);
  let q = admin().from("scheduled_posts").select("*").eq("user_id", ownerId).order("scheduled_at", { ascending: true }).limit(query.limit);
  if (query.status) q = q.eq("status", query.status);
  if (query.projectId) q = q.eq("project_id", query.projectId);
  if (query.from) q = q.gte("scheduled_at", query.from);
  if (query.to) q = q.lte("scheduled_at", query.to);
  const { data, error } = await q;
  if (error) throw httpError(500, "Falha ao listar posts: " + error.message);
  return (data || []).map(rowToApi);
}

async function getOwnedPost(ownerId: string, id: string) {
  const { data, error } = await admin().from("scheduled_posts").select("*").eq("id", id).eq("user_id", ownerId).maybeSingle();
  if (error) throw httpError(500, "Falha ao procurar o post: " + error.message);
  if (!data) throw httpError(404, "Post não encontrado.");
  return data;
}

export async function getPost(auth: AuthContext, id: string) {
  const ownerId = await resolveOwnerId(auth);
  return rowToApi(await getOwnedPost(ownerId, id));
}

export async function updatePost(auth: AuthContext, id: string, input: ScheduledPostUpdate) {
  const ownerId = await resolveOwnerId(auth);
  await getOwnedPost(ownerId, id); // 404 cedo se não for dela
  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) patch.title = input.title;
  if (input.caption !== undefined) patch.caption = input.caption;
  if (input.hashtags !== undefined) patch.hashtags = input.hashtags;
  if (input.mediaUrl !== undefined) patch.media_url = input.mediaUrl;
  if (input.aspectRatio !== undefined) patch.aspect_ratio = input.aspectRatio;
  if (input.platforms !== undefined) patch.platforms = input.platforms;
  if (input.scheduledAt !== undefined) patch.scheduled_at = input.scheduledAt;
  if (input.status !== undefined) patch.status = input.status;
  if (input.brandId !== undefined) patch.brand_id = input.brandId;
  if (input.campaignId !== undefined) patch.campaign_id = input.campaignId;
  const { data, error } = await admin().from("scheduled_posts").update(patch).eq("id", id).select().single();
  if (error) throw httpError(500, "Falha ao atualizar o post: " + error.message);
  return rowToApi(data);
}

export async function deletePost(auth: AuthContext, id: string) {
  const ownerId = await resolveOwnerId(auth);
  await getOwnedPost(ownerId, id);
  const { error } = await admin().from("scheduled_posts").delete().eq("id", id);
  if (error) throw httpError(500, "Falha ao apagar o post: " + error.message);
}

export async function schedulePost(auth: AuthContext, id: string, scheduledAt: string) {
  return updatePost(auth, id, { scheduledAt, status: "agendado" } as ScheduledPostUpdate);
}

/** Publica um post agora (chamada direta, fora do cron). Marca publicando→publicado|falhou. */
export async function publishPostNow(auth: AuthContext, id: string) {
  const ownerId = await resolveOwnerId(auth);
  const post = await getOwnedPost(ownerId, id);
  return publishRow(post);
}

/** Núcleo da publicação, partilhado pelo publishPostNow e pelo cron. */
async function publishRow(post: any) {
  const db = admin();
  await db.from("scheduled_posts").update({ status: "publicando" }).eq("id", post.id);

  const results = await publishToPlatforms(post.platforms || [], {
    imageUrl: post.media_url || undefined,
    caption: [post.caption, ...(post.hashtags || [])].filter(Boolean).join("\n\n"),
  });
  const allOk = Object.values(results).every((r: any) => r.ok);
  const anyOk = Object.values(results).some((r: any) => r.ok);
  // Publicou em pelo menos uma rede → "publicado" (o erro das outras fica em error_message).
  // Só vira "falhou" quando NENHUMA rede aceitou o post.
  const status = anyOk ? "publicado" : "falhou";
  const errorMessage = allOk
    ? null
    : Object.entries(results)
        .filter(([, r]: any) => !r.ok)
        .map(([k, r]: any) => `${k}: ${r.error}`)
        .join(" | ");

  const { data, error } = await db
    .from("scheduled_posts")
    .update({
      status,
      error_message: errorMessage,
      published_at: anyOk ? new Date().toISOString() : null,
      ig_media_id: (results as any).instagram?.id ?? null,
      fb_post_id: (results as any).facebook?.id ?? null,
      publish_results: results,
    })
    .eq("id", post.id)
    .select()
    .single();
  if (error) throw httpError(500, "Publicou mas falhou ao gravar o resultado: " + error.message);
  return rowToApi(data);
}

/** Chamado pelo cron: publica todos os agendados vencidos. "Reivindica" cada um antes de
 *  publicar (UPDATE condicional) para duas execuções do cron não publicarem o mesmo post 2x. */
export async function publishDuePosts(nowIso = new Date().toISOString()) {
  const db = admin();
  const { data: due, error } = await db
    .from("scheduled_posts")
    .select("id")
    .eq("status", "agendado")
    .lte("scheduled_at", nowIso)
    .limit(25);
  if (error) throw httpError(500, "Falha ao procurar posts agendados: " + error.message);

  const outcomes: { id: string; status: string; error?: string }[] = [];
  for (const { id } of due || []) {
    // Reivindica: só segue se ainda estiver 'agendado' (evita corrida com outra execução).
    const { data: claimed } = await db
      .from("scheduled_posts")
      .update({ status: "publicando" })
      .eq("id", id)
      .eq("status", "agendado")
      .select()
      .maybeSingle();
    if (!claimed) continue; // outra execução já pegou este post
    try {
      const result = await publishRow(claimed);
      outcomes.push({ id, status: result.status });
    } catch (e: any) {
      await db.from("scheduled_posts").update({ status: "falhou", error_message: e.message }).eq("id", id);
      outcomes.push({ id, status: "falhou", error: e.message });
    }
  }
  return outcomes;
}
