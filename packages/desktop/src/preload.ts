/**
 * Preload — a ÚNICA ponte entre o renderer e o main.
 * Expõe APENAS: versão da app, caminho userData, diálogos guardar/abrir,
 * leitura/escrita de ficheiros de projecto/rascunho e a ligação de IA
 * (Fase 3). Nada de fs, process ou Node no renderer.
 *
 * Ligação de IA: o renderer NUNCA recebe a chave. O main cifra/guarda a
 * chave com safeStorage (secrets.ts) e faz as chamadas à OpenAI (aiApi.ts);
 * o renderer só vê o estado público (tem chave? qual o modo? quanto gastou?).
 */
import { contextBridge, ipcRenderer } from 'electron';

export interface DraftMeta {
  id: string;
  title: string;
  updatedAt: string;
}

export interface Draft extends DraftMeta {
  data: unknown;
}

export type AiConnectionMode = 'teste' | 'api' | 'desligada';
export type AiKeyStorageKind = 'safeStorage' | 'memory-only' | 'none';

export interface AiConnectionPublicState {
  settings: {
    mode: AiConnectionMode;
    apiEnabled: boolean;
    monthlyCapUsd: number;
    maxPerCallUsd: number;
    model: string;
  };
  hasKey: boolean;
  keyHint: string | null;
  storage: AiKeyStorageKind;
  lastTestedAt: string | null;
  lastTestOk: boolean | null;
  spend: { month: string; spentUsd: number; reservedUsd?: number };
}

export interface AiSaveKeyResult {
  stored: boolean;
  storage: AiKeyStorageKind;
  /** null quando guardou; senão a mensagem (ex.: fallback só-em-memória). */
  error: string | null;
}

export interface AiTestResult {
  ok: boolean;
  modelCount: number;
  models: string[];
  checkedAt: string;
  error: string | null;
}

export interface AiGenerateCopyInput {
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

export interface AiGenerateCopyResult {
  copy: { slides: { title: string; body: string }[]; caption: string; hashtags: string[] };
  source: 'api';
  demo: false;
  costUsd: number;
}

export interface ChatGPTConnectionStatus {
  connected: boolean; status: string; method: string; reason: string; imageGeneration: boolean;
  sessionOwnedBy: 'Pink Logic'; subscriptionAuthorized: boolean; textGenerationVerified: boolean;
  textRequestAvailable: boolean; lastTextAt: string | null;
}
export interface PinkLogicDesktopApi {
  saveDraftSync(draft: {id:string;title:string;data:unknown}): {ok:boolean;error?:string};
  listDraftVersions(id: string): Promise<{id: string; updatedAt: string}[]>;
  restoreDraftVersion(id: string,version: string): Promise<{id: string; title: string; updatedAt: string}>;

  beginChatGPTLogin(): Promise<ChatGPTConnectionStatus>;
  cancelChatGPTLogin(): Promise<ChatGPTConnectionStatus>;
  disconnectChatGPT(): Promise<ChatGPTConnectionStatus>;
  generateChatGPTText(input: string, consent: boolean): Promise<{text: string; source: 'chatgpt-plan'; verified: true}>;

  saveExport(name: string, bytes: Uint8Array): Promise<{saved: boolean; filePath?: string}>;
  getChatGPTStatus(): Promise<ChatGPTConnectionStatus>;
  openChatGPTManual(prompt: string): Promise<boolean>;
  requestChatGPTAccess(): Promise<void>;
  startLocalTransfer(bytes: Uint8Array): Promise<{url: string; qrDataUrl: string; expiresAt: string}>;
  stopLocalTransfer(): Promise<boolean>;

