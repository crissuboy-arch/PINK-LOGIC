// ---------------------------------------------------------------------------
// Ligação de IA — Fase 3.
//
// Um só ponto de verdade para o estado da IA no Pink Logic Desktop:
//   - MODO DE TESTE (predefinido): o fluxo de carrosséis funciona com
//     templates locais + conteúdos de teste. NUNCA finge usar os modelos da
//     OpenAI — a origem 'teste' e o rótulo de demonstração acompanham o
//     conteúdo até à UI.
//   - ADAPTADOR OpenAI (BYOK, desactivado por predefinição): a geração real
//     só acontece atrás do gate (chave configurada + activação explícita +
//     limites de custo). Sem chave, o adaptador RECUSA-SE e o fluxo continua
//     em modo de teste.
//   - DESLIGADA: nenhuma geração (nem teste, nem API).
//
// Regras duras deste módulo (puro — sem DOM, sem localStorage, sem rede
// directa; a rede e a chave chegam por injecção, para os testes provarem o
// comportamento sem gastar nada):
//   - A chave NUNCA aparece em ficheiros de projecto, em logs nem em
//     objectos devolvidos à UI. Só `keyHint` (ex.: "sk-…abcd") circula.
//   - O teste de ligação é de custo zero: GET /v1/models. NUNCA gera
//     texto/imagem no teste.
//   - A geração real e a de teste devolvem a MESMA forma (GeneratedCopy /
//     GeneratedImage) para o fluxo não mudar quando a API for activada.
//   - Os limites (teto mensal em USD + máximo por chamada) são verificados
//     ANTES de qualquer chamada paga; o gasto é registado por mês.
// ---------------------------------------------------------------------------
import { generateCopy, getArchitecture, type CopyInput, type GeneratedCopy } from './carouselRadar';

export type { CopyInput, GeneratedCopy } from './carouselRadar';

export type AiMode = 'teste' | 'api' | 'desligada';

/** Onde a chave vive (nunca em texto simples num ficheiro de projecto). */
export type AiKeyStorage = 'safeStorage' | 'memory-only' | 'none';

export interface AiConnectionSettings {
  /** 'teste' é o predefinido ao abrir a app. */
  mode: AiMode;
  /** Opt-in explícito para a geração real via API (além do modo 'api'). */
  apiEnabled: boolean;
  /** Teto de gasto por mês, em USD. Predefinição conservadora: 5. */
  monthlyCapUsd: number;
  /** Gasto máximo estimado por chamada, em USD. Predefinição: 0.10. */
  maxPerCallUsd: number;
  /** Modelo de texto da OpenAI (só usado com a API ligada). */
  model: string;
}

export const DEFAULT_AI_SETTINGS: AiConnectionSettings = {
  mode: 'teste',
  apiEnabled: false,
  monthlyCapUsd: 5,
  maxPerCallUsd: 0.1,
  model: 'gpt-4o-mini',
};

export const OPENAI_MODELS_URL = 'https://api.openai.com/v1/models';
export const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';
export const OPENAI_IMAGES_URL = 'https://api.openai.com/v1/images/generations';

/** Preços aproximados por 1M tokens (USD) — só para estimar o teto. */
export const OPENAI_PRICING_PER_MILLION: Record<string, { input: number; output: number }> = {
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
  'gpt-4o': { input: 2.5, output: 10 },
  'gpt-4.1-mini': { input: 0.4, output: 1.6 },
};

export interface AiSpend {
  /** Mês a que o gasto pertence, 'AAAA-MM'. */
  month: string;
  spentUsd: number;
}

/** Estado completo da ligação. A chave NUNCA está aqui — só `keyHint`. */
export interface AiConnectionState {
  settings: AiConnectionSettings;
  /** true quando há uma chave guardada (o valor nunca sai do cofre). */
  hasKey: boolean;
  /** Ex.: 'sk-…abcd' — os últimos 4 caracteres, só para reconhecer a chave. */
  keyHint: string | null;
  storage: AiKeyStorage;
  lastTestedAt: string | null;
  lastTestOk: boolean | null;
  spend: AiSpend;
}

