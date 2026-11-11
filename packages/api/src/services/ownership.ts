/**
 * Propriedade (owner) — quem pode publicar ou agendar nas páginas da dona.
 *
 * Não existe um sistema de papéis (roles) no servidor: o "admin" é a
 * proprietária, identificada por PINK_LOGIC_OWNER_USER_ID (o UUID da conta
 * dela no Supabase Auth — o mesmo env que a Athena/MCP já usa para saber
 * em nome de quem criar posts).
 *
 * Regra fail-closed: sem o env configurado, NINGUÉM publica ou agenda
 * (nem a própria dona, até o env estar definido). Nunca permitir por omissão.
 */
import type { AuthContext } from "./auth.js";

function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

/** UUID da proprietária, ou null se não configurado. */
export function getOwnerUserId(): string | null {
  const id = (process.env.PINK_LOGIC_OWNER_USER_ID || "").trim();
  return id || null;
}

/**
 * Verdadeiro só para a proprietária.
 * - service (chave Athena/MCP): age em nome do dono configurado;
 *   sem dono configurado, não é dono de ninguém.
 * - chatgpt (chave do GPT): NUNCA é dona — permissões mínimas por
 *   desenho (só rascunhos/leitura/geração); agendar, aprovar, publicar
 *   e apagar passam sempre pelo requireOwner e dão 403.
 * - user (sessão Supabase): só se o userId for o dono configurado.
 */
export function isOwner(auth: AuthContext): boolean {
  const ownerId = getOwnerUserId();
  if (!ownerId) return false;
  if (auth.kind === "service") return true;
  if (auth.kind === "chatgpt") return false;
  return auth.userId === ownerId;
}

/**
 * Exige a proprietária. Lança 503 se o dono não estiver configurado
 * (fail-closed, visível nos logs) e 403 se o chamador não for o dono.
 * Devolve o UUID do dono para filtrar queries.
 */
export function requireOwner(auth: AuthContext): string {
  // A chave do ChatGPT é barrada ANTES de qualquer outra verificação
  // (403 determinístico, mesmo sem dono configurado no servidor).
  if (auth.kind === "chatgpt") {
    throw httpError(403, "A chave do ChatGPT não pode aprovar, agendar nem publicar — faz isso no site.");
  }
  const ownerId = getOwnerUserId();
  if (!ownerId) {
    throw httpError(
      503,
      "PINK_LOGIC_OWNER_USER_ID não configurado — publicação e agendamento estão bloqueados até definir a proprietária."
    );
  }
  if (!isOwner(auth)) {
    throw httpError(403, "Só a proprietária pode publicar ou agendar nas páginas partilhadas.");
  }
  return ownerId;
}
