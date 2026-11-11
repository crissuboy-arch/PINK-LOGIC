/**
 * Pink Logic — processo main (Electron).
 * Segurança: contextIsolation=true, nodeIntegration=false, sem `remote`,
 * sem Node exposto ao renderer. O renderer só fala com o main através do
 * preload (window.pinkLogicDesktop) e só para as operações registadas aqui.
 */
import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { deleteDraft, listDrafts, loadDraft, saveDraft, type Draft } from './drafts';
import {
  clearApiKey, encryptionAvailable, keyHintFromStored, loadDiskConfig,
  saveDiskConfig, storeApiKey, type AiConnectionDiskConfig,
} from './secrets';
import { generateCopyMain, testAiConnectionMain, type MainCopyInput } from './aiApi';

const isSelfTest = process.env.PINK_DESKTOP_SELFTEST === '1';
const selfTestOut = process.env.PINK_DESKTOP_SELFTEST_OUT || '';

if (process.env.PINK_DESKTOP_USER_DATA) {
  app.setPath('userData', process.env.PINK_DESKTOP_USER_DATA);
}

let mainWindow: BrowserWindow | null = null;

function webEntry(): { url?: string; file?: string } {
  // Dev explícito: servidor Vite (o script `dev` do web corre na porta 3001).
  if (process.env.ELECTRON_WEB_URL) return { url: process.env.ELECTRON_WEB_URL };
  const bundled = path.join(__dirname, '..', 'dist-web', 'index.html');
  if (fs.existsSync(bundled)) return { file: bundled };
  return { url: 'http://localhost:3001' };
}

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 640,
    title: 'Pink Logic',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  const entry = webEntry();
  if (entry.file) void win.loadFile(entry.file);
  else if (entry.url) void win.loadURL(entry.url);

  win.webContents.on('console-message', (_e, level, message, line, sourceId) => {
    console.log(`[renderer-console:${level}] ${message} (${sourceId}:${line})`);
  });
  win.webContents.on('did-finish-load', () => {
    console.log(`[desktop] SPA carregada: ${win.webContents.getURL()} | título: ${win.webContents.getTitle()}`);
    if (isSelfTest) void runSelfTest(win).catch((err) => failSelfTest(err));
  });
  win.webContents.on('did-fail-load', (_e, code, desc, url) => {
    console.error(`[desktop] FALHA ao carregar ${url}: ${code} ${desc}`);
    if (isSelfTest) failSelfTest(new Error(`did-fail-load ${code} ${desc} em ${url}`));
  });
  win.on('closed', () => { mainWindow = null; });
  return win;
}

function registerIpc(): void {
  ipcMain.handle('pink-logic:get-version', () => app.getVersion());
  ipcMain.handle('pink-logic:get-user-data-path', () => app.getPath('userData'));

  ipcMain.handle('pink-logic:save-draft', (_e, draft: Draft) => saveDraft(app.getPath('userData'), draft));
  ipcMain.handle('pink-logic:load-draft', (_e, id: string) => loadDraft(app.getPath('userData'), id));
  ipcMain.handle('pink-logic:list-drafts', () => listDrafts(app.getPath('userData')));
  ipcMain.handle('pink-logic:delete-draft', (_e, id: string) => deleteDraft(app.getPath('userData'), id));

  ipcMain.handle('pink-logic:show-save-dialog', async (_e, opts: { defaultPath?: string }) => {
    const win = BrowserWindow.getFocusedWindow() ?? mainWindow;
    if (!win) return { canceled: true };
    return dialog.showSaveDialog(win, {
      defaultPath: opts?.defaultPath ?? 'projecto-pink-logic.json',
      filters: [{ name: 'Projecto Pink Logic (JSON)', extensions: ['json'] }],
    });
  });
  ipcMain.handle('pink-logic:show-open-dialog', async () => {
    const win = BrowserWindow.getFocusedWindow() ?? mainWindow;
    if (!win) return { canceled: true, filePaths: [] };
    return dialog.showOpenDialog(win, {
      properties: ['openFile'],
      filters: [{ name: 'Projecto Pink Logic (JSON)', extensions: ['json'] }],
    });
  });
  // Leitura/escrita de ficheiro de projecto escolhido pelo utilizador no diálogo.
  ipcMain.handle('pink-logic:read-project-file', (_e, filePath: string) =>
    fs.readFileSync(filePath, 'utf8'),
  );
  ipcMain.handle('pink-logic:write-project-file', (_e, filePath: string, contents: string) => {
    fs.writeFileSync(filePath, contents, 'utf8');
    return true;
  });

  // Ligação de IA (Fase 3) — o renderer nunca recebe a chave; o main cifra
  // (safeStorage), guarda e faz as chamadas à OpenAI. O estado devolvido é
  // sempre público (ver publicStatus em aiConnection.ts).
  const publicAiState = () => {
    const userData = app.getPath('userData');
    const config = loadDiskConfig(userData);
    return {
      settings: config.settings,
      hasKey: config.encryptedKey !== null,
      keyHint: keyHintFromStored(userData),
      storage: config.storage,
      lastTestedAt: config.lastTestedAt,
      lastTestOk: config.lastTestOk,
      spend: config.spend,
    };
  };
  ipcMain.handle('pink-logic:ai-get', () => publicAiState());
  ipcMain.handle('pink-logic:ai-save-key', (_e, key: string) => {
    const userData = app.getPath('userData');
    if (typeof key !== 'string' || !/^sk-[A-Za-z0-9_-]{20,}$/.test(key.trim())) {
      return { stored: false, storage: 'none' as const, error: 'A chave não tem o formato esperado (começa por «sk-»).' };
    }
    const result = storeApiKey(userData, key.trim());
    return { stored: result.stored, storage: result.storage, error: result.error ?? null };
  });
  ipcMain.handle('pink-logic:ai-clear-key', () => {
    clearApiKey(app.getPath('userData'));
    return true;
  });
  ipcMain.handle('pink-logic:ai-save-settings', (_e, settings: AiConnectionDiskConfig['settings']) => {
    const userData = app.getPath('userData');
    const config = loadDiskConfig(userData);
    const monthly = Number(settings?.monthlyCapUsd);
    const perCall = Number(settings?.maxPerCallUsd);
    if (!Number.isFinite(monthly) || monthly <= 0 || monthly > 1000) throw new Error('O teto mensal tem de estar entre 0 e 1000 USD.');
    if (!Number.isFinite(perCall) || perCall <= 0 || perCall > 10) throw new Error('O máximo por chamada tem de estar entre 0 e 10 USD.');
    if (perCall > monthly) throw new Error('O máximo por chamada não pode ser maior que o teto mensal.');
    if (!['teste', 'api', 'desligada'].includes(settings?.mode)) throw new Error('Modo de IA desconhecido.');
    if (!['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini'].includes(settings?.model)) throw new Error('Modelo desconhecido.');
    config.settings = {
      mode: settings.mode,
      apiEnabled: settings.apiEnabled === true,
      monthlyCapUsd: monthly,
      maxPerCallUsd: perCall,
      model: settings.model,
    };
    // Sem chave guardada, o armazenamento seguro não se aplica; se a
    // encriptação não estiver disponível, o estado diz 'none' (a chave, se
    // existir, só vive em memória no renderer — ver useAiConnection).
    if (!config.encryptedKey) config.storage = 'none';
    else if (!encryptionAvailable()) config.storage = 'memory-only';
    saveDiskConfig(userData, config);
    return publicAiState();
  });
  ipcMain.handle('pink-logic:ai-test', () => testAiConnectionMain(app.getPath('userData')));
  ipcMain.handle('pink-logic:ai-generate-copy', (_e, input: MainCopyInput) =>
    generateCopyMain(app.getPath('userData'), input),
  );
}