/** Estado efectivo que o indicador da app mostra (sempre coerente). */
export type AiEffectiveStatus = 'teste' | 'api' | 'desligada';

export const AI_STATUS_LABELS: Record<AiEffectiveStatus, string> = {
  teste: 'IA: Modo de teste',
  api: 'IA: API ligada',
  desligada: 'IA: Desligada',
};

export const AI_STATUS_DESCRIPTIONS: Record<AiEffectiveStatus, string> = {
  teste: 'Conteúdo de demonstração gerado por templates locais — não usa os modelos da OpenAI.',
  api: 'Geração real via API da OpenAI com a tua chave (BYOK) e limites de custo activos.',
  desligada: 'Geração de IA desligada — o fluxo de carrosséis não gera copy nem imagens.',
};

export function defaultAiState(now = new Date()): AiConnectionState {
  return {
    settings: { ...DEFAULT_AI_SETTINGS },
    hasKey: false,
    keyHint: null,
    storage: 'none',
    lastTestedAt: null,
    lastTestOk: null,
    spend: { month: monthKey(now), spentUsd: 0 },
  };
}

/** 'AAAA-MM' em UTC — a unidade do teto mensal. */
export function monthKey(date = new Date()): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

/** Estado efectivo: 'api' só com modo api + opt-in + chave; senão cai. */
export function effectiveStatus(state: AiConnectionState): AiEffectiveStatus {
  if (state.settings.mode === 'desligada') return 'desligada';
  if (state.settings.mode === 'api' && state.settings.apiEnabled && state.hasKey) return 'api';
  if (state.settings.mode === 'api') return 'desligada';
  return 'teste';
}

export function aiStatusLabel(state: AiConnectionState): string {
  return AI_STATUS_LABELS[effectiveStatus(state)];
}

/** Motivo legível quando o modo 'api' não chega a 'API ligada'. */
export function apiNotReadyReason(state: AiConnectionState): string | null {
  if (state.settings.mode !== 'api') return null;
  if (!state.hasKey) return 'Sem chave da API OpenAI configurada — o fluxo continua em modo de teste.';
  if (!state.settings.apiEnabled) return 'API configurada mas não activada — activa a geração real no ecrã de ligação.';
  return null;
}

// ---------------------------------------------------------------------------
// Validação
// ---------------------------------------------------------------------------

const API_KEY_RE = /^sk-[A-Za-z0-9_-]{20,}$/;

/** Formato de chave OpenAI (sk-… / sk-proj-…). Não valida se a chave funciona. */
export function validateApiKeyFormat(key: string): string | null {
  const k = key.trim();
  if (!k) return 'Indica a chave da API OpenAI.';
  if (!API_KEY_RE.test(k)) return 'A chave não tem o formato esperado (começa por «sk-» e tem pelo menos 20 caracteres depois).';
  return null;
}

export function validateSettings(patch: Partial<AiConnectionSettings>): string | null {
  if (patch.monthlyCapUsd !== undefined) {
    if (!Number.isFinite(patch.monthlyCapUsd) || patch.monthlyCapUsd <= 0) return 'O teto mensal tem de ser maior que 0 USD.';
    if (patch.monthlyCapUsd > 1000) return 'O teto mensal não pode passar de 1000 USD.';
  }
  if (patch.maxPerCallUsd !== undefined) {
    if (!Number.isFinite(patch.maxPerCallUsd) || patch.maxPerCallUsd <= 0) return 'O máximo por chamada tem de ser maior que 0 USD.';
    if (patch.maxPerCallUsd > 10) return 'O máximo por chamada não pode passar de 10 USD.';
  }
  const monthly = patch.monthlyCapUsd ?? DEFAULT_AI_SETTINGS.monthlyCapUsd;
  const perCall = patch.maxPerCallUsd ?? DEFAULT_AI_SETTINGS.maxPerCallUsd;
  if (perCall > monthly) return 'O máximo por chamada não pode ser maior que o teto mensal.';
  if (patch.model !== undefined && !OPENAI_PRICING_PER_MILLION[patch.model] && patch.model !== 'gpt-4o-mini') {
    return `Modelo desconhecido para estimar custo: ${patch.model}.`;
  }
  return null;
}

