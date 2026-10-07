/**
 * Vercel serverless: POST /api/carousel/render
 * Renderer híbrido estilo "maestro" — devolve PNG 1080×1080.
 * Body: { title, items?, footer?, handle?, counter? }
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth } from "@pink-logic/api/services/auth.js";
import { renderSlide } from "@pink-logic/api/services/carousel-render.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Só POST" });
  const auth = await requireAuth(req, res);
  if (!auth) return;
  const { title, items, footer, handle, counter } = req.body || {};
  if (!title || typeof title !== "string") {
    return res.status(400).json({ error: "title é obrigatório" });
  }
  try {
    const png = await renderSlide({
      title,
      items: Array.isArray(items) ? items : [],
      footer,
      handle: handle || "",
      counter: counter || "",
    });
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Length", png.length);
    res.status(200).send(png);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
