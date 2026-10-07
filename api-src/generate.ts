/**
 * Vercel serverless: POST /api/generate
 * Motores reais do PINK-LOGIC (logo/sticker/qrcode grátis, copy via AIsa).
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth } from "@pink-logic/api/services/auth.js";
import { GenerateRequestSchema } from "@pink-logic/shared";
import { generate } from "@pink-logic/api/services/generate.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Só POST" });
  const auth = await requireAuth(req, res);
  if (!auth) return;
  const parsed = GenerateRequestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  // [copy-diag] TEMPORÁRIO: metadados do fluxo do Gerador de Copy (sem conteúdo, token ou dados pessoais).
  const diag = parsed.data.module === "copy";
  const t0 = Date.now();
  if (diag) console.log("[copy-diag] start auth", auth.kind);
  try {
    const out: any = await generate(parsed.data.module, parsed.data.prompt, parsed.data.options);
    if (diag) console.log("[copy-diag] response", JSON.stringify({
      ms: Date.now() - t0, keys: Object.keys(out || {}), hasText: typeof out?.text === "string" && out.text.length > 0,
      textLen: typeof out?.text === "string" ? out.text.length : null, bytes: JSON.stringify(out ?? null).length,
    }));
    res.status(200).json(out);
  } catch (err: any) {
    if (diag) console.log("[copy-diag] error", JSON.stringify({ ms: Date.now() - t0, status: err.status || 500, name: err?.name, msg: String(err?.message || "").slice(0, 200) }));
    res.status(err.status || 500).json({ error: err.message });
  }
}
