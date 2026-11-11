// PRIMEIRA PROVA REAL — Pink Logic 2.0, Fase 3 (fluxo completo de 15 passos).
// Correr: ./node_modules/.bin/tsx scripts/demo-fase3-primeira-prova.mjs
//
// Gera na app (serviços reais do fluxo) um carrossel de 5 cards da marca
// Ofensiva Criativa, em MODO DE TESTE, e prova cada passo com artefactos em
// .proof/fase3-primeira-prova/ (ZIP, slides, caption, PDF, project.json,
// log do self-test Electron, capturas de ecrã reais).
//
// HONESTIDADE (o que NÃO é provado aqui):
// - Conteúdo de demonstração: pauta, copy, legenda e DMs são compostos
//   localmente a partir de templates — NÃO gerados pelos modelos da OpenAI.
//   Custo $0; nenhuma chamada paga; nenhuma chave configurada.
// - O fetch real ao website NÃO foi executado — a extracção é demonstrada
//   sobre um HTML de exemplo escrito localmente (como na Fase 2).
// - O botão «Guardar no Brand Kit» da UI NÃO foi clicado aqui (não há
//   automação de cliques nesta sessão): a marca é provada por entrevista
//   (buildBrandFromInterview) e o botão existe na página do fluxo.
// - A gravação real no Supabase NÃO foi executada — a persistência é
//   provada por round-trip local do projecto + rascunho desktop atómico
//   (saveDraft/loadDraft) + round-trip do projecto no self-test Electron
//   via preload real.
// - Os PNG/JPG do ZIP são renderizados com PIL a partir da MESMA geometria
//   do motor (scripts/render-carousel-pil.py), como na Fase 2. A
//   renderização no canvas do browser (novo serviço carouselRender.ts, usado
//   pela exportação na app) NÃO foi executada aqui — é provada por testes
//   unitários com mock de canvas (tests/carousel-render.test.mjs, 4/4) e
//   pela presença do código na build.
// - As capturas de ecrã são da app REAL a correr em Electron sob xvfb
//   (self-test alargado): arranque por file://, fluxo e ecrã de IA.
//   A sessão é local de demonstração, só aceite no bundle de self-test
//   (VITE_PINK_DESKTOP_SELFTEST=1 — ver authService).
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import {
  normalizeBrandContext, buildBrandFromInterview, extractBrandFromWebsiteHtml,
  newCarouselProject, serializeProject, parseProject, approveProject,
} from '../packages/web/src/services/carouselFlow.ts';
import { generateRadar, topPautas, selectPautas, ARCHITECTURES, getArchitecture } from '../packages/web/src/services/carouselRadar.ts';
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
import {
  defaultAiState, effectiveStatus, generateTestCopy, checkApiGate,
} from '../packages/web/src/services/aiConnection.ts';
import { saveDraft, loadDraft, listDrafts } from '../packages/desktop/src/drafts.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, '.proof', 'fase3-primeira-prova');
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
};

const log = [];
function step(name, detail, status = 'OK') {
  log.push({ step: name, status, detail });
  console.log(`[${status}] ${name} — ${detail}`);
}

// Passo 2 — Ligação de IA: modo de teste predefinido, sem chave, custo $0.
const aiState = defaultAiState();
assert.equal(aiState.settings.mode, 'teste');
assert.equal(effectiveStatus(aiState), 'teste');
assert.equal(aiState.hasKey, false);
const gateInTest = checkApiGate(aiState, 0.05);
assert.equal(gateInTest.allowed, false, 'em modo de teste a API real tem de ser recusada pelo gate');
step('2. Ligar a IA (modo de teste)', 'Estado predefinido: modo «teste», sem chave, gasto $0. O gate recusa a geração real em modo de teste. O ecrã /sistema/ia e o rótulo de demonstração são provados no self-test Electron (screenshot-ia.png).', 'OK');

