// ---------------------------------------------------------------------------
// Fluxo completo de criação de carrosséis — Fase 2 (passos a–o).
// Assistente em 6 passos: Marca → Radar → Arquitetura → Copy → Slides → Entrega.
// Usa os serviços puros (carouselFlow / carouselRadar / carouselReference /
// carouselDelivery / carouselPublish) + o motor da Fase 1 (carouselDocument).
// Sem IA paga, sem rede para gerar conteúdo; a leitura de website é só HTML
// público e pode falhar por CORS — nesse caso diz-se, não se contorna.
// ---------------------------------------------------------------------------
import { useMemo, useState } from 'react';
import { useBrand, type BrandSchema } from '../../providers/BrandProvider';
import { useCentralStore } from '../../store/CentralStore';
import { useCarouselAutosave } from '../../hooks/useCarouselAutosave';
import {
  INTERVIEW_QUESTIONS, buildBrandFromInterview, extractBrandFromWebsiteHtml,
  normalizeBrandContext, mergeBrandContext, newCarouselProject, approveProject as approveProjectFn,
  serializeProject, FLOW_STEPS, type BrandContext, type BrandInterviewAnswers,
  type BrandLike, type CarouselFlowStep, type CarouselProject,
} from '../../services/carouselFlow';
import {
  generateRadar, selectPautas, topPautas, ARCHITECTURES, generateCopy,
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
import type { Slide } from '../../contexts/EditorContext';

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
  const { activeBrand, createBrand } = useBrand();
  const { activeProjectId } = useCentralStore();
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
    const p = newCarouselProject({ title: topic || 'Carrossel sem título', brand, context, topic });
    p.architectureId = architectureId;
    p.coverVariant = coverVariant;
    p.slides = slides.map(slideTextContents);
    p.caption = caption;
    p.hashtags = hashtags;
    p.approvedBy = approvedBy || null;
    p.approvedAt = approvedAt;
    p.referenceId = reference?.id ?? null;
    p.pautaId = radar?.selectedIds[0] ?? null;
    return p;
  }, [brand, context, topic, architectureId, coverVariant, slides, caption, hashtags, approvedBy, approvedAt, reference, radar]);

  const autosave = useCarouselAutosave(project);

  const run = (fn: () => void) => {
    setError(null);
    setNotice(null);
    try { fn(); } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
  };

  const applyInterview = () => run(() => {
    const { brand: built, errors } = buildBrandFromInterview(answers as BrandInterviewAnswers, activeProjectId || 'default');
    setInterviewErrors(errors);
    if (Object.keys(errors).length) return;
    setBrand(built);
    setNotice(`Marca «${built.name}» configurada por entrevista (logo vazio — sem ficheiro oficial).`);
  });

  const saveInterviewBrandToKit = () => run(() => {
    if (!brand) throw new Error('Configura primeiro a marca por entrevista.');
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

  const runCopy = () => run(() => {
    if (!brand) throw new Error('Configura primeiro a marca.');
    const copy = generateCopy({ topic, architectureId, context, brandName: brand.name, tone: brand.tone });
    setCaption(copy.caption);
    setHashtags(copy.hashtags);
    setSlides(applyBrandTemplate(brandSchema, copy.slides, { coverVariant }));
    setNotice(`Copy gerada por templates (${copy.slides.length} slides) — revê cada card antes de aprovar.`);
  });

  const runReplicate = () => run(() => {
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
    setCoverVariant(variant);
    if (slides.length) setSlides(applyCoverVariant(slides, variant, brandSchema));
  });

  const editSlide = (index: number, patch: { title?: string; body?: string }) => run(() => {
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

  const download = (name: string, blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  };

  const exportDeliveryZip = async () => {
    if (!project) return;
    setError(null);
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const delivery = { brandName: brand?.name ?? '', title: topic, caption, hashtags, slides: slides.map(slideTextContents), cta: context.defaultCta };
      zip.file('caption.txt', buildCaptionText({ brandName: brand?.name, title: topic, caption, hashtags }));
      zip.file('plano.pdf', buildPlanPdf(delivery));
      zip.file('dm.txt', buildDmText(delivery));
      zip.file('project.json', serializeProject(project));
      const manifest = buildExportManifest({ slideCount: Math.max(slides.length, 1) });
      zip.file('MANIFESTO.txt', [
        'Ficheiros do ZIP de entrega (os PNG/JPG dos slides saem do Editor — Fase 1):',
        ...manifest.map((m) => ` - ${m.name}`),
        '',
        'Conteúdo composto a partir de templates locais (sem IA).',
      ].join('\n'));
      const blob = await zip.generateAsync({ type: 'blob' });
      download(`pinklogic-carrossel-${new Date().toISOString().split('T')[0]}.zip`, blob);
      setNotice('ZIP de entrega descarregado (caption + plano.pdf + dm + project.json). Os PNG/JPG exportam-se no Editor.');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const stepIndex = FLOW_STEPS.findIndex((s) => s.id === step);

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: '1rem' }}>
      <h2 className="brand-font" style={{ fontSize: '1.6rem', margin: '0 0 4px' }}>Fluxo de Carrosséis</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 1rem' }}>
        Marca → Radar → Arquitetura → Copy → Slides → Entrega. Templates locais, sem IA paga.
        {autosave.storage && (
          <> Autosave: {autosave.status === 'saved-desktop' ? 'desktop' : autosave.status === 'saved-browser' ? 'browser (localStorage)' : autosave.status} {autosave.lastSavedAt ? `· ${autosave.lastSavedAt.slice(11, 19)}` : ''}.</>
        )}
      </p>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '1rem' }}>
        {FLOW_STEPS.map((s, i) => (
          <button key={s.id} onClick={() => setStep(s.id)} disabled={i > stepIndex + 1}
            style={{ padding: '0.4rem 0.7rem', borderRadius: 999, border: '1px solid var(--border, #ddd)', background: s.id === step ? '#103B78' : '#fff', color: s.id === step ? '#fff' : 'inherit', cursor: 'pointer', fontSize: '0.8rem' }}>
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
            <button className="btn-primary" onClick={() => { runCopy(); setStep('copy'); }}>Gerar copy →</button>
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
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Pré-visualização simples (cores e texto reais). A renderização final PNG/JPG é no Editor.</p>
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
            <button className="btn-primary" onClick={exportDeliveryZip} disabled={!slides.length}>Exportar ZIP de entrega</button>
            <button onClick={() => project && download('plano.pdf', new Blob([buildPlanPdf({ brandName: brand?.name ?? '', title: topic, caption, hashtags, slides: slides.map(slideTextContents), cta: context.defaultCta })], { type: 'application/pdf' }))} disabled={!slides.length}>Descarregar plano.pdf</button>
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
