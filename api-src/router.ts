/**
 * Front-controller ÚNICO da API (plano Hobby: 1 função).
 *
 * MOTIVO (provado ao vivo, missões 26/10/2026): no router de funções
 * `api/` da Vercel, catch-all opcional `[[...all]]` E obrigatório
 * `[...all]` casam exatamente 1 segmento — rotas de 2 segmentos
 * (posts/:id/approve|publish|schedule) davam 404, e com ficheiros
 * explícitos a conta seria 15 funções > limite Hobby de 12. A solução
 * é UM router por trás de um rewrite no vercel.json:
 *   /api/:path* → /api/router?__path=:path*
 * Como só existe `api/router.js` em `api/`, não há conflito
 * filesystem-vs-rewrites: nenhum ficheiro sombreia o rewrite.
 * As rotas web NÃO são afetadas (o rewrite só casa /api/*; o fallback
 * SPA continua a excluir /api/).
 *
 * Os handlers originais NÃO mudaram — vivem em ./_handlers/ (o script
 * de bundle ignora diretórios com prefixo `_`) e o router só delega,
 * preservando método, auth, gates de dono/aprovação, códigos de erro
 * (401/403/409/503/405), rate limit e SSRF de cada rota:
 *  - posts (base): GET/POST, auth + rate limit geral;
 *  - posts/:id: GET/PATCH/DELETE, auth;
 *  - posts/:id/approve|publish|schedule: POST, 405 antes da auth;
 *  - integrations/health: pública, qualquer método;
 *  - integrations/stats: só GET, Bearer PINKLOGIC_ATHENA_API_KEY;
 *  - auth/owner-status: só GET, auth (devolve só { isOwner });
 *  - cron/publish: segredo CRON_SECRET em tempo constante (503 sem
 *    segredo, 401 com segredo errado) — a execução agendada do Vercel
 *    Cron (0 9 * * * UTC) resolve por este rewrite até ao handler;
 *  - health/ping: públicos, qualquer método;
 *  - collect/decide/generate/mockup/carousel/render: só POST.
 * Rotas desconhecidas → 404 JSON, como o 404 da Vercel antes.
 * Meta continua DESATIVADA (sem variáveis Meta, nada publica).
 *
 * Origem dos segmentos, por ordem (o rewrite passa o caminho em
 * `__path`; os fallbacks cobrem invocação direta, testes e vercel dev):
 *  1. req.query.__path (string, do rewrite);
 *  2. req.query.path (caso a Vercel passe o segmento capturado);
 *  3. req.query.all (compatibilidade estilo catch-all);
 *  4. pathname do req.url (a partir de /api/).
 * Os parâmetros de roteamento são removidos da query antes de delegar
 * (a rota base usa a query para filtros); posts/:id recebe query.id.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import postsIndex from "./_handlers/posts/index.js";
import postsDetail from "./_handlers/posts/[id].js";
import postsApprove from "./_handlers/posts/approve.js";
import postsPublish from "./_handlers/posts/publish.js";
import postsSchedule from "./_handlers/posts/schedule.js";
import integrationsHealth from "./_handlers/integrations/health.js";
import integrationsStats from "./_handlers/integrations/stats.js";
import ownerStatus from "./_handlers/auth/owner-status.js";
import cronPublish from "./_handlers/cron/publish.js";
import health from "./_handlers/health.js";
import ping from "./_handlers/ping.js";
import collect from "./_handlers/collect.js";
import decide from "./_handlers/decide.js";
import generate from "./_handlers/generate.js";
import mockup from "./_handlers/mockup.js";
import carouselRender from "./_handlers/carousel/render.js";

type Handler = (req: VercelRequest, res: VercelResponse) => unknown;

function decode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

function splitPath(v: string): string[] {
  return v
    .split("/")
    .map(decode)
    .filter((s) => s.length > 0);
}

/** Segmentos do caminho /api/... (ver cabeçalho para a ordem das fontes). */
export function segmentsOf(req: VercelRequest): string[] {
  const q = (req.query ?? {}) as Record<string, unknown>;
  if (typeof q.__path === "string") return splitPath(q.__path);
  if (typeof q.path === "string") return splitPath(q.path);
  const rawAll = q.all;
  if (Array.isArray(rawAll)) {
    const segs = rawAll.map(String).map(decode).filter((s) => s.length > 0);
    if (segs.length > 0) return segs;
  } else if (typeof rawAll === "string") {
    const segs = splitPath(rawAll);
    if (segs.length > 0) return segs;
  }
  try {
    const path = new URL(req.url || "", "http://localhost").pathname;
    const rest = path.replace(/^\/api\/?/, "");
    if (!rest || rest === "router") return [];
    return splitPath(rest);
  } catch {
    return [];
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const segments = segmentsOf(req);
  // Query sem os parâmetros de roteamento (a rota base usa-a para filtros).
  const query = { ...(req.query as Record<string, unknown>) };
  delete query.__path;
  delete query.path;
  delete query.all;
  const plain = () => {
    req.query = { ...query } as VercelRequest["query"];
  };
  const withId = (id: string) => {
    req.query = { ...query, id } as VercelRequest["query"];
  };

  const [first, second, third] = segments;

  // --- posts ------------------------------------------------------------
  if (first === "posts") {
    if (segments.length === 1) {
      plain();
      return postsIndex(req, res);
    }
    if (segments.length === 2) {
      withId(second);
      return postsDetail(req, res);
    }
    if (segments.length === 3) {
      withId(second);
      if (third === "approve") return postsApprove(req, res);
      if (third === "publish") return postsPublish(req, res);
      if (third === "schedule") return postsSchedule(req, res);
    }
    return res.status(404).json({ error: "Rota não encontrada." });
  }

  // --- integrations ------------------------------------------------------
  if (first === "integrations" && segments.length === 2) {
    plain();
    if (second === "health") return integrationsHealth(req, res);
    if (second === "stats") return integrationsStats(req, res);
  }

  // --- rotas de 2 segmentos ----------------------------------------------
  if (segments.length === 2) {
    plain();
    if (first === "auth" && second === "owner-status") return ownerStatus(req, res);
    if (first === "cron" && second === "publish") return cronPublish(req, res);
    if (first === "carousel" && second === "render") return carouselRender(req, res);
  }

  // --- rotas de 1 segmento -----------------------------------------------
  if (segments.length === 1) {
    plain();
    if (first === "health") return health(req, res);
    if (first === "ping") return ping(req, res);
    if (first === "collect") return collect(req, res);
    if (first === "decide") return decide(req, res);
    if (first === "generate") return generate(req, res);
    if (first === "mockup") return mockup(req, res);
  }

  return res.status(404).json({ error: "Rota não encontrada." });
}