// Passos 3–5 — Marca: entrevista + website + Brand Kit.
assert.equal(brand.logo, null);
assert.deepEqual([brand.palette.primary, brand.palette.accent], ['#103B78', '#D4AF37']);
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
step('3. Site ou descrição do negócio', 'Website: extracção demonstrada sobre HTML de exemplo local (fetch real NÃO executado); nome e cor #103B78 extraídos. A importação por URL existe na etapa 1 do fluxo.', 'PARCIAL');
step('4. Contexto Oficial da Marca por entrevista', 'Entrevista validada sem erros (nome/cor/tom/slogan iguais ao seed).', 'OK');
step('5. Brand Kit guardado', 'Marca «Ofensiva Criativa» — cores #103B78/#D4AF37/#FFFFFF/#071D3A/#F5F7FA, slogan «Marketing sem filtro. Resultados sem desculpa.», LOGO VAZIO (não existe ficheiro oficial). O botão «Guardar no Brand Kit» existe na etapa 1 do fluxo; o clique na UI NÃO foi executado nesta prova (sem automação de cliques).', 'PARCIAL');

// Passo 6 — Radar: 30 pautas → top 10.
const topic = 'A IA chegou às pequenas empresas';
const radar = generateRadar(topic, context);
assert.equal(radar.pautas.length, 30);
const top10 = topPautas(radar, 10);
const selected = selectPautas(radar, top10.map((p) => p.id));
assert.equal(selected.selectedIds.length, 10);
step('6. Radar — 30 pautas, 10 destacadas', `30 pautas geradas (determinísticas, sem IA); top 10 seleccionadas. 1.ª = «${selected.pautas[0].title}» (${selected.pautas[0].score}).`);

// Passo 7 — Tema + estrutura: 'lista' = 5 cards (a prova pede cinco).
const arch = getArchitecture('lista');
assert.equal(arch.slideCount, 5);
assert.equal(ARCHITECTURES.length, 5);
const ref = modelReference({ label: 'Carrossel demo Ofensiva — Fase 3', hook: 'gancho directo sobre a dor', slideCount: 5, structure: ['gancho', 'ponto 1', 'ponto 2', 'ponto 3', 'CTA'], cta: 'Comenta LINK' });
const replicated = replicateContent({ source: ref, newTopic: 'Vendas directas sem complicação', architectureId: 'lista', context, brandName: brand.name, tone: brand.tone });
assert.equal(replicated.slides.length, 5);
step('7. Tema + estrutura do carrossel', `Arquitetura «${arch.label}» (${arch.slideCount} slides) de ${ARCHITECTURES.length} disponíveis. Referência modelada e replicada para «Vendas directas sem complicação» (5 slides).`);

// Passo 8 — Copy em modo de teste (declarado como demonstração).
const testCopy = generateTestCopy({ topic, architectureId: 'lista', context, brandName: brand.name, tone: brand.tone });
assert.equal(testCopy.source, 'teste');
assert.equal(testCopy.demo, true);
assert.equal(testCopy.costUsd, 0);
assert.equal(testCopy.copy.slides.length, 5);
step('8. Copy com revisões', `5 slides gerados por templates locais em MODO DE TESTE (demonstração, custo $0 — nunca finge usar os modelos da OpenAI). Capa: «${testCopy.copy.slides[0].title}». Fecho: «${testCopy.copy.slides[4].title}».`);

