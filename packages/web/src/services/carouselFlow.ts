// ---------------------------------------------------------------------------
// Fluxo completo de carrosséis — Fase 2 (sobre o motor da Fase 1).
// Módulo de contexto da marca + documento do projecto (passos a, b, o).
//
// Regras:
// - Tudo local e determinístico: nenhuma chamada de rede, nenhuma IA paga,
//   nenhuma imagem gerada. O conteúdo de demonstração é escrito localmente.
// - O logótipo da marca é texto quando não existe ficheiro oficial — nunca
//   se inventa um logótipo (ver scripts/ofensiva-criativa-brand.json).
// - Supabase só quando houver sessão autenticada — NÃO há sessão neste
//   contexto, por isso a persistência aqui é local (ficheiro JSON no
//   desktop / localStorage no browser). Nada finge guardar no Supabase.
// ---------------------------------------------------------------------------

export interface BrandPaletteLike {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  surface: string;
}

export interface BrandLike {
  id: string;
  projectId: string;
  name: string;
  palette: BrandPaletteLike;
  typography: { heading: string; body: string };
  tone: string;
  visualStyle: string;
  logo?: string | null;
  colors: string[];
}

/** Contexto persistente da marca: o que o radar, a copy e o replicador lêem. */
export interface BrandContext {
  /** Público-alvo em linguagem da marca (ex.: "pequenas empresas"). */
  audience: string;
  /** Dores do público, uma por linha de ideia (máx. 8). */
  pains: string[];
  /** Objectivos do público (máx. 8). */
  goals: string[];
  /** Temas recorrentes da marca (máx. 12). */
  themes: string[];
  /** Frases proibidas / a evitar (ex.: promessas de resultados). */
  avoid: string[];
  /** Chamada para a acção por omissão. */
  defaultCta: string;
  /** Hashtags da marca. */
  hashtags: string[];
}

export const EMPTY_BRAND_CONTEXT: BrandContext = {
  audience: '',
  pains: [],
  goals: [],
  themes: [],
  avoid: [],
  defaultCta: '',
  hashtags: [],
};

export function normalizeBrandContext(input: Partial<BrandContext> | null | undefined): BrandContext {
  const list = (v: unknown, max: number): string[] =>
    (Array.isArray(v) ? v : [])
      .map((s) => String(s).trim())
      .filter(Boolean)
      .slice(0, max);
  return {
    audience: typeof input?.audience === 'string' ? input.audience.trim() : '',
    pains: list(input?.pains, 8),
    goals: list(input?.goals, 8),
    themes: list(input?.themes, 12),
    avoid: list(input?.avoid, 8),
    defaultCta: typeof input?.defaultCta === 'string' ? input.defaultCta.trim() : '',
    hashtags: list(input?.hashtags, 10).map((h) => (h.startsWith('#') ? h : `#${h}`)),
  };
}

/** Junta o contexto guardado com um novo (o novo ganha; listas unem-se sem duplicados). */
export function mergeBrandContext(base: BrandContext, patch: Partial<BrandContext>): BrandContext {
  const union = (a: string[], b: string[] | undefined, max: number): string[] => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const s of [...a, ...(b ?? [])]) {
      const t = s.trim();
      if (t && !seen.has(t.toLowerCase())) { seen.add(t.toLowerCase()); out.push(t); }
    }
    return out.slice(0, max);
  };
  const merged = normalizeBrandContext({
    ...base,
    ...patch,
    pains: union(base.pains, patch.pains, 8),
    goals: union(base.goals, patch.goals, 8),
    themes: union(base.themes, patch.themes, 12),
    avoid: union(base.avoid, patch.avoid, 8),
    hashtags: union(base.hashtags, patch.hashtags, 10),
  });
  if (patch.audience !== undefined) merged.audience = patch.audience.trim();
  if (patch.defaultCta !== undefined) merged.defaultCta = patch.defaultCta.trim();
  return merged;
}

// ---------------------------------------------------------------------------
// (a) Configuração da marca por entrevista
// ---------------------------------------------------------------------------

export interface InterviewQuestion {
  id: keyof BrandInterviewAnswers;
  label: string;
  hint: string;
  required: boolean;
  /** Sugestões locais (não são respostas automáticas — só exemplos). */
  examples: string[];
}

export interface BrandInterviewAnswers {
  name: string;
  audience: string;
  tone: string;
  primaryColor: string;
  accentColor: string;
  slogan: string;
  cta: string;
}

