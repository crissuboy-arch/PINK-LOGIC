/**
 * Handler GET/POST /api/campaigns — servido pelo front-controller api/router.
 * Lista ou cria campanhas (tabela `campaigns`) do dono. Mesmo padrão de
 * /api/posts: auth + rate limit + schema zod + erros seguros.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth } from "@pink-logic/api/services/auth.js";
import { CampaignCreateSchema, CampaignListQuerySchema } from "@pink-logic/shared";
import { createCampaign, listCampaigns } from "@pink-logic/api/services/campaigns.js";
import { generalLimiter, rateLimitKey, enforceRateLimit } from "@pink-logic/api/services/rate-limit.js";
import { toPublicError } from "@pink-logic/api/services/http-errors.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = await requireAuth(req, res);
  if (!auth) return;
  if (!enforceRateLimit(generalLimiter, rateLimitKey(auth), res)) return;

  try {
    if (req.method === "GET") {
      const parsed = CampaignListQuerySchema.safeParse(req.query);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
      return res.status(200).json({ campaigns: await listCampaigns(auth, parsed.data) });
    }
    if (req.method === "POST") {
      const parsed = CampaignCreateSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
      return res.status(201).json({ campaign: await createCampaign(auth, parsed.data) });
    }
    return res.status(405).json({ error: "Só GET ou POST" });
  } catch (err: any) {
    const pub = toPublicError(err);
    res.status(pub.status).json({ error: pub.message });
  }
}
