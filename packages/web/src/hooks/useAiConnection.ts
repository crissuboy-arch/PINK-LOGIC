// ---------------------------------------------------------------------------
// Hook da ligação de IA — Fase 3.
//
// Uma só fonte de estado para o indicador do cabeçalho, o ecrã de ligação
// e o fluxo de carrosséis (todos lêem o mesmo estado e reagem ao evento
// 'pinklogic:ai-connection-changed').
//
// Desktop (Electron): o estado vive no main (ai-connection.json em
// userData); a chave fica cifrada com safeStorage e NUNCA chega ao
// renderer — o teste e a geração real correm no main via IPC.
// Browser (sem desktop): FALLBACK DOCUMENTADO — as definições (modo,
// limites, gasto) guardam-se em localStorage, mas a chave vive SÓ em
// memória durante a sessão (nunca em localStorage, nunca em ficheiro de
// projecto) e perde-se ao recarregar a página.
// ---------------------------------------------------------------------------
import { useCallback, useEffect, useState } from 'react';
import {
  aiStatusLabel, applySettings, defaultAiState, effectiveStatus,
  generateCarouselCopy, generateTestCopy, redactText, testConnection,
  validateApiKeyFormat, keyHint, type AiConnectionState,
  type AiConnectionTest, type CopyInput, type FetchFn, type GeneratedCopyResult,
} from '../services/aiConnection';

// A ponte window.pinkLogicDesktop é declarada uma só vez, em
// src/types/desktopApi.d.ts (não duplicar aqui).
export const AI_CONNECTION_CHANGED_EVENT = 'pinklogic:ai-connection-changed';
const BROWSER_SETTINGS_KEY = 'pink-logic:ai-connection:settings';

/** Chave só-em-memória (fallback browser / safeStorage indisponível). Nunca persistida. */
let memoryKey: string | null = null;

function hasDesktopApi(): boolean {
  return typeof window !== 'undefined' && typeof window.pinkLogicDesktop?.getAiConnection === 'function';
}

function notifyChanged(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AI_CONNECTION_CHANGED_EVENT));
  }
}

/** fetch do browser, adaptado ao tipo FetchFn do serviço (nunca regista a chave). */
const browserFetch: FetchFn = (url, init) =>
  fetch(url, { method: init?.method, headers: init?.headers, body: init?.body });

function loadBrowserSettings(): AiConnectionState {
  const state = defaultAiState();
  try {
    const raw = window.localStorage.getItem(BROWSER_SETTINGS_KEY);
    if (!raw) return state;
    const parsed = JSON.parse(raw) as Partial<AiConnectionState>;
    if (!parsed.settings) return state;
    // Só definições: se por algum motivo viesse uma chave aqui, é descartada.
    return applySettings({ ...state, spend: parsed.spend ?? state.spend }, parsed.settings);
  } catch {
    return state;
  }
}

function saveBrowserSettings(state: AiConnectionState): void {
  // Guarda-se SÓ settings + spend. A chave nunca entra aqui.
  window.localStorage.setItem(
    BROWSER_SETTINGS_KEY,
    JSON.stringify({ settings: state.settings, spend: state.spend }),
  );
}

async function loadState(): Promise<AiConnectionState> {
  if (hasDesktopApi()) {
    const pub = await window.pinkLogicDesktop!.getAiConnection();
    return {
      settings: pub.settings,
      hasKey: pub.hasKey,
      keyHint: pub.keyHint,
      storage: pub.storage,
      lastTestedAt: pub.lastTestedAt,
      lastTestOk: pub.lastTestOk,
      spend: pub.spend,
    };
  }
  const state = loadBrowserSettings();
  // Fallback browser: a chave em memória conta como guardada nesta sessão.
  return { ...state, hasKey: memoryKey !== null, keyHint: memoryKey ? keyHint(memoryKey) : null, storage: memoryKey ? 'memory-only' : 'none' };
}

export interface AiConnectionHook {
  state: AiConnectionState;
  status: ReturnType<typeof effectiveStatus>;
  label: string;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  setMode: (mode: AiConnectionState['settings']['mode']) => Promise<void>;
  saveSettings: (patch: Partial<AiConnectionState['settings']>) => Promise<void>;
  /** Guarda a chave (desktop: safeStorage; browser: só memória nesta sessão). */
  saveKey: (key: string) => Promise<{ stored: boolean; message: string }>;
  clearKey: () => Promise<void>;
  testConnection: () => Promise<AiConnectionTest>;
  generateCopy: (input: CopyInput) => Promise<GeneratedCopyResult>;
}

