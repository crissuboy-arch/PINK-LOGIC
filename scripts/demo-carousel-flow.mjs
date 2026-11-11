// Demo do fluxo completo de carrosséis — Fase 2 (passos a–o), marca Ofensiva Criativa.
// Correr: ./node_modules/.bin/tsx scripts/demo-carousel-flow.mjs
// Tudo local: lê o seed da marca, corre radar → copy → slides → entrega e
// escreve as provas em .proof/fase2-fluxo/. Conteúdo de demonstração escrito
// localmente, sem IA paga, sem rede, sem Supabase.
// Nota: a data do ZIP é fixada (1980-01-01) para o artefacto ser reproduzível.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import {
  normalizeBrandContext, newCarouselProject, serializeProject, approveProject,
} from '../packages/web/src/services/carouselFlow.ts';
import { generateRadar, topPautas, selectPautas, generateCopy } from '../packages/web/src/services/carouselRadar.ts';
import { modelReference, replicateContent } from '../packages/web/src/services/carouselReference.ts';
import {
  buildCaptionVariants, buildDmText, buildPlanPdf, buildExportManifest,
} from '../packages/web/src/services/carouselDelivery.ts';
import { checkScheduleGate, disabledAdapter } from '../packages/web/src/services/carouselPublish.ts';
import {
  applyBrandTemplate, buildCoverVariants, correctSlide, setSlideReviewStatus,
  checkBrandConsistency, slideTextContents, buildCaptionText, CAROUSEL_45_FORMAT,
} from '../packages/web/src/services/carouselDocument.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, '.proof', 'fase2-fluxo');
mkdirSync(outDir, { recursive: true });

const seed = JSON.parse(readFileSync(join(root, 'scripts', 'ofensiva-criativa-brand.json'), 'utf8'));
const ctx = seed.brand_dna.context;
const context = normalizeBrandContext({
  audience: ctx.audience,
  pains: ctx.pains,
  goals: ctx.goals,
  themes: ctx.themes,
  avoid: ctx.avoid,
  defaultCta: ctx.default_cta,
  hashtags: ctx.hashtags,
});
const brand = {
  id: 'brand-ofensiva-demo',
  projectId: 'project-ofensiva-demo',
  name: seed.name,
  palette: {
    primary: seed.colors.primary,
    secondary: seed.colors.secondary,
    accent: seed.colors.accent,
    background: seed.colors.background,
    text: seed.colors.text,
    surface: seed.secondary_colors[0],
  },
  typography: { heading: seed.fonts.heading, body: seed.fonts.body },
  tone: seed.tone,
  visualStyle: seed.style,
  logo: seed.logo, // null — sem ficheiro oficial
  colors: [seed.colors.primary, seed.colors.accent],
};

const log = [];
const step = (msg) => { log.push(msg); console.log(msg); };

// (c) Radar: 30 pautas → top 10
const radar = generateRadar('A IA chegou às pequenas empresas', context);
assert.equal(radar.pautas.length, 30);
const selected = selectPautas(radar, topPautas(radar, 10).map((p) => p.id));
step(`(c) radar: 30 pautas geradas; top 10: 1.ª = «${selected.pautas[0].title}» (${selected.pautas[0].score})`);

// (e+f) Arquitetura lista + copy por templates
const copy = generateCopy({ topic: 'A IA chegou às pequenas empresas', architectureId: 'lista', context, brandName: brand.name, tone: brand.tone });
assert.equal(copy.slides.length, 5);
step(`(f) copy: ${copy.slides.length} slides (lista); fecho: «${copy.slides[4].title}»`);

// (g+h+i) Slides 4:5 + 3 capas + correcção individual + consistência
const variants = buildCoverVariants(brand, copy.slides[0], copy.slides.length, CAROUSEL_45_FORMAT);
assert.equal(variants.length, 3);
let slides = applyBrandTemplate(brand, copy.slides, { coverVariant: 'classica' });
assert.deepEqual(checkBrandConsistency(slides, brand), []);
slides = correctSlide(slides, 2, { body: 'Ideias, textos e legendas saem em minutos — revisto por ti, não escrito por ti.' }, brand);
assert.equal(slides[2].reviewStatus, 'corrigido');
for (let i = 0; i < slides.length; i++) slides = setSlideReviewStatus(slides, i, 'aprovado');
assert.ok(slides.every((s) => s.reviewStatus === 'aprovado'));
step(`(g/h/i) 3 capas; consistência OK; card 3 corrigido; 5/5 slides aprovados`);

