import ofensivaLogo from '../../assets/ofensiva-criativa-logo.png?inline';
// ---------------------------------------------------------------------------
// Fluxo completo de criação de carrosséis — Fase 2 (passos a–o).
// Assistente em 6 passos: Marca → Radar → Arquitetura → Copy → Slides → Entrega.
// Usa os serviços puros (carouselFlow / carouselRadar / carouselReference /
// carouselDelivery / carouselPublish) + o motor da Fase 1 (carouselDocument).
// Sem IA paga, sem rede para gerar conteúdo; a leitura de website é só HTML
// público e pode falhar por CORS — nesse caso diz-se, não se contorna.
// ---------------------------------------------------------------------------
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBrand, type BrandSchema } from '../../providers/BrandProvider';
import { useCentralStore } from '../../store/CentralStore';
import { useCarouselAutosave } from '../../hooks/useCarouselAutosave';
import { useAiConnection } from '../../hooks/useAiConnection';
import AIStatusBadge from '../../components/AIStatusBadge';
import { generateTestCopy } from '../../services/aiConnection';
import {
  INTERVIEW_QUESTIONS, buildBrandFromInterview, extractBrandFromWebsiteHtml,
  normalizeBrandContext, mergeBrandContext, newCarouselProject, approveProject as approveProjectFn,
  serializeProject, parseProject, FLOW_STEPS, type BrandContext, type BrandInterviewAnswers,
  type BrandLike, type CarouselFlowStep, type CarouselProject,
} from '../../services/carouselFlow';
import {
  generateRadar, selectPautas, topPautas, ARCHITECTURES,
  type ArchitectureId, type RadarResult,
} from '../../services/carouselRadar';
import { modelReference, replicateContent, type ReferenceModel } from '../../services/carouselReference';
import {
  buildCaptionVariants, buildCtaVariants, buildDmText, buildPlanPdf,
  buildExportManifest,
} from '../../services/carouselDelivery';
import { disabledAdapter, checkScheduleGate, evaluateChannel } from '../../services/carouselPublish';
import {
  applyBrandTemplate, buildCoverVariants, applyCoverVariant, correctSlide,
  setSlideReviewStatus, checkBrandConsistency, slideTextContents, buildCaptionText,
  type CoverVariantId,
} from '../../services/carouselDocument';
import { renderSlideToBlob } from '../../services/carouselRender';
import type { Slide } from '../../contexts/EditorContext';

// Mapa dos 15 passos do fluxo completo (Fase 3) para as 6 etapas desta
// página + ecrã de IA + app desktop. Nada aqui é um passo novo: é só a
// navegação explícita entre o que já existe, para a Cristiane ver onde está.
const FIFTEEN_STEPS: { n: number; label: string; where: string; stage: CarouselFlowStep | 'ia' | 'app' }[] = [
  { n: 1, label: 'Instalar / abrir a app', where: 'Aplicação desktop Pink Logic', stage: 'app' },
  { n: 2, label: 'Ligar a IA (modo de teste predefinido)', where: 'Sistema → Ligação de IA', stage: 'ia' },
  { n: 3, label: 'Site ou descrição do negócio', where: 'Etapa 1 — Marca (importar website)', stage: 'marca' },
  { n: 4, label: 'Contexto Oficial da Marca por entrevista', where: 'Etapa 1 — Marca (entrevista guiada)', stage: 'marca' },
  { n: 5, label: 'Brand Kit guardado', where: 'Etapa 1 — Marca («Guardar no Brand Kit»)', stage: 'marca' },
  { n: 6, label: '30 pautas, 10 destacadas', where: 'Etapa 2 — Radar', stage: 'radar' },
  { n: 7, label: 'Tema + estrutura do carrossel', where: 'Etapa 3 — Arquitetura', stage: 'arquitetura' },
  { n: 8, label: 'Copy com revisões', where: 'Etapa 4 — Copy', stage: 'copy' },
  { n: 9, label: 'Até 3 capas', where: 'Etapa 5 — Slides (variantes de capa)', stage: 'slides' },
  { n: 10, label: 'Escolher capa e aplicar a identidade aos restantes cards', where: 'Etapa 5 — Slides', stage: 'slides' },
  { n: 11, label: 'Correcção individual por card', where: 'Etapa 4 — Copy (editar cada card)', stage: 'copy' },
  { n: 12, label: 'Legenda, CTA e materiais complementares', where: 'Etapa 6 — Entrega', stage: 'entrega' },
  { n: 13, label: 'Exportar (ZIP com PNG/JPG + caption + PDF + DM)', where: 'Etapa 6 — Entrega', stage: 'entrega' },
  { n: 14, label: 'Guardar e recuperar o projecto', where: 'Autosave (desktop/browser) + «Guardar projecto agora»', stage: 'entrega' },
  { n: 15, label: 'Instagram / agendamento / analytics / automação', where: 'Etapa 6 — Entrega (desactivado — só esqueleto)', stage: 'entrega' },
];

const label = { fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4, display: 'block' } as const;
const inputStyle = { width: '100%', padding: '0.6rem', borderRadius: 8, border: '1px solid var(--border, #ddd)', fontSize: '0.9rem' } as const;

function toBrandSchema(brand: BrandLike, context: BrandContext): BrandSchema {
  return {
    id: brand.id, projectId: brand.projectId, name: brand.name,
    palette: brand.palette, typography: brand.typography,
    logo: brand.logo ?? undefined, visualStyle: brand.visualStyle, tone: brand.tone,
    colors: context.hashtags, secondaryColors: [],
  };
}

function brandLikeFromSchema(b: BrandSchema): BrandLike {
  return {
    id: b.id, projectId: b.projectId, name: b.name,
    palette: { ...b.palette, surface: b.palette.surface ?? '#F5F7FA' },
    typography: b.typography, tone: b.tone, visualStyle: b.visualStyle,
    logo: b.logo ?? null, colors: [b.palette.primary, b.palette.accent],
  };
}

