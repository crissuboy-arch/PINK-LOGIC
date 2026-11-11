import type { Slide, EditorElement, CanvasFormat } from '../contexts/EditorContext';
import type { BrandSchema } from '../providers/BrandProvider';

export interface CarouselContent {
  slides: { title: string; body: string }[];
  caption: string;
  hashtags: string[];
}

/** Converte o documento em elementos nativos editáveis, sem HTML gerado pela IA. */
export function buildEditableCarousel(doc: CarouselContent, format: CanvasFormat, brand: BrandSchema | null): Slide[] {
  const w = format.width;
  const h = format.height;
  const palette = brand?.palette;
  const foreground = palette?.text || '#FFFFFF';
  const accent = palette?.accent || '#D4AF37';
  return doc.slides.map((slide, index) => {
    const text = (content: string, y: number, height: number, size: number, color: string, weight: number): EditorElement => ({
      id: crypto.randomUUID(), type: 'text', content, x: w * .075, y, width: w * .85, height,
      rotation: 0, opacity: 100, zIndex: 2, fontSize: size, color, fontWeight: weight,
      fontFamily: weight >= 700 ? brand?.typography.heading || 'Inter' : brand?.typography.body || 'Inter',
      textAlign: 'left', lineHeight: 1.2,
    });
    const elements: EditorElement[] = [
      text(index === 0 ? brand?.name || 'CARROSSEL' : index === doc.slides.length - 1 ? 'PRÓXIMO PASSO' : 'CONTINUE', h * .08, h * .06, w * .025, accent, 700),
      text(slide.title, h * .22, h * .28, w * (slide.title.length > 65 ? .047 : .06), foreground, 800),
      text(slide.body, h * .53, h * .32, w * (slide.body.length > 240 ? .029 : .034), foreground, 400),
      text(`${index + 1}/${doc.slides.length}`, h * .91, h * .04, w * .023, accent, 700),
    ];
    if (brand?.logo) elements.push({
      id: crypto.randomUUID(), type: 'image', content: brand.logo,
      x: w * .8, y: h * .07, width: w * .12, height: h * .09,
      rotation: 0, opacity: 100, zIndex: 3, objectFit: 'contain',
    });
    return { id: crypto.randomUUID(), elements, background: {
      type: 'color', value: palette?.background || '#0B1730', blur: 0, brightness: 100, opacity: 100,
    } };
  });
}

// ---------------------------------------------------------------------------
// Motor económico de templates 4:5 (sem IA)
// Aplica o Brand Kit a N slides 1080x1350 (4:5) usando apenas composição
// local: cores da marca, hierarquia tipográfica e número de slide. Nenhuma
// imagem de IA por página; nenhum pedido de rede.
// ---------------------------------------------------------------------------

export const CAROUSEL_45_FORMAT: CanvasFormat = { id: 'carousel', name: 'Carousel', width: 1080, height: 1350 };

export type CoverVariantId = 'classica' | 'destaque' | 'minimal';
export type SlideReviewStatus = 'pendente' | 'aprovado' | 'corrigido';

export interface CarouselSlideInput { title: string; body: string }

export interface BrandTemplateOptions {
  /** Variante de capa aplicada ao slide 1. Default: 'classica'. */
  coverVariant?: CoverVariantId;
  /** Formato do canvas. Default: 1080x1350 (4:5). */
  format?: CanvasFormat;
}

export const COVER_VARIANTS: { id: CoverVariantId; label: string; description: string }[] = [
  { id: 'classica', label: 'Clássica', description: 'Fundo azul da marca, barra dourada no topo, título grande à esquerda.' },
  { id: 'destaque', label: 'Destaque', description: 'Fundo claro, título azul escuro, faixa dourada — máximo contraste.' },
  { id: 'minimal', label: 'Minimal', description: 'Fundo azul-noite, filete dourado fino, título e corpo com muito respiro.' },
];

interface BrandColors {
  primary: string;
  accent: string;
  background: string;
  text: string;
  surface: string;
}

function resolveColors(brand: BrandSchema | null): BrandColors {
  const p = brand?.palette;
  return {
    primary: p?.primary || '#103B78',
    accent: p?.accent || '#D4AF37',
    background: p?.background || '#071D3A',
    text: p?.text || '#FFFFFF',
    surface: p?.surface || '#F5F7FA',
  };
}

