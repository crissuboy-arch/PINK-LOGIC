// Testes do fluxo completo de carrosséis — Fase 2 (passos a–o).
// Correr: ./node_modules/.bin/tsx --test tests/carousel-flow.test.mjs
// Tudo local e determinístico: sem rede, sem IA paga, sem Supabase.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateInterview, buildBrandFromInterview, extractBrandFromWebsiteHtml,
  normalizeBrandContext, mergeBrandContext, newCarouselProject,
  serializeProject, parseProject, approveProject, CAROUSEL_PROJECT_VERSION,
} from '../packages/web/src/services/carouselFlow.ts';
import {
  generateRadar, topPautas, selectPautas, ARCHITECTURES, getArchitecture, generateCopy,
} from '../packages/web/src/services/carouselRadar.ts';
import { modelReference, parseReference, replicateContent } from '../packages/web/src/services/carouselReference.ts';
import {
  buildCaptionVariants, buildCtaVariants, buildDmTemplates, buildDmText,
  buildPlanPdf, buildExportManifest,
} from '../packages/web/src/services/carouselDelivery.ts';
import { disabledAdapter, listAdapters, checkScheduleGate, evaluateChannel } from '../packages/web/src/services/carouselPublish.ts';
import { applyBrandTemplate, checkBrandConsistency } from '../packages/web/src/services/carouselDocument.ts';
import { OFENSIVA_BRAND, DEMO_INPUTS } from './carousel-template.test.mjs';

const CONTEXT = normalizeBrandContext({
  audience: 'Pequenas empresas que querem vender mais sem complicação',
  pains: ['a agenda vazia apesar do bom trabalho', 'não serem encontradas online'],
  goals: ['encher a agenda com clientes certos', 'ser encontrada por quem procura'],
  themes: ['IA nas pequenas empresas', 'marketing sem filtro'],
  avoid: ['promessas de resultados garantidos'],
  defaultCta: 'Comenta LINK',
  hashtags: ['#OfensivaCriativa'],
});

// (a) Entrevista
test('(a) entrevista: rejeita campos em falta e cores inválidas; aceita resposta completa sem logótipo', () => {
  assert.deepEqual(Object.keys(validateInterview({})), ['name', 'audience', 'tone', 'primaryColor', 'accentColor']);
  assert.ok(validateInterview({ name: 'X', audience: 'Y', tone: 'directo', primaryColor: 'azul', accentColor: '#D4AF37' }).primaryColor);
  const { brand, errors } = buildBrandFromInterview(
    { name: 'Ofensiva Criativa', audience: 'Pequenas empresas', tone: 'Directo e sem filtro', primaryColor: '#103B78', accentColor: '#D4AF37', slogan: 'Marketing sem filtro.', cta: 'Comenta LINK' },
    'project-ofensiva-demo',
  );
  assert.deepEqual(errors, {});
  assert.equal(brand.name, 'Ofensiva Criativa');
  assert.equal(brand.palette.primary, '#103B78');
  assert.equal(brand.logo, null); // nunca se inventa logótipo
});

// (a) Website
test('(a) website: extrai nome/cores/slogan de HTML público; sem cores não inventa nenhuma', () => {
  const html = `<html><head><title>Ofensiva Criativa | Marketing</title>
    <meta property="og:site_name" content="Ofensiva Criativa">
    <meta name="description" content="Marketing sem filtro."></head>
    <body><style>.a{color:#103B78}.b{color:#103B78}.c{color:#D4AF37}</style>
    <h1>Marketing sem filtro. Resultados sem desculpa.</h1></body></html>`;
  const draft = extractBrandFromWebsiteHtml(html, 'https://www.ofensivacriativa.com.br');
  assert.equal(draft.name, 'Ofensiva Criativa');
  assert.deepEqual(draft.colors, ['#103B78', '#D4AF37']);
  assert.ok(draft.taglines[0].includes('Marketing sem filtro'));
  assert.equal(draft.description, 'Marketing sem filtro.');
  const empty = extractBrandFromWebsiteHtml('<html><head><title>Só Texto</title></head><body><p>olá</p></body></html>', 'https://exemplo.com');
  assert.deepEqual(empty.colors, []);
  assert.throws(() => extractBrandFromWebsiteHtml('   ', 'https://exemplo.com'), /vazio/);
});

// (b) Contexto persistente
test('(b) contexto: normaliza listas com limites e une sem duplicados', () => {
  const merged = mergeBrandContext(CONTEXT, { pains: ['A agenda vazia apesar do bom trabalho', 'nova dor'], audience: 'Outro público' });
  assert.equal(merged.pains.length, 3);
  assert.equal(merged.audience, 'Outro público');
  assert.equal(merged.hashtags[0], '#OfensivaCriativa');
  assert.equal(normalizeBrandContext({ hashtags: ['sem-cardinal'] }).hashtags[0], '#sem-cardinal');
});