export function applySettings(
  state: AiConnectionState,
  patch: Partial<AiConnectionSettings>,
): AiConnectionState {
  const error = validateSettings(patch);
  if (error) throw new Error(error);
  return { ...state, settings: { ...state.settings, ...patch } };
}

/** Últimos 4 caracteres, para reconhecer a chave sem a expor. */
export function keyHint(key: string): string {
  const k = key.trim();
  return k.length <= 4 ? 'sk-…????' : `sk-…${k.slice(-4)}`;
}

/**
 * Remove qualquer chave (sk-…) de um texto — para mensagens de erro e logs
 * nunca vazarem a chave. A chave em si nunca é registada em lado nenhum.
 */
export function redactText(text: string): string {
  return text.replace(/sk-[A-Za-z0-9_-]{10,}/g, 'sk-…[redigido]');
}

/** Vista pública do estado: sem nada que identifique a chave. */
export function publicStatus(state: AiConnectionState): Omit<AiConnectionState, 'hasKey'> & { hasKey: boolean } {
  return {
    settings: { ...state.settings },
    hasKey: state.hasKey,
    keyHint: state.keyHint,
    storage: state.storage,
    lastTestedAt: state.lastTestedAt,
    lastTestOk: state.lastTestOk,
    spend: { ...state.spend },
  };
}

// ---------------------------------------------------------------------------
// Gate + limites de custo (verificados ANTES de qualquer chamada paga)
// ---------------------------------------------------------------------------

export interface AiGate {
  allowed: boolean;
  /** Motivo legível quando recusa (o fluxo mostra isto e continua em teste). */
  reason: string | null;
}

/**
 * Gate da geração real. `estimatedCostUsd` é a estimativa ANTES da chamada
 * (para o teste de ligação é 0 — custo zero). Recusa sem chamar a rede.
 */
export function checkApiGate(state: AiConnectionState, estimatedCostUsd: number, now = new Date()): AiGate {
  const status = effectiveStatus(state);
  if (status === 'desligada') {
    return {
      allowed: false,
      reason: state.settings.mode === 'api'
        ? (apiNotReadyReason(state) ?? 'A API não está pronta.')
        : 'A IA está desligada — activa o modo de teste ou a API no ecrã de ligação.',
    };
  }
  if (status === 'teste') {
    return { allowed: false, reason: 'Estás em modo de teste — a geração real está desactivada (usa os templates locais).' };
  }
  if (!Number.isFinite(estimatedCostUsd) || estimatedCostUsd < 0) {
    return { allowed: false, reason: 'Estimativa de custo inválida — chamada recusada por segurança.' };
  }
  if (estimatedCostUsd > state.settings.maxPerCallUsd) {
    return {
      allowed: false,
      reason: `Custo estimado $${estimatedCostUsd.toFixed(4)} acima do máximo por chamada ($${state.settings.maxPerCallUsd.toFixed(2)}).`,
    };
  }
  const spent = state.spend.month === monthKey(now) ? state.spend.spentUsd : 0;
  if (spent + estimatedCostUsd > state.settings.monthlyCapUsd) {
    return {
      allowed: false,
      reason: `Teto mensal de $${state.settings.monthlyCapUsd.toFixed(2)} atingido ($${spent.toFixed(2)} gastos este mês).`,
    };
  }
  return { allowed: true, reason: null };
}

