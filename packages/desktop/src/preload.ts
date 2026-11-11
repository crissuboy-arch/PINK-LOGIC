/**
 * Preload — a ÚNICA ponte entre o renderer e o main.
 * Expõe APENAS: versão da app, caminho userData, diálogos guardar/abrir e
 * leitura/escrita de ficheiros de projecto/rascunho. Nada de fs, process ou
 * Node no renderer.
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

export interface PinkLogicDesktopApi {
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
}

const api: PinkLogicDesktopApi = {
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
};

contextBridge.exposeInMainWorld('pinkLogicDesktop', api);