// (d+n) Referência modelada + replicador para um tema novo
const ref = modelReference({ label: 'Carrossel demo Ofensiva — dia 1', hook: 'gancho directo sobre a dor', slideCount: 5, structure: ['gancho', 'ponto 1', 'ponto 2', 'ponto 3', 'CTA'], cta: 'Comenta LINK' });
const replicated = replicateContent({ source: ref, newTopic: 'Vendas directas sem complicação', architectureId: 'lista', context, brandName: brand.name, tone: brand.tone });
assert.equal(replicated.slides.length, 5);
assert.equal(replicated.mapping[0].from, 'gancho');
step(`(n) replicador: estrutura «${ref.label}» → tema novo «Vendas directas sem complicação»`);

// (o+m) Projecto + aprovação humana + gate
let project = newCarouselProject({ title: 'A IA chegou às pequenas empresas', brand, context, topic: 'A IA chegou às pequenas empresas' });
project.architectureId = 'lista';
project.coverVariant = 'classica';
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
step(`(o/m) gate fechado sem aprovação → ABERTO após aprovação por Cristiane; Instagram: ${disabledAdapter('instagram').enabled ? 'activo' : 'desactivado'}`);

// (k+l) Entrega: caption, DM, PDF, ZIP
const delivery = { brandName: brand.name, title: project.title, caption: copy.caption, hashtags: copy.hashtags, slides: project.slides, cta: context.defaultCta };
const captionVariants = buildCaptionVariants(delivery);
const pdf = buildPlanPdf(delivery);
assert.ok(new TextDecoder('latin1').decode(pdf).startsWith('%PDF-1.4'));
const manifest = buildExportManifest({ slideCount: slides.length });
assert.equal(manifest.length, 5 * 2 + 4);
const zip = new JSZip();
const fixedDate = new Date('1980-01-01T00:00:00Z');
zip.file('caption.txt', buildCaptionText({ brandName: brand.name, title: project.title, caption: copy.caption, hashtags: copy.hashtags }), { date: fixedDate });
zip.file('plano.pdf', pdf, { date: fixedDate });
zip.file('dm.txt', buildDmText(delivery), { date: fixedDate });
zip.file('project.json', serializeProject(project), { date: fixedDate });
// MANIFESTO: o plano completo do ZIP de entrega. Os slide-N.png/jpg NÃO vão
// aqui como ficheiros falsos — são renderizados pelo Editor (Fase 1) e juntos
// no ZIP final. O manifesto lista-os para o export ficar completo.
zip.file('MANIFESTO.txt', [
  'ZIP de entrega do carrossel (ficheiros reais neste ZIP + slides do Editor):',
  ...manifest.map((m) => ` - ${m.name}`),
  '',
  'slide-N.png/jpg: renderizados pelo Editor (Fase 1) — não incluídos como placeholders.',
  'Conteúdo de demonstração composto a partir de templates locais (sem IA).',
].join('\n'), { date: fixedDate });
const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
const loaded = await JSZip.loadAsync(zipBuffer);
const names = Object.keys(loaded.files).sort();
assert.deepEqual(names, ['MANIFESTO.txt', 'caption.txt', 'dm.txt', 'plano.pdf', 'project.json']);
assert.ok(new TextDecoder('latin1').decode(await loaded.file('plano.pdf').async('nodebuffer')).startsWith('%PDF-1.4'));
step(`(k/l) ZIP de entrega: ${names.length} ficheiros reais (${zipBuffer.length} bytes): ${names.join(', ')} — manifesto completo: ${manifest.length} entradas (incl. ${slides.length * 2} slides do Editor)`);

// Provas
writeFileSync(join(outDir, 'radar.json'), JSON.stringify(selected, null, 2));
writeFileSync(join(outDir, 'project.json'), serializeProject(project));
writeFileSync(join(outDir, 'caption.txt'), buildCaptionText({ brandName: brand.name, title: project.title, caption: copy.caption, hashtags: copy.hashtags }));
writeFileSync(join(outDir, 'dm.txt'), buildDmText(delivery));
writeFileSync(join(outDir, 'plano.pdf'), pdf);
writeFileSync(join(outDir, 'carousel-fase2-demo.zip'), zipBuffer);
writeFileSync(join(outDir, 'demo-log.json'), JSON.stringify({ steps: log, zipFiles: names, zipBytes: zipBuffer.length, generatedAt: new Date().toISOString(), note: 'Conteúdo de demonstração composto a partir de templates locais (sem IA).' }, null, 2));
console.log(`Provas em: ${outDir}`);
