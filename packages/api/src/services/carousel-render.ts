/**
 * Renderer híbrido de carrosséis — estilo "maestro" (@maestroprompts).
 *
 * Arquitetura (padrão OpenHive: HTML → screenshot):
 *   1. Template HTML/CSS com fontes manuscritas reais (pixel-perfect PT)
 *   2. Satori renderiza HTML → SVG (funciona em serverless, sem browser)
 *   3. resvg converte SVG → PNG 1080×1080
 *
 * A IA NÃO escreve texto — só direção de arte. O texto é sempre exato.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
// Tenta vários locais: dist (build), src (dev) e raiz do monorepo (Vercel).
const FONTS_DIR =
  [
    join(__dirname, "..", "fonts"),
    join(process.cwd(), "packages", "api", "dist", "fonts"),
    join(process.cwd(), "packages", "api", "src", "fonts"),
  ].find((d) => existsSync(join(d, "PermanentMarker-Regular.ttf"))) ?? join(__dirname, "..", "fonts");

let fontsCache: { name: string; data: Buffer; weight: 400; style: "normal" }[] | null = null;

function loadFonts() {
  if (fontsCache) return fontsCache;
  fontsCache = [
    {
      name: "Permanent Marker",
      data: readFileSync(join(FONTS_DIR, "PermanentMarker-Regular.ttf")),
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "Gochi Hand",
      data: readFileSync(join(FONTS_DIR, "GochiHand-Regular.ttf")),
      weight: 400 as const,
      style: "normal" as const,
    },
  ];
  return fontsCache;
}

export interface CarouselSlide {
  /** Título grande (marker azul, caixa alta) */
  title: string;
  /** Itens da lista (com ✓ ou número) */
  items?: string[];
  /** Linha de destaque no rodapé (ex: CTA) */
  footer?: string;
  /** Atribuição topo-esquerda (ex: @maestroprompts) */
  handle?: string;
  /** Contador topo-direita (ex: "4/6") */
  counter?: string;
}

/** Forma aceita por CarouselRenderSchema: itens estruturados {title?, body?}. */
export interface CarouselRenderItem {
  title?: string;
  body?: string;
}

/**
 * CarouselRenderSchema valida `items` como {title?, body?}[], mas CarouselSlide
 * (e wrapText, abaixo) sempre esperou string[] — o handler passava os objetos
 * direto, e wrapText quebrava em `item.split(...)` (TypeError: text.split is
 * not a function). Achata cada item numa única linha de exibição.
 */
export function flattenCarouselItems(items: Array<CarouselRenderItem | string> = []): string[] {
  return items
    .map((it) => {
      if (typeof it === "string") return it;
      return [it?.title, it?.body].filter(Boolean).join(": ");
    })
    .filter((line) => line.length > 0);
}

const BLUE = "#1e3fae";
const PAPER = "#f5eeda";

/**
 * Papel pautado envelhecido via CSS puro: creme + linhas + manchas de café.
 * Determinístico — sem IA, sem custo, sempre igual.
 */
function paperBackground(): Record<string, string> {
  return {
    backgroundColor: PAPER,
    backgroundImage: [
      // linhas pautadas
      "repeating-linear-gradient(transparent, transparent 63px, rgba(30,63,174,0.18) 63px, rgba(30,63,174,0.18) 65px)",
      // mancha de café (canto superior esquerdo)
      "radial-gradient(ellipse 220px 180px at 8% 6%, rgba(160,120,60,0.25), transparent 70%)",
      "radial-gradient(ellipse 120px 100px at 12% 10%, rgba(160,120,60,0.18), transparent 70%)",
      // mancha de café (canto inferior direito)
      "radial-gradient(ellipse 260px 200px at 92% 94%, rgba(160,120,60,0.22), transparent 70%)",
      // vinheta subtil
      "radial-gradient(ellipse 120% 120% at 50% 50%, transparent 60%, rgba(120,90,40,0.12))",
    ].join(","),
  };
}

