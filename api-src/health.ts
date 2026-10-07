/**
 * Vercel serverless: GET /api/health
 * Reutiliza os serviços do packages/api (mesma lógica, sem Express).
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    ok: true,
    service: "pink-logic-api",
    version: "2.0.0",
    runtime: "vercel-serverless",
    integrations: {
      jev: !!process.env.JEV_API_KEY,
      aisa: !!process.env.AISA_API_KEY,
    },
  });
}