// Passos 9–10 — 3 capas; escolher «destaque» e aplicar a identidade aos restantes.
const variants = buildCoverVariants(brand, testCopy.copy.slides[0], testCopy.copy.slides.length, CAROUSEL_45_FORMAT);
assert.equal(variants.length, 3);
assert.equal(new Set(variants.map((o) => o.slide.background.value)).size, 3);
const chosenCover = 'destaque';
step('9. Até 3 capas', '3 variantes geradas (clássica #103B78, destaque #F5F7FA, minimal #071D3A), mesmo título. Escolhida: «destaque».');
let slides = applyBrandTemplate(brand, testCopy.copy.slides, { coverVariant: chosenCover });
const refsBeforeCover = slides.map((s) => s);
slides = applyCoverVariant(slides, chosenCover, brand);
assert.equal(slides.length, 5);
assert.deepEqual(checkBrandConsistency(slides, brand), []);
for (const i of [1, 2, 3, 4]) assert.equal(slides[i], refsBeforeCover[i], `aplicar a capa não pode tocar no card ${i + 1}`);
const backgrounds = slides.map((s) => s.background.value);
assert.ok(backgrounds.every((b) => ['#103B78', '#D4AF37', '#FFFFFF', '#071D3A', '#F5F7FA'].includes(b)), `fundos fora da identidade: ${backgrounds.join(', ')}`);
step('10. Capa escolhida + identidade nos restantes cards', `Capa «destaque» aplicada ao card 1; cards 2–5 intocados (mesma referência). Consistência de marca: 0 violações. Fundos: ${backgrounds.join(', ')} — só cores do Brand Kit Ofensiva. Contraste verificado por teste (WCAG AA 4,5:1 em todos os textos, todas as capas — o motor resolve os papéis por luminância, por isso a paleta com fundo claro também dá texto legível).`);

// Passo 11 — Corrigir 1 card: só esse muda (antes/depois + referências).
const before = slideTextContents(slides[2]);
const beforeRefs = slides.map((s) => s);
slides = correctSlide(slides, 2, {
  title: 'Passo 2 — revisto por ti',
  body: 'Ideias, textos e legendas saem em minutos — revisto por ti, não escrito por ti.',
}, brand);
assert.equal(slides[2].reviewStatus, 'corrigido');
assert.ok(slides[2].correctedAt);
for (const i of [0, 1, 3, 4]) assert.equal(slides[i], beforeRefs[i]);
slides = setSlideReviewStatus(slides, 2, 'aprovado');
for (let i = 0; i < slides.length; i++) slides = setSlideReviewStatus(slides, i, 'aprovado');
assert.ok(slides.every((s) => s.reviewStatus === 'aprovado'));
step('11. Correcção individual por card', `Card 3 corrigido e aprovado. Antes: «${before.title}». Depois: «${slideTextContents(slides[2]).title}». Cards 1, 2, 4 e 5 intocados (mesma referência). 5/5 cards aprovados.`);
writeFileSync(join(outDir, 'correction-card-3.json'), JSON.stringify({ before, after: slideTextContents(slides[2]), correctedAt: slides[2].correctedAt }, null, 2));

// Passo 12 — Legenda + CTA + DM + PDF; projecto + gate de aprovação.
let project = newCarouselProject({ id: 'carousel-ofensiva-fase3', title: topic, brand, context, topic });
project.architectureId = 'lista';
project.coverVariant = chosenCover;
project.slides = slides.map(slideTextContents);
project.caption = testCopy.copy.caption;
project.hashtags = testCopy.copy.hashtags;
project.pautaId = selected.selectedIds[0];
project.referenceId = ref.id;
const gateBefore = checkScheduleGate(project, slides.map((s) => s.reviewStatus ?? 'pendente'));
assert.equal(gateBefore.ok, false, 'gate devia estar fechado sem aprovação');
project = approveProject(project, 'Cristiane');
const gateAfter = checkScheduleGate(project, slides.map((s) => s.reviewStatus ?? 'pendente'));
assert.equal(gateAfter.ok, true);
const adapters = listAdapters();
assert.ok(adapters.every((a) => a.enabled === false));
const delivery = { brandName: brand.name, title: project.title, caption: testCopy.copy.caption, hashtags: testCopy.copy.hashtags, slides: project.slides, cta: context.defaultCta };
const captionVariants = buildCaptionVariants(delivery);
const ctaVariants = buildCtaVariants(context.defaultCta);
const dmTemplates = buildDmTemplates(delivery);
assert.equal(ctaVariants.length, 3);
assert.ok(captionVariants.main.includes('#OfensivaCriativa'));
const pdf = buildPlanPdf(delivery);
assert.ok(new TextDecoder('latin1').decode(pdf).startsWith('%PDF-1.4'));
const captionText = buildCaptionText({ brandName: brand.name, title: project.title, caption: testCopy.copy.caption, hashtags: testCopy.copy.hashtags });
const dmText = buildDmText(delivery);
step('12. Legenda, CTA e materiais complementares', `Legenda principal + 2 variantes (curta/pergunta), 3 variantes de CTA, 3 templates de DM (resposta/seguimento/partilha), plano.pdf gerado localmente (${pdf.length} bytes). Gate FECHADO sem aprovação → ABERTO após aprovação por Cristiane.`);
step('15. Instagram / agendamento / analytics / automação', 'SÓ esqueleto desactivado (como na Fase 2): Instagram desactivado, Composio desactivado — nada agenda nem publica sem aprovação humana. Nenhuma chamada, nenhuma credencial.', 'OK');