/** Word-wrap simples: o Satori não calcula altura de texto com quebra automática. */
function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? cur + " " + w : w;
    if (next.length > maxChars && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = next;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

/**
 * Layout 100% manual com posicionamento absoluto.
 * O Satori/Yoga falha com múltiplos blocos de texto com quebra —
 * por isso calculamos cada Y nós mesmos. Determinístico.
 */
function slideToElement(slide: CarouselSlide) {
  const { title, items = [], footer, handle, counter } = slide;

  const titleLines = wrapText(title.toUpperCase(), 12);
  const TITLE_Y = 200;
  const TITLE_FS = 88;
  const TITLE_LH = 140;

  // auto-fit: se os itens não cabem, encolhe fonte/espaçamento (mín. 70%)
  const FOOTER_Y = 880;
  const ITEMS_TOP = TITLE_Y + titleLines.length * TITLE_LH + 24;
  const AVAIL_H = FOOTER_Y - 40 - ITEMS_TOP;

  let itemFs = 46;
  let itemLh = 64;
  let itemLines: string[] = [];
  for (let attempt = 0; attempt < 4; attempt++) {
    itemLines = [];
    for (const item of items) {
      for (const line of wrapText(item, Math.floor(920 / (itemFs * 0.55)))) itemLines.push(line);
      itemLines.push("");
    }
    const needH = itemLines.length * itemLh;
    if (needH <= AVAIL_H || attempt === 3) break;
    const scale = Math.max(0.7, AVAIL_H / needH);
    itemFs = Math.floor(itemFs * scale);
    itemLh = Math.floor(itemLh * scale);
  }

  const children: any[] = [
    // topo: handle + contador
    {
      type: "div",
      props: {
        style: {
          position: "absolute", top: "60px", left: "80px", right: "80px",
          display: "flex", justifyContent: "space-between",
        },
        children: [
          {
            type: "div",
            props: {
              style: { fontFamily: "Gochi Hand", fontSize: "44px", color: BLUE },
              children: handle || "",
            },
          },
          {
            type: "div",
            props: {
              style: {
                fontFamily: "Gochi Hand", fontSize: "40px", color: "#fff",
                backgroundColor: "rgba(0,0,0,0.45)", borderRadius: "40px",
                padding: "8px 28px",
              },
              children: counter || "",
            },
          },
        ],
      },
    },
    // título (linhas absolutas, centradas)
    ...titleLines.map((line, i) => ({
      type: "div",
      props: {
        style: {
          position: "absolute", top: `${TITLE_Y + i * TITLE_LH}px`,
          left: "80px", right: "80px", textAlign: "center",
          fontFamily: "Permanent Marker", fontSize: `${TITLE_FS}px`, color: BLUE,
        },
        children: line,
      },
    })),
    // itens (linhas absolutas, com auto-fit)
    ...itemLines.map((line, i) => ({
      type: "div",
      props: {
        style: {
          position: "absolute", top: `${ITEMS_TOP + i * itemLh}px`,
          left: "80px", right: "80px",
          fontFamily: "Gochi Hand", fontSize: `${itemFs}px`, color: BLUE,
        },
        children: line || " ",
      },
    })),
  ];

  // rodapé / CTA (fixo em baixo)
  if (footer) {
    const footerLines = wrapText(footer.toUpperCase(), 26);
    footerLines.forEach((line, i) => {
      children.push({
        type: "div",
        props: {
          style: {
            position: "absolute", top: `${FOOTER_Y + i * 78}px`,
            left: "80px", right: "80px", textAlign: "center",
            fontFamily: "Permanent Marker", fontSize: "58px", color: BLUE,
            ...(i === 0 ? { borderTop: `6px solid ${BLUE}`, paddingTop: "24px" } : {}),
          },
          children: line,
        },
      });
    });
  }

  return {
    type: "div",
    props: {
      style: {
        width: "1080px", height: "1080px", position: "relative",
        display: "flex", // exigido pelo satori p/ múltiplos filhos (filhos são absolutos)
        ...paperBackground(),
      },
      children,
    },
  } as any;
}

/** Renderiza UM slide → PNG (Buffer). */
export async function renderSlide(slide: CarouselSlide): Promise<Buffer> {
  const svg = await satori(slideToElement(slide), {
    width: 1080,
    height: 1080,
    fonts: loadFonts(),
  });
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: 1080 },
  });
  return Buffer.from(resvg.render().asPng());
}

/** Renderiza vários slides → array de PNGs. */
export async function renderCarousel(slides: CarouselSlide[]): Promise<Buffer[]> {
  const out: Buffer[] = [];
  for (const s of slides) out.push(await renderSlide(s));
  return out;
}
