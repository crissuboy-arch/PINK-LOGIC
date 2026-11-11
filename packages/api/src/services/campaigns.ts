/**
 * Campanhas (tabela `campaigns`) — listagem/criação para o ChatGPT.
 * Mesmo padrão das marcas: a campanha pertence a um projeto do dono.
 */
import type { AuthContext } from "./auth.js";
import type { CampaignCreate, CampaignListQuery } from "@pink-logic/shared";
import { admin, resolveOwnerId, resolveProjectId, ownerProjectIds } from "./scope.js";

function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

function rowToApi(row: any) {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    mainProduct: row.main_product ?? null,
    secondaryProduct: row.secondary_product ?? null,
    message: row.message ?? null,
    status: row.status,
    goal: row.goal ?? null,
    cta: row.cta ?? null,
    startDate: row.start_date ?? null,
    linkedPostIds: row.linked_post_ids ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listCampaigns(auth: AuthContext, query: CampaignListQuery) {
  const ownerId = await resolveOwnerId(auth);
  const ids = await ownerProjectIds(ownerId);
  if (ids.length === 0) return [];
  let q = admin().from("campaigns").select("*").in("project_id", ids).order("created_at", { ascending: true }).limit(query.limit);
  if (query.projectId) {
    const projectId = await resolveProjectId(ownerId, query.projectId);
    q = q.eq("project_id", projectId);
  }
  const { data, error } = await q;
  if (error) throw httpError(500, "Falha ao listar campanhas.");
  return (data ?? []).map(rowToApi);
}

export async function createCampaign(auth: AuthContext, input: CampaignCreate) {
  const ownerId = await resolveOwnerId(auth);
  const projectId = await resolveProjectId(ownerId, input.projectId);
  const insert: Record<string, unknown> = { project_id: projectId, name: input.name };
  if (input.main_product !== undefined) insert.main_product = input.main_product;
  if (input.secondary_product !== undefined) insert.secondary_product = input.secondary_product;
  if (input.message !== undefined) insert.message = input.message;
  if (input.status !== undefined) insert.status = input.status;
  if (input.goal !== undefined) insert.goal = input.goal;
  if (input.cta !== undefined) insert.cta = input.cta;
  if (input.start_date !== undefined) insert.start_date = input.start_date;
  if (input.linked_post_ids !== undefined) insert.linked_post_ids = input.linked_post_ids;
  const { data, error } = await admin().from("campaigns").insert(insert).select().single();
  if (error) throw httpError(500, "Falha ao criar a campanha.");
  return rowToApi(data);
}
