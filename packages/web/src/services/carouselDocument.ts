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