// Passo 13 — Export: render real dos slides (PIL) + ZIP com ficheiros reais.
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
  'ZIP de entrega do carrossel — Ofensiva Criativa, Fase 3 (ficheiros reais):',
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
step('13. Exportar (ZIP real)', `ZIP de entrega: ${names.length} ficheiros reais (${zipBuffer.length} bytes) — ${slides.length} slides PNG+JPG 1080×1350, 3 capas PNG+JPG, caption.txt, plano.pdf, dm.txt, project.json, MANIFESTO.txt. Verificados: magia PNG/JPEG + dimensões + PDF + legenda. Nota: PNG/JPG via PIL a partir da mesma geometria do motor; a renderização no canvas do browser (serviço novo da app) é provada por testes unitários, não aqui.`);

// Passo 14 — Guardar e reabrir (round-trip local + rascunho desktop).
writeFileSync(join(outDir, 'radar.json'), JSON.stringify(selected, null, 2));
writeFileSync(join(outDir, 'project.json'), serializeProject(project));
writeFileSync(join(outDir, 'caption.txt'), captionText);
writeFileSync(join(outDir, 'dm.txt'), dmText);
writeFileSync(join(outDir, 'plano.pdf'), pdf);
writeFileSync(join(outDir, 'carousel-ofensiva-fase3-primeira-prova.zip'), zipBuffer);
const reopened = parseProject(readFileSync(join(outDir, 'project.json'), 'utf-8'));
assert.equal(reopened.id, project.id);
assert.equal(reopened.slides.length, 5);
assert.equal(reopened.slides[2].title, 'Passo 2 — revisto por ti');
assert.equal(reopened.approvedBy, 'Cristiane');
assert.equal(reopened.architectureId, 'lista');
const userDataDir = join(outDir, 'drafts-userdata');
const meta = saveDraft(userDataDir, { id: 'demo-ofensiva-fase3', title: project.title, data: JSON.parse(serializeProject(project)) });
const loadedDraft = loadDraft(userDataDir, 'demo-ofensiva-fase3');
assert.ok(loadedDraft);
assert.equal(loadedDraft.data.title, project.title);
assert.equal(loadedDraft.data.slides.length, 5);
assert.ok(listDrafts(userDataDir).some((d) => d.id === meta.id));
step('14. Guardar e recuperar o projecto', 'Round-trip local do projecto (parseProject): 5 slides, card 3 corrigido, aprovado por Cristiane, arquitetura lista — igual ao guardado. Rascunho desktop (saveDraft/loadDraft, escrita atómica): guardado e relido em disco. O round-trip via preload real é provado no self-test Electron. Gravação real no Supabase NÃO executada — requer sessão autenticada.', 'OK');

