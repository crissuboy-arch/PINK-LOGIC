/**
 * Cofre da chave da API OpenAI (processo main, Electron).
 *
 * A chave NUNCA vive em texto simples: é cifrada com `safeStorage` do
 * Electron (Keychain no macOS, Credential Vault no Windows, Secret Service
 * no Linux) e só o texto cifrado (base64) é que vai para disco, no ficheiro
 * <userData>/ai-connection.json — fora do repo, fora de qualquer ficheiro
 * de projecto. A chave NUNCA é registada em logs nem devolvida ao renderer.
 *
 * Fallback documentado: se `safeStorage.isEncryptionAvailable()` for false
 * (ex.: Linux sem Secret Service / libsecret), a chave NÃO é guardada em
 * disco — o renderer só a pode usar em memória durante a sessão (ver
 * useAiConnection: storage 'memory-only'). Guardar em texto simples nunca
 * é uma opção.
 *
 * O ficheiro guarda ainda as definições não-secretas (modo, limites, gasto
 * mensal, último teste) — nada disto identifica a chave.
 */
import * as fs from 'fs';
import * as path from 'path';
import { safeStorage } from 'electron';

// Tipos espelhados de packages/web/src/services/aiConnection.ts (o package
// desktop não pode importar o .ts do web: o tsconfig tem rootDir=src).
// Manter sincronizado: mode/limites/modelo têm de ser os mesmos.
export type AiMode = 'teste' | 'api' | 'desligada';
export type AiKeyStorage = 'safeStorage' | 'memory-only' | 'none';

export interface AiConnectionSettings {
  mode: AiMode;
  apiEnabled: boolean;
  monthlyCapUsd: number;
  maxPerCallUsd: number;
  model: string;
}

export interface AiSpend {
  month: string;
  spentUsd: number;
  reservedUsd?: number;
}

export interface AiConnectionDiskConfig {
  version: 1;
  /** Texto cifrado com safeStorage, em base64. null = sem chave guardada. */
  encryptedKey: string | null;
  storage: AiKeyStorage;
  settings: AiConnectionSettings;
  spend: AiSpend;
  lastTestedAt: string | null;
  lastTestOk: boolean | null;
}

export const AI_CONNECTION_FILE = 'ai-connection.json';

export function aiConnectionPath(userDataPath: string): string {
  return path.join(userDataPath, AI_CONNECTION_FILE);
}

export function defaultDiskConfig(now = new Date()): AiConnectionDiskConfig {
  const month = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  return {
    version: 1,
    encryptedKey: null,
    storage: 'none',
    settings: { mode: 'teste', apiEnabled: false, monthlyCapUsd: 5, maxPerCallUsd: 0.1, model: 'gpt-4o-mini' },
    spend: { month, spentUsd: 0 },
    lastTestedAt: null,
    lastTestOk: null,
  };
}

export function loadDiskConfig(userDataPath: string): AiConnectionDiskConfig {
  const file = aiConnectionPath(userDataPath);
  if (!fs.existsSync(file)) return defaultDiskConfig();
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8')) as Partial<AiConnectionDiskConfig>;
    if (parsed.version !== 1 || !parsed.settings || !parsed.spend) return defaultDiskConfig();
    const base = defaultDiskConfig();
    return {
      ...base,
      ...parsed,
      settings: { ...base.settings, ...parsed.settings },
      spend: { ...base.spend, ...parsed.spend },
      // A chave cifrada só é aceite se for string; qualquer outro valor é descartado.
      encryptedKey: typeof parsed.encryptedKey === 'string' ? parsed.encryptedKey : null,
    };
  } catch {
    return defaultDiskConfig();
  }
}

/** Escrita atómica (ficheiro temporário + rename), como em drafts.ts. */
export function saveDiskConfig(userDataPath: string, config: AiConnectionDiskConfig): void {
  const file = aiConnectionPath(userDataPath);
  const tmp = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, JSON.stringify(config, null, 2), 'utf8');
  fs.renameSync(tmp, file);
}

export function encryptionAvailable(): boolean {
  try {
    return safeStorage.isEncryptionAvailable();
  } catch {
    return false;
  }
}

/**
 * Guarda a chave cifrada. Recusa-se se a encriptação não estiver disponível
 * — nesse caso o chamador usa só memória (nunca texto simples em disco).
 */
export function storeApiKey(userDataPath: string, key: string): { stored: boolean; storage: AiKeyStorage; error?: string } {
  if (!encryptionAvailable()) {
    return {
      stored: false,
      storage: 'memory-only',
      error: 'Encriptação do sistema indisponível (safeStorage) — a chave não foi guardada em disco. Fica só em memória nesta sessão.',
    };
  }
  const encrypted = safeStorage.encryptString(key).toString('base64');
  const config = loadDiskConfig(userDataPath);
  config.encryptedKey = encrypted;
  config.storage = 'safeStorage';
  saveDiskConfig(userDataPath, config);
  return { stored: true, storage: 'safeStorage' };
}

/** Decifra a chave para uso imediato no main. NUNCA a devolve ao renderer. */
export function loadApiKey(userDataPath: string): string | null {
  const config = loadDiskConfig(userDataPath);
  if (!config.encryptedKey) return null;
  try {
    return safeStorage.decryptString(Buffer.from(config.encryptedKey, 'base64'));
  } catch {
    return null;
  }
}

export function clearApiKey(userDataPath: string): void {
  const config = loadDiskConfig(userDataPath);
  config.encryptedKey = null;
  config.storage = 'none';
  saveDiskConfig(userDataPath, config);
}

export function keyHintFromStored(userDataPath: string): string | null {
  const key = loadApiKey(userDataPath);
  if (!key) return null;
  return key.length <= 4 ? 'sk-…????' : `sk-…${key.slice(-4)}`;
}