export function recordSpend(state: AiConnectionState, costUsd: number, now = new Date()): AiConnectionState {
  const month = monthKey(now);
  const spent = state.spend.month === month ? state.spend.spentUsd : 0;
  return { ...state, spend: { month, spentUsd: Math.round((spent + costUsd) * 10000) / 10000 } };
}

export function estimateChatCost(model: string, promptTokens: number, completionTokens: number): number {
  const pricing = OPENAI_PRICING_PER_MILLION[model] ?? OPENAI_PRICING_PER_MILLION['gpt-4o-mini'];
  return (promptTokens / 1_000_000) * pricing.input + (completionTokens / 1_000_000) * pricing.output;
}

// ---------------------------------------------------------------------------
// Geração — MESMA forma de resposta no modo de teste e na API.
// ---------------------------------------------------------------------------

export interface GeneratedCopyResult {
  copy: GeneratedCopy;
  /** 'teste' = templates locais (demonstração); 'api' = modelo da OpenAI. */
  source: 'teste' | 'api';
  /** true no modo de teste — a UI mostra sempre o rótulo de demonstração. */
  demo: boolean;
  /** Custo real estimado da chamada (0 no modo de teste). */
  costUsd: number;
}

export interface AiImageInput {
  prompt: string;
  /** Proporção do slide (a API recebe-a como size). */
  aspectRatio?: '4:5' | '1:1' | '9:16';
}

export interface GeneratedImageResult {
  /** URL da imagem gerada (API) ou null no modo de teste (não se inventa URL). */
  url: string | null;
  /** No modo de teste: descrição do cartão de substituição (cores da marca). */
  placeholder: { title: string; description: string } | null;
  source: 'teste' | 'api';
  demo: boolean;
  costUsd: number;
}

export type FetchFn = (url: string, init?: { method?: string; headers?: Record<string, string>; body?: string; signal?: unknown }) => Promise<{
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
  text(): Promise<string>;
}>;

export type KeyProvider = () => Promise<string | null>;

/** Modo de teste: copy por templates locais — sem rede, sem custo. */
export function generateTestCopy(input: CopyInput): GeneratedCopyResult {
  const copy = generateCopy(input);
  return { copy, source: 'teste', demo: true, costUsd: 0 };
}

/**
 * Geração de copy pelo adaptador. Em modo de teste delega nos templates
 * (fetch NUNCA é chamado — os testes provam-no). Em modo API, o gate
 * (chave + opt-in + limites) é verificado ANTES de qualquer chamada; sem
 * chave ou sem opt-in, RECUSA com mensagem clara e NÃO chama a rede — o
 * chamador (o fluxo) é que decide voltar ao modo de teste, a dizer.
 * Com a IA desligada, recusa sempre.
 */