export function useAiConnection(): AiConnectionHook {
  const [state, setState] = useState<AiConnectionState>(() => defaultAiState());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setState(await loadState());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? redactText(e.message) : 'Falha ao ler o estado da ligação de IA.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    window.addEventListener(AI_CONNECTION_CHANGED_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(AI_CONNECTION_CHANGED_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [refresh]);

  const saveSettings = useCallback(async (patch: Partial<AiConnectionState['settings']>) => {
    const next = applySettings(state, patch);
    if (hasDesktopApi()) {
      const pub = await window.pinkLogicDesktop!.saveAiConnectionSettings(next.settings);
      setState({
        settings: pub.settings, hasKey: pub.hasKey, keyHint: pub.keyHint, storage: pub.storage,
        lastTestedAt: pub.lastTestedAt, lastTestOk: pub.lastTestOk, spend: pub.spend,
      });
    } else {
      saveBrowserSettings(next);
      setState({ ...next, hasKey: memoryKey !== null, keyHint: memoryKey ? keyHint(memoryKey) : null, storage: memoryKey ? 'memory-only' : 'none' });
    }
    notifyChanged();
  }, [state]);

  const setMode = useCallback(
    (mode: AiConnectionState['settings']['mode']) => saveSettings({ mode }),
    [saveSettings],
  );

  const saveKey = useCallback(async (key: string): Promise<{ stored: boolean; message: string }> => {
    const formatError = validateApiKeyFormat(key);
    if (formatError) throw new Error(formatError);
    if (hasDesktopApi()) {
      const result = await window.pinkLogicDesktop!.saveAiApiKey(key.trim());
      if (result.stored) {
        await refresh();
        notifyChanged();
        return { stored: true, message: 'Chave guardada com encriptação do sistema (safeStorage).' };
      }
      // Fallback documentado: safeStorage indisponível — só memória.
      memoryKey = key.trim();
      await refresh();
      notifyChanged();
      return {
        stored: false,
        message: result.error ?? 'Encriptação do sistema indisponível — a chave fica só em memória nesta sessão (não foi guardada em disco).',
      };
    }
    memoryKey = key.trim();
    setState((s) => ({ ...s, hasKey: true, keyHint: keyHint(memoryKey!), storage: 'memory-only' }));
    notifyChanged();
    return { stored: false, message: 'Browser sem desktop: a chave fica só em memória nesta sessão — recarregar a página apaga-a. No Desktop fica guardada com safeStorage.' };
  }, [refresh]);

  const clearKey = useCallback(async () => {
    memoryKey = null;
    if (hasDesktopApi()) await window.pinkLogicDesktop!.clearAiApiKey();
    await refresh();
    notifyChanged();
  }, [refresh]);

  const runTestConnection = useCallback(async (): Promise<AiConnectionTest> => {
    if (hasDesktopApi()) {
      const result = await window.pinkLogicDesktop!.testAiConnection();
      await refresh();
      notifyChanged();
      return result;
    }
    const result = await testConnection({
      keyProvider: async () => memoryKey,
      fetchFn: browserFetch,
    });
    setState((s) => ({ ...s, lastTestedAt: result.checkedAt, lastTestOk: result.ok }));
    return result;
  }, [refresh]);

  const generateCopy = useCallback(async (input: CopyInput): Promise<GeneratedCopyResult> => {
    // Modo de teste: templates locais, sem rede, sem custo.
    if (state.settings.mode === 'teste') return generateTestCopy(input);
    // Modo 'api' ou 'desligada': o gate vive no serviço (web) ou no main
    // (desktop) e recusa com mensagem clara quando não está pronto.
    if (hasDesktopApi()) {
      const result = await window.pinkLogicDesktop!.generateAiCopy({
        topic: input.topic,
        architectureId: input.architectureId,
        slideCount: input.slideCount,
        brandName: input.brandName,
        tone: input.tone,
        defaultCta: input.context.defaultCta,
        pains: input.context.pains,
        goals: input.context.goals,
        avoid: input.context.avoid,
      });
      await refresh();
      notifyChanged();
      return { copy: result.copy, source: 'api', demo: false, costUsd: result.costUsd };
    }
    const result = await generateCarouselCopy({
      input,
      state,
      keyProvider: async () => memoryKey,
      fetchFn: browserFetch,
    });
    await refresh();
    notifyChanged();
    return result;
  }, [state, refresh]);

  return {
    state,
    status: effectiveStatus(state),
    label: aiStatusLabel(state),
    loading,
    error,
    refresh,
    setMode,
    saveSettings,
    saveKey,
    clearKey,
    testConnection: runTestConnection,
    generateCopy,
  };
}
