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
import { getOwnerUserId, isOwner, requireOwner } from "./ownership.js";

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
    if (error) throw httpError(500, "Falha ao validar o projeto.");
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
  if (error) throw httpError(500, "Falha ao procurar um projeto.");
  if (!data) throw httpError(422, "Esta conta ainda não tem nenhum projeto — crie um no site antes de criar posts.");
  return data.id;
}

/**
 * Validação de dono de marca/campanha (Achado 4): a marca e a campanha têm
 * de pertencer ao MESMO projeto do post — e o projeto já foi validado
 * como sendo do dono. Sem isto, um utilizador associava o seu post à
 * marca/campanha de outra conta.
 */
async function validateBrandAndCampaign(
  projectId: string,
  brandId?: string,
  campaignId?: string
): Promise<void> {
  const db = admin();
  if (brandId) {
    const { data, error } = await db.from("brands").select("id, project_id").eq("id", brandId).maybeSingle();
    if (error) throw httpError(500, "Falha ao validar a marca.");
    if (!data || data.project_id !== projectId) throw httpError(403, "Marca não pertence a este projeto.");
  }
  if (campaignId) {
    const { data, error } = await db.from("campaigns").select("id, project_id").eq("id", campaignId).maybeSingle();
    if (error) throw httpError(500, "Falha ao validar a campanha.");
    if (!data || data.project_id !== projectId) throw httpError(403, "Campanha não pertence a este projeto.");
  }
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
    // Aprovação humana (migration 20261025140000): null até a proprietária aprovar.
    approvedBy: row.approved_by ?? null,
    approvedAt: row.approved_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createPost(auth: AuthContext, input: ScheduledPostCreate) {
  const ownerId = await resolveOwnerId(auth);
  const projectId = await resolveProjectId(ownerId, input.projectId);
  await validateBrandAndCampaign(projectId, input.brandId, input.campaignId);

  // Porta do Jev — AGORA PARA TODOS (Achado 1): antes só corria para a
  // Athena/MCP, com o pretexto de que "um humano no site já revê". Com
  // registo aberto, esse pretexto é falso: qualquer conta auto-registada
  // agendava sem passar pelo Jev. Reprovado → rascunho, nunca agenda.
  // E agendar é exclusivo da proprietária: um não-dono que indique
  // scheduledAt fica com rascunho (só a dona agenda, ver updatePost).
  let status = input.scheduledAt ? "agendado" : "rascunho";
  let decision = input.decision ?? null;
  if (input.scheduledAt && !input.decision) {
    const result = await approvePost({ caption: input.caption, hashtags: input.hashtags, imageUrl: input.mediaUrl });
    // Nunca guardar detalhe cru do upstream na decisão (vai parar à API).
    decision = { ...result, error: result.error ? "Jev indisponível; revisão manual necessária." : undefined } as any;
    if (!result.passed) status = "rascunho";
  }
  if (status === "agendado" && auth.kind === "user" && !isOwner(auth)) status = "rascunho";

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
  if (error) throw httpError(500, "Falha ao criar o post.");
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
  if (error) throw httpError(500, "Falha ao listar posts.");
  return (data || []).map(rowToApi);
}

async function getOwnedPost(ownerId: string, id: string) {
  const { data, error } = await admin().from("scheduled_posts").select("*").eq("id", id).eq("user_id", ownerId).maybeSingle();
  if (error) throw httpError(500, "Falha ao procurar o post.");
  if (!data) throw httpError(404, "Post não encontrado.");
  return data;
}

export async function getPost(auth: AuthContext, id: string) {
  const ownerId = await resolveOwnerId(auth);
  return rowToApi(await getOwnedPost(ownerId, id));
}

export async function updatePost(auth: AuthContext, id: string, input: ScheduledPostUpdate) {
  const ownerId = await resolveOwnerId(auth);
  const current = await getOwnedPost(ownerId, id); // 404 cedo se não for dela
  // Agendar é exclusivo da proprietária (Achado 1): criar um "agendado"
  // ou mexer na data de um post já agendado exige ser a dona.
  if (input.status === "agendado" || (input.scheduledAt !== undefined && current.status === "agendado")) {
    requireOwner(auth);
  }
  await validateBrandAndCampaign(current.project_id, input.brandId, input.campaignId);
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
  // Filtro user_id repetido no UPDATE (Achado 4): o getOwnedPost prévio
  // não basta sozinho (TOCTOU); o UPDATE só toca linhas do próprio dono.
  const { data, error } = await admin().from("scheduled_posts").update(patch).eq("id", id).eq("user_id", ownerId).select().single();
  if (error) throw httpError(500, "Falha ao atualizar o post.");
  return rowToApi(data);
}

export async function deletePost(auth: AuthContext, id: string) {
  const ownerId = await resolveOwnerId(auth);
  await getOwnedPost(ownerId, id);
  const { error } = await admin().from("scheduled_posts").delete().eq("id", id).eq("user_id", ownerId);
  if (error) throw httpError(500, "Falha ao apagar o post.");
}

export async function schedulePost(auth: AuthContext, id: string, scheduledAt: string) {
  return updatePost(auth, id, { scheduledAt, status: "agendado" } as ScheduledPostUpdate);
}

/**
 * Porta de publicação (Achado 1 + item 2 da missão): NADA sai sem estas
 * três condições em simultâneo — é a regra que o cron também aplica.
 * - o post é da proprietária (user_id = dono configurado);
 * - está agendado (rascunhos nunca publicam diretamente);
 * - tem aprovação humana registada (approved_at);
 * - o Jev não o reprovou (se houver decisão).
 * Sem aprovação = bloqueado, nunca por omissão.
 */
export function canPublishPost(
  post: any,
  ownerId: string
): { ok: true } | { ok: false; error: string } {
  if (post.user_id !== ownerId) return { ok: false, error: "Só a proprietária pode publicar." };
  if (post.status !== "agendado") return { ok: false, error: "Só posts agendados podem ser publicados." };
  if (!post.approved_at) return { ok: false, error: "O post precisa de aprovação humana antes de publicar." };
  if (post.decision && post.decision.passed === false) return { ok: false, error: "O Jev reprovou este post." };
  return { ok: true };
}

/** Elegibilidade do cron (pura, testável): dono + agendado + aprovado + vencido. */
export function isCronEligible(post: any, ownerId: string, nowIso: string): boolean {
  return (
    post.user_id === ownerId &&
    post.status === "agendado" &&
    !!post.approved_at &&
    !!post.scheduled_at &&
    post.scheduled_at <= nowIso
  );
}

/**
 * Aprovação humana (item 2 da missão): só a proprietária aprova, e só
 * rascunhos/agendados. Regista quem aprovou e quando — é este registo
 * que destrava a publicação. Sem a migration de aprovação aplicada, a
 * coluna não existe e a chamada falha fechada (503), nunca aprova.
 */
export async function approvePostHuman(auth: AuthContext, id: string) {
  const ownerId = requireOwner(auth);
  const post = await getOwnedPost(ownerId, id);
  if (post.status !== "rascunho" && post.status !== "agendado") {
    throw httpError(409, "Só rascunhos ou agendados podem ser aprovados.");
  }
  const { data, error } = await admin()
    .from("scheduled_posts")
    .update({ approved_by: ownerId, approved_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", ownerId)
    .select()
    .single();
  if (error) {
    if (/approved_by|approved_at|column/i.test(error.message)) {
      throw httpError(503, "Aprovação humana ainda não configurada na base — aplique a migration de aprovação.");
    }
    throw httpError(500, "Falha ao registar a aprovação.");
  }
  return rowToApi(data);
}

/** Publica um post agora (chamada direta, fora do cron). Marca publicando→publicado|falhou. */
export async function publishPostNow(auth: AuthContext, id: string) {
  const ownerId = requireOwner(auth);
  const post = await getOwnedPost(ownerId, id);
  const gate = canPublishPost(post, ownerId);
  if (!gate.ok) throw httpError(409, gate.error);
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
  if (error) throw httpError(500, "Publicou mas falhou ao gravar o resultado.");
  return rowToApi(data);
}

/**
 * Chamado pelo cron: publica SÓ os agendados vencidos da proprietária COM
 * aprovação humana (Achado 1, variante automática). Antes publicava TODOS
 * os agendados vencidos sem filtro por utilizador — bastava um estranho
 * agendar para sair sozinho às 09:00.
 * Sem dono configurado, o cron não publica NADA (503, fail-closed).
 * "Reivindica" cada um antes de publicar (UPDATE condicional com os
 * mesmos filtros) para duas execuções não publicarem o mesmo post 2x e
 * para uma aprovação revogada a meio não vazar.
 */
export async function publishDuePosts(nowIso = new Date().toISOString()) {
  const ownerId = getOwnerUserId();
  if (!ownerId) {
    throw httpError(503, "PINK_LOGIC_OWNER_USER_ID não configurado — o cron não publica nada sem dono definido.");
  }
  const db = admin();
  const { data: due, error } = await db
    .from("scheduled_posts")
    .select("id")
    .eq("user_id", ownerId)
    .eq("status", "agendado")
    .not("approved_at", "is", null)
    .lte("scheduled_at", nowIso)
    .limit(25);
  if (error) {
    if (/approved_at|column/i.test(error.message)) {
      throw httpError(503, "Aprovação humana ainda não configurada na base — aplique a migration de aprovação.");
    }
    throw httpError(500, "Falha ao procurar posts agendados.");
  }

  const outcomes: { id: string; status: string }[] = [];
  for (const { id } of due || []) {
    // Reivindica: só segue se ainda estiver 'agendado' + aprovado + da dona.
    const { data: claimed } = await db
      .from("scheduled_posts")
      .update({ status: "publicando" })
      .eq("id", id)
      .eq("user_id", ownerId)
      .eq("status", "agendado")
      .not("approved_at", "is", null)
      .select()
      .maybeSingle();
    if (!claimed) continue; // outra execução já pegou este post, ou deixou de ser elegível
    try {
      const result = await publishRow(claimed);
      outcomes.push({ id, status: result.status });
    } catch (e: any) {
      // Detalhe só no log do servidor; a resposta do cron não vaza mensagens.
      console.error("[pink-logic] cron: falha ao publicar", id, e?.message || e);
      await db.from("scheduled_posts").update({ status: "falhou", error_message: "Falha na publicação." }).eq("id", id);
      outcomes.push({ id, status: "falhou" });
    }
  }
  return outcomes;
}