/**
 * Self-test (PINK_DESKTOP_SELFTEST=1): exercita o preload REAL no renderer
 * (window.pinkLogicDesktop), guarda/carrega um rascunho, tira screenshot e
 * escreve o resultado em PINK_DESKTOP_SELFTEST_OUT. Nunca corre em uso normal.
 */
async function runSelfTest(win: BrowserWindow): Promise<void> {
  const api = (expr: string) => win.webContents.executeJavaScript(expr);
  const result: Record<string, unknown> = { startedAt: new Date().toISOString() };

  // Dar tempo ao React para pintar antes de inspeccionar/capturar.
  await new Promise((r) => setTimeout(r, 3000));
  result.pageUrl = win.webContents.getURL();
  result.pageTitle = win.webContents.getTitle();
  result.rootChildren = await api(`document.getElementById('root')?.children.length ?? -1`);
  result.bodyTextLength = await api(`document.body.innerText.length`);
  result.bodyTextSample = await api(`document.body.innerText.slice(0, 200)`);

  result.apiPresent = await api(`typeof window.pinkLogicDesktop !== 'undefined'`);
  result.version = await api(`window.pinkLogicDesktop.getVersion()`);
  result.userDataPath = await api(`window.pinkLogicDesktop.getUserDataPath()`);
  const draft = {
    id: 'selftest-projecto',
    title: 'Projecto self-test',
    data: { texto: 'rascunho de teste', itens: [1, 2, 3] },
  };
  result.savedMeta = await api(`window.pinkLogicDesktop.saveDraft(${JSON.stringify(draft)})`);
  result.listed = await api(`window.pinkLogicDesktop.listDrafts()`);
  result.loaded = await api(`window.pinkLogicDesktop.loadDraft('selftest-projecto')`);
  const loaded = result.loaded as { data?: { texto?: string } } | null;
  result.roundTripOk =
    loaded?.data?.texto === 'rascunho de teste' &&
    Array.isArray(result.listed) &&
    (result.listed as Array<{ id: string }>).some((d) => d.id === 'selftest-projecto');
  const shot = await win.webContents.capturePage();
  const shotPath = path.join(path.dirname(selfTestOut || process.cwd()), 'screenshot.png');
  fs.mkdirSync(path.dirname(shotPath), { recursive: true });
  fs.writeFileSync(shotPath, shot.toPNG());
  result.screenshot = shotPath;
  result.screenshotBytes = fs.statSync(shotPath).size;
  result.finishedAt = new Date().toISOString();
  result.ok = result.apiPresent === true && result.roundTripOk === true && (result.screenshotBytes as number) > 0
    && (result.rootChildren as number) > 0 && (result.bodyTextLength as number) > 0;
  if (selfTestOut) {
    fs.mkdirSync(path.dirname(selfTestOut), { recursive: true });
    fs.writeFileSync(selfTestOut, JSON.stringify(result, null, 2), 'utf8');
  }
  console.log(`[desktop] SELFTEST ok=${result.ok} userData=${result.userDataPath}`);
  console.log(`[desktop] SELFTEST resultado: ${JSON.stringify(result)}`);
  app.exit(result.ok ? 0 : 1);
}

function failSelfTest(err: unknown): void {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[desktop] SELFTEST FALHOU: ${message}`);
  if (selfTestOut) {
    try {
      fs.mkdirSync(path.dirname(selfTestOut), { recursive: true });
      fs.writeFileSync(selfTestOut, JSON.stringify({ ok: false, error: message }, null, 2), 'utf8');
    } catch { /* nada a fazer */ }
  }
  app.exit(1);
}

void app.whenReady().then(() => {
  registerIpc();
  mainWindow = createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) mainWindow = createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
