/**
 * Renderer de mockups — backend para o Mockup Studio.
 *
 * Reutiliza o padrão do carousel-render (Satori + resvg, sem browser).
 * Os 9 tipos são os MESMOS do MockupStudio.tsx (web):
 *   card | storefront | uniform | box | laptop | smartphone | billboard | mug | sticker
 *
 * Entrada: artwork (URL http(s) ou data:image base64) + tipo + projeto.
 * Saída: PNG 1080×1080 (Buffer). Render puro dos inputs → idempotente.
 */
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import type { MockupType } from "@pink-logic/shared";

const BG = "#07070a";
const FRAME = "#1a1a22";
const ACCENT = "#FF2D8D";

export interface MockupInput {
  type: MockupType;
  /** URL http(s) pública ou data:image/...;base64 (máx ~5MB) */
  artworkUrl: string;
  projectName?: string;
}

const TYPES: MockupType[] = ["card", "storefront", "uniform", "box", "laptop", "smartphone", "billboard", "mug", "sticker"];

export function isValidMockupType(t: string): t is MockupType {
  return (TYPES as string[]).includes(t);
}

/** Valida a artwork: URL http(s) ou data:image base64, tamanho limitado. */
export function validateArtwork(url: string): { ok: true } | { ok: false; error: string } {
  if (!url || typeof url !== "string") return { ok: false, error: "artworkUrl é obrigatório" };
  if (url.startsWith("data:image/")) {
    // ~5MB em base64 ≈ 6.7M chars
    if (url.length > 7_000_000) return { ok: false, error: "imagem base64 excede 5MB" };
    return { ok: true };
  }
  if (/^https?:\/\//i.test(url)) {
    if (url.length > 2000) return { ok: false, error: "URL demasiado longa" };
    return { ok: true };
  }
  return { ok: false, error: "artworkUrl deve ser URL http(s) ou data:image base64" };
}

/**
 * Resolve a artwork para data URL (o satori bloqueia URLs externas por SSRF).
 * Só aceita content-type image/*, máx 5MB, timeout 15s.
 */
export async function resolveArtwork(url: string): Promise<string> {
  const v = validateArtwork(url);
  if (!v.ok) throw Object.assign(new Error(v.error), { status: 400 });
  if (url.startsWith("data:image/")) return url;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15_000);
  try {
    const r = await fetch(url, { signal: ctrl.signal, redirect: "follow" });
    if (!r.ok) throw Object.assign(new Error(`artwork HTTP ${r.status}`), { status: 400 });
    const ct = r.headers.get("content-type") || "";
    if (!ct.startsWith("image/")) throw Object.assign(new Error(`artwork não é imagem (${ct})`), { status: 400 });
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length > 5 * 1024 * 1024) throw Object.assign(new Error("artwork excede 5MB"), { status: 400 });
    return `data:${ct.split(";")[0]};base64,${buf.toString("base64")}`;
  } catch (err: any) {
    if (err.status) throw err;
    throw Object.assign(new Error("falha ao obter artwork: " + err.message), { status: 400 });
  } finally {
    clearTimeout(t);
  }
}

type El = any;
const abs = (top: number, left: number, width: number, height: number, extra: Record<string, any> = {}): Record<string, any> => ({
  position: "absolute", top: `${top}px`, left: `${left}px`, width: `${width}px`, height: `${height}px`, ...extra,
});

function bg(): El {
  return {
    type: "div",
    props: {
      style: {
        ...abs(0, 0, 1080, 1080, { backgroundColor: BG, display: "flex" }),
      },
      children: [],
    },
  };
}

function art(url: string, box: { top: number; left: number; width: number; height: number }): El {
  return {
    type: "img",
    props: {
      src: url,
      style: {
        ...abs(box.top, box.left, box.width, box.height, {
          objectFit: "contain",
        }),
      },
    },
  };
}

