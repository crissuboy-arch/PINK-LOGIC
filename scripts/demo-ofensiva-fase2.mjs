// Demonstração REAL ponta a ponta do fluxo de carrosséis — Fase 2, marca Ofensiva Criativa.
// Correr: ./node_modules/.bin/tsx scripts/demo-ofensiva-fase2.mjs
//
// Cobre os passos (a)–(o) do fluxo: marca (Brand Kit semeado) → entrevista/website
// → radar 30→10 → referência/replicador → arquitetura → copy → 3 capas → cards 4:5
// → correcção de 1 card → revisão/aprovação → legenda + CTA + DM + PDF → export ZIP
// com slides REAIS → gate de aprovação → guardar e reabrir (persistência).
//
// HONESTIDADE: sem AIsa e sem nenhuma API paga — pauta, copy, legenda e DMs são
// CONTEÚDO DE DEMONSTRAÇÃO composto localmente a partir de templates (não gerados
// por IA). Nenhuma imagem de IA por página — só o motor de templates da marca.
// A marca é o fixture local (scripts/ofensiva-criativa-brand.json); a existência
// da marca semeada no preview NÃO foi verificada (GET /api/brands devolveu 401
// sem autenticação). O fetch real ao website NÃO foi executado — a extracção é
// demonstrada sobre um HTML de exemplo escrito localmente. A gravação real no
// Supabase (pl_editor_documents) NÃO foi executada — a persistência é provada
// por round-trip local do projecto (parseProject) + rascunho desktop (saveDraft/
// loadDraft, escrita atómica em disco). A renderização no canvas do browser NÃO
// foi executada (sem browser nesta sessão) — os PNG/JPG são renderizados com
// PIL a partir da mesma geometria do motor (scripts/render-carousel-pil.py).
// Provas em .proof/fase2-demo-ofensiva/.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import {
  normalizeBrandContext, buildBrandFromInterview, extractBrandFromWebsiteHtml,
  newCarouselProject, serializeProject, parseProject, approveProject,
} from '../packages/web/src/services/carouselFlow.ts';
import { generateRadar, topPautas, selectPautas, generateCopy, ARCHITECTURES, getArchitecture } from '../packages/web/src/services/carouselRadar.ts';
import { modelReference, replicateContent } from '../packages/web/src/services/carouselReference.ts';
import {
  buildCaptionVariants, buildCtaVariants, buildDmTemplates, buildDmText, buildPlanPdf,
  buildExportManifest,
} from '../packages/web/src/services/carouselDelivery.ts';
import { checkScheduleGate, disabledAdapter, listAdapters } from '../packages/web/src/services/carouselPublish.ts';
import {
  applyBrandTemplate, buildCoverVariants, applyCoverVariant, correctSlide, setSlideReviewStatus,
  checkBrandConsistency, slideTextContents, buildCaptionText, CAROUSEL_45_FORMAT,
} from '../packages/web/src/services/carouselDocument.ts';
import { saveDraft, loadDraft, listDrafts } from '../packages/desktop/src/drafts.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, '.proof', 'fase2-demo-ofensiva');
const expDir = join(outDir, 'exports');
mkdirSync(expDir, { recursive: true });

const seed = JSON.parse(readFileSync(join(root, 'scripts', 'ofensiva-criativa-brand.json'), 'utf8'));
const ctx = seed.brand_dna.context;
const context = normalizeBrandContext({
  audience: ctx.audience, pains: ctx.pains, goals: ctx.goals, themes: ctx.themes,
  avoid: ctx.avoid, defaultCta: ctx.default_cta, hashtags: ctx.hashtags,
});
const brand = {
  id: 'brand-ofensiva-demo',
  projectId: 'project-ofensiva-demo',
  name: seed.name,
  palette: {
    primary: seed.colors.primary, secondary: seed.colors.secondary, accent: seed.colors.accent,
    background: seed.colors.background, text: seed.colors.text, surface: seed.secondary_colors[0],
  },
  typography: { heading: seed.fonts.heading, body: seed.fonts.body },
  tone: seed.tone, visualStyle: seed.style, logo: seed.logo, // null — sem ficheiro oficial
  colors: [seed.colors.primary, seed.colors.accent],
};