export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  { id: 'name', label: 'Qual é o nome da marca?', hint: 'O nome exacto, como aparece nos posts.', required: true, examples: ['Ofensiva Criativa'] },
  { id: 'audience', label: 'Para quem é o conteúdo?', hint: 'Uma frase: quem é o público e o que ele quer.', required: true, examples: ['Pequenas empresas que querem vender mais sem complicação'] },
  { id: 'tone', label: 'Qual é o tom da marca?', hint: 'Ex.: directo, acolhedor, técnico, divertido.', required: true, examples: ['Directo e sem filtro', 'Acolhedor e simples', 'Técnico e preciso'] },
  { id: 'primaryColor', label: 'Cor principal (hex)?', hint: 'Ex.: #103B78. É a cor de fundo dos slides.', required: true, examples: ['#103B78'] },
  { id: 'accentColor', label: 'Cor de destaque (hex)?', hint: 'Ex.: #D4AF37. Usada em barras, números e CTAs.', required: true, examples: ['#D4AF37'] },
  { id: 'slogan', label: 'Slogan da marca?', hint: 'Uma frase curta. Pode ficar vazio.', required: false, examples: ['Marketing sem filtro. Resultados sem desculpa.'] },
  { id: 'cta', label: 'Chamada para a acção habitual?', hint: 'O que pedes no fim dos posts (ex.: "Comenta LINK").', required: false, examples: ['Comenta LINK', 'Guarda este post'] },
];

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

/** Valida as respostas da entrevista; devolve os erros por campo (vazio = válido). */
export function validateInterview(answers: Partial<BrandInterviewAnswers>): Partial<Record<keyof BrandInterviewAnswers, string>> {
  const errors: Partial<Record<keyof BrandInterviewAnswers, string>> = {};
  if (!answers.name?.trim()) errors.name = 'O nome da marca é obrigatório.';
  if (!answers.audience?.trim()) errors.audience = 'O público é obrigatório.';
  if (!answers.tone?.trim()) errors.tone = 'O tom é obrigatório.';
  if (!answers.primaryColor?.trim()) errors.primaryColor = 'A cor principal é obrigatória.';
  else if (!HEX_RE.test(answers.primaryColor.trim())) errors.primaryColor = 'A cor principal tem de ser hex (#RRGGBB).';
  if (!answers.accentColor?.trim()) errors.accentColor = 'A cor de destaque é obrigatória.';
  else if (!HEX_RE.test(answers.accentColor.trim())) errors.accentColor = 'A cor de destaque tem de ser hex (#RRGGBB).';
  return errors;
}

/** Converte respostas válidas num BrandLike (logo fica vazio — nunca inventado). */
export function buildBrandFromInterview(
  answers: BrandInterviewAnswers,
  projectId: string,
): { brand: BrandLike; errors: Partial<Record<keyof BrandInterviewAnswers, string>> } {
  const errors = validateInterview(answers);
  if (Object.keys(errors).length) return { brand: null as unknown as BrandLike, errors };
  const primary = answers.primaryColor.trim();
  const accent = answers.accentColor.trim();
  const brand: BrandLike = {
    id: `brand-${Date.now().toString(36)}`,
    projectId,
    name: answers.name.trim(),
    palette: {
      primary,
      secondary: primary,
      accent,
      background: primary,
      text: '#FFFFFF',
      surface: '#F5F7FA',
    },
    typography: { heading: 'Inter', body: 'Inter' },
    tone: answers.tone.trim(),
    visualStyle: answers.slogan?.trim() || '',
    logo: null,
    colors: [primary, accent],
  };
  return { brand, errors: {} };
}

// ---------------------------------------------------------------------------
// (a) Configuração da marca por website — só leitura de HTML público.
// A função recebe o HTML já obtido (o fetch vive na UI); nunca contorna
// bloqueios, nunca segue logins, nunca executa scripts.
// ---------------------------------------------------------------------------