/** Cada tipo devolve os elementos do mockup (fundo + objeto + artwork). */
function mockupElements(type: MockupType, artworkUrl: string): El[] {
  const C = 540; // centro X
  switch (type) {
    case "laptop": {
      // ecrã + base
      return [
        { type: "div", props: { style: abs(300, C - 260, 520, 320, { backgroundColor: "#111", borderRadius: "16px 16px 0 0", border: "4px solid #2d2d2d", display: "flex" }), children: [] } },
        art(artworkUrl, { top: 330, left: C - 220, width: 440, height: 250 }),
        { type: "div", props: { style: abs(620, C - 300, 600, 18, { backgroundColor: "#444", borderRadius: "0 0 14px 14px", display: "flex" }), children: [] } },
      ];
    }
    case "smartphone": {
      return [
        { type: "div", props: { style: abs(240, C - 140, 280, 600, { backgroundColor: "#0d0d12", borderRadius: "48px", border: "10px solid #2d2d2d", display: "flex" }), children: [] } },
        art(artworkUrl, { top: 330, left: C - 100, width: 200, height: 380 }),
        { type: "div", props: { style: abs(258, C - 40, 80, 18, { backgroundColor: "#000", borderRadius: "10px", display: "flex" }), children: [] } },
      ];
    }
    case "card": {
      // cartão de visita rodado (satori não faz rotate; usa rect simples)
      return [
        { type: "div", props: { style: abs(400, C - 260, 520, 280, { backgroundColor: "#0D0D12", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.12)", display: "flex" }), children: [] } },
        { type: "div", props: { style: abs(400, C - 260, 520, 6, { backgroundColor: ACCENT, borderRadius: "20px 20px 0 0", display: "flex" }), children: [] } },
        art(artworkUrl, { top: 440, left: C - 180, width: 360, height: 140 }),
      ];
    }
    case "uniform": {
      // t-shirt simplificada: corpo + mangas
      return [
        { type: "div", props: { style: abs(340, C - 150, 300, 340, { backgroundColor: "#14141c", borderRadius: "36px 36px 10px 10px", display: "flex" }), children: [] } },
        { type: "div", props: { style: abs(350, C - 210, 70, 110, { backgroundColor: "#14141c", borderRadius: "18px", display: "flex" }), children: [] } },
        { type: "div", props: { style: abs(350, C + 140, 70, 110, { backgroundColor: "#14141c", borderRadius: "18px", display: "flex" }), children: [] } },
        art(artworkUrl, { top: 450, left: C - 90, width: 180, height: 180 }),
      ];
    }
    case "box": {
      return [
        { type: "div", props: { style: abs(380, C - 160, 320, 320, { backgroundColor: "#1C1510", borderRadius: "20px", border: "2px solid rgba(255,255,255,0.06)", display: "flex" }), children: [] } },
        { type: "div", props: { style: abs(380, C - 14, 28, 320, { backgroundColor: "rgba(255,255,255,0.04)", display: "flex" }), children: [] } },
        art(artworkUrl, { top: 450, left: C - 110, width: 220, height: 160 }),
      ];
    }
    case "storefront": {
      return [
        { type: "div", props: { style: abs(320, C - 300, 600, 360, { backgroundColor: "#09090c", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.1)", display: "flex" }), children: [] } },
        { type: "div", props: { style: abs(380, C - 220, 440, 140, { backgroundColor: "#040407", borderRadius: "8px", border: `3px solid ${ACCENT}`, display: "flex" }), children: [] } },
        art(artworkUrl, { top: 400, left: C - 190, width: 380, height: 100 }),
        { type: "div", props: { style: abs(640, C - 300, 600, 40, { backgroundColor: "#111", display: "flex" }), children: [] } },
      ];
    }
    case "billboard": {
      return [
        { type: "div", props: { style: abs(660, C - 120, 24, 220, { backgroundColor: "#333", display: "flex" }), children: [] } },
        { type: "div", props: { style: abs(660, C + 96, 24, 220, { backgroundColor: "#333", display: "flex" }), children: [] } },
        { type: "div", props: { style: abs(340, C - 300, 600, 320, { backgroundColor: "#fff", border: "10px solid #222", display: "flex" }), children: [] } },
        { type: "div", props: { style: abs(362, C - 278, 556, 276, { backgroundColor: "#0d0d12", display: "flex" }), children: [] } },
        art(artworkUrl, { top: 390, left: C - 240, width: 480, height: 220 }),
      ];
    }
    case "mug": {
      return [
        { type: "div", props: { style: abs(380, C - 130, 260, 300, { backgroundColor: "#f5f0e8", borderRadius: "18px 18px 40px 40px", display: "flex" }), children: [] } },
        { type: "div", props: { style: abs(430, C + 130, 90, 150, { border: "26px solid #f5f0e8", borderLeft: "none", borderRadius: "0 60px 60px 0", display: "flex" }), children: [] } },
        art(artworkUrl, { top: 460, left: C - 90, width: 180, height: 140 }),
      ];
    }
    case "sticker": {
      // die-cut: artwork com rebordo branco
      return [
        { type: "div", props: { style: abs(330, C - 175, 350, 350, { backgroundColor: "#ffffff", borderRadius: "50%", display: "flex" }), children: [] } },
        art(artworkUrl, { top: 365, left: C - 140, width: 280, height: 280 }),
      ];
    }
  }
}

/** Renderiza um mockup → PNG (Buffer). Puro nos inputs → idempotente. */
export async function renderMockup(input: MockupInput): Promise<Buffer> {
  const v = validateArtwork(input.artworkUrl);
  if (!v.ok) throw Object.assign(new Error(v.error), { status: 400 });
  if (!isValidMockupType(input.type)) throw Object.assign(new Error(`tipo inválido: ${input.type}`), { status: 400 });

  const svg = await satori(
    {
      type: "div",
      props: {
        style: { width: "1080px", height: "1080px", position: "relative", display: "flex", backgroundColor: BG },
        children: [bg(), ...mockupElements(input.type, input.artworkUrl)],
      },
    } as any,
    { width: 1080, height: 1080, fonts: [] }
  );
  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: 1080 } });
  return Buffer.from(resvg.render().asPng());
}

export function listMockupTypes(): { id: MockupType; label: string }[] {
  return [
    { id: "laptop", label: "Portátil" },
    { id: "smartphone", label: "Smartphone" },
    { id: "card", label: "Cartão de visita" },
    { id: "uniform", label: "T-shirt / Uniforme" },
    { id: "box", label: "Caixa / Embalagem" },
    { id: "storefront", label: "Fachada de loja" },
    { id: "billboard", label: "Outdoor" },
    { id: "mug", label: "Caneca" },
    { id: "sticker", label: "Sticker die-cut" },
  ];
}
