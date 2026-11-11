// Teste do motor económico de templates 4:5 (sem IA) — packages/web/src/services/carouselDocument.ts
// Correr: ./node_modules/.bin/tsx --test tests/carousel-template.test.mjs
// Não chama rede nem IA; usa o Brand Kit da Ofensiva Criativa do briefing
// (nome, slogan, cores #103B78/#D4AF37/#FFFFFF/#071D3A/#F5F7FA, sem logótipo).
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyBrandTemplate,
  buildCoverVariants,
  applyCoverVariant,
  correctSlide,
  setSlideReviewStatus,
  slideTextContents,
  buildCaptionText,
  COVER_VARIANTS,
  CAROUSEL_45_FORMAT,
} from '../packages/web/src/services/carouselDocument.ts';

export const OFENSIVA_BRAND = {
  id: 'brand-ofensiva-demo',
  projectId: 'project-ofensiva-demo',
  name: 'Ofensiva Criativa',
  palette: {
    primary: '#103B78',
    secondary: '#071D3A',
    accent: '#D4AF37',
    background: '#071D3A',
    text: '#FFFFFF',
    surface: '#F5F7FA',
  },
  typography: { heading: 'Inter', body: 'Inter' },
  visualStyle: 'Marketing sem filtro. Resultados sem desculpa.',
  tone: 'direto',
  colors: ['#103B78', '#D4AF37'],
};

export const DEMO_INPUTS = [
  { title: 'A IA chegou às pequenas empresas', body: 'Não é só para as grandes: hoje uma pequena empresa usa IA para atender, vender e criar todos os dias.' },
  { title: '1. Atendimento sem parar', body: 'Respostas automáticas tiram dúvidas e marcam contactos enquanto dormes — sem contratar ninguém.' },
  { title: '2. Conteúdo em minutos', body: 'Ideias, textos e legendas saem em minutos. O teu trabalho passa a ser rever e aprovar, não escrever do zero.' },
  { title: '3. Anúncios mais certeiros', body: 'A IA testa variações e mostra o que funciona — gastas menos para chegar às pessoas certas.' },
  { title: 'O próximo passo é teu', body: 'Escolhe uma tarefa repetitiva desta semana e testa uma ferramenta de IA nela. Começa pequeno.' },
];

function assertInsideSlide(slide, i) {
  assert.equal(slide.background.type, 'color');
  for (const el of slide.elements) {
    assert.ok(el.x >= 0 && el.y >= 0, `slide ${i + 1}: elemento fora do canvas (${el.x},${el.y})`);
    assert.ok(el.x + el.width <= 1080 + 0.01, `slide ${i + 1}: elemento excede a largura`);
    assert.ok(el.y + el.height <= 1350 + 0.01, `slide ${i + 1}: elemento excede a altura`);
  }
  assert.ok(slide.elements.some((el) => el.type === 'text' && el.content.includes(`${i + 1}/5`)), `slide ${i + 1}: falta o nº ${i + 1}/5`);
}

test('formato 4:5 é 1080x1350', () => {
  assert.deepEqual(
    { width: CAROUSEL_45_FORMAT.width, height: CAROUSEL_45_FORMAT.height },
    { width: 1080, height: 1350 },
  );
});

test('applyBrandTemplate: 5 slides 4:5 com as cores da Ofensiva, todos pendentes', () => {
  const slides = applyBrandTemplate(OFENSIVA_BRAND, DEMO_INPUTS);
  assert.equal(slides.length, 5);
  const brandColors = new Set(['#103B78', '#D4AF37', '#FFFFFF', '#071D3A', '#F5F7FA']);
  slides.forEach((slide, i) => {
    assert.equal(slide.reviewStatus, 'pendente');
    assert.ok(brandColors.has(slide.background.value), `slide ${i + 1}: fundo ${slide.background.value} não é cor da marca`);
    assert.ok(slide.elements.every((el) => !el.color || brandColors.has(el.color) || el.type !== 'text'), `slide ${i + 1}: cor de texto fora da marca`);
    assertInsideSlide(slide, i);
    const { title } = slideTextContents(slide);
    assert.ok(title.length > 0, `slide ${i + 1}: sem título`);
  });
  // Sem logótipo da Ofensiva: nenhum elemento de imagem pode existir.
  assert.ok(slides.every((s) => s.elements.every((el) => el.type !== 'image')));
  // A capa usa o fundo primário da marca (variante clássica por omissão).
  assert.equal(slides[0].background.value, '#103B78');
});

test('buildCoverVariants: 3 variantes, mesmo título, composições distintas', () => {
  assert.equal(COVER_VARIANTS.length, 3);
  const variants = buildCoverVariants(OFENSIVA_BRAND, DEMO_INPUTS[0], 5);
  assert.equal(variants.length, 3);
  assert.deepEqual(variants.map((v) => v.variant), ['classica', 'destaque', 'minimal']);
  const backgrounds = variants.map((v) => v.slide.background.value);
  assert.equal(new Set(backgrounds).size, 3, `fundos das capas deviam ser distintos: ${backgrounds.join(', ')}`);
  assert.deepEqual(backgrounds, ['#103B78', '#F5F7FA', '#071D3A']);
  for (const v of variants) {
    assert.equal(slideTextContents(v.slide).title, DEMO_INPUTS[0].title, `variante ${v.variant}: título mudou`);
  }
});