export interface WebsiteBrandDraft {
  name: string;
  description: string;
  /** Cores hex encontradas no HTML/CSS embutido (máx. 6, por frequência). */
  colors: string[];
  /** Frases candidatas a slogan (máx. 3). */
  taglines: string[];
  sourceUrl: string;
}

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<(?:[^>'"]|"[^"]*"|'[^']*')*>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function metaContent(html: string, attr: string, value: string): string {
  const re = new RegExp(`<meta[^>]*${attr}=["']${value}["'][^>]*content=["']([^"']+)["']`, 'i');
  const m = html.match(re) ?? html.match(new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*${attr}=["']${value}["']`, 'i'));
  return m ? m[1].trim() : '';
}

/**
 * Extrai nome/cores/texto de HTML público. Devolve um rascunho para a
 * utilizadora rever — nunca aplica nada sozinho. Sem cores no HTML, a
 * lista fica vazia (não se inventam cores).
 */
export function extractBrandFromWebsiteHtml(html: string, sourceUrl: string): WebsiteBrandDraft {
  if (!html || !html.trim()) throw new Error('O HTML do website está vazio.');
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch ? stripTags(titleMatch[1]).split(/[|·—–-]/)[0].trim() : '';
  const name =
    metaContent(html, 'property', 'og:site_name') ||
    metaContent(html, 'name', 'application-name') ||
    title;
  const description =
    metaContent(html, 'property', 'og:description') ||
    metaContent(html, 'name', 'description') ||
    '';
  // Cores hex no HTML/CSS embutido, por frequência (ignora branco/preto puros).
  const counts = new Map<string, number>();
  for (const m of html.matchAll(/#([0-9A-Fa-f]{6})\b/g)) {
    const hex = `#${m[1].toUpperCase()}`;
    if (hex === '#FFFFFF' || hex === '#000000') continue;
    counts.set(hex, (counts.get(hex) ?? 0) + 1);
  }
  const colors = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([hex]) => hex);
  // Candidatas a slogan: h1/h2 curtos.
  const taglines: string[] = [];
  for (const m of html.matchAll(/<h[12][^>]*>([\s\S]{1,120}?)<\/h[12]>/gi)) {
    const text = stripTags(m[1]);
    if (text.length >= 8 && text.length <= 90 && !taglines.includes(text)) taglines.push(text);
    if (taglines.length >= 3) break;
  }
  return { name, description, colors, taglines, sourceUrl };
}

// ---------------------------------------------------------------------------
// (o) Documento do projecto de carrossel — persistência e recuperação.
// Versão do schema: mudanças incompatíveis sobem a versão e o parse rejeita
// (nunca "adivinha" campos em falta).
// ---------------------------------------------------------------------------

export const CAROUSEL_PROJECT_VERSION = 1;

export type CarouselFlowStep =
  | 'marca'
  | 'radar'
  | 'arquitetura'
  | 'copy'
  | 'slides'
  | 'entrega';

export const FLOW_STEPS: { id: CarouselFlowStep; label: string }[] = [
  { id: 'marca', label: 'Marca' },
  { id: 'radar', label: 'Radar' },
  { id: 'arquitetura', label: 'Arquitetura' },
  { id: 'copy', label: 'Copy' },
  { id: 'slides', label: 'Slides' },
  { id: 'entrega', label: 'Entrega' },
];

export interface CarouselProject {
  version: number;
  id: string;
  title: string;
  brandId: string;
  brandName: string;
  context: BrandContext;
  topic: string;
  /** Pauta escolhida no radar (id) ou tema livre. */
  pautaId: string | null;
  architectureId: string;
  coverVariant: 'classica' | 'destaque' | 'minimal';
  slides: { title: string; body: string }[];
  caption: string;
  hashtags: string[];
  /** Gate humano: só a dona aprova. Sem estes campos, nada agenda/publica. */
  approvedBy: string | null;
  approvedAt: string | null;
  referenceId: string | null;
  createdAt: string;
  updatedAt: string;
}

export function newCarouselProject(input: {
  id?: string;
  title: string;
  brand: BrandLike;
  context?: BrandContext;
  topic?: string;
}): CarouselProject {
  const now = new Date().toISOString();
  return {
    version: CAROUSEL_PROJECT_VERSION,
    id: input.id ?? `carousel-${Date.now().toString(36)}`,
    title: input.title.trim(),
    brandId: input.brand.id,
    brandName: input.brand.name,
    context: normalizeBrandContext(input.context),
    topic: input.topic?.trim() ?? '',
    pautaId: null,
    architectureId: 'lista',
    coverVariant: 'classica',
    slides: [],
    caption: '',
    hashtags: input.context?.hashtags ?? [],
    approvedBy: null,
    approvedAt: null,
    referenceId: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function serializeProject(project: CarouselProject): string {
  return JSON.stringify({ ...project, updatedAt: new Date().toISOString() }, null, 2);
}

/** Parse com validação: ficheiro de outra versão ou sem campos obrigatórios é rejeitado. */
export function parseProject(raw: string): CarouselProject {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('O ficheiro do projecto não é JSON válido.');
  }
  if (!parsed || typeof parsed !== 'object') throw new Error('O ficheiro do projecto está vazio.');
  const p = parsed as Partial<CarouselProject>;
  if (p.version !== CAROUSEL_PROJECT_VERSION) {
    throw new Error(`Versão do projecto não suportada: ${String(p.version)} (esperada ${CAROUSEL_PROJECT_VERSION}).`);
  }
  if (!p.id || !p.title || !p.brandId || !Array.isArray(p.slides)) {
    throw new Error('O ficheiro do projecto não tem os campos obrigatórios (id, title, brandId, slides).');
  }
  return {
    ...p,
    context: normalizeBrandContext(p.context),
    hashtags: Array.isArray(p.hashtags) ? p.hashtags.map(String) : [],
    approvedBy: p.approvedBy ?? null,
    approvedAt: p.approvedAt ?? null,
    referenceId: p.referenceId ?? null,
    pautaId: p.pautaId ?? null,
  } as CarouselProject;
}

/** Aprovação humana explícita — a única forma de abrir o gate de agendamento. */
export function approveProject(project: CarouselProject, approvedBy: string): CarouselProject {
  if (!approvedBy.trim()) throw new Error('A aprovação precisa de quem aprovou (approvedBy).');
  return { ...project, approvedBy: approvedBy.trim(), approvedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
}
