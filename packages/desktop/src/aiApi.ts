import { createPaidCopyAdapter } from './paidCopy';
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

function monthKey(date = new Date()): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function redact(text: string): string {
  return text.replace(/sk-[A-Za-z0-9_-]{10,}/g, 'sk-…[redigido]');
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
  slideCount?: number | 'auto';
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
const adapters = new Map<string,ReturnType<typeof createPaidCopyAdapter>>();
export async function generateCopyMain(userDataPath: string, input: MainCopyInput): Promise<MainCopyResult> {
  let adapter=adapters.get(userDataPath);
  if(!adapter) {
    const ledger=(reserve: number, actual?: number) => {
      const config=loadDiskConfig(userDataPath); const month=monthKey();
      if(config.spend.month!==month) config.spend={month,spentUsd:0,reservedUsd:0};
      if(actual===undefined) config.spend.reservedUsd=(config.spend.reservedUsd||0)+reserve;
      else {config.spend.reservedUsd=Math.max(0,(config.spend.reservedUsd||0)-reserve); config.spend.spentUsd+=actual;}
      saveDiskConfig(userDataPath,config);
    };
    adapter=createPaidCopyAdapter({read:()=>loadDiskConfig(userDataPath),key:()=>loadApiKey(userDataPath),reserve:n=>ledger(n),settle:(reserve,actual)=>ledger(reserve,actual),fetch:(url,init)=>fetchWithTimeout(url,init,60000)});
    adapters.set(userDataPath,adapter);
  }
  return adapter(input);
}
