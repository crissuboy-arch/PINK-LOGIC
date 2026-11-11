// Demonstração do fluxo de carrossel 4:5 — Ofensiva Criativa (Fase 1, motor de templates)
// Correr: ./node_modules/.bin/tsx scripts/demo-carousel-ofensiva.mjs
//
// HONESTIDADE: sem AIsa e sem nenhuma API paga, a pauta/roteiro/copy abaixo
// são CONTEÚDO DE DEMONSTRAÇÃO escrito localmente a partir de templates
// (não gerados por IA). Nenhuma imagem de IA por página — só o template da
// marca. A marca é um fixture local com os valores do briefing (nome, slogan
// e cores); a existência da marca semeada no preview NÃO foi verificada
// (GET /api/brands devolveu 401 sem autenticação) — ver demo-log.json.
// A persistência é demonstrada como round-trip local do documento JSON (o
// mesmo formato que saveEditorData envia para pl_editor_documents); a
// gravação real no Supabase NÃO foi executada (requer sessão autenticada).
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import {
  applyBrandTemplate,
  buildCoverVariants,
  applyCoverVariant,
  correctSlide,
  setSlideReviewStatus,
  slideTextContents,
  buildCaptionText,
  CAROUSEL_45_FORMAT,
} from '../packages/web/src/services/carouselDocument.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, '.proof', 'fase1-motor', 'demo-ofensiva');
mkdirSync(outDir, { recursive: true });

const log = [];
function step(name, detail, status = 'OK') {
  log.push({ step: name, status, detail });
  console.log(`[${status}] ${name} — ${detail}`);
}

// 1. Selecionar a marca (fixture local com os valores do briefing; seed no preview NÃO verificado)
const brand = {
  id: 'brand-ofensiva-demo',
  projectId: 'project-ofensiva-demo',
  name: 'Ofensiva Criativa',
  palette: { primary: '#103B78', secondary: '#071D3A', accent: '#D4AF37', background: '#071D3A', text: '#FFFFFF', surface: '#F5F7FA' },
  typography: { heading: 'Inter', body: 'Inter' },
  visualStyle: 'Marketing sem filtro. Resultados sem desculpa.',
  tone: 'direto',
  colors: ['#103B78', '#D4AF37'],
};
step('Selecionar a marca', 'Ofensiva Criativa — fixture local (cores #103B78/#D4AF37/#FFFFFF/#071D3A/#F5F7FA, sem logótipo). Existência no preview NÃO verificada: GET /api/brands devolveu 401 sem autenticação.', 'PARCIAL');

// 2. Pauta (conteúdo de demonstração, escrito localmente — NÃO gerado por IA)
const theme = 'Como a inteligência artificial está a transformar o marketing das pequenas empresas';
const pauta = [
  'A IA chegou às pequenas empresas',
  'Atendimento sem parar',
  'Conteúdo em minutos',
  'Anúncios mais certeiros',
  'O próximo passo é teu',
];
step('Pauta', `Tema: «${theme}». 5 pontos definidos localmente (conteúdo de demonstração, sem IA).`);

// 3. Roteiro (conteúdo de demonstração, escrito localmente — NÃO gerado por IA)
const inputs = [
  { title: 'A IA está a transformar o marketing das pequenas empresas', body: 'O que muda, na prática, para quem tem uma pequena empresa — sem jargão e sem promessas mágicas.' },
  { title: '1. Atendimento sem parar', body: 'Respostas automáticas tiram dúvidas e agendam contactos enquanto dormes — sem contratar ninguém.' },
  { title: '2. Conteúdo em minutos', body: 'Ideias, textos e legendas saem em minutos. O teu trabalho passa a ser rever e aprovar, não escrever do zero.' },
  { title: '3. Anúncios mais certeiros', body: 'A IA testa variações e mostra o que funciona — gastas menos para chegar às pessoas certas.' },
  { title: 'O próximo passo é teu', body: 'Escolhe uma tarefa repetitiva desta semana e testa uma ferramenta de IA nela. Começa pequeno, mede, repete.' },
];
step('Roteiro', '5 pares título/corpo escritos localmente (conteúdo de demonstração, sem IA).');

// 4. Rever textos — todos os cards nascem pendentes; aprovar 1, 2, 4 e 5; o 3 fica para corrigir
let slides = applyBrandTemplate(brand, inputs);
assert.equal(slides.length, 5);
for (const i of [0, 1, 3, 4]) slides = setSlideReviewStatus(slides, i, 'aprovado');
step('Rever textos', `5 cards produzidos pelo motor (1080x1350, cores da marca). Aprovados: 1, 2, 4, 5. Card 3: pendente, a corrigir.`);

// 5. Escolher capa — 3 variantes a partir do título aprovado, sem regenerar a copy
const coverOptions = buildCoverVariants(brand, inputs[0], 5);
assert.equal(coverOptions.length, 3);
assert.equal(new Set(coverOptions.map((o) => o.slide.background.value)).size, 3);
const chosen = 'destaque';
slides = applyCoverVariant(slides, chosen, brand);
assert.equal(slides[0].background.value, '#F5F7FA');
step('Escolher capa', `3 variantes geradas (clássica #103B78, destaque #F5F7FA, minimal #071D3A), mesmo título. Escolhida: «destaque». Restantes 4 cards intactos (mesmos objetos).`);

