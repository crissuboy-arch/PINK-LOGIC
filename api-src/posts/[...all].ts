/**
 * Vercel serverless (router, catch-all OBRIGATÓRIO): /api/posts/:id,
 * /api/posts/:id/approve, /api/posts/:id/publish,
 * /api/posts/:id/schedule (1+ segmentos).
 *
 * CORREÇÃO FINAL (limite Hobby: 12 funções): o router opcional
 * posts/[[...all]] NÃO casa 0 nem 2+ segmentos no router de funções
 * da Vercel (provado ao vivo), por isso a base exata vive em
 * posts/index.ts e este ficheiro é o catch-all OBRIGATÓRIO
 * (1+ segmentos — já provado ao vivo pelo router integrations).
 * NÃO tem ramo base: sem segmentos → 404 (a base é o index.ts).
 * Os handlers originais NÃO mudaram — vivem em ./_handlers/ (o
 * script de bundle ignora diretórios com prefixo `_`) e o router só
 * delega, preservando método, auth, gates e códigos de erro:
 *  - :id (GET/PATCH/DELETE): requireAuth;
 *  - approve/publish/schedule (POST): 405 antes da auth, depois
 *    requireAuth; schedule valida o body antes do serviço.
 * Rotas desconhecidas → 404, como o 404 da Vercel antes.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import detailHandler from "./_handlers/[id].js";
import approveHandler from "./_handlers/approve.js";
import publishHandler from "./_handlers/publish.js";
import scheduleHandler from "./_handlers/schedule.js";

/** Segmentos do catch-all: do parâmetro da Vercel ou, em fallback, do URL. */
export function segmentsOf(req: VercelRequest): string[] {
  const raw = (req.query as Record<string, unknown> | undefined)?.all;
  const fromQuery = Array.isArray(raw)
    ? raw.map(String)
    : typeof raw === "string"
      ? [raw]
      : null;
  const decode = (s: string): string => {
    try {
      return decodeURIComponent(s);
    } catch {
      return s;
    }
  };
  if (fromQuery) return fromQuery.map(decode).filter((s) => s.length > 0);
  // Fallback: caminho do URL (ex.: invocação direta sem query.all).
  try {
    const path = new URL(req.url || "", "http://localhost").pathname;
    const rest = path.replace(/^\/api\/posts\/?/, "");
    if (!rest) return [];
    return rest.split("/").map(decode).filter((s) => s.length > 0);
  } catch {
    return [];
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const segments = segmentsOf(req);
  // Query sem o parâmetro do catch-all (a rota base usa-a para filtros).
  const query = { ...(req.query as Record<string, unknown>) };
  delete query.all;

  // SEM ramo base: a rota exata /api/posts é posts/index.ts.
  if (segments.length === 0) {
    return res.status(404).json({ error: "Rota não encontrada." });
  }
  const [id, action, ...extra] = segments;
  if (segments.length === 1) {
    req.query = { ...query, id } as VercelRequest["query"];
    return detailHandler(req, res);
  }
  if (segments.length === 2 && extra.length === 0) {
    req.query = { ...query, id } as VercelRequest["query"];
    if (action === "approve") return approveHandler(req, res);
    if (action === "publish") return publishHandler(req, res);
    if (action === "schedule") return scheduleHandler(req, res);
  }
  return res.status(404).json({ error: "Rota não encontrada." });
}