function mkText(
  content: string, x: number, y: number, width: number, height: number,
  fontSize: number, color: string, fontWeight: number, fontFamily: string,
  textAlign: 'left' | 'center' | 'right' = 'left',
): EditorElement {
  return {
    id: crypto.randomUUID(), type: 'text', content, x, y, width, height,
    rotation: 0, opacity: 100, zIndex: 2, fontSize, color, fontWeight,
    fontFamily, textAlign, lineHeight: 1.2,
  };
}

function mkBar(x: number, y: number, width: number, height: number, color: string): EditorElement {
  return {
    id: crypto.randomUUID(), type: 'shape', content: 'square', x, y, width, height,
    rotation: 0, opacity: 100, zIndex: 1, color, borderRadius: 0,
  };
}

/** Extrai título (maior texto) e corpo (2.º maior texto) de um slide. */
export function slideTextContents(slide: Slide): { title: string; body: string } {
  const texts = slide.elements
    .filter((el) => el.type === 'text' && el.content.trim())
    .sort((a, b) => (b.fontSize || 0) - (a.fontSize || 0));
  return { title: texts[0]?.content || '', body: texts[1]?.content || '' };
}

function buildCoverSlide(
  input: CarouselSlideInput, total: number, brand: BrandSchema | null,
  variant: CoverVariantId, format: CanvasFormat,
): Slide {
  const w = format.width;
  const h = format.height;
  const colors = resolveColors(brand);
  const heading = brand?.typography.heading || 'Inter';
  const bodyFont = brand?.typography.body || 'Inter';
  const kicker = (brand?.name || 'CARROSSEL').toUpperCase();
  const titleSize = w * (input.title.length > 65 ? 0.052 : 0.064);
  const bodySize = w * (input.body.length > 240 ? 0.03 : 0.034);
  const elements: EditorElement[] = [];

  if (variant === 'classica') {
    elements.push(
      mkBar(w * 0.075, h * 0.07, w * 0.16, h * 0.008, colors.accent),
      mkText(kicker, w * 0.075, h * 0.1, w * 0.85, h * 0.05, w * 0.024, colors.accent, 700, heading),
      mkText(input.title, w * 0.075, h * 0.24, w * 0.85, h * 0.3, titleSize, colors.text, 800, heading),
      mkText(input.body, w * 0.075, h * 0.58, w * 0.85, h * 0.28, bodySize, colors.surface, 400, bodyFont),
      mkText(`1/${total}`, w * 0.075, h * 0.91, w * 0.85, h * 0.04, w * 0.023, colors.accent, 700, heading),
    );
    return finishSlide(elements, colors.primary, brand, w, h, total);
  }

  if (variant === 'destaque') {
    elements.push(
      mkBar(0, 0, w, h * 0.012, colors.accent),
      mkBar(0, h * 0.88, w, h * 0.12, colors.primary),
      mkText(kicker, w * 0.075, h * 0.09, w * 0.85, h * 0.05, w * 0.024, colors.primary, 700, heading),
      mkText(input.title, w * 0.075, h * 0.22, w * 0.85, h * 0.32, titleSize, colors.primary, 800, heading),
      mkText(input.body, w * 0.075, h * 0.56, w * 0.85, h * 0.26, bodySize, colors.background, 400, bodyFont),
      mkText(`1/${total}  ·  ${kicker}`, w * 0.075, h * 0.915, w * 0.85, h * 0.04, w * 0.022, colors.text, 700, heading),
    );
    return finishSlide(elements, colors.surface, brand, w, h, total);
  }

  // minimal
  elements.push(
    mkBar(w * 0.075, h * 0.16, w * 0.1, 3, colors.accent),
    mkText(kicker, w * 0.075, h * 0.1, w * 0.85, h * 0.05, w * 0.022, colors.accent, 700, heading),
    mkText(input.title, w * 0.075, h * 0.26, w * 0.85, h * 0.3, titleSize, colors.text, 800, heading),
    mkText(input.body, w * 0.075, h * 0.62, w * 0.8, h * 0.24, bodySize, colors.surface, 400, bodyFont),
    mkText(`1/${total}`, w * 0.075, h * 0.91, w * 0.85, h * 0.04, w * 0.023, colors.accent, 700, heading),
  );
  return finishSlide(elements, colors.background, brand, w, h, total);
}