// (c) Radar
test('(c) radar: exactamente 30 pautas, determinístico, ordenado por pontuação; top 10 + selecção 1–10', () => {
  const r1 = generateRadar('A IA chegou às pequenas empresas', CONTEXT);
  const r2 = generateRadar('A IA chegou às pequenas empresas', CONTEXT);
  assert.equal(r1.pautas.length, 30);
  assert.deepEqual(r1.pautas.map((p) => p.id), r2.pautas.map((p) => p.id));
  assert.deepEqual(r1.pautas.map((p) => p.title), r2.pautas.map((p) => p.title));
  for (let i = 1; i < r1.pautas.length; i++) assert.ok(r1.pautas[i - 1].score >= r1.pautas[i].score, 'radar não ordenado');
  assert.ok(r1.pautas[0].serves.startsWith('dor:') || r1.pautas[0].serves.startsWith('objectivo:'), 'o topo devia servir uma dor/objectivo');
  assert.equal(topPautas(r1, 10).length, 10);
  const selected = selectPautas(r1, topPautas(r1, 10).map((p) => p.id));
  assert.equal(selected.selectedIds.length, 10);
  assert.throws(() => selectPautas(r1, []), /entre 1 e 10/);
  assert.throws(() => selectPautas(r1, ['pauta-99']), /desconhecida/);
  assert.throws(() => generateRadar('   ', CONTEXT), /tema/);
});

// (e) Arquiteturas
test('(e) arquiteturas: 5 definidas, cada uma com slideCount e plano do corpo', () => {
  assert.equal(ARCHITECTURES.length, 5);
  for (const a of ARCHITECTURES) {
    assert.equal(a.bodyPlan.length, a.slideCount - 2, `${a.id}: corpo devia ter slideCount-2 itens`);
  }
  assert.equal(getArchitecture('mito-verdade').slideCount, 5);
  assert.throws(() => getArchitecture('invalida'), /desconhecida/);
});

// (f) Copy por templates
test('(f) copy: cada arquitetura gera exactamente o seu slideCount, com capa e fecho com CTA', () => {
  for (const a of ARCHITECTURES) {
    const copy = generateCopy({ topic: 'IA nas pequenas empresas', architectureId: a.id, context: CONTEXT, brandName: 'Ofensiva Criativa', tone: 'Directo e sem filtro' });
    assert.equal(copy.slides.length, a.slideCount, a.id);
    assert.equal(copy.slides[0].title, 'IA nas pequenas empresas');
    assert.ok(copy.slides[copy.slides.length - 1].body.includes('Comenta LINK'), `${a.id}: fecho sem CTA`);
    assert.ok(copy.caption.includes('Comenta LINK'));
    assert.deepEqual(copy.hashtags, ['#OfensivaCriativa']);
  }
  assert.throws(() => generateCopy({ topic: '', architectureId: 'lista', context: CONTEXT, brandName: 'X', tone: '' }), /tema/);
});

// (d) Modelador de referências
test('(d) referência: guarda estrutura, nunca texto colado; rejeita estrutura curta', () => {
  const ref = modelReference({ label: 'Carrossel X — conta Y', hook: 'gancho directo sobre a dor', slideCount: 5, structure: ['gancho', 'problema', 'solução', 'prova', 'CTA'], cta: 'Comenta LINK' });
  assert.equal(ref.structure.length, 5);
  assert.equal(parseReference(JSON.stringify(ref)).label, 'Carrossel X — conta Y');
  assert.throws(() => modelReference({ label: 'X', hook: 'h', slideCount: 5, structure: ['só um'], cta: 'c' }), /pelo menos 2/);
  assert.throws(() => modelReference({ label: 'X', hook: '', slideCount: 5, structure: ['a', 'b'], cta: 'c' }), /gancho/);
  assert.throws(() => parseReference('não-json'), /JSON válido/);
});

// (n) Replicador
test('(n) replicador: transpõe a estrutura da referência para um tema novo, com mapeamento', () => {
  const ref = modelReference({ label: 'Ref', hook: 'gancho', slideCount: 5, structure: ['gancho', 'problema', 'solução', 'prova', 'CTA'], cta: 'Comenta LINK' });
  const out = replicateContent({ source: ref, newTopic: 'Vendas directas', architectureId: 'lista', context: CONTEXT, brandName: 'Ofensiva Criativa', tone: 'directo' });
  assert.equal(out.slides.length, 5);
  assert.equal(out.slides[0].title, 'Vendas directas');
  assert.equal(out.mapping.length, 5);
  assert.equal(out.mapping[0].from, 'gancho');
  // A partir de um projecto passado: mesma estrutura, texto novo.
  const fromProject = replicateContent({ source: { slides: DEMO_INPUTS }, newTopic: 'Outro tema', architectureId: 'historia', context: CONTEXT, brandName: 'Ofensiva Criativa', tone: 'directo' });
  assert.equal(fromProject.slides.length, 5);
  assert.equal(fromProject.mapping[0].from, 'capa');
});

