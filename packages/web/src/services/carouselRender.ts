// ---------------------------------------------------------------------------
// Renderizador de slides do carrossel para canvas — Fase 3.
//
// O Editor (Editor.tsx) já tinha um drawSlideToCanvas local, preso ao
// componente; o fluxo de carrosséis exportava o ZIP sem os PNG/JPG dos
// slides («saem do Editor»). Este módulo extrai essa renderização para um
// serviço reutilizável, com a MESMA geometria do motor de templates
// (applyBrandTemplate): fundo, formas e textos com x/y/largura/altura em px.
// A exportação do fluxo passa a incluir slide-N.png + slide-N.jpg reais.
//
// Quebra de linha: ao contrário do desenho do Editor (fillText por linha
// \n, sem wrap), aqui o texto é embrulhado à largura do elemento
// (measureText) — igual ao renderizador PIL de prova
// (scripts/render-carousel-pil.py) — para o PNG exportado não cortar texto.
//
// Limites honestos:
// - Fundos de imagem e elementos de imagem (ex.: logótipo) NÃO são
//   desenhados: o carregamento é assíncrono e cross-origin pode falhar.
//   Os slides do motor de templates usam só cor/forma/texto; com o logo
//   null da Ofensiva Criativa, nada se perde. Se um dia houver imagem,
//   o export avisa em vez de fingir.
// - A quebra de linha é pura (wrapTextLines) e testável sem DOM; só o
//   desenho final precisa de um canvas 2D real.
// ---------------------------------------------------------------------------
import type { Slide } from '../contexts/EditorContext';
import { CAROUSEL_45_FORMAT } from './carouselDocument';

/** Tipo mínimo do contexto 2D usado aqui (permite um mock nos testes). */
export interface SlideCanvasContext {
  fillStyle: string | CanvasGradient;
  font: string;
  textAlign: string;
  textBaseline: string;
  globalAlpha: number;
  fillRect(x: number, y: number, w: number, h: number): void;
  save(): void;
  restore(): void;
  translate(x: number, y: number): void;
  rotate(angle: number): void;
  beginPath(): void;
  arc(x: number, y: number, r: number, start: number, end: number): void;
  fill(): void;
  roundRect?(x: number, y: number, w: number, h: number, r: number): void;
  measureText(text: string): { width: number };
  fillText(text: string, x: number, y: number): void;
  createLinearGradient(x0: number, y0: number, x1: number, y1: number): CanvasGradient;
}

/**
 * Quebra um parágrafo em linhas que cabem em `maxWidth`, medido por
 * `measure`. Parágrafos separados por \n são mantidos. Palavras maiores
 * que a largura são partidas por caracteres (nunca se perde texto).
 */
export function wrapTextLines(
  measure: (text: string) => number,
  text: string,
  maxWidth: number,
): string[] {
  const out: string[] = [];
  for (const paragraph of text.split('\n')) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (!words.length) { out.push(''); continue; }
    let current = '';
    for (const word of words) {
      const trial = current ? `${current} ${word}` : word;
      if (measure(trial) <= maxWidth || !current) {
        if (measure(trial) <= maxWidth) { current = trial; continue; }
        // Palavra única maior que a largura: parte por caracteres.
        let rest = word;
        while (rest && measure(rest) > maxWidth) {
          let cut = rest.length;
          while (cut > 1 && measure(rest.slice(0, cut)) > maxWidth) cut -= 1;
          out.push(rest.slice(0, cut));
          rest = rest.slice(cut);
        }
        current = rest;
        continue;
      }
      out.push(current);
      current = word;
    }
    if (current) out.push(current);
  }
  return out;
}

/** Desenha UM slide no contexto 2D (1080×1350 por omissão, formato 4:5). */
export function drawSlideToCanvas(
  ctx: SlideCanvasContext,
  slide: Slide,
  width: number = CAROUSEL_45_FORMAT.width,
  height: number = CAROUSEL_45_FORMAT.height,
): void {
  // Fundo.
  if (slide.background.type === 'color') {
    ctx.fillStyle = slide.background.value;
    ctx.fillRect(0, 0, width, height);
  } else if (slide.background.type === 'gradient') {
    const direction = slide.background.direction || 'tb';
    const grad = direction === 'lr'
      ? ctx.createLinearGradient(0, 0, width, 0)
      : direction === 'diag'
        ? ctx.createLinearGradient(0, 0, width, height)
        : ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, slide.background.color1 || '#103B78');
    grad.addColorStop(1, slide.background.color2 || '#071D3A');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else {
    // Fundo de imagem: não desenhado aqui (ver comentário no topo).
    ctx.fillStyle = '#071D3A';
    ctx.fillRect(0, 0, width, height);
  }

  const elements = [...slide.elements].sort((a, b) => a.zIndex - b.zIndex);
  for (const el of elements) {
    ctx.save();
    ctx.globalAlpha = (el.opacity ?? 100) / 100;
    if (el.rotation) {
      ctx.translate(el.x + el.width / 2, el.y + el.height / 2);
      ctx.rotate((el.rotation * Math.PI) / 180);
      ctx.translate(-(el.x + el.width / 2), -(el.y + el.height / 2));
    }
    if (el.type === 'shape') {
      ctx.fillStyle = el.color || '#000000';
      if (el.content === 'circle') {
        ctx.beginPath();
        ctx.arc(el.x + el.width / 2, el.y + el.height / 2, el.width / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (el.borderRadius && el.borderRadius > 0 && typeof ctx.roundRect === 'function') {
        ctx.beginPath();
        ctx.roundRect(el.x, el.y, el.width, el.height, el.borderRadius);
        ctx.fill();
      } else {
        ctx.fillRect(el.x, el.y, el.width, el.height);
      }
    } else if (el.type === 'text') {
      const fontSize = el.fontSize || 16;
      ctx.fillStyle = el.color || '#FFFFFF';
      ctx.font = `${el.fontWeight || 400} ${fontSize}px ${el.fontFamily || 'Inter'}`;
      ctx.textBaseline = 'top';
      ctx.textAlign = el.textAlign || 'left';
      const content = el.isUppercase ? el.content.toUpperCase() : el.content;
      const lineHeight = (el.lineHeight || 1.2) * fontSize;
      const lines = wrapTextLines((t) => ctx.measureText(t).width, content, el.width);
      const x = el.textAlign === 'left' ? el.x : el.textAlign === 'right' ? el.x + el.width : el.x + el.width / 2;
      lines.forEach((line, i) => ctx.fillText(line, x, el.y + i * lineHeight));
    }
    // Elementos de imagem (logótipo): não desenhados (ver topo do ficheiro).
    ctx.restore();
  }
}

/** Renderiza um slide para Blob PNG ou JPEG (precisa de DOM/canvas real). */
export async function renderSlideToBlob(
  slide: Slide,
  format: 'png' | 'jpeg',
): Promise<Blob> {
  if (typeof document === 'undefined') {
    throw new Error('A renderização de slides precisa do canvas do browser (sem DOM aqui).');
  }
  const canvas = document.createElement('canvas');
  canvas.width = CAROUSEL_45_FORMAT.width;
  canvas.height = CAROUSEL_45_FORMAT.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('O browser não disponibilizou um contexto canvas 2D.');
  drawSlideToCanvas(ctx as unknown as SlideCanvasContext, slide, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, format === 'png' ? 'image/png' : 'image/jpeg', 0.92),
  );
  if (!blob) throw new Error(`O browser não conseguiu gerar o ${format.toUpperCase()} do slide.`);
  return blob;
}
