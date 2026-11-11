/**
 * Âmbito de dono/projeto — partilhado pelos serviços da API.
 *
 * Extraído de posts.ts (mesma lógica, sem tocar nesse ficheiro): a API
 * escreve com a service_role (ignora RLS), por isso TODA a filtragem por
 * dono é feita aqui, à mão — nunca confiar só na política do banco.
 * Usado pelas rotas novas do ChatGPT (brands, campaigns, media/import).
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { AuthContext } from "./auth.js";

function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

let adminClient: SupabaseClient | null = null;

/** Cliente service_role (ignora RLS). Falha 503 sem as envs. */
export function admin(): SupabaseClient {
  if (adminClient) return adminClient;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw httpError(503, "Falta SUPABASE_SERVICE_ROLE_KEY nas variáveis de ambiente da Vercel.");
  adminClient = createClient(url, key, { auth: { persistSession: false } });
  return adminClient;
}

/** Dono efetivo da operação: o utilizador logado, ou — para chaves de
 *  serviço (Athena/MCP, ChatGPT) — o dono configurado. */
export async function resolveOwnerId(auth: AuthContext): Promise<string> {
  if (auth.kind === "user") return auth.userId;
  const ownerId = process.env.PINK_LOGIC_OWNER_USER_ID || "";
  if (!ownerId) {
    throw httpError(
      503,
      "PINK_LOGIC_OWNER_USER_ID não configurado — as chaves de serviço não sabem em nome de quem operar. " +
        "Defina-o com o UUID da sua conta (Supabase → Authentication → Users)."
    );
  }
  return ownerId;
}

/** Projeto alvo: o indicado (se for do dono), ou o primeiro projeto do dono. */
export async function resolveProjectId(ownerId: string, projectId?: string): Promise<string> {
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
  if (!data) throw httpError(422, "Esta conta ainda não tem nenhum projeto — crie um no site antes de continuar.");
  return data.id;
}

/** Todos os projetos do dono (para filtrar marcas/campanhas, que só têm project_id). */
export async function ownerProjectIds(ownerId: string): Promise<string[]> {
  const { data, error } = await admin().from("projects").select("id").eq("user_id", ownerId);
  if (error) throw httpError(500, "Falha ao procurar projetos.");
  return (data ?? []).map((p: { id: string }) => p.id);
}
