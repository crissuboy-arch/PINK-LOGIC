/**
 * Chamadas à API OpenAI a partir do processo main (Electron).
 *
 * A chave é decifrada aqui (secrets.ts) e NUNCA sai do main: o renderer
 * recebe apenas o resultado (modelos listados / copy gerada / erro legível).
 * Isto espelha o contrato de packages/web/src/services/aiConnection.ts —
 * mesmo gate (chave + opt-in + limites), mesmo teste de custo zero
 * (GET /v1/models), mesma forma de resposta (GeneratedCopy). Manter os dois
 * sincronizados quando os limites ou os preços mudarem.
 *
 * Nenhuma chamada aqui corre nos testes unitários (node:test): o gate e o
 * parsing são testados no módulo web com fetch injectado. O código abaixo
 * só corre dentro do Electron, atrás do IPC registado em main.ts.
 */
import { loadApiKey, loadDiskConfig, saveDiskConfig, type AiConnectionDiskConfig } from './secrets';

const MODELS_URL = 'https://api.openai.com/v1/models';
const CHAT_URL = 'https://api.openai.com/v1/chat/completions';

const PRICING_PER_MILLION: Record<string, { input: number; output: number }> = {
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
  'gpt-4o': { input: 2.5, output: 10 },
  'gpt-4.1-mini': { input: 0.4, output: 1.6 },
};

const ARCH_SLIDE_COUNT: Record<string, number> = {
  lista: 5,
  'antes-depois': 5,
  'passo-a-passo': 6,
  historia: 5,
  'mito-verdade': 5,
};

function monthKey(date = new Date()): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function redact(text: string): string {
  return text.replace(/sk-[A-Za-z0-9_-]{10,}/g, 'sk-…[redigido]');
}

function spentThisMonth(config: AiConnectionDiskConfig, now = new Date()): number {
  return config.spend.month === monthKey(now) ? config.spend.spentUsd : 0;
}

function addSpend(userDataPath: string, costUsd: number): void {
  const config = loadDiskConfig(userDataPath);
  const now = new Date();
  const month = monthKey(now);
  const spent = config.spend.month === month ? config.spend.spentUsd : 0;
  config.spend = { month, spentUsd: Math.round((spent + costUsd) * 10000) / 10000 };
  saveDiskConfig(userDataPath, config);
}

export interface MainTestResult {
  ok: boolean;
  modelCount: number;
  models: string[];
  checkedAt: string;
  error: string | null;
}