function finishSlide(
  elements: EditorElement[], backgroundValue: string, brand: BrandSchema | null,
  w: number, h: number, _total: number,
): Slide {
  if (brand?.logo) {
    elements.push({
      id: crypto.randomUUID(), type: 'image', content: brand.logo,
      x: w * 0.8, y: h * 0.07, width: w * 0.12, height: h * 0.09,
      rotation: 0, opacity: 100, zIndex: 3, objectFit: 'contain',
    });
  }
  return {
    id: crypto.randomUUID(), elements,
    background: { type: 'color', value: backgroundValue, blur: 0, brightness: 100, opacity: 100 },
  };
}

function buildContentSlide(
  input: CarouselSlideInput, index: number, total: number,
  brand: BrandSchema | null, format: CanvasFormat,
): Slide {
  const w = format.width;
  const h = format.height;
  const colors = resolveColors(brand);
  const heading = brand?.typography.heading || 'Inter';
  const bodyFont = brand?.typography.body || 'Inter';
  const isLast = index === total - 1;
  const kicker = isLast ? 'PRÓXIMO PASSO' : (brand?.name || 'CARROSSEL').toUpperCase();
  const elements: EditorElement[] = [
    mkText(kicker, w * 0.075, h * 0.08, w * 0.85, h * 0.05, w * 0.024, colors.accent, 700, heading),
    mkText(input.title, w * 0.075, h * 0.2, w * 0.85, h * 0.3, w * (input.title.length > 65 ? 0.047 : 0.058), colors.text, 800, heading),
    mkText(input.body, w * 0.075, h * 0.52, w * 0.85, h * 0.32, w * (input.body.length > 240 ? 0.029 : 0.034), colors.surface, 400, bodyFont),
    mkText(`${index + 1}/${total}`, w * 0.075, h * 0.91, w * 0.85, h * 0.04, w * 0.023, colors.accent, 700, heading),
  ];
  return finishSlide(elements, colors.background, brand, w, h, total);
}

/**
 * Motor de templates: dado um Brand Kit + N pares título/corpo, produz N
 * slides editáveis 4:5 (1080x1350) com as cores da marca. O slide 1 usa a
 * variante de capa escolhida; os restantes usam o layout de conteúdo.
 * Não chama IA nem rede. Todos os slides nascem com reviewStatus 'pendente'.
 */
export function applyBrandTemplate(
  brand: BrandSchema | null,
  inputs: CarouselSlideInput[],
  options: BrandTemplateOptions = {},
): Slide[] {
  if (!inputs.length) throw new Error('O carrossel precisa de pelo menos um slide.');
  const format = options.format || CAROUSEL_45_FORMAT;
  const variant = options.coverVariant || 'classica';
  return inputs.map((input, index) => {
    const slide = index === 0
      ? buildCoverSlide(input, inputs.length, brand, variant, format)
      : buildContentSlide(input, index, inputs.length, brand, format);
    return { ...slide, reviewStatus: 'pendente' as SlideReviewStatus };
  });
}

/** Gera as 3 variantes de capa para o mesmo título/corpo (mesma copy, sem regenerar). */
export function buildCoverVariants(
  brand: BrandSchema | null,
  cover: CarouselSlideInput,
  total: number,
  format: CanvasFormat = CAROUSEL_45_FORMAT,
): { variant: CoverVariantId; label: string; description: string; slide: Slide }[] {
  return COVER_VARIANTS.map((v) => ({
    variant: v.id, label: v.label, description: v.description,
    slide: { ...buildCoverSlide(cover, total, brand, v.id, format), reviewStatus: 'pendente' as SlideReviewStatus },
  }));
}

/**
 * Substitui APENAS o slide 1 (capa) pela variante escolhida, mantendo o
 * título/corpo aprovados. Os restantes slides são devolvidos por referência
 * (não são tocados nem reconstruídos).
 */
export function applyCoverVariant(
  slides: Slide[],
  variant: CoverVariantId,
  brand: BrandSchema | null,
  format: CanvasFormat = CAROUSEL_45_FORMAT,
): Slide[] {
  if (!slides.length) throw new Error('Não há slides para aplicar a capa.');
  const cover = slideTextContents(slides[0]);
  const next = buildCoverSlide(cover, slides.length, brand, variant, format);
  return slides.map((slide, i) => (i === 0
    ? { ...next, id: slide.id, reviewStatus: slide.reviewStatus || ('pendente' as SlideReviewStatus) }
    : slide));
}

