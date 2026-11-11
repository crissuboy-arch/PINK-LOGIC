/**
 * Autenticação das rotas da API (Etapa 1).
 *
 * Aceita três tipos de credencial no header `Authorization: Bearer <token>`:
 *  - token de sessão do Supabase Auth (utilizador logado no site) → { kind: "user" }
 *  - PINK_LOGIC_SERVICE_KEY (Athena/MCP, servidor-a-servidor) → { kind: "service" }
 *  - PINK_LOGIC_CHATGPT_KEY (GPT privado do ChatGPT) → { kind: "chatgpt" }
 *
 * A chave do ChatGPT é DEDICADA e de permissões mínimas: cria rascunhos,
 * lê, gera e importa — mas NUNCA é dona (ver ownership.ts): não agenda,
 * não aprova, não publica, não apaga. Revoga-se apagando/rodando a env
 * na Vercel; a chave da Athena não é afetada.
 *
 * Fecha por omissão: sem credencial válida → 401; sem config no servidor → 503.
 */
import { createHash, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

export type AuthContext =
  | { kind: "user"; userId: string; email: string | null }
  | { kind: "service" }
  | { kind: "chatgpt" };

export type AuthResult =
  | { ok: true; ctx: AuthContext }
  | { ok: false; status: 401 | 503; error: string };

const sha256 = (s: string) => createHash("sha256").update(s).digest();

/** Primeira URL http(s) válida entre SUPABASE_URL e VITE_SUPABASE_URL (a do site, pública). */
function supabaseUrl(): string | null {
  for (const raw of [process.env.SUPABASE_URL, process.env.VITE_SUPABASE_URL]) {
    const v = (raw || "").trim();
    if (/^https?:\/\/\S+$/i.test(v)) return v;
  }
  return null;
}

/** Devolve o tipo de chave de serviço, ou null se o token não for nenhuma. */
function serviceKeyKind(token: string): "service" | "chatgpt" | null {
  // Cada chave vale por si (≥32 chars; ausente ou fraca nunca autentica).
  // Comparação em tempo constante por chave.
  const serviceKey = (process.env.PINK_LOGIC_SERVICE_KEY || "").trim();
  if (serviceKey.length >= 32 && timingSafeEqual(sha256(token), sha256(serviceKey))) return "service";
  const chatKey = (process.env.PINK_LOGIC_CHATGPT_KEY || "").trim();
  if (chatKey.length >= 32 && timingSafeEqual(sha256(token), sha256(chatKey))) return "chatgpt";
  return null;
}

export async function authenticate(authorization: string | undefined): Promise<AuthResult> {
  const match = /^Bearer\s+(.+)$/i.exec(authorization || "");
  const token = match?.[1]?.trim();
  if (!token) return { ok: false, status: 401, error: "Não autenticado: faça login." };

  const kind = serviceKeyKind(token);
  if (kind) return { ok: true, ctx: { kind } };

  const url = supabaseUrl();
  const anonKey = (process.env.SUPABASE_ANON_KEY || "").trim() || (process.env.VITE_SUPABASE_ANON_KEY || "").trim();
  if (!url || !anonKey) {
    return { ok: false, status: 503, error: "Autenticação não configurada no servidor." };
  }

  try {
    const supabase = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) return { ok: false, status: 401, error: "Sessão inválida ou expirada: faça login novamente." };
    return { ok: true, ctx: { kind: "user", userId: data.user.id, email: data.user.email ?? null } };
  } catch {
    return { ok: false, status: 503, error: "Não foi possível validar a sessão agora." };
  }
}

/** Helper para handlers Vercel/Express: responde o erro e devolve null se não autenticado. */
export async function requireAuth(
  req: { headers: Record<string, string | string[] | undefined> },
  res: { status: (code: number) => { json: (body: unknown) => unknown } }
): Promise<AuthContext | null> {
  const header = req.headers["authorization"];
  const result = await authenticate(Array.isArray(header) ? header[0] : header);
  if (!result.ok) {
    res.status(result.status).json({ error: result.error });
    return null;
  }
  return result.ctx;
}