test('applyCoverVariant: só o slide 1 muda; os restantes são os mesmos objetos', () => {
  const slides = applyBrandTemplate(OFENSIVA_BRAND, DEMO_INPUTS);
  const next = applyCoverVariant(slides, 'destaque', OFENSIVA_BRAND);
  assert.equal(next.length, 5);
  assert.notEqual(next[0], slides[0]);
  assert.equal(next[0].background.value, '#F5F7FA');
  assert.equal(slideTextContents(next[0]).title, DEMO_INPUTS[0].title);
  for (let i = 1; i < 5; i++) assert.equal(next[i], slides[i], `slide ${i + 1} foi tocado`);
});

test('correctSlide: corrige só o card 3, regista a correção, os outros ficam intactos', () => {
  const slides = applyBrandTemplate(OFENSIVA_BRAND, DEMO_INPUTS);
  const correctedTitle = '2. Conteúdo em minutos (revisto)';
  const next = correctSlide(slides, 2, { title: correctedTitle }, OFENSIVA_BRAND);
  assert.equal(next.length, 5);
  assert.equal(slideTextContents(next[2]).title, correctedTitle);
  assert.equal(next[2].reviewStatus, 'corrigido');
  assert.ok(next[2].correctedAt, 'falta correctedAt no card corrigido');
  assert.ok(!Number.isNaN(Date.parse(next[2].correctedAt)), 'correctedAt não é data ISO válida');
  for (const i of [0, 1, 3, 4]) assert.equal(next[i], slides[i], `slide ${i + 1} foi tocado`);
  assert.throws(() => correctSlide(slides, 9, { title: 'x' }), /Índice de slide inválido/);
});

test('setSlideReviewStatus: só o card indicado muda de estado', () => {
  const slides = applyBrandTemplate(OFENSIVA_BRAND, DEMO_INPUTS);
  const next = setSlideReviewStatus(slides, 0, 'aprovado');
  assert.equal(next[0].reviewStatus, 'aprovado');
  for (let i = 1; i < 5; i++) assert.equal(next[i], slides[i]);
  assert.throws(() => setSlideReviewStatus(slides, -1, 'aprovado'), /Índice de slide inválido/);
});

test('buildCaptionText: inclui legenda, hashtags e o aviso de conteúdo de demonstração', () => {
  const text = buildCaptionText({
    brandName: 'Ofensiva Criativa',
    title: 'A IA chegou às pequenas empresas',
    caption: 'A IA não é só para as grandes.',
    hashtags: ['#Marketing', '#IA'],
  });
  assert.ok(text.includes('A IA não é só para as grandes.'));
  assert.ok(text.includes('#Marketing #IA'));
  assert.ok(text.includes('sem IA'));
});

// ---------------------------------------------------------------------------
// Contraste (Fase 3): a paleta do seed da Ofensiva usa background #FFFFFF +
// texto #071D3A — a convenção oposta à da app (fundo escuro + texto claro).
// Antes do fix por luminância, o corpo dos slides saía branco sobre branco
// (contraste 1,0) apesar de «0 violações» de consistência. O motor tem de
// resolver os papéis por luminância para as duas convenções darem texto
// legível (WCAG AA, 4,5:1) em todas as variantes de capa.
// ---------------------------------------------------------------------------
function testLuminance(hex) {
  const h = hex.replace('#', '');
  const ch = [0, 2, 4].map((i) => {
    const v = parseInt(h.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

function contrastRatio(a, b) {
  const [hi, lo] = [testLuminance(a), testLuminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

test('contraste: paleta com background claro + texto escuro dá texto legível em todas as capas', () => {
  const seedBrand = {
    ...OFENSIVA_BRAND,
    palette: { primary: '#103B78', secondary: '#071D3A', accent: '#D4AF37', background: '#FFFFFF', text: '#071D3A', surface: '#F5F7FA' },
  };
  for (const variant of ['classica', 'destaque', 'minimal']) {
    const slides = applyBrandTemplate(seedBrand, DEMO_INPUTS, { coverVariant: variant });
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const shapes = slide.elements.filter((el) => el.type === 'shape');
      for (const el of slide.elements) {
        if (el.type !== 'text' || !el.color) continue;
        // Fundo efectivo: a forma (barra) por baixo do texto, se existir.
        const cx = el.x + el.width / 2;
        const cy = el.y + el.height / 2;
        const under = shapes.filter((s) => cx >= s.x && cx <= s.x + s.width && cy >= s.y && cy <= s.y + s.height)
          .sort((a, b) => a.zIndex - b.zIndex).at(-1);
        const bg = under?.color || slide.background.value;
        const ratio = contrastRatio(el.color, bg);
        assert.ok(ratio >= 4.5, `${variant} slide ${i + 1}: «${el.content.slice(0, 30)}» ${el.color} sobre ${bg} — contraste ${ratio.toFixed(2)} < 4.5`);
      }
    }
  }
});