async function fetchWithTimeout(url: string, init: RequestInit, ms = 15000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** Teste de ligação (custo zero): GET /v1/models com a chave do cofre. */
export async function testAiConnectionMain(userDataPath: string): Promise<MainTestResult> {
  const checkedAt = new Date().toISOString();
  const key = loadApiKey(userDataPath);
  if (!key) {
    return { ok: false, modelCount: 0, models: [], checkedAt, error: 'Sem chave configurada — guarda primeiro a chave da API OpenAI.' };
  }
  try {
    const res = await fetchWithTimeout(MODELS_URL, {
      method: 'GET',
      headers: { Authorization: `Bearer ${key}` },
    });
    const config = loadDiskConfig(userDataPath);
    config.lastTestedAt = checkedAt;
    config.lastTestOk = res.ok;
    saveDiskConfig(userDataPath, config);
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return {
        ok: false, modelCount: 0, models: [], checkedAt,
        error: res.status === 401
          ? 'Chave rejeitada pela OpenAI (401) — verifica a chave em platform.openai.com/api-keys.'
          : `A OpenAI respondeu ${res.status}${redact(body).slice(0, 200) ? ` — ${redact(body).slice(0, 200)}` : ''}.`,
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
      error: `Não foi possível contactar a OpenAI (${redact(e instanceof Error ? e.message : String(e))}). Verifica a ligação à internet.`,
    };
  }
}

export interface MainCopyInput {
  topic: string;
  architectureId: string;
  brandName: string;
  tone: string;
  defaultCta: string;
  pains: string[];
  goals: string[];
  avoid: string[];
}

export interface MainCopyResult {
  copy: { slides: { title: string; body: string }[]; caption: string; hashtags: string[] };
  source: 'api';
  demo: false;
  costUsd: number;
}

/**
 * Geração real de copy no main. Gate: modo 'api' + opt-in + chave + limites
 * (estimativa 0.05 USD antes da chamada; custo real registado depois).
 * Sem chave ou fora dos limites, recusa SEM chamar a rede.
 */
export async function generateCopyMain(userDataPath: string, input: MainCopyInput): Promise<MainCopyResult> {
  const config = loadDiskConfig(userDataPath);
  const { settings } = config;
  if (settings.mode !== 'api' || !settings.apiEnabled) {
    throw new Error('A geração real está desactivada — activa a API no ecrã «Ligação de IA» (modo de teste continua disponível).');
  }
  const key = loadApiKey(userDataPath);
  if (!key) {
    throw new Error('Sem chave da API OpenAI configurada — o fluxo continua em modo de teste.');
  }
  const preEstimate = 0.05;
  if (preEstimate > settings.maxPerCallUsd) {
    throw new Error(`Custo estimado $${preEstimate.toFixed(2)} acima do máximo por chamada ($${settings.maxPerCallUsd.toFixed(2)}).`);
  }
  if (spentThisMonth(config) + preEstimate > settings.monthlyCapUsd) {
    throw new Error(`Teto mensal de $${settings.monthlyCapUsd.toFixed(2)} atingido ($${spentThisMonth(config).toFixed(2)} gastos este mês).`);
  }
  const slideCount = ARCH_SLIDE_COUNT[input.architectureId];
  if (!slideCount) throw new Error(`Arquitetura desconhecida: ${input.architectureId}.`);
  const res = await fetchWithTimeout(CHAT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: settings.model,
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
          content: `Marca: ${input.brandName}. Tom: ${input.tone}. Tema: ${input.topic}. Arquitetura com exactamente ${slideCount} slides (primeiro = capa com o tema, último = fecho com a CTA «${input.defaultCta || 'Guarda este post'}»). Dores: ${input.pains.join('; ') || 'nenhuma'}. Objectivos: ${input.goals.join('; ') || 'nenhum'}. Evitar: ${input.avoid.join('; ') || 'nada'}.`,
        },
      ],
    }),
  }, 30000);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`A OpenAI respondeu ${res.status} — ${redact(body).slice(0, 200) || 'sem detalhe'}. Nada foi gerado; o modo de teste continua disponível.`);
  }
  const parsed = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };
  let data: unknown;
  try {
    data = JSON.parse(parsed.choices?.[0]?.message?.content ?? '');
  } catch {
    throw new Error('A API devolveu copy num formato inválido — nada foi aplicado.');
  }
  const d = data as Partial<MainCopyResult['copy']>;
  if (!Array.isArray(d.slides) || d.slides.length !== slideCount || typeof d.caption !== 'string' || !Array.isArray(d.hashtags)) {
    throw new Error(`A API devolveu ${Array.isArray(d.slides) ? d.slides.length : 0} slides (esperados ${slideCount}) — nada foi aplicado.`);
  }
  for (const s of d.slides) {
    if (!s || typeof s.title !== 'string' || typeof s.body !== 'string' || !s.title.trim() || !s.body.trim()) {
      throw new Error('A API devolveu slides incompletos — nada foi aplicado.');
    }
  }
  const pricing = PRICING_PER_MILLION[settings.model] ?? PRICING_PER_MILLION['gpt-4o-mini'];
  const costUsd = Math.round(
    (((parsed.usage?.prompt_tokens ?? 0) / 1_000_000) * pricing.input +
      ((parsed.usage?.completion_tokens ?? 0) / 1_000_000) * pricing.output) * 10000,
  ) / 10000;
  addSpend(userDataPath, costUsd);
  return {
    copy: {
      slides: d.slides.map((s) => ({ title: s.title.trim(), body: s.body.trim() })),
      caption: d.caption.trim(),
      hashtags: d.hashtags.map((h) => String(h)),
    },
    source: 'api',
    demo: false,
    costUsd,
  };
}
