/**
 * Rate limiting por chamador (janela deslizante em memória).
 *
 * Limitação honesta: em serverless cada instância tem a sua memória, por
 * isso o limite é por instância (melhor esforço), não global. O passo
 * seguinte para um limite global é um contador no Redis/Supabase — ver o
 * relatório de segurança. Mesmo assim, o limite trava abusos de uma só
 * conta numa só instância e é totalmente testável.
 */
import type { AuthContext } from "./auth.js";

export class RateLimiter {
  private hits = new Map<string, number[]>();

  constructor(
    private max: number,
    private windowMs: number
  ) {}

  check(key: string, now = Date.now()): { allowed: boolean; retryAfterSec: number } {
    const cutoff = now - this.windowMs;
    const arr = (this.hits.get(key) || []).filter((t) => t > cutoff);
    if (arr.length >= this.max) {
      this.hits.set(key, arr);
      const retryAfterSec = Math.max(1, Math.ceil((arr[0] + this.windowMs - now) / 1000));
      return { allowed: false, retryAfterSec };
    }
    arr.push(now);
    this.hits.set(key, arr);
    return { allowed: true, retryAfterSec: 0 };
  }

  reset(): void {
    this.hits.clear();
  }
}

/** 60 pedidos/min por chamador — rotas gerais (posts, leitura). */
export const generalLimiter = new RateLimiter(60, 60_000);
/** 30 pedidos/min por chamador — geração e decisão (CPU / pagos). */
export const generationLimiter = new RateLimiter(30, 60_000);
/** 200 gerações/decisões/coleções por dia por chamador — teto de custo. */
export const dailyQuota = new RateLimiter(200, 24 * 60 * 60_000);

export function rateLimitKey(auth: AuthContext): string {
  // Balde próprio por chamador: a chave do ChatGPT não come a quota da
  // Athena (nem vice-versa); utilizadores limitados por userId.
  if (auth.kind === "service") return "service";
  if (auth.kind === "chatgpt") return "chatgpt";
  return `user:${auth.userId}`;
}

/**
 * Aplica um limite; se excedido, responde 429 e devolve false.
 * `res` pode ser resposta Vercel ou Express (ambas têm status().json()).
 */
export function enforceRateLimit(
  limiter: RateLimiter,
  key: string,
  res: { status: (code: number) => { json: (body: unknown) => unknown } }
): boolean {
  const r = limiter.check(key);
  if (r.allowed) return true;
  res.status(429).json({ error: "Demasiados pedidos. Tente novamente mais tarde.", retryAfterSec: r.retryAfterSec });
  return false;
}