// Passo 1 — Aplicação Windows a executar (self-test Electron alargado).
// Apaga as provas anteriores para um ficheiro velho nunca passar por fresco.
const evidenceDir = join(root, 'packages', 'desktop', 'test-evidence');
for (const f of ['selftest.json', 'screenshot.png', 'screenshot-flow.png', 'screenshot-ia.png']) {
  rmSync(join(evidenceDir, f), { force: true });
}
const selftest = spawnSync('node', [join(root, 'packages', 'desktop', 'scripts', 'run-selftest.mjs')], {
  encoding: 'utf-8', timeout: 600000,
});
console.log((selftest.stdout || '').slice(-3000));
if (selftest.stderr) console.error((selftest.stderr || '').slice(-2000));
const selftestPath = join(root, 'packages', 'desktop', 'test-evidence', 'selftest.json');
let selftestResult = null;
let selftestOk = false;
if (existsSync(selftestPath)) {
  selftestResult = JSON.parse(readFileSync(selftestPath, 'utf8'));
  selftestOk = selftest.status === 0 && selftestResult.ok === true && selftestResult.flowVisible === true && selftestResult.iaVisible === true;
  for (const [src, dst] of [['screenshot.png', 'screenshot-arranque.png'], ['screenshot-flow.png', 'screenshot-fluxo.png'], ['screenshot-ia.png', 'screenshot-ia.png']]) {
    const from = join(root, 'packages', 'desktop', 'test-evidence', src);
    if (existsSync(from)) copyFileSync(from, join(outDir, dst));
  }
  copyFileSync(selftestPath, join(outDir, 'selftest.json'));
}
if (selftestOk) {
  step('1. Aplicação Windows a executar', `Electron arranca por file:// (userData temporário), root com conteúdo, preload presente. Navegação real: #/criacao/carrossel-fluxo visível com banner de demonstração + botão «Ligação de IA»; #/sistema/ia visível; modo de IA no main = «teste». Capturas reais: screenshot-arranque.png (${selftestResult.screenshotBytes} bytes), screenshot-fluxo.png (${selftestResult.screenshotFlowBytes} bytes), screenshot-ia.png (${selftestResult.screenshotIaBytes} bytes). Round-trip do projecto via preload: ${selftestResult.projectRoundTripOk === true ? 'OK' : 'NÃO PROVADO'}.`);
} else {
  step('1. Aplicação Windows a executar', `Self-test Electron NÃO passou (exit ${selftest.status}). Ver packages/desktop/test-evidence/selftest.json — o fluxo e o ecrã de IA não estão provados nesta corrida.`, 'PARCIAL');
}

const ordered = [...log].sort((a, b) => {
  const n = (s) => parseInt(String(s.step).split('.')[0], 10) || 99;
  return n(a) - n(b);
});
writeFileSync(join(outDir, 'demo-log.json'), JSON.stringify({
  theme: topic, architecture: arch.id, coverVariant: chosenCover, slideCount: slides.length,
  brand: { name: brand.name, slogan: seed.brand_dna.slogan, palette: brand.palette, logo: null },
  honesty: 'Sem AIsa e sem nenhuma API paga: pauta, copy, legenda e DMs são CONTEÚDO DE DEMONSTRAÇÃO composto localmente a partir de templates (não gerados por IA). Nenhuma imagem de IA por página. A marca é um fixture local; a existência da marca semeada no preview NÃO foi verificada. O fetch real ao website NÃO foi executado. A gravação real no Supabase NÃO foi executada. Os PNG/JPG do ZIP são renderizados com PIL a partir da mesma geometria do motor; a renderização no canvas do browser (serviço novo carouselRender.ts, usado pela exportação na app) é provada por testes unitários com mock de canvas (4/4), não neste script. O botão «Guardar no Brand Kit» da UI não foi clicado (sem automação de cliques).',
  steps: ordered,
  zipFiles: names, zipBytes: zipBuffer.length,
  selftest: selftestResult ? { ok: selftestResult.ok, flowVisible: selftestResult.flowVisible, iaVisible: selftestResult.iaVisible, aiMode: selftestResult.aiMode, projectRoundTripOk: selftestResult.projectRoundTripOk } : null,
  generatedAt: new Date().toISOString(),
}, null, 2));

console.log(`\nProva Fase 3 escrita em ${outDir}`);
if (!selftestOk) {
  console.error('PROVA FASE 3: PARCIAL — self-test Electron não passou (ver demo-log.json).');
  process.exit(1);
}
console.log('PROVA FASE 3: OK');