const log = [];
function step(name, detail, status = 'OK') {
  log.push({ step: name, status, detail });
  console.log(`[${status}] ${name} — ${detail}`);
}

// (a) Marca — Brand Kit semeado (fixture local; seed no preview NÃO verificado)
assert.equal(brand.logo, null);
assert.deepEqual([brand.palette.primary, brand.palette.accent], ['#103B78', '#D4AF37']);
step('Marca (Brand Kit)', 'Ofensiva Criativa — cores #103B78/#D4AF37/#FFFFFF/#071D3A/#F5F7FA, slogan «Marketing sem filtro. Resultados sem desculpa.», LOGO VAZIO (não existe ficheiro oficial). Existência no preview NÃO verificada: GET /api/brands devolveu 401 sem autenticação.', 'PARCIAL');

// (b) Entrevista + website — caminhos do fluxo exercidos sobre dados locais
const interview = buildBrandFromInterview({
  name: seed.name, primaryColor: seed.colors.primary, accentColor: seed.colors.accent,
  tone: seed.tone, slogan: seed.brand_dna.slogan, audience: ctx.audience,
}, 'project-ofensiva-demo');
assert.deepEqual(interview.errors, {});
assert.equal(interview.brand.name, seed.name);
assert.equal(interview.brand.palette.primary, seed.colors.primary);
const websiteHtml = `<html><head><title>Ofensiva Criativa</title><meta name="description" content="Marketing sem filtro. Resultados sem desculpa."></head><body><h1>Ofensiva Criativa</h1><p>Pequenas empresas que querem vender mais sem complicação.</p><style>.a{color:#103B78}.b{color:#D4AF37}</style></body></html>`;
const draft = extractBrandFromWebsiteHtml(websiteHtml, 'https://www.ofensivacriativa.com.br');
assert.equal(draft.name, 'Ofensiva Criativa');
assert.ok(draft.colors.includes('#103B78'));
step('Entrevista + website', 'Entrevista validada sem erros (nome/cor/tom iguais ao seed). Website: extracção demonstrada sobre HTML de exemplo local (fetch real NÃO executado); nome e cor #103B78 extraídos.', 'PARCIAL');

// (c) Radar: 30 pautas → top 10
const topic = 'A IA chegou às pequenas empresas';
const radar = generateRadar(topic, context);
assert.equal(radar.pautas.length, 30);
const top10 = topPautas(radar, 10);
const selected = selectPautas(radar, top10.map((p) => p.id));
assert.equal(selected.selectedIds.length, 10);
step('Radar 30 → 10', `30 pautas geradas (determinísticas, sem IA); top 10 seleccionadas. 1.ª = «${selected.pautas[0].title}» (${selected.pautas[0].score}).`);

// (d) Referência modelada + replicador para tema novo
const ref = modelReference({ label: 'Carrossel demo Ofensiva — Fase 2', hook: 'gancho directo sobre a dor', slideCount: 6, structure: ['gancho', 'passo 1', 'passo 2', 'passo 3', 'passo 4', 'CTA'], cta: 'Comenta LINK' });
const replicated = replicateContent({ source: ref, newTopic: 'Vendas directas sem complicação', architectureId: 'passo-a-passo', context, brandName: brand.name, tone: brand.tone });
assert.equal(replicated.slides.length, 6);
assert.equal(replicated.mapping[0].from, 'gancho');
step('Referência + replicador', `Estrutura «${ref.label}» modelada e replicada para «Vendas directas sem complicação» (6 slides, mapeamento gancho→gancho).`);

// (e) Arquitetura — passo-a-passo (6 slides), diferente da demo Fase 2 anterior (lista)
const arch = getArchitecture('passo-a-passo');
assert.equal(arch.slideCount, 6);
assert.equal(ARCHITECTURES.length, 5);
step('Arquitetura', `Escolhida «${arch.label}» (${arch.slideCount} slides) de ${ARCHITECTURES.length} arquiteturas disponíveis (lista, antes-depois, passo-a-passo, história, mito-verdade).`);

