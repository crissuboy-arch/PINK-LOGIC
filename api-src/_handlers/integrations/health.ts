/**
 * Handler GET /api/integrations/health (público, sem auth) — servido
 * pelo front-controller api/router (não é função direta).
 * Código INTACTO da consolidação Opção B.
 *
 * Identidade oficial da plataforma para a Athena Control.
 * Contrato v1 — mesmo padrão da integração VitrinePro ↔ Athena.
 * Sem dados de clientes, sem Supabase, sem autenticação.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";

export const PLATFORM = "PinkLogic";
export const CONTRACT = "v1";
export const VERSION = "2.0.0";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    platform: PLATFORM,
    status: "operational",
    version: VERSION,
    contract: CONTRACT,
    capabilities: ["integrations:health", "integrations:stats"],
  });
}