// (k) Entrega
test('(k) entrega: variantes de legenda/CTA, DM e PDF válido com o conteúdo do projecto', () => {
  const input = { brandName: 'Ofensiva Criativa', title: 'IA nas pequenas empresas', caption: 'Legenda base.', hashtags: ['#OfensivaCriativa'], slides: DEMO_INPUTS, cta: 'Comenta LINK' };
  const variants = buildCaptionVariants(input);
  assert.ok(variants.main.includes('#OfensivaCriativa'));
  assert.ok(variants.short.includes('Comenta LINK'));
  assert.ok(variants.question.includes('O que achaste?'));
  assert.equal(buildCtaVariants('Comenta LINK').length, 3);
  const dm = buildDmTemplates(input);
  assert.ok(dm.replyToComment.includes('Ofensiva Criativa'));
  assert.ok(buildDmText(input).includes('MENSAGENS DE DM'));
  const pdf = buildPlanPdf(input);
  const text = new TextDecoder('latin1').decode(pdf);
  assert.ok(text.startsWith('%PDF-1.4'), 'PDF sem cabeçalho');
  assert.ok(text.includes('%%EOF'), 'PDF sem EOF');
  assert.ok(text.includes('IA nas pequenas empresas'), 'PDF sem título');
  assert.ok(text.includes('Comenta LINK'), 'PDF sem CTA');
});

// (l) Manifesto de exportação
test('(l) export: manifesto com PNG+JPG por slide, caption, plano.pdf, dm.txt e project.json', () => {
  const manifest = buildExportManifest({ slideCount: 5 });
  const names = manifest.map((m) => m.name);
  assert.equal(names.length, 5 * 2 + 4);
  for (let i = 1; i <= 5; i++) {
    assert.ok(names.includes(`slide-${i}.png`));
    assert.ok(names.includes(`slide-${i}.jpg`));
  }
  for (const required of ['caption.txt', 'plano.pdf', 'dm.txt', 'project.json']) assert.ok(names.includes(required));
  assert.throws(() => buildExportManifest({ slideCount: 0 }), /1 a 10/);
});

// (m) Publicação desactivada + gate
test('(m) publicação: adaptadores desactivados recusam sempre; gate exige aprovação + slides aprovados', async () => {
  for (const adapter of listAdapters()) {
    assert.equal(adapter.enabled, false);
    await assert.rejects(adapter.publish(), /desactivado/);
    await assert.rejects(adapter.schedule(), /desactivado/);
  }
  assert.equal(disabledAdapter('instagram').channel, 'instagram');
  assert.ok(evaluateChannel('instagram').missing.length >= 2);
  assert.ok(evaluateChannel('composio').missing.length >= 2);
  const project = newCarouselProject({ title: 'Teste', brand: OFENSIVA_BRAND, context: CONTEXT, topic: 'Tema' });
  project.slides = DEMO_INPUTS;
  const closed = checkScheduleGate(project, ['pendente', 'aprovado', 'aprovado', 'aprovado', 'aprovado']);
  assert.equal(closed.ok, false);
  assert.ok(closed.reasons.some((r) => r.includes('aprovado pela dona')));
  const approved = approveProject(project, 'Cristiane');
  assert.ok(approved.approvedBy === 'Cristiane' && approved.approvedAt);
  const open = checkScheduleGate(approved, ['aprovado', 'aprovado', 'aprovado', 'aprovado', 'aprovado']);
  assert.equal(open.ok, true);
});

// (o) Projecto: round-trip + rejeição de versão/ficheiro inválido
test('(o) projecto: serializar/parse preserva tudo; versão errada e JSON inválido são rejeitados', () => {
  const project = newCarouselProject({ title: 'Carrossel demo', brand: OFENSIVA_BRAND, context: CONTEXT, topic: 'IA nas pequenas empresas' });
  project.slides = DEMO_INPUTS;
  project.architectureId = 'lista';
  const parsed = parseProject(serializeProject(project));
  assert.equal(parsed.version, CAROUSEL_PROJECT_VERSION);
  assert.equal(parsed.title, 'Carrossel demo');
  assert.deepEqual(parsed.slides, DEMO_INPUTS);
  assert.equal(parsed.approvedBy, null);
  assert.throws(() => parseProject('não-json'), /JSON válido/);
  assert.throws(() => parseProject(JSON.stringify({ ...project, version: 99 })), /não suportada/);
  assert.throws(() => parseProject(JSON.stringify({ version: 1 })), /obrigatórios/);
});

// (h) Consistência da marca
test('(h) consistência: slides do motor passam; cor/fora da marca é apontada', () => {
  const slides = applyBrandTemplate(OFENSIVA_BRAND, DEMO_INPUTS);
  assert.deepEqual(checkBrandConsistency(slides, OFENSIVA_BRAND), []);
  const bad = structuredClone(slides);
  bad[1].elements[1].color = '#FF0000';
  const violations = checkBrandConsistency(bad, OFENSIVA_BRAND);
  assert.equal(violations.length, 1);
  assert.equal(violations[0].kind, 'color');
  assert.equal(violations[0].slideIndex, 1);
});
