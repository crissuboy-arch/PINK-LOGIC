/**
 * Vercel serverless: GET /api/integrations/stats (autenticado, só leitura)
 *
 * Integração Pink Logic ↔ Athena Control — contrato v1.
 * Mesmo padrão da integração VitrinePro ↔ Athena.
 *
 * Autenticação: Authorization: Bearer <PINKLOGIC_ATHENA_API_KEY>
 * (chave EXCLUSIVA da Pink Logic — nunca reutilizar a da VitrinePro).
 * Configurar como env var na Vercel (Production).
 *
 * Devolve APENAS agregados reais do banco. Indicadores sem tabela
 * correspondente vêm a null e são listados em `unavailable` — nunca
 * se inventam dados, tabelas, métricas ou números.
 * Zero PII: nenhum email, user_id, caption ou texto de erro é exposto.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { createHash, timingSafeEqual } from "node:crypto";

export const PLATFORM = "PinkLogic";
export const CONTRACT = "v1";
/** Nome da env var com a chave exclusiva desta integração. */
export const API_KEY_ENV = "PINKLOGIC_ATHENA_API_KEY";

const POST_STATUSES = [
  "DRAFT",
  "PENDING_REVIEW",
  "SCHEDULED",
  "PUBLISHING",
  "PUBLISHED",
  "FAILED",
] as const;

export interface Deps {
  env: Record<string, string | undefined>;
  makeClient: (url: string, key: string) => any;
}

function unauthorized(res: VercelResponse) {
  return res.status(401).json({ error: "Não autorizado." });
}

/** Comparação em tempo constante para não vazar a chave por timing. */
export function bearerMatches(header: string | undefined, expected: string): boolean {
  if (!header || !expected) return false;
  const m = /^Bearer\s+(.+)$/i.exec(header.trim());
  if (!m) return false;
  const a = createHash("sha256").update(m[1]).digest();
  const b = createHash("sha256").update(expected).digest();
  return a.length === b.length && timingSafeEqual(a, b);
}

async function countUsers(supabase: any): Promise<number | null> {
  try {
    let total = 0;
    let page = 1;
    const perPage = 1000;
    for (;;) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
      if (error) return null;
      const users = data?.users ?? [];
      total += users.length;
      if (users.length < perPage) break;
      page += 1;
    }
    return total;
  } catch {
    return null;
  }
}

async function countByStatus(supabase: any): Promise<Record<string, number> | null> {
  try {
    const out: Record<string, number> = {};
    for (const s of POST_STATUSES) {
      const { count, error } = await supabase
        .from("pl_posts")
        .select("id", { count: "exact", head: true })
        .eq("status", s);
      if (error) return null;
      out[s.toLowerCase()] = count ?? 0;
    }
    return out;
  } catch {
    return null;
  }
}

/** Núcleo testável: recebe o cliente Supabase e devolve os agregados. */
export async function collectStats(supabase: any) {
  const [usersTotal, byStatus] = await Promise.all([countUsers(supabase), countByStatus(supabase)]);

  const postsTotal = byStatus ? Object.values(byStatus).reduce((a, b) => a + b, 0) : null;

  return {
    platform: PLATFORM,
    contract: CONTRACT,
    users: usersTotal === null ? null : { total: usersTotal },
    posts:
      byStatus === null
        ? null
        : {
            total: postsTotal,
            draft: byStatus.draft,
            pending_review: byStatus.pending_review,
            scheduled: byStatus.scheduled,
            publishing: byStatus.publishing,
            published: byStatus.published,
            failed: byStatus.failed,
          },
    // Sem tabela de assinaturas/planos no banco — informado, não inventado.
    subscriptions: null,
    // Sem tabela de utilização das funcionalidades de IA — informado, não inventado.
    ai_usage: null,
    errors: byStatus === null ? null : { failed_posts: byStatus.failed },
    unavailable: ["subscriptions", "ai_usage"],
    notes: {
      subscriptions: "Sem tabela de assinaturas/planos no banco.",
      ai_usage: "Sem registo de utilização das funcionalidades de IA no banco.",
    },
  };
}

export function createHandler(deps: Deps) {
  return async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "GET") return res.status(405).json({ error: "Só GET." });

    const expected = deps.env[API_KEY_ENV];
    if (!expected) {
      return res.status(503).json({ error: "Integração não configurada." });
    }
    const header = Array.isArray(req.headers.authorization)
      ? req.headers.authorization[0]
      : req.headers.authorization;
    if (!bearerMatches(header, expected)) return unauthorized(res);

    const url = deps.env.SUPABASE_URL;
    const serviceKey = deps.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      return res.status(503).json({ error: "Banco de dados não configurado." });
    }

    try {
      const supabase = deps.makeClient(url, serviceKey);
      const stats = await collectStats(supabase);
      return res.status(200).json(stats);
    } catch {
      return res.status(500).json({ error: "Falha ao consultar os indicadores." });
    }
  };
}

export default createHandler({
  env: process.env as Record<string, string | undefined>,
  makeClient: (url: string, key: string) => createClient(url, key),
});