// 6. Produzir 5 cards — já feito pelo motor no passo 4 (confirmar contagem e formato)
assert.ok(slides.every((s) => s.elements.length > 0));
step('Produzir 5 cards', '5 cards 1080x1350 com fundo/cor da marca, hierarquia tipográfica e nº 1/5–5/5.');

// 7. Corrigir 1 card — só o card 3 muda; os outros 4 são os mesmos objetos
const before = slideTextContents(slides[2]);
const beforeRefs = slides.map((s) => s);
slides = correctSlide(slides, 2, {
  title: '2. Conteúdo em minutos, com a tua voz',
  body: 'Ideias, textos e legendas saem em minutos — mas a revisão é tua: a IA propõe, tu aprovas com a tua voz.',
}, brand);
assert.equal(slides[2].reviewStatus, 'corrigido');
assert.ok(slides[2].correctedAt);
for (const i of [0, 1, 3, 4]) assert.equal(slides[i], beforeRefs[i]);
slides = setSlideReviewStatus(slides, 2, 'aprovado');
step('Corrigir 1 card', `Card 3 corrigido e aprovado. Antes: «${before.title}». Depois: «${slideTextContents(slides[2]).title}». Cards 1, 2, 4 e 5 intocados.`);
writeFileSync(join(outDir, 'correction-card-3.json'), JSON.stringify({ before, after: slideTextContents(slides[2]), correctedAt: slides[2].correctedAt }, null, 2));

// 8. Criar legenda (conteúdo de demonstração, escrito localmente — NÃO gerado por IA)
const caption = buildCaptionText({
  brandName: brand.name,
  title: inputs[0].title,
  caption: 'A inteligência artificial não é só para as grandes empresas. Atendimento automático, conteúdo em minutos e anúncios mais certeiros — tudo ao alcance de uma pequena empresa. Começa por uma tarefa repetitiva desta semana e mede o resultado.',
  hashtags: ['#MarketingDigital', '#PequenasEmpresas', '#InteligenciaArtificial', '#OfensivaCriativa'],
});
writeFileSync(join(outDir, 'caption.txt'), caption);
step('Criar legenda', 'caption.txt escrito localmente (conteúdo de demonstração, sem IA), com hashtags e aviso de demonstração.');

// 9. Exportar os 5 cards — renderização real via PIL (scripts/render-carousel-pil.py) + ZIP via JSZip (scripts/zip-carousel-demo.mjs)
const document = { slides, canvasFormat: CAROUSEL_45_FORMAT, slideCount: slides.length, caption };
writeFileSync(join(outDir, 'slides.json'), JSON.stringify(document, null, 2));
writeFileSync(join(outDir, 'cover-variants.json'), JSON.stringify(coverOptions.map((o) => ({ variant: o.variant, label: o.label, slide: o.slide })), null, 2));
step('Exportar os 5 cards', 'Documento guardado em slides.json; renderização PNG/JPG + ZIP feita pelos scripts render-carousel-pil.py e zip-carousel-demo.mjs (ver demo-log.json e o ZIP).');

// 10. Guardar projeto + fechar e reabrir (round-trip local do documento)
const savedPath = join(outDir, 'project-document.json');
writeFileSync(savedPath, JSON.stringify(document, null, 2));
const reopened = JSON.parse(readFileSync(savedPath, 'utf-8'));
assert.deepEqual(reopened, document);
assert.equal(reopened.slides.length, 5);
assert.equal(reopened.slides[2].reviewStatus, 'aprovado');
assert.ok(reopened.slides[2].correctedAt);
step('Guardar projeto, fechar e reabrir', 'Round-trip local do documento JSON: guardado e relido sem diferenças (5 slides, card 3 aprovado com correctedAt). Gravação real no Supabase (pl_editor_documents) NÃO executada — requer sessão autenticada.', 'PARCIAL');

// 11. Confirmar persistência
step('Confirmar persistência', 'O documento relido é igual ao guardado (deepEqual PASS). A persistência no Supabase continua por verificar numa sessão autenticada.', 'PARCIAL');

writeFileSync(join(outDir, 'demo-log.json'), JSON.stringify({
  theme, pauta, brand: { name: brand.name, slogan: brand.visualStyle, palette: brand.palette, logo: null },
  honesty: 'Sem AIsa e sem nenhuma API paga: pauta, roteiro, copy e legenda são CONTEÚDO DE DEMONSTRAÇÃO escrito localmente a partir de templates (não gerados por IA). Nenhuma imagem de IA por página. A marca é um fixture local; a existência da marca semeada no preview NÃO foi verificada (GET /api/brands devolveu 401 sem autenticação). A gravação real no Supabase NÃO foi executada.',
  steps: log,
}, null, 2));
console.log(`\nDemo guardada em ${outDir}`);
