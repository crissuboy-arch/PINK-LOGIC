/**
 * Estilos de carrossel — presets de direção de arte para geração via IA.
 *
 * "maestro": estilo @maestroprompts — caderno manuscrito.
 *   Papel pautado envelhecido (creme/bege) com manchas de café,
 *   tipografia marker azul em caixa alta, doodles (foguetes, lâmpadas,
 *   setas, sublinhados), checklists, detalhes vermelho/laranja.
 */
import type { CarouselStyle } from "@pink-logic/shared";
export type { CarouselStyle };

const MAESTRO_STYLE = `hand-drawn notebook carousel slide, aged cream lined paper background with subtle coffee stains, bold blue marker handwriting typography in ALL CAPS Brazilian Portuguese, playful doodles (rockets, light bulbs, arrows, underlines, circles around key numbers), checklist with hand-drawn checkmarks, small red and orange accent details, hierarchical layout with numbered sections, square 1:1 format, authentic whiteboard-marker aesthetic, high contrast, readable`;

const CLEAN_STYLE = `minimalist instagram carousel slide, clean white background, modern sans-serif typography, generous whitespace, subtle brand color accents, professional layout, square 1:1 format`;

const BOLD_STYLE = `bold instagram carousel slide, dark background with vibrant gradient accents, large impactful typography, high contrast, modern streetwear aesthetic, square 1:1 format`;

const STYLES: Record<CarouselStyle, string> = {
  maestro: MAESTRO_STYLE,
  clean: CLEAN_STYLE,
  bold: BOLD_STYLE,
};

/**
 * Monta o prompt completo: estilo + conteúdo do slide.
 * O conteúdo vem do gerador de copy/estratégia; o estilo é fixo por preset.
 */
export function buildCarouselPrompt(
  style: CarouselStyle,
  slideContent: string,
  slideNumber?: string
): string {
  const styleDesc = STYLES[style] || STYLES.maestro;
  const slideTag = slideNumber ? ` (slide ${slideNumber})` : "";
  return `${styleDesc}${slideTag}. Slide text content in Brazilian Portuguese, exactly as written: "${slideContent}". Keep text short, punchy, legible — few words per slide, large lettering.`;
}

export function listCarouselStyles(): { id: CarouselStyle; name: string; description: string }[] {
  return [
    { id: "maestro", name: "Maestro", description: "Caderno manuscrito — marker azul, doodles, estilo @maestroprompts" },
    { id: "clean", name: "Clean", description: "Minimalista — fundo claro, tipografia moderna" },
    { id: "bold", name: "Bold", description: "Impacto — fundo escuro, gradientes vibrantes" },
  ];
}