/**
 * Corrige UM card (índice `index`) a partir de novo título/corpo, sem tocar
 * nos restantes slides (devolvidos por referência). Marca o card corrigido
 * com reviewStatus 'corrigido' e regista a data/hora da correção.
 */
export function correctSlide(
  slides: Slide[],
  index: number,
  patch: Partial<CarouselSlideInput>,
  brand: BrandSchema | null = null,
  format: CanvasFormat = CAROUSEL_45_FORMAT,
): Slide[] {
  if (index < 0 || index >= slides.length) throw new Error(`Índice de slide inválido: ${index}.`);
  const current = slideTextContents(slides[index]);
  const input: CarouselSlideInput = {
    title: patch.title !== undefined ? patch.title : current.title,
    body: patch.body !== undefined ? patch.body : current.body,
  };
  const rebuilt = index === 0
    ? buildCoverSlide(input, slides.length, brand, 'classica', format)
    : buildContentSlide(input, index, slides.length, brand, format);
  return slides.map((slide, i) => (i === index
    ? { ...rebuilt, id: slide.id, reviewStatus: 'corrigido' as SlideReviewStatus, correctedAt: new Date().toISOString() }
    : slide));
}

/** Altera o estado de revisão de UM card, sem tocar nos restantes. */
export function setSlideReviewStatus(
  slides: Slide[],
  index: number,
  status: SlideReviewStatus,
): Slide[] {
  if (index < 0 || index >= slides.length) throw new Error(`Índice de slide inválido: ${index}.`);
  return slides.map((slide, i) => (i === index ? { ...slide, reviewStatus: status } : slide));
}

/** Texto do ficheiro caption.txt incluído no ZIP exportado. */
export function buildCaptionText(input: {
  brandName?: string; title?: string; caption: string; hashtags?: string[];
}): string {
  const lines = [
    input.brandName ? `${input.brandName}` : '',
    input.title ? `${input.title}` : '',
    '',
    input.caption.trim(),
  ];
  if (input.hashtags?.length) lines.push('', input.hashtags.join(' '));
  lines.push('', '—', 'Conteúdo de demonstração composto a partir de templates locais (sem IA).');
  return lines.filter((l, i) => !(i < 2 && l === '')).join('\n');
}

// ---------------------------------------------------------------------------
// (h) Consistência visual por marca (Fase 2): verifica que TODOS os slides
// usam só as cores e as fontes do Brand Kit. Devolve a lista de violações
// (vazia = consistente). Não gera imagens — só verifica.
// ---------------------------------------------------------------------------

export interface BrandConsistencyViolation {
  slideIndex: number;
  elementId: string;
  kind: 'color' | 'font' | 'background';
  value: string;
  expected: string;
}

export function checkBrandConsistency(
  slides: Slide[],
  brand: BrandSchema | null,
): BrandConsistencyViolation[] {
  if (!brand) return [];
  const colors = new Set(
    [brand.palette.primary, brand.palette.secondary, brand.palette.accent,
     brand.palette.background, brand.palette.text, brand.palette.surface]
      .filter((c): c is string => Boolean(c)).map((c) => c.toUpperCase()),
  );
  const fonts = new Set(
    [brand.typography.heading, brand.typography.body].filter(Boolean),
  );
  const violations: BrandConsistencyViolation[] = [];
  slides.forEach((slide, slideIndex) => {
    if (slide.background.type === 'color' && !colors.has(slide.background.value.toUpperCase())) {
      violations.push({
        slideIndex, elementId: slide.id, kind: 'background',
        value: slide.background.value, expected: [...colors].join(', '),
      });
    }
    for (const el of slide.elements) {
      if (el.type === 'image') continue; // imagens (ex.: logótipo) não têm cor de marca
      if (el.color && !colors.has(el.color.toUpperCase())) {
        violations.push({
          slideIndex, elementId: el.id, kind: 'color',
          value: el.color, expected: [...colors].join(', '),
        });
      }
      if (el.type === 'text' && el.fontFamily && !fonts.has(el.fontFamily)) {
        violations.push({
          slideIndex, elementId: el.id, kind: 'font',
          value: el.fontFamily, expected: [...fonts].join(', '),
        });
      }
    }
  });
  return violations;
}