export async function generateCarouselCopy(opts: {
  input: CopyInput;
  state: AiConnectionState;
  keyProvider: KeyProvider;
  fetchFn: FetchFn;
}): Promise<GeneratedCopyResult> {
  const { input, state } = opts;
  if (state.settings.mode === 'teste') {
    return generateTestCopy(input);
  }
  if (state.settings.mode === 'desligada') {
    throw new Error('A IA está desligada — activa o modo de teste ou a API no ecrã «Ligação de IA».');
  }
  // Modo 'api': sem chave ou sem opt-in, recusa-se (não cai em silêncio
  // para o modo de teste — o fluxo é que volta aos templates, a dizer).
  if (!state.hasKey) {
    throw new Error('Sem chave da API OpenAI configurada — o fluxo continua em modo de teste. Configura a chave no ecrã «Ligação de IA».');
  }
  if (!state.settings.apiEnabled) {
    throw new Error('API configurada mas não activada — activa a geração real no ecrã «Ligação de IA» (o fluxo continua em modo de teste).');
  }
  const key = await opts.keyProvider();
  if (!key) {
    throw new Error('Sem chave da API OpenAI configurada — o fluxo continua em modo de teste. Configura a chave no ecrã «Ligação de IA».');
  }
  // Estimativa conservadora ANTES da chamada (teto por chamada).
  const preEstimate = 0.05;
  const gate = checkApiGate(state, preEstimate);
  if (!gate.allowed) throw new Error(gate.reason ?? 'Chamada à API recusada pelo gate de custo.');
  const arch = getArchitecture(input.architectureId);
  const res = await opts.fetchFn(OPENAI_CHAT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: state.settings.model,
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'Escreves copy para carrosséis de Instagram em português. Devolve SÓ JSON: {"slides":[{"title":"...","body":"..."}], "caption":"...", "hashtags":["#..."]}.',
        },
        {
          role: 'user',
          content: `Marca: ${input.brandName}. Tom: ${input.tone}. Tema: ${input.topic}. Arquitetura: ${arch.label} com exactamente ${arch.slideCount} slides (primeiro = capa com o tema, último = fecho com a CTA «${input.context.defaultCta || 'Guarda este post'}»). Dores: ${input.context.pains.join('; ') || 'nenhuma'}. Objectivos: ${input.context.goals.join('; ') || 'nenhum'}. Evitar: ${input.context.avoid.join('; ') || 'nada'}.`,
        },
      ],
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`A OpenAI respondeu ${res.status} — ${redactText(body).slice(0, 200) || 'sem detalhe'}. Nada foi gerado; o modo de teste continua disponível.`);
  }
  const parsed = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };
  const content = parsed.choices?.[0]?.message?.content ?? '';
  let data: unknown;
  try {
    data = JSON.parse(content);
  } catch {
    throw new Error('A API devolveu copy num formato inválido — nada foi aplicado. Tenta de novo ou usa o modo de teste.');
  }
  const d = data as Partial<GeneratedCopy>;
  if (!Array.isArray(d.slides) || d.slides.length !== arch.slideCount || typeof d.caption !== 'string' || !Array.isArray(d.hashtags)) {
    throw new Error(`A API devolveu ${Array.isArray(d.slides) ? d.slides.length : 0} slides (esperados ${arch.slideCount}) — nada foi aplicado.`);
  }
  for (const s of d.slides) {
    if (!s || typeof s.title !== 'string' || typeof s.body !== 'string' || !s.title.trim() || !s.body.trim()) {
      throw new Error('A API devolveu slides incompletos — nada foi aplicado.');
    }
  }
  const costUsd = estimateChatCost(
    state.settings.model,
    parsed.usage?.prompt_tokens ?? 0,
    parsed.usage?.completion_tokens ?? 0,
  );
  return {
    copy: {
      slides: d.slides.map((s) => ({ title: s.title.trim(), body: s.body.trim() })),
      caption: d.caption.trim(),
      hashtags: d.hashtags.map((h) => String(h)),
    },
    source: 'api',
    demo: false,
    costUsd: Math.round(costUsd * 10000) / 10000,
  };
}

/**
 * Geração de imagem. Modo de teste: NÃO inventa URL de imagem — devolve um
 * cartão de substituição descrito (a UI desenha-o com as cores da marca).
 * API: DALL-E atrás do mesmo gate (nunca chamada nos testes).
 */