// (f) Copy por templates (sem IA)
const copy = generateCopy({ topic, architectureId: 'passo-a-passo', context, brandName: brand.name, tone: brand.tone });
assert.equal(copy.slides.length, 6);
step('Copy', `6 slides gerados por templates locais (sem IA). Capa: «${copy.slides[0].title}». Fecho: «${copy.slides[5].title}».`);

// (g) 3 capas — escolhida «destaque»
const variants = buildCoverVariants(brand, copy.slides[0], copy.slides.length, CAROUSEL_45_FORMAT);
assert.equal(variants.length, 3);
assert.equal(new Set(variants.map((o) => o.slide.background.value)).size, 3);
const chosenCover = 'destaque';
step('Capas', `3 variantes geradas (clássica #103B78, destaque #F5F7FA, minimal #071D3A), mesmo título. Escolhida: «${chosenCover}».`);

// (h) Cards 4:5 com o motor de templates + consistência de marca
let slides = applyBrandTemplate(brand, copy.slides, { coverVariant: chosenCover });
slides = applyCoverVariant(slides, chosenCover, brand);
assert.equal(slides.length, 6);
assert.deepEqual(checkBrandConsistency(slides, brand), []);
assert.ok(slides.every((s) => s.elements.length > 0));
step('Cards 4:5', `6 cards 1080×1350 produzidos pelo motor (cores da marca, nº 1/6–6/6). Consistência de marca: 0 violações.`);

// (i) Corrigir 1 card — só o card 3 muda
const before = slideTextContents(slides[2]);
const beforeRefs = slides.map((s) => s);
slides = correctSlide(slides, 2, {
  title: 'Passo 2 — revisto por ti',
  body: 'Ideias, textos e legendas saem em minutos — revisto por ti, não escrito por ti.',
}, brand);
assert.equal(slides[2].reviewStatus, 'corrigido');
assert.ok(slides[2].correctedAt);
for (const i of [0, 1, 3, 4, 5]) assert.equal(slides[i], beforeRefs[i]);
slides = setSlideReviewStatus(slides, 2, 'aprovado');
step('Corrigir 1 card', `Card 3 corrigido e aprovado. Antes: «${before.title}». Depois: «${slideTextContents(slides[2]).title}». Cards 1, 2, 4, 5 e 6 intocados.`);
writeFileSync(join(outDir, 'correction-card-3.json'), JSON.stringify({ before, after: slideTextContents(slides[2]), correctedAt: slides[2].correctedAt }, null, 2));

// (j) Revisão — aprovar todos os cards
for (let i = 0; i < slides.length; i++) slides = setSlideReviewStatus(slides, i, 'aprovado');
assert.ok(slides.every((s) => s.reviewStatus === 'aprovado'));
step('Revisão', '6/6 cards aprovados (revisão por card).');

// (o) Projecto + aprovação humana + gate de agendamento
let project = newCarouselProject({ id: 'carousel-ofensiva-fase2', title: topic, brand, context, topic });
project.architectureId = 'passo-a-passo';
project.coverVariant = chosenCover;
project.slides = slides.map(slideTextContents);
project.caption = copy.caption;
project.hashtags = copy.hashtags;
project.pautaId = selected.selectedIds[0];
project.referenceId = ref.id;
const gateBefore = checkScheduleGate(project, slides.map((s) => s.reviewStatus ?? 'pendente'));
assert.equal(gateBefore.ok, false, 'gate devia estar fechado sem aprovação');
project = approveProject(project, 'Cristiane');
const gateAfter = checkScheduleGate(project, slides.map((s) => s.reviewStatus ?? 'pendente'));
assert.equal(gateAfter.ok, true);
const adapters = listAdapters();
assert.ok(adapters.every((a) => a.enabled === false));
step('Gate de aprovação', `Gate FECHADO sem aprovação → ABERTO após aprovação por Cristiane. Publicação: Instagram ${disabledAdapter('instagram').enabled ? 'activo' : 'desactivado'}, Composio ${disabledAdapter('composio').enabled ? 'activo' : 'desactivado'} (nada agenda nem publica sem aprovação).`);

