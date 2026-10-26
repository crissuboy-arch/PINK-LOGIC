/**
 * Vercel serverless (router único, catch-all): /api/integrations/health,
 * /api/integrations/stats.
 *
 * CONSOLIDAÇÃO Opção B (limite Hobby: 12 funções): as 2 rotas
 * integrations viviam em 2 ficheiros/funções; passam a 1 função com
 * dispatch interno. Os handlers originais NÃO mudaram — vivem em
 * ./_handlers/ (o script de bundle ignora diretórios com prefixo `_`)
 * e o router só delega, preservando método, auth e códigos de cada rota:
 *  - health: pública, qualquer método → 200 (como antes);
 *  - stats: só GET, Bearer PINKLOGIC_ATHENA_API_KEY, 401/503.
 * Rotas desconhecidas → 404, como o 404 da Vercel antes (sem função).
 * Não existe rota base /api/integrations (antes como agora: 404 Vercel).
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import healthHandler from "./_handlers/health.js";
import statsHandler from "./_handlers/stats.js";

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
    const rest = path.replace(/^\/api\/integrations\/?/, "");
    if (!rest) return [];
    return rest.split("/").map(decode).filter((s) => s.length > 0);
  } catch {
    return [];
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const segments = segmentsOf(req);
  if (segments.length === 1 && segments[0] === "health") return healthHandler(req, res);
  if (segments.length === 1 && segments[0] === "stats") return statsHandler(req, res);
  return res.status(404).json({ error: "Rota não encontrada." });
}
