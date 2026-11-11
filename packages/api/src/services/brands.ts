/**
 * Brand Kit (tabela `brands`) — CRUD de leitura/criação para o ChatGPT.
 *
 * A tabela já existe (migrations 20260607000000 + 20261008113719) e o web
 * já a usa; o que faltava era a API. Marcas pertencem a projetos
 * (project_id); a propriedade é verificada via projects.user_id, porque
 * a tabela não tem user_id próprio (ver política RLS pl_brands_owner).
 */
import type { AuthContext } from "./auth.js";
import type { BrandCreate, BrandListQuery } from "@pink-logic/shared";
import { admin, resolveOwnerId, resolveProjectId, ownerProjectIds } from "./scope.js";

function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

function rowToApi(row: any) {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    colors: row.colors,
    fonts: row.fonts,
    hashtags: row.hashtags ?? [],
    cta: row.cta ?? "",
    tone: row.tone ?? "",
    style: row.style ?? "",
    overlays: row.overlays ?? [],
    logo: row.logo ?? null,
    avatar: row.avatar ?? null,
    secondaryColors: row.secondary_colors ?? [],
    socialLinks: row.social_links ?? {},
    brandDna: row.brand_dna ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listBrands(auth: AuthContext, query: BrandListQuery) {
  const ownerId = await resolveOwnerId(auth);
  const ids = await ownerProjectIds(ownerId);
  if (ids.length === 0) return [];
  let q = admin().from("brands").select("*").in("project_id", ids).order("created_at", { ascending: true }).limit(query.limit);
  if (query.projectId) {
    const projectId = await resolveProjectId(ownerId, query.projectId);
    q = q.eq("project_id", projectId);
  }
  const { data, error } = await q;
  if (error) throw httpError(500, "Falha ao listar marcas.");
  return (data ?? []).map(rowToApi);
}

export async function createBrand(auth: AuthContext, input: BrandCreate) {
  const ownerId = await resolveOwnerId(auth);
  const projectId = await resolveProjectId(ownerId, input.projectId);
  // Só os campos enviados (os restantes ficam com o default da tabela).
  const insert: Record<string, unknown> = { project_id: projectId, name: input.name };
  if (input.colors !== undefined) insert.colors = input.colors;
  if (input.fonts !== undefined) insert.fonts = input.fonts;
  if (input.hashtags !== undefined) insert.hashtags = input.hashtags;
  if (input.cta !== undefined) insert.cta = input.cta;
  if (input.tone !== undefined) insert.tone = input.tone;
  if (input.style !== undefined) insert.style = input.style;
  if (input.overlays !== undefined) insert.overlays = input.overlays;
  if (input.logo !== undefined) insert.logo = input.logo;
  if (input.avatar !== undefined) insert.avatar = input.avatar;
  if (input.secondary_colors !== undefined) insert.secondary_colors = input.secondary_colors;
  if (input.social_links !== undefined) insert.social_links = input.social_links;
  if (input.brand_dna !== undefined) insert.brand_dna = input.brand_dna;
  const { data, error } = await admin().from("brands").insert(insert).select().single();
  if (error) throw httpError(500, "Falha ao criar a marca.");
  return rowToApi(data);
}

export async function getBrand(auth: AuthContext, id: string) {
  const ownerId = await resolveOwnerId(auth);
  const ids = await ownerProjectIds(ownerId);
  if (ids.length === 0) throw httpError(404, "Marca não encontrada.");
  const { data, error } = await admin()
    .from("brands")
    .select("*")
    .eq("id", id)
    .in("project_id", ids)
    .maybeSingle();
  if (error) throw httpError(500, "Falha ao ler a marca.");
  if (!data) throw httpError(404, "Marca não encontrada.");
  return rowToApi(data);
}