// (k) Legenda + variantes de CTA + DM + PDF do plano
const delivery = { brandName: brand.name, title: project.title, caption: copy.caption, hashtags: copy.hashtags, slides: project.slides, cta: context.defaultCta };
const captionVariants = buildCaptionVariants(delivery);
const ctaVariants = buildCtaVariants(context.defaultCta);
const dmTemplates = buildDmTemplates(delivery);
assert.equal(ctaVariants.length, 3);
assert.ok(captionVariants.main.includes('#OfensivaCriativa'));
const pdf = buildPlanPdf(delivery);
assert.ok(new TextDecoder('latin1').decode(pdf).startsWith('%PDF-1.4'));
const captionText = buildCaptionText({ brandName: brand.name, title: project.title, caption: copy.caption, hashtags: copy.hashtags });
const dmText = buildDmText(delivery);
step('Legenda + CTA + DM + PDF', `Legenda principal + 2 variantes (curta/pergunta), 3 variantes de CTA, 3 templates de DM (resposta/seguimento/partilha), plano.pdf gerado localmente (${pdf.length} bytes).`);

// (l) Export — render real dos slides (PIL) + ZIP com ficheiros reais
const document = { slides, canvasFormat: CAROUSEL_45_FORMAT, slideCount: slides.length, caption: captionText };
writeFileSync(join(outDir, 'slides.json'), JSON.stringify(document, null, 2));
writeFileSync(join(outDir, 'cover-variants.json'), JSON.stringify(variants.map((o) => ({ variant: o.variant, label: o.label, slide: o.slide })), null, 2));
const render = spawnSync('python3', [join(root, 'scripts', 'render-carousel-pil.py'), outDir], { encoding: 'utf-8' });
if (render.status !== 0) { console.error(render.stdout, render.stderr); throw new Error('render-carousel-pil.py falhou'); }
console.log(render.stdout.trim());
const manifest = buildExportManifest({ slideCount: slides.length });
const zip = new JSZip();
const fixedDate = new Date('1980-01-01T00:00:00Z');
for (let i = 1; i <= slides.length; i++) {
  zip.file(`slide-${i}.png`, readFileSync(join(expDir, `slide-${i}.png`)), { date: fixedDate });
  zip.file(`slide-${i}.jpg`, readFileSync(join(expDir, `slide-${i}.jpg`)), { date: fixedDate });
}
for (const v of variants) {
  zip.file(`cover-${v.variant}.png`, readFileSync(join(expDir, `cover-${v.variant}.png`)), { date: fixedDate });
  zip.file(`cover-${v.variant}.jpg`, readFileSync(join(expDir, `cover-${v.variant}.jpg`)), { date: fixedDate });
}
zip.file('caption.txt', captionText, { date: fixedDate });
zip.file('plano.pdf', pdf, { date: fixedDate });
zip.file('dm.txt', dmText, { date: fixedDate });
zip.file('project.json', serializeProject(project), { date: fixedDate });
zip.file('MANIFESTO.txt', [
  'ZIP de entrega do carrossel — Ofensiva Criativa, Fase 2 (ficheiros reais):',
  ...manifest.map((m) => ` - ${m.name}`),
  ...variants.map((v) => ` - cover-${v.variant}.png/jpg`),
  '',
  'Conteúdo de demonstração composto a partir de templates locais (sem IA).',
].join('\n'), { date: fixedDate });
const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
const loaded = await JSZip.loadAsync(zipBuffer);
const names = Object.keys(loaded.files).sort();
assert.ok(names.includes('slide-1.png') && names.includes(`slide-${slides.length}.jpg`));
for (let i = 1; i <= slides.length; i++) {
  const png = await loaded.file(`slide-${i}.png`).async('nodebuffer');
  assert.ok(png.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), `slide-${i}.png sem assinatura PNG`);
  assert.equal(png.readUInt32BE(16), 1080, `slide-${i}.png largura`);
  assert.equal(png.readUInt32BE(20), 1350, `slide-${i}.png altura`);
  const jpg = await loaded.file(`slide-${i}.jpg`).async('nodebuffer');
  assert.ok(jpg.subarray(0, 2).equals(Buffer.from([0xff, 0xd8])), `slide-${i}.jpg sem assinatura JPEG`);
}
assert.ok((await loaded.file('plano.pdf').async('nodebuffer')).subarray(0, 8).toString('latin1').startsWith('%PDF-1.4'));
assert.equal(await loaded.file('caption.txt').async('string'), captionText);
step('Export (ZIP)', `ZIP de entrega: ${names.length} ficheiros reais (${zipBuffer.length} bytes) — ${slides.length} slides PNG+JPG 1080×1350, 3 capas PNG+JPG, caption.txt, plano.pdf, dm.txt, project.json, MANIFESTO.txt. Verificados: magia PNG/JPEG + dimensões + PDF + legenda.`);