const OFENSIVA_CONTEXT: BrandContext = normalizeBrandContext({
  audience: 'Pequenas empresas que querem vender mais sem complicação',
  pains: ['a agenda vazia apesar do bom trabalho', 'não serem encontradas online', 'falta de tempo para criar conteúdo'],
  goals: ['encher a agenda com clientes certos', 'ser encontrada por quem procura', 'vender sem complicação'],
  themes: ['IA nas pequenas empresas', 'marketing sem filtro', 'vendas directas'],
  avoid: ['promessas de resultados garantidos', 'linguagem de guru'],
  defaultCta: 'Comenta LINK',
  hashtags: ['#OfensivaCriativa'],
});

export default function CarouselFlowPage() {
  const navigate = useNavigate();
  const { activeBrand, createBrand } = useBrand();
  const { activeProjectId } = useCentralStore();
  const ai = useAiConnection();
  const [projectId, setProjectId] = useState<string>(() => crypto.randomUUID());
  const [savedBrands, setSavedBrands] = useState<{id: string; title: string}[]>([]);
  const [savedDrafts, setSavedDrafts] = useState<{id: string; title: string}[]>([]);
  const [transfer, setTransfer] = useState<{url: string; qrDataUrl: string; expiresAt: string} | null>(null);
  const [manualCopy, setManualCopy] = useState('');
  const [contentOrigin, setContentOrigin] = useState('templates locais');
  const [step, setStep] = useState<CarouselFlowStep>('marca');
  const [brand, setBrand] = useState<BrandLike | null>(activeBrand ? brandLikeFromSchema(activeBrand) : null);
  const [context, setContext] = useState<BrandContext>(
    activeBrand?.name === 'Ofensiva Criativa' ? OFENSIVA_CONTEXT : normalizeBrandContext(null),
  );
  const [topic, setTopic] = useState('A IA chegou às pequenas empresas');
  const [radar, setRadar] = useState<RadarResult | null>(null);
  const [architectureId, setArchitectureId] = useState<ArchitectureId>('lista');
  const [slides, setSlides] = useState<Slide[]>([]);
  const [coverVariant, setCoverVariant] = useState<CoverVariantId>('classica');
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [approvedBy, setApprovedBy] = useState('');
  const [approvedAt, setApprovedAt] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Entrevista (a)
  const [answers, setAnswers] = useState<Partial<BrandInterviewAnswers>>({});
  const [interviewErrors, setInterviewErrors] = useState<Record<string, string>>({});
  // Website (a)
  const [siteUrl, setSiteUrl] = useState('');
  const [siteDraft, setSiteDraft] = useState<{ name: string; colors: string[]; taglines: string[] } | null>(null);
  // Referência / replicador (d, n)
  const [refLabel, setRefLabel] = useState('');
  const [refHook, setRefHook] = useState('');
  const [refStructure, setRefStructure] = useState('gancho, problema, solução, prova, CTA');
  const [refCta, setRefCta] = useState('');
  const [reference, setReference] = useState<ReferenceModel | null>(null);

  const brandSchema = useMemo(() => (brand ? toBrandSchema(brand, context) : null), [brand, context]);

  const project: CarouselProject | null = useMemo(() => {
    if (!brand) return null;
    const p = newCarouselProject({ id: projectId, title: topic || 'Carrossel sem título', brand, context, topic });
    p.architectureId = architectureId;
    p.coverVariant = coverVariant;
    p.slides = slides.map(slideTextContents);
    p.caption = caption;
    p.hashtags = hashtags;
    p.approvedBy = approvedBy || null;
    p.approvedAt = approvedAt;
    p.referenceId = reference?.id ?? null;
    p.pautaId = radar?.selectedIds[0] ?? null;
    Object.assign(p, { brandSnapshot: brand, contentOrigin });
    return p;
  }, [projectId, brand, context, topic, architectureId, coverVariant, slides, caption, hashtags, approvedBy, approvedAt, reference, radar, contentOrigin]);

  const autosave = useCarouselAutosave(project);
  useEffect(() => { void window.pinkLogicDesktop?.listDrafts().then(d => { setSavedDrafts(d.filter(x => x.id.startsWith('carousel-'))); setSavedBrands(d.filter(x => x.id.startsWith('brand-'))); }); }, []);
  const restoreDraft = async (id: string) => {
    try {
      const draft = await window.pinkLogicDesktop?.loadDraft(id);
      if (!draft) throw new Error('Projeto não encontrado.');
      const restored = parseProject(JSON.stringify(draft.data));
      const extra = draft.data as { brandSnapshot?: BrandLike; contentOrigin?: string };
      if (!extra.brandSnapshot) throw new Error('Este rascunho antigo não contém a identidade. Reabra com a marca original.');
      setProjectId(restored.id); setBrand(extra.brandSnapshot); setContext(restored.context); setTopic(restored.topic);
      setArchitectureId(restored.architectureId as ArchitectureId); setCoverVariant(restored.coverVariant);
      setSlides(applyBrandTemplate(toBrandSchema(extra.brandSnapshot, restored.context), restored.slides, { coverVariant: restored.coverVariant }));
      setCaption(restored.caption); setHashtags(restored.hashtags); setApprovedBy(''); setApprovedAt(null);
      setContentOrigin(extra.contentOrigin || 'origem não registada'); setStep('copy'); setNotice('Projeto e marca recuperados do disco.');
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
  };
  const loadOfensivaExample = async () => {
    const b: BrandLike = { id: 'ofensiva-criativa', projectId: 'ofensiva-local', name: 'Ofensiva Criativa', palette: {primary: '#103B78', secondary: '#071D3A', accent: '#D4AF37', background: '#FFFFFF', text: '#071D3A', surface: '#F5F7FA'}, typography: {heading: 'Arial', body: 'Arial'}, tone: 'Direto e sem filtro', visualStyle: 'Editorial azul e dourado', logo: ofensivaLogo, colors: ['#103B78', '#D4AF37'] };
    const theme = '5 tarefas que a tua empresa pode automatizar com inteligência artificial.';
    const texts = [
      {title: '1. Responder às perguntas frequentes', body: 'Organiza respostas sobre horários, serviços e prazos. A IA prepara uma resposta; a equipa revê os casos sensíveis.'},
      {title: '2. Preparar propostas comerciais', body: 'Usa modelos com serviços e condições aprovados. Confirma valores e escopo antes de enviar a proposta.'},
      {title: '3. Organizar contactos e seguimentos', body: 'Resume conversas e prepara lembretes. Pede autorização antes de enviar mensagens aos clientes.'},
      {title: '4. Transformar conteúdos próprios', body: 'Converte um artigo num rascunho de carrossel ou legenda. Revê os factos e mantém a voz da marca.'},
      {title: '5. Resumir relatórios de rotina', body: 'Reúne indicadores e destaca pontos para revisão humana. Marketing sem filtro. Resultados sem desculpa. Comenta LINK.'},
    ];
    setProjectId(crypto.randomUUID()); setBrand(b); setContext(OFENSIVA_CONTEXT); setTopic(theme); setArchitectureId('lista'); setCoverVariant('classica');
    setSlides(applyBrandTemplate(toBrandSchema(b, OFENSIVA_CONTEXT), texts, {coverVariant: 'classica'}));
    setCaption('Começa por uma tarefa repetitiva e mantém a revisão humana. Estas cinco ideias são um ponto de partida. Marketing sem filtro. Resultados sem desculpa. Comenta LINK.'); setHashtags(['#OfensivaCriativa', '#InteligenciaArtificial']); setContentOrigin('texto de exemplo escrito localmente; sem geração de IA'); setApprovedAt(null); setApprovedBy(''); setStep('copy');
    if (window.pinkLogicDesktop) { await window.pinkLogicDesktop.saveDraft({ id: 'brand-ofensiva-criativa', title: b.name, data: {brand: b, context: OFENSIVA_CONTEXT, slogan: 'Marketing sem filtro. Resultados sem desculpa.'} }); setSavedBrands((await window.pinkLogicDesktop.listDrafts()).filter(x => x.id.startsWith('brand-'))); }
    setNotice('Ofensiva Criativa configurada e guardada localmente. Exemplo com 5 cards; logótipo oficial incluído. Texto e arte locais, sem IA.');
  };
  const saveLocalBrand = async () => {
    if (!brand) return;
    try { await window.pinkLogicDesktop!.saveDraft({ id: `brand-${brand.id}`, title: brand.name, data: { brand, context } }); setSavedBrands((await window.pinkLogicDesktop!.listDrafts()).filter(x => x.id.startsWith('brand-'))); setNotice('Brand Kit guardado neste computador.'); }
    catch(e) { setError(e instanceof Error ? e.message : String(e)); }
  };
  const importChatGPTCopy = () => {
    try {
      if (!brandSchema) throw new Error('Configure a marca.');
      const parsed = JSON.parse(manualCopy) as { slides: {title: string; body: string}[]; caption: string; hashtags: string[] };
      if (!Array.isArray(parsed.slides) || parsed.slides.length !== 5 || !parsed.slides.every(x => typeof x.title === 'string' && typeof x.body === 'string') || typeof parsed.caption !== 'string' || !Array.isArray(parsed.hashtags) || !parsed.hashtags.every(x => typeof x === 'string')) throw new Error('Esperado JSON com 5 slides (title/body), caption e hashtags.');
      setSlides(applyBrandTemplate(brandSchema, parsed.slides, {coverVariant})); setCaption(parsed.caption); setHashtags(parsed.hashtags);
      setContentOrigin('texto importado manualmente — origem declarada pelo utilizador'); setNotice('Texto importado. Arte por templates locais; revise antes de exportar.'); setStep('copy');
    } catch(e) { setError(e instanceof Error ? e.message : String(e)); }
  };


  const run = (fn: () => void) => {
    setError(null);
    setNotice(null);
    try { fn(); } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
  };

  const applyInterview = () => run(() => {
    const { brand: built, errors } = buildBrandFromInterview(answers as BrandInterviewAnswers, activeProjectId || 'default');
    setInterviewErrors(errors);
    if (Object.keys(errors).length) return;
    if (brand?.id !== built.id) { setProjectId(crypto.randomUUID()); setSlides([]); setCaption(''); setHashtags([]); setApprovedAt(null); setApprovedBy(''); }
    setBrand(built);
    setNotice(`Marca «${built.name}» configurada por entrevista (logo vazio — sem ficheiro oficial).`);
  });

  const saveInterviewBrandToKit = () => run(() => {
    if (!brand) throw new Error('Configura primeiro a marca por entrevista.');
    if (window.pinkLogicDesktop) { void saveLocalBrand(); return; }
    createBrand({
      projectId: brand.projectId, name: brand.name, logo: undefined,
      palette: brand.palette, typography: brand.typography,
      tone: brand.tone, colors: context.hashtags,
    });
    setNotice(`Marca «${brand.name}» guardada no Brand Kit.`);
  });

  const importFromWebsite = async () => {
    setError(null);
    setNotice(null);
    const url = siteUrl.trim();
    if (!/^https?:\/\//i.test(url)) { setError('Indica um URL público (https://…).'); return; }
    try {
      const res = await fetch(url, { mode: 'cors' });
      if (!res.ok) throw new Error(`O site respondeu ${res.status} — nada foi importado.`);
      const html = await res.text();
      const draft = extractBrandFromWebsiteHtml(html, url);
      setSiteDraft({ name: draft.name, colors: draft.colors, taglines: draft.taglines });
      setNotice(draft.name
        ? `Lido: «${draft.name}» — revê antes de aplicar (cores: ${draft.colors.join(', ') || 'nenhuma encontrada'}).`
        : 'O site foi lido, mas não se encontrou nome — nada aplicado.');
    } catch (e) {
      setError(`Não foi possível ler o site (${e instanceof Error ? e.message : String(e)}). Alguns sites bloqueiam leitura cross-origin — usa a entrevista.`);
    }
  };

  const applySiteDraft = () => run(() => {
    if (!siteDraft?.name) throw new Error('Não há rascunho de website para aplicar.');
    setAnswers((a) => ({
      ...a, name: siteDraft.name,
      primaryColor: siteDraft.colors[0] ?? a.primaryColor ?? '',
      accentColor: siteDraft.colors[1] ?? a.accentColor ?? '',
      slogan: siteDraft.taglines[0] ?? a.slogan ?? '',
    }));
    setNotice('Rascunho do website aplicado à entrevista — completa os campos em falta e aplica.');
  });

  const runRadar = () => run(() => {
    if (!brand) throw new Error('Configura primeiro a marca.');
    setRadar(generateRadar(topic, context));
    setNotice('Radar gerado por templates locais (sem IA): 30 pautas.');
  });

  const pickTop10 = () => run(() => {
    if (!radar) return;
    setRadar(selectPautas(radar, topPautas(radar, 10).map((p) => p.id)));
  });

  const togglePauta = (id: string) => run(() => {
    if (!radar) return;
    const selected = radar.selectedIds.includes(id)
      ? radar.selectedIds.filter((x) => x !== id)
      : [...radar.selectedIds, id];
    setRadar(selectPautas(radar, selected));
  });

  const runCopy = async () => {
    setError(null);
    setNotice(null);
    if (!brand) { setError('Configura primeiro a marca.'); return; }
    try {
      const result = await ai.generateCopy({ topic, architectureId, context, brandName: brand.name, tone: brand.tone });
      setContentOrigin(result.source === "api" ? "OpenAI API" : "templates locais");
      setCaption(result.copy.caption);
      setHashtags(result.copy.hashtags);
      setSlides(applyBrandTemplate(brandSchema, result.copy.slides, { coverVariant }));
      setNotice(result.source === 'api'
        ? `Copy gerada pela API da OpenAI (${result.copy.slides.length} slides, custo ~$${result.costUsd.toFixed(4)}) — revê cada card antes de aprovar.`
        : `Copy gerada por templates (${result.copy.slides.length} slides) — conteúdo de demonstração, modo de teste. Revê cada card antes de aprovar.`);
    } catch (e) {
      // A API falhou (ou o gate recusou): volta aos templates locais, a dizer —
      // excepto com a IA desligada, onde gerar seria desrespeitar a escolha.
      if (ai.state.settings.mode === 'desligada') {
        setError(e instanceof Error ? e.message : String(e));
        return;
      }
      try {
        setContentOrigin('templates locais'); setApprovedAt(null);
        const fallback = generateTestCopy({ topic, architectureId, context, brandName: brand.name, tone: brand.tone });
        setCaption(fallback.copy.caption);
        setHashtags(fallback.copy.hashtags);
        setSlides(applyBrandTemplate(brandSchema, fallback.copy.slides, { coverVariant }));
        setNotice(`A API não gerou a copy (${e instanceof Error ? e.message : String(e)}). Gerada por templates locais (modo de teste) — nada foi gasto.`);
      } catch (e2) {
        setError(e2 instanceof Error ? e2.message : String(e2));
      }
    }
  };

  const runReplicate = () => run(() => {
    setContentOrigin('templates locais'); setApprovedAt(null);
    if (!brand) throw new Error('Configura primeiro a marca.');
    if (!reference) throw new Error('Modela primeiro uma referência.');
    const result = replicateContent({
      source: reference, newTopic: topic, architectureId, context, brandName: brand.name, tone: brand.tone,
    });
    setCaption(result.caption);
    setHashtags(result.hashtags);
    setSlides(applyBrandTemplate(brandSchema, result.slides, { coverVariant }));
    setNotice(`Replicado da estrutura «${reference.label}» para o tema «${topic}» — texto novo por templates.`);
  });

  const changeCover = (variant: CoverVariantId) => run(() => {
    setApprovedAt(null);
    setCoverVariant(variant);
    if (slides.length) setSlides(applyCoverVariant(slides, variant, brandSchema));
  });

  const editSlide = (index: number, patch: { title?: string; body?: string }) => run(() => {
    setApprovedAt(null);
    setSlides(correctSlide(slides, index, patch, brandSchema));
  });

  const approveSlide = (index: number) => run(() => {
    setSlides(setSlideReviewStatus(slides, index, 'aprovado'));
  });

  const approveProjectClick = () => run(() => {
    if (!project) throw new Error('Não há projecto.');
    const approved = approveProjectFn(project, approvedBy);
    setApprovedBy(approved.approvedBy ?? '');
    setApprovedAt(approved.approvedAt);
    setNotice('Projecto aprovado por ti — o gate de agendamento pode abrir (publicação continua desactivada).');
  });

  const consistency = brandSchema ? checkBrandConsistency(slides, brandSchema) : [];
  const gate = project ? checkScheduleGate(project, slides.map((s) => s.reviewStatus ?? 'pendente')) : null;
  const captionVariants = caption ? buildCaptionVariants({ brandName: brand?.name ?? '', title: topic, caption, hashtags, slides: slides.map(slideTextContents), cta: context.defaultCta }) : null;
  const ctaVariants = buildCtaVariants(context.defaultCta);

  const download = async (name: string, blob: Blob) => {
    if(window.pinkLogicDesktop?.saveExport) { const result=await window.pinkLogicDesktop.saveExport(name,new Uint8Array(await blob.arrayBuffer())); if(!result.saved) throw new Error('Exportação cancelada.'); return; }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  const exportCardsPdf = async (downloadFile = true) => {
    if (!slides.length) throw new Error("Não há cards para exportar.");
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF({orientation: 'portrait', unit: 'px', format: [1080, 1350], hotfixes: ['px_scaling']});
    for (let i = 0; i < slides.length; i++) { if (i) pdf.addPage([1080, 1350]); const png = await renderSlideToBlob(slides[i], 'jpeg'); const data = new Uint8Array(await png.arrayBuffer()); pdf.addImage(data, 'JPEG', 0, 0, 1080, 1350); }
    const blob = pdf.output('blob'); if(downloadFile) await download('pinklogic-cards.pdf', blob); return blob;
  };
  const exportDeliveryZip = async (toPhone = false) => {
    if (!project) return;
    setError(null);
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const delivery = { brandName: brand?.name ?? '', title: topic, caption, hashtags, slides: slides.map(slideTextContents), cta: context.defaultCta };
      // PNG/JPG reais de cada slide, renderizados no canvas do browser a
      // partir da mesma geometria do motor de templates (Fase 3). Se o
      // browser não conseguir renderizar um slide, o ZIP não sai a fingir
      // que saiu: o erro é mostrado e nada é descarregado.
      for (let i = 0; i < slides.length; i++) {
        zip.file(`slide-${i + 1}.png`, new Uint8Array(await (await renderSlideToBlob(slides[i], 'png')).arrayBuffer()));
        zip.file(`slide-${i + 1}.jpg`, new Uint8Array(await (await renderSlideToBlob(slides[i], 'jpeg')).arrayBuffer()));
      }
      zip.file('caption.txt', buildCaptionText({ brandName: brand?.name, title: topic, caption, hashtags }));
      zip.file('plano.pdf', buildPlanPdf(delivery));
      zip.file('cards.pdf', new Uint8Array(await (await exportCardsPdf(false)).arrayBuffer()));
      zip.file('dm.txt', buildDmText(delivery));
      zip.file('project.json', serializeProject(project));
      const manifest = buildExportManifest({ slideCount: Math.max(slides.length, 1) });
      zip.file('MANIFESTO.txt', [
        'Ficheiros do ZIP de entrega (PNG/JPG renderizados no canvas do browser):',
        ...manifest.map((m) => ` - ${m.name}`),
        '',
        `Origem do texto: ${contentOrigin}. Arte por templates locais.`,
      ].join('\n'));
      const blob = await zip.generateAsync({ type: 'blob' });
      if (toPhone) { if (!window.pinkLogicDesktop) throw new Error('Transferência local requer o desktop.'); setTransfer(await window.pinkLogicDesktop.startLocalTransfer(new Uint8Array(await blob.arrayBuffer()))); }
      else await download(`pinklogic-carrossel-${new Date().toISOString().split('T')[0]}.zip`, blob);
      setNotice(`ZIP de entrega descarregado (${slides.length} slides PNG+JPG 1080×1350, caption, plano.pdf, dm, project.json).`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const restoreSavedProject = async () => { await restoreDraft(`carousel-${projectId}`); };

  const stepIndex = FLOW_STEPS.findIndex((s) => s.id === step);

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: '1rem' }}>
      <h2 className="brand-font" style={{ fontSize: '1.6rem', margin: '0 0 4px' }}>Fluxo de Carrosséis</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 0.5rem', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <AIStatusBadge />
        <span>
          Marca → Radar → Arquitetura → Copy → Slides → Entrega.{' '}
          {ai.status === 'teste'
            ? 'Modo de teste: templates locais, conteúdo de demonstração — não usa os modelos da OpenAI.'
            : ai.status === 'api'
              ? 'API ligada: a copy pode ser gerada pela OpenAI (com limites de custo).'
              : 'IA desligada: sem geração de copy.'}
        </span>
      </p>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 1rem' }}>
        {autosave.storage && (
          <> Autosave: {autosave.status === 'saved-desktop' ? 'desktop' : autosave.status === 'saved-browser' ? 'browser (localStorage)' : autosave.status} {autosave.lastSavedAt ? `· ${autosave.lastSavedAt.slice(11, 19)}` : ''}.</>
        )}
      </p>
      {ai.status === 'teste' && (
        <p data-testid="ai-demo-banner" style={{ background: '#FFF7E0', border: '1px solid #D4AF37', borderRadius: 8, padding: '0.7rem', fontSize: '0.85rem', color: '#4a3600' }}>
          <strong>Conteúdo de demonstração — modo de teste.</strong> A copy deste fluxo é gerada por
          templates locais e não usa os modelos da OpenAI. Para a geração real, abre «Ligação de IA».
        </p>
      )}

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '1rem' }}>
        <button onClick={() => navigate('/sistema/ia')} data-testid="go-ai-connection"
          style={{ padding: '0.4rem 0.7rem', borderRadius: 999, border: '1px solid #D4AF37', background: '#FFF7E0', color: '#4a3600', cursor: 'pointer', fontSize: '0.8rem' }}>
          Passo 2 — Ligação de IA ({ai.status === 'teste' ? 'modo de teste' : ai.status === 'api' ? 'API ligada' : 'desligada'}) →
        </button>
      </div>
      {window.pinkLogicDesktop && <section className="card" style={{padding: 16, marginBottom: 16}}>
        <h3>Projetos neste computador</h3>
        <button data-testid="load-ofensiva-example" onClick={() => void loadOfensivaExample()}>Carregar exemplo Ofensiva Criativa — 5 cards locais</button>
        <select aria-label="Brand Kits locais" value="" onChange={async e => { const d = await window.pinkLogicDesktop!.loadDraft(e.target.value); if(d) { const kit = d.data as {brand: BrandLike; context: BrandContext}; setProjectId(crypto.randomUUID()); setBrand(kit.brand); setContext(kit.context); setSlides([]); setCaption(''); setHashtags([]); setApprovedAt(null); setApprovedBy(''); setTopic(''); setRadar(null); setReference(null); setContentOrigin('templates locais'); setStep('marca'); } }}><option value="">Abrir Brand Kit local…</option>{savedBrands.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}</select>
        <button onClick={async () => { await autosave.saveNow(); setSavedDrafts((await window.pinkLogicDesktop!.listDrafts()).filter(x => x.id.startsWith('carousel-'))); }}>Guardar e atualizar lista</button>
        <select aria-label="Recuperar projeto" value="" onChange={e => void restoreDraft(e.target.value)}><option value="">Recuperar projeto guardado…</option>{savedDrafts.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}</select>
        <p>Origem: {contentOrigin}. Capas e cards: templates locais editáveis.</p>
      </section>}
      <details style={{marginBottom: 16}}><summary>Usar texto do meu ChatGPT sem API — transferência manual</summary>
        <p>Na Ligação de IA, abra o ChatGPT e copie o pedido. Cole aqui a resposta JSON. Isto não liga nem verifica a sua assinatura.</p>
        <textarea aria-label="Resposta JSON do ChatGPT" value={manualCopy} onChange={e => setManualCopy(e.target.value)} rows={6} style={inputStyle}/>
        <button onClick={() => void window.pinkLogicDesktop?.openChatGPTManual(`Cria 5 cards em português de Portugal sobre: ${topic}. Marca: ${brand?.name || 'não definida'}. Tom: ${brand?.tone || ''}. Contexto: ${JSON.stringify(context)}. Devolve apenas JSON, sem markdown: {"slides":[{"title":"...","body":"..."}],"caption":"...","hashtags":["..."]}. Exatamente 5 slides. Não inventes resultados, provas ou tendências.`)}>Copiar pedido e abrir ChatGPT</button>
        <button onClick={importChatGPTCopy}>Importar e rever os 5 cards</button>
      </details>
      <details style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
        <summary style={{ cursor: 'pointer' }}>Fluxo completo — 15 passos (onde está cada um)</summary>
        <ol style={{ paddingLeft: '1.2rem', margin: '0.5rem 0 0' }}>
          {FIFTEEN_STEPS.map((s) => (
            <li key={s.n} style={{ marginBottom: 2, fontWeight: s.stage === step || (s.stage === 'ia' && ai.status === 'teste') ? 700 : 400 }}>
              {s.n}. {s.label} — <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>{s.where}</span>
              {s.stage === 'ia' && <button onClick={() => navigate('/sistema/ia')} style={{ marginLeft: 6, fontSize: '0.8rem', cursor: 'pointer' }}>Abrir →</button>}
              {s.stage !== 'ia' && s.stage !== 'app' && <button onClick={() => setStep(s.stage as CarouselFlowStep)} style={{ marginLeft: 6, fontSize: '0.8rem', cursor: 'pointer' }}>Ir →</button>}
            </li>
          ))}
        </ol>
      </details>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '1rem' }}>
        {FLOW_STEPS.map((s, i) => (
          <button key={s.id} onClick={() => setStep(s.id)} disabled={i > stepIndex + 1}
            style={{ padding: '0.4rem 0.7rem', borderRadius: 999, border: '1px solid var(--border, #ddd)', background: s.id === step ? '#103B78' : '#fff', color: s.id === step ? '#fff' : '#111', cursor: 'pointer', fontSize: '0.8rem' }}>
            {i + 1}. {s.label}
          </button>
        ))}
      </div>

      {error && <p style={{ color: '#b00020', fontSize: '0.85rem' }}>{error}</p>}
      {notice && <p style={{ color: '#0a6b2d', fontSize: '0.85rem' }}>{notice}</p>}
      {autosave.error && <p style={{ color: '#b00020', fontSize: '0.85rem' }}>Autosave: {autosave.error}</p>}

      {step === 'marca' && (
        <div className="card" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <h3 style={{ margin: 0 }}>1. Marca {brand ? `— activa: ${brand.name}` : '— nenhuma marca activa'}</h3>
          {activeBrand && !brand && (
            <button className="btn-primary" onClick={() => { setBrand(brandLikeFromSchema(activeBrand)); setNotice(`Marca activa do Brand Kit: ${activeBrand.name}.`); }}>
              Usar marca activa do Brand Kit ({activeBrand.name})
            </button>
          )}
          <h4 style={{ margin: '0.4rem 0 0' }}>Entrevista guiada</h4>
          {INTERVIEW_QUESTIONS.map((q) => (
            <div key={q.id}>
              <label style={label}>{q.label} {q.required ? '*' : ''} <span style={{ color: 'var(--text-secondary)' }}>— {q.hint}</span></label>
              <input style={inputStyle} value={(answers[q.id] as string) ?? ''} placeholder={q.examples.join(' · ')}
                onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))} />
              {interviewErrors[q.id] && <span style={{ color: '#b00020', fontSize: '0.8rem' }}>{interviewErrors[q.id]}</span>}
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={applyInterview}>Aplicar entrevista</button>
            <button onClick={saveInterviewBrandToKit} disabled={!brand}>Guardar no Brand Kit</button>
          </div>
          <h4 style={{ margin: '0.4rem 0 0' }}>Ou importar de um website público (só leitura)</h4>
          <div style={{ display: 'flex', gap: 8 }}>
            <input style={inputStyle} value={siteUrl} placeholder="https://www.exemplo.com" onChange={(e) => setSiteUrl(e.target.value)} />
            <button onClick={importFromWebsite}>Ler site</button>
          </div>
          {siteDraft && (
            <div style={{ fontSize: '0.85rem', border: '1px dashed #ccc', borderRadius: 8, padding: '0.6rem' }}>
              <strong>{siteDraft.name || '(sem nome)'}</strong>
              <br />Cores: {siteDraft.colors.join(', ') || 'nenhuma encontrada'}
              <br />Slogans possíveis: {siteDraft.taglines.join(' · ') || 'nenhum'}
              <br /><button onClick={applySiteDraft} style={{ marginTop: 6 }}>Aplicar à entrevista (rever depois)</button>
            </div>
          )}
          <h4 style={{ margin: '0.4rem 0 0' }}>Contexto persistente da marca</h4>
          <label style={label}>Público</label>
          <input style={inputStyle} value={context.audience} onChange={(e) => setContext((c) => ({ ...c, audience: e.target.value }))} />
          <label style={label}>Dores (uma por linha)</label>
          <textarea style={inputStyle} rows={3} value={context.pains.join('\n')} onChange={(e) => setContext((c) => mergeBrandContext(c, { pains: e.target.value.split('\n') }))} />
          <label style={label}>Objectivos (um por linha)</label>
          <textarea style={inputStyle} rows={3} value={context.goals.join('\n')} onChange={(e) => setContext((c) => mergeBrandContext(c, { goals: e.target.value.split('\n') }))} />
          <label style={label}>CTA por omissão</label>
          <input style={inputStyle} value={context.defaultCta} onChange={(e) => setContext((c) => ({ ...c, defaultCta: e.target.value }))} />
          <label style={label}>Hashtags (separadas por espaço)</label>
          <input style={inputStyle} value={context.hashtags.join(' ')} onChange={(e) => setContext((c) => ({ ...c, hashtags: e.target.value.split(/\s+/).filter(Boolean) }))} />
          <button className="btn-primary" onClick={() => setStep('radar')} disabled={!brand}>Continuar para o Radar →</button>
        </div>
      )}

      {step === 'radar' && (
        <div className="card" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <h3 style={{ margin: 0 }}>2. Radar — 30 pautas → 10 prioritárias</h3>
          <label style={label}>Tema</label>
          <input style={inputStyle} value={topic} onChange={(e) => setTopic(e.target.value)} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-primary" onClick={runRadar}>Gerar 30 pautas (templates locais)</button>
            <button onClick={pickTop10} disabled={!radar}>Escolher as 10 com maior pontuação</button>
          </div>
          {radar && (
            <div>
              <p style={{ fontSize: '0.85rem' }}>Seleccionadas: {radar.selectedIds.length}/10 (a 1.ª seleccionada vira o tema do carrossel).</p>
              <ol style={{ fontSize: '0.85rem', paddingLeft: '1.2rem' }}>
                {radar.pautas.map((p) => (
                  <li key={p.id} style={{ marginBottom: 4 }}>
                    <label>
                      <input type="checkbox" checked={radar.selectedIds.includes(p.id)} onChange={() => togglePauta(p.id)} />{' '}
                      <strong>{p.title}</strong> <span style={{ color: 'var(--text-secondary)' }}>({p.angle} · {p.score} — {p.serves})</span>
                    </label>
                  </li>
                ))}
              </ol>
              <button className="btn-primary" disabled={!radar.selectedIds.length} onClick={() => {
                const first = radar.pautas.find((p) => p.id === radar.selectedIds[0]);
                if (first) setTopic(first.title);
                setStep('arquitetura');
              }}>Usar a 1.ª seleccionada como tema →</button>
            </div>
          )}
        </div>
      )}

      {step === 'arquitetura' && (
        <div className="card" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <h3 style={{ margin: 0 }}>3. Arquitetura do carrossel</h3>
          {ARCHITECTURES.map((a) => (
            <label key={a.id} style={{ border: architectureId === a.id ? '2px solid #103B78' : '1px solid #ddd', borderRadius: 8, padding: '0.6rem', cursor: 'pointer' }}>
              <input type="radio" name="arch" checked={architectureId === a.id} onChange={() => setArchitectureId(a.id)} />{' '}
              <strong>{a.label}</strong> ({a.slideCount} slides) — {a.description}
              <br /><span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{a.bodyPlan.join(' → ')}</span>
            </label>
          ))}
          <h4 style={{ margin: '0.4rem 0 0' }}>Modelador de referências (estrutura, nunca cópia)</h4>
          <input style={inputStyle} value={refLabel} placeholder="Nome da referência (ex.: Carrossel X — conta Y)" onChange={(e) => setRefLabel(e.target.value)} />
          <input style={inputStyle} value={refHook} placeholder="Gancho descrito com as tuas palavras" onChange={(e) => setRefHook(e.target.value)} />
          <input style={inputStyle} value={refStructure} placeholder="Estrutura: gancho, problema, solução, prova, CTA" onChange={(e) => setRefStructure(e.target.value)} />
          <input style={inputStyle} value={refCta} placeholder="CTA observado (descrito)" onChange={(e) => setRefCta(e.target.value)} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => run(() => setReference(modelReference({ label: refLabel, hook: refHook, slideCount: 5, structure: refStructure.split(','), cta: refCta })))}>Guardar referência</button>
            {reference && <span style={{ fontSize: '0.85rem', alignSelf: 'center' }}>Referência: {reference.label} ({reference.structure.length} passos)</span>}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => { void runCopy().then(() => setStep('copy')); }}>Gerar copy →</button>
            <button onClick={() => { runReplicate(); setStep('copy'); }} disabled={!reference}>Replicar da referência →</button>
          </div>
        </div>
      )}

      {step === 'copy' && (
        <div className="card" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <h3 style={{ margin: 0 }}>4. Copy — revisão por card</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Copy por templates a partir da voz da marca. Edita cada card; a correcção é individual, sem refazer o carrossel.</p>
          {slides.map((s, i) => {
            const { title, body } = slideTextContents(s);
            return (
              <div key={s.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: '0.6rem' }}>
                <strong>Card {i + 1}</strong> <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>({s.reviewStatus ?? 'pendente'})</span>
                <input style={{ ...inputStyle, marginTop: 6 }} value={title} onChange={(e) => editSlide(i, { title: e.target.value })} />
                <textarea style={{ ...inputStyle, marginTop: 6 }} rows={3} value={body} onChange={(e) => editSlide(i, { body: e.target.value })} />
                <button onClick={() => approveSlide(i)} style={{ marginTop: 6 }}>Aprovar card</button>
              </div>
            );
          })}
          {!slides.length && <p style={{ fontSize: '0.85rem' }}>Ainda sem slides — volta à Arquitetura e gera a copy.</p>}
          <label style={label}>Legenda</label>
          <textarea style={inputStyle} rows={4} value={caption} onChange={(e) => setCaption(e.target.value)} />
          <button className="btn-primary" onClick={() => setStep('slides')} disabled={!slides.length}>Continuar para os Slides →</button>
        </div>
      )}

      {step === 'slides' && (
        <div className="card" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <h3 style={{ margin: 0 }}>5. Slides — capas e consistência da marca</h3>
          <div>
            <span style={{ fontSize: '0.85rem' }}>Capa: </span>
            {buildCoverVariants(brandSchema, slides.length ? slideTextContents(slides[0]) : { title: topic, body: '' }, slides.length || 1).map((v) => (
              <button key={v.variant} onClick={() => changeCover(v.variant)} style={{ marginRight: 6, background: coverVariant === v.variant ? '#103B78' : '#fff', color: coverVariant === v.variant ? '#fff' : 'inherit', borderRadius: 6, border: '1px solid #ccc', padding: '0.3rem 0.6rem', cursor: 'pointer' }}>
                {v.label}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.85rem', margin: 0 }}>
            Consistência da marca: {consistency.length === 0 ? 'OK — todos os slides usam só cores e fontes do Brand Kit.' : `${consistency.length} violação(ões): ${consistency.map((v) => `slide ${v.slideIndex + 1} ${v.kind} ${v.value}`).join('; ')}`}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
            {slides.map((s, i) => {
              const { title, body } = slideTextContents(s);
              return (
                <div key={s.id} style={{ background: s.background.value, color: '#fff', borderRadius: 10, padding: '0.8rem', minHeight: 200, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ color: '#D4AF37', fontSize: '0.7rem', fontWeight: 700 }}>{brand?.name.toUpperCase()} · {i + 1}/{slides.length}</span>
                  <strong style={{ fontSize: '0.95rem' }}>{title}</strong>
                  <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>{body}</span>
                  <span style={{ marginTop: 'auto', fontSize: '0.7rem' }}>{s.reviewStatus ?? 'pendente'}{s.correctedAt ? ' · corrigido' : ''}</span>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Pré-visualização simples (cores e texto reais). A exportação inclui os PNG/JPG dos slides (botão «Exportar ZIP de entrega» na Entrega).</p>
          <button className="btn-primary" onClick={() => setStep('entrega')} disabled={!slides.length}>Continuar para a Entrega →</button>
        </div>
      )}

      {step === 'entrega' && (
        <div className="card" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <h3 style={{ margin: 0 }}>6. Entrega</h3>
          {captionVariants && (
            <>
              <label style={label}>Legenda (principal)</label>
              <textarea style={inputStyle} rows={4} readOnly value={captionVariants.main} />
              <label style={label}>Legenda curta</label>
              <textarea style={inputStyle} rows={2} readOnly value={captionVariants.short} />
              <label style={label}>Legenda com pergunta</label>
              <textarea style={inputStyle} rows={3} readOnly value={captionVariants.question} />
            </>
          )}
          <div>
            <span style={{ fontSize: '0.85rem' }}>Variantes de CTA: </span>
            {ctaVariants.map((c) => <span key={c} style={{ fontSize: '0.85rem', background: '#F5F7FA', borderRadius: 6, padding: '0.2rem 0.5rem', marginRight: 6 }}>{c}</span>)}
          </div>
          <label style={label}>Mensagens de DM (templates — editar antes de enviar; nada é enviado automaticamente)</label>
          <textarea style={inputStyle} rows={6} readOnly value={project ? buildDmText({ brandName: brand?.name ?? '', title: topic, caption, hashtags, slides: slides.map(slideTextContents), cta: context.defaultCta }) : ''} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => void exportCardsPdf().catch(e => setError(e instanceof Error ? e.message : String(e)))} disabled={!slides.length}>Exportar PDF dos cards</button>
            <button onClick={() => void exportDeliveryZip(true)} disabled={!slides.length || !window.pinkLogicDesktop}>Enviar ao telemóvel por QR</button>
            {transfer && <div><img src={transfer.qrDataUrl} alt="QR de transferência local"/><p>Mesma rede Wi-Fi. Link HTTP local, de uso único, expira em 5 minutos. Utilize rede de confiança.</p><button onClick={() => { void window.pinkLogicDesktop?.stopLocalTransfer(); setTransfer(null); }}>Encerrar transferência</button></div>}
            <button className="btn-primary" onClick={() => void exportDeliveryZip()} disabled={!slides.length}>Exportar ZIP de entrega</button>
            <button onClick={() => project && download('plano.pdf', new Blob([buildPlanPdf({ brandName: brand?.name ?? '', title: topic, caption, hashtags, slides: slides.map(slideTextContents), cta: context.defaultCta })], { type: 'application/pdf' }))} disabled={!slides.length}>Descarregar plano.pdf</button>
          </div>
          <h4 style={{ margin: '0.4rem 0 0' }}>Guardar e recuperar (passo 14)</h4>
          <p style={{ fontSize: '0.85rem', margin: 0 }}>
            {autosave.storage
              ? `Guardado em ${autosave.storage === 'desktop' ? 'rascunho desktop' : 'browser (localStorage)'}${autosave.lastSavedAt ? ` · ${autosave.lastSavedAt.slice(11, 19)}` : ''} (autosave).`
              : 'Ainda sem autosave — preenche a marca e gera a copy para o projecto existir.'}
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => { void autosave.saveNow().then(() => setNotice('Projecto guardado agora.')); }} disabled={!project}>Guardar projecto agora</button>
            <button onClick={() => void restoreSavedProject()} disabled={!project}>Recuperar projecto guardado</button>
          </div>
          <h4 style={{ margin: '0.4rem 0 0' }}>Aprovação humana (gate de agendamento)</h4>
          <div style={{ display: 'flex', gap: 8 }}>
            <input style={inputStyle} value={approvedBy} placeholder="Aprovado por (nome)" onChange={(e) => setApprovedBy(e.target.value)} />
            <button onClick={approveProjectClick}>Aprovar projecto</button>
          </div>
          {gate && (
            <p style={{ fontSize: '0.85rem', margin: 0 }}>
              Gate de agendamento: {gate.ok ? 'ABERTO — projecto aprovado e todos os slides aprovados.' : `FECHADO — ${gate.reasons.join(' ')}`}
            </p>
          )}
          <h4 style={{ margin: '0.4rem 0 0' }}>Publicação (avaliada, desactivada)</h4>
          {(['instagram', 'composio'] as const).map((ch) => {
            const adapter = disabledAdapter(ch);
            const ev = evaluateChannel(ch);
            return (
              <p key={ch} style={{ fontSize: '0.85rem', margin: 0 }}>
                <strong>{ch}</strong>: {adapter.disabledReason}
                <br /><span style={{ color: 'var(--text-secondary)' }}>Falta: {ev.missing.join(' ')}</span>
              </p>
            );
          })}
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Nada é publicado a partir daqui. O agendamento continua com o gate humano existente (approved_by/approved_at, só a dona).
          </p>
        </div>
      )}
    </div>
  );
}
