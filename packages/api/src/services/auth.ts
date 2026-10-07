/**
 * Autenticação das rotas da API (Etapa 1).
 *
 * Aceita dois tipos de credencial no header `Authorization: Bearer <token>`:
 *  - token de sessão do Supabase Auth (utilizador logado no site) → { kind: "user" }
 *  - PINK_LOGIC_SERVICE_KEY (Athena/MCP, servidor-a-servidor) → { kind: "service" }
 *
 * Fecha por omissão: sem credencial válida → 401; sem config no servidor → 503.
 */
import { createHash, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

export type AuthContext =
  | { kind: "user"; userId: string; email: string | null }
  | { kind: "service" };

export type AuthResult =
  | { ok: true; ctx: AuthContext }
  | { ok: false; status: 401 | 503; error: string };

const sha256 = (s: string) => createHash("sha256").update(s).digest();

function isServiceKey(token: string): boolean {
  const key = process.env.PINK_LOGIC_SERVICE_KEY || "";
  if (key.length < 32) return false; // chave ausente ou fraca nunca autentica
  // Compara digests (mesmo tamanho) em tempo constante.
  return timingSafeEqual(sha256(token), sha256(key));
}

export async function authenticate(authorization: string | undefined): Promise<AuthResult> {
  const match = /^Bearer\s+(.+)$/i.exec(authorization || "");
  const token = match?.[1]?.trim();
  if (!token) return { ok: false, status: 401, error: "Não autenticado: faça login." };

  if (isServiceKey(token)) return { ok: true, ctx: { kind: "service" } };

  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
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