// (o) Persistência — guardar e reabrir
writeFileSync(join(outDir, 'radar.json'), JSON.stringify(selected, null, 2));
writeFileSync(join(outDir, 'project.json'), serializeProject(project));
writeFileSync(join(outDir, 'caption.txt'), captionText);
writeFileSync(join(outDir, 'dm.txt'), dmText);
writeFileSync(join(outDir, 'plano.pdf'), pdf);
writeFileSync(join(outDir, 'carousel-ofensiva-fase2-demo.zip'), zipBuffer);
const reopened = parseProject(readFileSync(join(outDir, 'project.json'), 'utf-8'));
assert.equal(reopened.id, project.id);
assert.equal(reopened.slides.length, 6);
assert.equal(reopened.slides[2].title, 'Passo 2 — revisto por ti');
assert.equal(reopened.approvedBy, 'Cristiane');
assert.equal(reopened.architectureId, 'passo-a-passo');
const userDataDir = join(outDir, 'drafts-userdata');
const meta = saveDraft(userDataDir, { id: 'demo-ofensiva-fase2', title: project.title, data: JSON.parse(serializeProject(project)) });
const loadedDraft = loadDraft(userDataDir, 'demo-ofensiva-fase2');
assert.ok(loadedDraft);
assert.equal(loadedDraft.data.title, project.title);
assert.equal(loadedDraft.data.slides.length, 6);
assert.ok(listDrafts(userDataDir).some((d) => d.id === meta.id));
step('Guardar e reabrir', 'Round-trip local do projecto (parseProject): 6 slides, card 3 corrigido, aprovado por Cristiane, arquitetura passo-a-passo — igual ao guardado. Rascunho desktop (saveDraft/loadDraft, escrita atómica): guardado e relido em disco. Gravação real no Supabase NÃO executada — requer sessão autenticada.', 'PARCIAL');

writeFileSync(join(outDir, 'demo-log.json'), JSON.stringify({
  theme: topic, architecture: arch.id, coverVariant: chosenCover,
  brand: { name: brand.name, slogan: seed.brand_dna.slogan, palette: brand.palette, logo: null },
  honesty: 'Sem AIsa e sem nenhuma API paga: pauta, copy, legenda e DMs são CONTEÚDO DE DEMONSTRAÇÃO composto localmente a partir de templates (não gerados por IA). Nenhuma imagem de IA por página. A marca é um fixture local; a existência da marca semeada no preview NÃO foi verificada. O fetch real ao website NÃO foi executado. A gravação real no Supabase NÃO foi executada. A renderização no canvas do browser NÃO foi executada (sem browser nesta sessão) — PNG/JPG via PIL a partir da mesma geometria do motor.',
  steps: log,
  zipFiles: names, zipBytes: zipBuffer.length,
  generatedAt: new Date().toISOString(),
}, null, 2));
console.log(`\nDemo guardada em ${outDir}`);
