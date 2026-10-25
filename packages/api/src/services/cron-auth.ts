/**
 * Autenticação do cron em tempo constante.
 *
 * Antes: `req.headers.authorization !== `Bearer ${secret}`` — comparação
 * com `!==`, vulnerável a timing attack. Agora: compara digests SHA-256
 * de tamanho fixo com timingSafeEqual (o mesmo padrão de auth.ts e stats.ts).
 */
import { createHash, timingSafeEqual } from "node:crypto";

const sha256 = (s: string) => createHash("sha256").update(s).digest();

/** Verdadeiro só se o header for exatamente `Bearer <secret>`. */
export function isCronSecretValid(authorization: string | string[] | undefined, secret: string): boolean {
  if (!secret) return false;
  const header = Array.isArray(authorization) ? authorization[0] : authorization;
  if (!header) return false;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  if (!match) return false;
  const provided = match[1].trim();
  // timingSafeEqual exige o mesmo tamanho: compara digests (sempre 32 bytes).
  return timingSafeEqual(sha256(provided), sha256(secret));
}