  getVersion(): Promise<string>;
  getUserDataPath(): Promise<string>;
  saveDraft(draft: Draft): Promise<DraftMeta>;
  loadDraft(id: string): Promise<Draft | null>;
  listDrafts(): Promise<DraftMeta[]>;
  deleteDraft(id: string): Promise<boolean>;
  showSaveDialog(defaultPath?: string): Promise<{ canceled: boolean; filePath?: string }>;
  showOpenDialog(): Promise<{ canceled: boolean; filePaths: string[] }>;
  readProjectFile(filePath: string): Promise<string>;
  writeProjectFile(filePath: string, contents: string): Promise<boolean>;
  /** Estado público da ligação de IA (nunca inclui a chave). */
  getAiConnection(): Promise<AiConnectionPublicState>;
  /** Guarda a chave cifrada com safeStorage (ou recusa, ver secrets.ts). */
  saveAiApiKey(key: string): Promise<AiSaveKeyResult>;
  clearAiApiKey(): Promise<boolean>;
  saveAiConnectionSettings(settings: AiConnectionPublicState['settings']): Promise<AiConnectionPublicState>;
  /** Teste de ligação de custo zero (GET /v1/models, feito no main). */
  testAiConnection(): Promise<AiTestResult>;
  /** Geração real de copy no main (atrás do gate; recusada sem chave/opt-in). */
  generateAiCopy(input: AiGenerateCopyInput): Promise<AiGenerateCopyResult>;
}

const api: PinkLogicDesktopApi = {
  saveDraftSync: draft => ipcRenderer.sendSync('pink-logic:save-draft-sync',draft),
  listDraftVersions: id => ipcRenderer.invoke('pink-logic:list-versions',id),
  restoreDraftVersion: (id,version) => ipcRenderer.invoke('pink-logic:restore-version',id,version),
  beginChatGPTLogin: () => ipcRenderer.invoke('pink-logic:chatgpt-begin'),
  cancelChatGPTLogin: () => ipcRenderer.invoke('pink-logic:chatgpt-cancel'),
  disconnectChatGPT: () => ipcRenderer.invoke('pink-logic:chatgpt-disconnect'),
  generateChatGPTText: (input,consent) => ipcRenderer.invoke('pink-logic:chatgpt-text',input,consent),

  saveExport: (name, bytes) => ipcRenderer.invoke('pink-logic:save-export',name,bytes),
  getChatGPTStatus: () => ipcRenderer.invoke('pink-logic:chatgpt-status'),
  openChatGPTManual: prompt => ipcRenderer.invoke('pink-logic:chatgpt-manual', prompt),
  requestChatGPTAccess: () => ipcRenderer.invoke('pink-logic:chatgpt-access'),
  startLocalTransfer: bytes => ipcRenderer.invoke('pink-logic:transfer-start', bytes),
  stopLocalTransfer: () => ipcRenderer.invoke('pink-logic:transfer-stop'),

  getVersion: () => ipcRenderer.invoke('pink-logic:get-version'),
  getUserDataPath: () => ipcRenderer.invoke('pink-logic:get-user-data-path'),
  saveDraft: (draft) => ipcRenderer.invoke('pink-logic:save-draft', draft),
  loadDraft: (id) => ipcRenderer.invoke('pink-logic:load-draft', id),
  listDrafts: () => ipcRenderer.invoke('pink-logic:list-drafts'),
  deleteDraft: (id) => ipcRenderer.invoke('pink-logic:delete-draft', id),
  showSaveDialog: (defaultPath) => ipcRenderer.invoke('pink-logic:show-save-dialog', { defaultPath }),
  showOpenDialog: () => ipcRenderer.invoke('pink-logic:show-open-dialog'),
  readProjectFile: (filePath) => ipcRenderer.invoke('pink-logic:read-project-file', filePath),
  writeProjectFile: (filePath, contents) =>
    ipcRenderer.invoke('pink-logic:write-project-file', filePath, contents),
  getAiConnection: () => ipcRenderer.invoke('pink-logic:ai-get'),
  saveAiApiKey: (key) => ipcRenderer.invoke('pink-logic:ai-save-key', key),
  clearAiApiKey: () => ipcRenderer.invoke('pink-logic:ai-clear-key'),
  saveAiConnectionSettings: (settings) => ipcRenderer.invoke('pink-logic:ai-save-settings', settings),
  testAiConnection: () => ipcRenderer.invoke('pink-logic:ai-test'),
  generateAiCopy: (input) => ipcRenderer.invoke('pink-logic:ai-generate-copy', input),
};

contextBridge.exposeInMainWorld('pinkLogicDesktop', api);
