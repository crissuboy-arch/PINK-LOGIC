// Declaração única da ponte do preload (window.pinkLogicDesktop) para o
// renderer web. NÃO duplicar este bloco noutro ficheiro: duas declarações
// globais da mesma propriedade têm de ter tipos idênticos e divergem.
// Os tipos completos da ponte vivem no package desktop (preload.ts); aqui
// fica a forma mínima que o renderer usa (rascunhos Fase 1/2 + IA Fase 3).
import type {
  AiConnectionState,
  AiConnectionTest,
  GeneratedCopyResult,
} from '../services/aiConnection';

export interface DesktopDraft {
  id: string;
  title: string;
  updatedAt: string;
  data: unknown;
}

export interface PinkLogicDesktopApi {
  getVersion(): Promise<string>;
  getUserDataPath(): Promise<string>;
  saveDraft(draft: { id: string; title: string; data: unknown }): Promise<{ id: string; title: string; updatedAt: string }>;
  loadDraft(id: string): Promise<DesktopDraft | null>;
  listDrafts(): Promise<{ id: string; title: string; updatedAt: string }[]>;
  deleteDraft(id: string): Promise<boolean>;
  showSaveDialog(defaultPath?: string): Promise<{ canceled: boolean; filePath?: string }>;
  showOpenDialog(): Promise<{ canceled: boolean; filePaths: string[] }>;
  readProjectFile(filePath: string): Promise<string>;
  writeProjectFile(filePath: string, contents: string): Promise<boolean>;
  getAiConnection(): Promise<AiConnectionState>;
  saveAiApiKey(key: string): Promise<{ stored: boolean; storage: string; error: string | null }>;
  clearAiApiKey(): Promise<boolean>;
  saveAiConnectionSettings(settings: AiConnectionState['settings']): Promise<AiConnectionState>;
  testAiConnection(): Promise<AiConnectionTest>;
  generateAiCopy(input: {
    topic: string;
    architectureId: string;
    brandName: string;
    tone: string;
    defaultCta: string;
    pains: string[];
    goals: string[];
    avoid: string[];
  }): Promise<{ copy: GeneratedCopyResult['copy']; source: 'api'; demo: false; costUsd: number }>;
}

declare global {
  interface Window {
    pinkLogicDesktop?: PinkLogicDesktopApi;
  }
}

export {};