export async function generateCarouselImage(opts: {
  input: AiImageInput;
  state: AiConnectionState;
  keyProvider: KeyProvider;
  fetchFn: FetchFn;
}): Promise<GeneratedImageResult> {
  const { input, state } = opts;
  if (state.settings.mode === 'teste') {
    return {
      url: null,
      placeholder: {
        title: input.prompt.slice(0, 80) || 'Imagem de demonstração',
        description: 'Modo de teste: imagem de demonstração desenhada com as cores da marca — não é uma imagem gerada por IA.',
      },
      source: 'teste',
      demo: true,
      costUsd: 0,
    };
  }
  if (state.settings.mode === 'desligada') {
    throw new Error('A IA está desligada — activa o modo de teste ou a API no ecrã «Ligação de IA».');
  }
  if (!state.hasKey) {
    throw new Error('Sem chave da API OpenAI configurada — o fluxo continua em modo de teste. Configura a chave no ecrã «Ligação de IA».');
  }
  if (!state.settings.apiEnabled) {
    throw new Error('API configurada mas não activada — activa a geração real no ecrã «Ligação de IA» (o fluxo continua em modo de teste).');
  }
  const key = await opts.keyProvider();
  if (!key) {
    throw new Error('Sem chave da API OpenAI configurada — o fluxo continua em modo de teste. Configura a chave no ecrã «Ligação de IA».');
  }
  const imageCostUsd = 0.04; // estimativa por imagem 1024×1024 (dall-e-3 standard)
  const gate = checkApiGate(state, imageCostUsd);
  if (!gate.allowed) throw new Error(gate.reason ?? 'Chamada à API recusada pelo gate de custo.');
  const size = input.aspectRatio === '9:16' ? '1024x1792' : input.aspectRatio === '1:1' ? '1024x1024' : '1024x1280';
  const res = await opts.fetchFn(OPENAI_IMAGES_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: 'dall-e-3', prompt: input.prompt, size, n: 1 }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`A OpenAI respondeu ${res.status} — ${redactText(body).slice(0, 200) || 'sem detalhe'}.`);
  }
  const parsed = (await res.json()) as { data?: { url?: string }[] };
  const url = parsed.data?.[0]?.url;
  if (!url || typeof url !== 'string') throw new Error('A API não devolveu URL de imagem — nada foi aplicado.');
  return { url, placeholder: null, source: 'api', demo: false, costUsd: imageCostUsd };
}

// ---------------------------------------------------------------------------
// Teste de ligação — custo zero: GET /v1/models. NUNCA gera texto/imagem.
// ---------------------------------------------------------------------------

export interface AiConnectionTest {
  ok: boolean;
  /** Nº de modelos listados (0 quando falha). */
  modelCount: number;
  /** Amostra de ids de modelos (máx. 5) — prova que a chave funciona. */
  models: string[];
  checkedAt: string;
  error: string | null;
}

/**
 * Valida a chave sem gastar: lista os modelos. Sem chave, recusa ANTES de
 * chamar a rede. A chave só viaja no cabeçalho Authorization desta chamada
 * e nunca aparece no resultado nem em mensagens de erro.
 */
export async function testConnection(opts: {
  keyProvider: KeyProvider;
  fetchFn: FetchFn;
}): Promise<AiConnectionTest> {
  const checkedAt = new Date().toISOString();
  const key = await opts.keyProvider();
  if (!key) {
    return { ok: false, modelCount: 0, models: [], checkedAt, error: 'Sem chave configurada — guarda primeiro a chave da API OpenAI.' };
  }
  try {
    const res = await opts.fetchFn(OPENAI_MODELS_URL, {
      method: 'GET',
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      const detail = redactText(body).slice(0, 200);
      return {
        ok: false, modelCount: 0, models: [], checkedAt,
        error: res.status === 401
          ? 'Chave rejeitada pela OpenAI (401) — verifica a chave em platform.openai.com/api-keys.'
          : `A OpenAI respondeu ${res.status}${detail ? ` — ${detail}` : ''}.`,
      };
    }
    const parsed = (await res.json()) as { data?: { id?: string }[] };
    const models = Array.isArray(parsed.data)
      ? parsed.data.map((m) => String(m.id ?? '')).filter(Boolean).slice(0, 5)
      : [];
    return { ok: true, modelCount: Array.isArray(parsed.data) ? parsed.data.length : 0, models, checkedAt, error: null };
  } catch (e) {
    return {
      ok: false, modelCount: 0, models: [], checkedAt,
      error: `Não foi possível contactar a OpenAI (${redactText(e instanceof Error ? e.message : String(e))}). Verifica a ligação à internet.`,
    };
  }
}
