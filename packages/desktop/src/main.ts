import { PinkChatGPTOAuth } from './chatgptOAuth';
import { runAcceptance } from './acceptance';
import { startTransfer, stopTransfer } from './localTransfer';
import { checkFfmpeg, runCortes, type CortesInput, type CortesProgress } from './cortes';
/**
 * Pink Logic — processo main (Electron).
 * Segurança: contextIsolation=true, nodeIntegration=false, sem `remote`,
 * sem Node exposto ao renderer. O renderer só fala com o main através do
 * preload (window.pinkLogicDesktop) e só para as operações registadas aqui.
 */
import { app, BrowserWindow, dialog, ipcMain, shell, clipboard, safeStorage } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { deleteDraft, draftsDir, listDrafts, loadDraft, saveDraft, listDraftVersions, restoreDraftVersion, type Draft } from './drafts';
import {
  clearApiKey, encryptionAvailable, keyHintFromStored, loadDiskConfig,
  saveDiskConfig, storeApiKey, type AiConnectionDiskConfig,
} from './secrets';
import { generateCopyMain, testAiConnectionMain, type MainCopyInput } from './aiApi';

if(process.env.PINK_DESKTOP_OFFSCREEN_TEST === '1') app.disableHardwareAcceleration();
const isSelfTest = process.env.PINK_DESKTOP_SELFTEST === '1';
const selfTestOut = process.env.PINK_DESKTOP_SELFTEST_OUT || '';

if (process.env.PINK_DESKTOP_USER_DATA) {
  app.setPath('userData', process.env.PINK_DESKTOP_USER_DATA);
}

let mainWindow: BrowserWindow | null = null;
if(!isSelfTest && !process.env.PINK_DESKTOP_ACCEPTANCE && !process.env.PINK_CHATGPT_DIAGNOSTIC_OUT) {
  if(!app.requestSingleInstanceLock()) app.exit(0);
  app.on('second-instance',()=>{if(mainWindow?.isMinimized()) mainWindow.restore();mainWindow?.focus();});
}

let chatgptConnection: PinkChatGPTOAuth | null = null;

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
    show: process.env.PINK_DESKTOP_OFFSCREEN_TEST !== '1',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      offscreen: process.env.PINK_DESKTOP_OFFSCREEN_TEST === '1',
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
    if (process.env.PINK_CHATGPT_DIAGNOSTIC_OUT) { void win.webContents.executeJavaScript('window.pinkLogicDesktop.getChatGPTStatus()').then(status => { const ok = status.sessionOwnedBy === 'Pink Logic' && status.connected === false && status.subscriptionAuthorized === false && status.textGenerationVerified === false && status.status === 'approval-required'; fs.writeFileSync(process.env.PINK_CHATGPT_DIAGNOSTIC_OUT!, JSON.stringify({ok, ...status}, null, 2)); app.exit(ok ? 0 : 1); }); }
    else if (process.env.PINK_DESKTOP_ACCEPTANCE) void runAcceptance(win).then(() => win.close()).catch(err => { console.error(err); app.exit(1); });
    else if (isSelfTest) void runSelfTest(win).catch((err) => failSelfTest(err));
  });
  win.webContents.on('did-fail-load', (_e, code, desc, url) => {
    console.error(`[desktop] FALHA ao carregar ${url}: ${code} ${desc}`);
    if (isSelfTest) failSelfTest(new Error(`did-fail-load ${code} ${desc} em ${url}`));
  });
  win.on('closed', () => { mainWindow = null; });
  return win;
}

function registerIpc(): void {
  ipcMain.on('pink-logic:save-draft-sync', (event,draft: Draft) => { try {saveDraft(app.getPath('userData'),draft);event.returnValue={ok:true};}catch {event.returnValue={ok:false,error:'Não foi possível guardar o projeto no disco.'};} });

  chatgptConnection = new PinkChatGPTOAuth({
    userData: app.getPath('userData'),
    clientId: process.env.PINK_CHATGPT_COMMERCIAL_CLIENT_ID,
    commercialApproved: process.env.PINK_CHATGPT_COMMERCIAL_APPROVED === '1',
    callbackPort: Number(process.env.PINK_CHATGPT_CALLBACK_PORT || '1456'),
    encryption: { available: () => safeStorage.isEncryptionAvailable(), encrypt: value => safeStorage.encryptString(value), decrypt: value => safeStorage.decryptString(value) },
    openBrowser: async url => { if(new URL(url).origin !== 'https://auth.openai.com') throw new Error('Destino de autenticação rejeitado.'); await shell.openExternal(url); },
  });
  ipcMain.handle('pink-logic:chatgpt-begin', () => chatgptConnection!.begin());
  ipcMain.handle('pink-logic:chatgpt-cancel', () => { chatgptConnection!.cancel(); return chatgptConnection!.status(); });
  ipcMain.handle('pink-logic:chatgpt-disconnect', () => chatgptConnection!.disconnect());
  ipcMain.handle('pink-logic:chatgpt-text', (_e,input: string,consent: boolean) => chatgptConnection!.generateText(input,consent === true));

  ipcMain.handle('pink-logic:save-export', async (_e, name: string, bytes: Uint8Array) => {
    if (typeof name !== 'string' || !/^[a-zA-Z0-9_.-]+\.(zip|pdf|png|jpg|json|txt)$/.test(name) || !(bytes instanceof Uint8Array) || bytes.length > 100*1024*1024) throw new Error('Exportação inválida.');
    let target: string | undefined;
    if (process.env.PINK_DESKTOP_ACCEPTANCE && process.env.PINK_ACCEPTANCE_OUT) target=path.join(process.env.PINK_ACCEPTANCE_OUT,name);
    else { const result=await dialog.showSaveDialog(mainWindow!, {defaultPath:path.join(app.getPath('downloads'),name)}); if(result.canceled) return {saved:false}; target=result.filePath; }
    if(!target) return {saved:false}; fs.writeFileSync(target,bytes); return {saved:true,filePath:target};
  });

  ipcMain.handle('pink-logic:chatgpt-status', () => chatgptConnection!.status());
  ipcMain.handle('pink-logic:chatgpt-manual', async (_e, prompt: string) => {
    if (typeof prompt !== 'string' || prompt.length > 30000) throw new Error('Pedido inválido.');
    clipboard.writeText(prompt); await shell.openExternal('https://chatgpt.com/'); return true;
  });
  ipcMain.handle('pink-logic:chatgpt-access', () => shell.openExternal('https://openai.com/form/sign-in-with-chatgpt-interest/'));
  ipcMain.handle('pink-logic:transfer-start', (_e, bytes: Uint8Array) => startTransfer(bytes));
  ipcMain.handle('pink-logic:transfer-stop', () => { stopTransfer(); return true; });

  ipcMain.handle('pink-logic:get-version', () => app.getVersion());
  ipcMain.handle('pink-logic:get-user-data-path', () => app.getPath('userData'));

  // Cortes Virais — o vídeo é escolhido num diálogo do main (o renderer nunca
  // fornece caminhos arbitrários) e os resultados só abrem se estiverem na pasta de saída.
  const cortesOutputRoot = () => path.join(app.getPath('documents'), 'Pink Logic', 'Cortes');
  let cortesPickedVideo: string | null = null;
  ipcMain.handle('pink-logic:cortes-ffmpeg', () => checkFfmpeg(app.getPath('userData')));
  ipcMain.handle('pink-logic:cortes-pick-video', async () => {
    const win = BrowserWindow.getFocusedWindow() ?? mainWindow;
    if (!win) return { canceled: true };
    const result = await dialog.showOpenDialog(win, {
      properties: ['openFile'],
      filters: [{ name: 'Vídeo', extensions: ['mp4', 'mov', 'mkv', 'webm', 'm4v'] }],
    });
    if (result.canceled || !result.filePaths[0]) return { canceled: true };
    cortesPickedVideo = result.filePaths[0];
    return { canceled: false, name: path.basename(cortesPickedVideo), sizeBytes: fs.statSync(cortesPickedVideo).size };
  });
  ipcMain.handle('pink-logic:cortes-run', async (event, opts: Omit<CortesInput, 'videoPath' | 'outputRoot'>) => {
    if (!cortesPickedVideo) throw new Error('Escolhe primeiro um vídeo.');
    const emit = (p: CortesProgress) => { if (!event.sender.isDestroyed()) event.sender.send('pink-logic:cortes-progress', p); };
    return runCortes(app.getPath('userData'), { ...opts, videoPath: cortesPickedVideo, outputRoot: cortesOutputRoot() }, emit);
  });
  const insideCortes = (p: unknown): string => {
    if (typeof p !== 'string') throw new Error('Caminho inválido.');
    const root = path.resolve(cortesOutputRoot());
    const target = path.resolve(p);
    if (target !== root && !target.startsWith(root + path.sep)) throw new Error('Só é possível abrir ficheiros da pasta de cortes.');
    return target;
  };
  ipcMain.handle('pink-logic:cortes-open', async (_e, filePath: string) => {
    const err = await shell.openPath(insideCortes(filePath));
    return err === '';
  });
  ipcMain.handle('pink-logic:cortes-reveal', (_e, filePath: string) => { shell.showItemInFolder(insideCortes(filePath)); return true; });

  ipcMain.handle('pink-logic:save-draft', (_e, draft: Draft) => saveDraft(app.getPath('userData'), draft));
  ipcMain.handle('pink-logic:load-draft', (_e, id: string) => loadDraft(app.getPath('userData'), id));
  ipcMain.handle('pink-logic:list-versions', (_e,id:string) => listDraftVersions(app.getPath('userData'),id));
  ipcMain.handle('pink-logic:restore-version', (_e,id:string,version:string) => restoreDraftVersion(app.getPath('userData'),id,version));
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
    if (!['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini', 'gpt-5.4-mini'].includes(settings?.model)) throw new Error('Modelo desconhecido.');
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
 *
 * Fase 3 — fluxo completo: além do arranque e do rascunho genérico, semeia
 * uma sessão local de demonstração (só aceite porque o bundle de self-test
 * foi construído com VITE_PINK_DESKTOP_SELFTEST=1 — ver authService) e
 * navega no fluxo real: criacao/carrossel-fluxo (banner de demonstração
 * visível) e sistema/ia (ecrã de ligação). Se PINK_DESKTOP_SELFTEST_PROJECT
 * apontar para um project.json de prova, guarda-o como rascunho desktop e
 * prova o round-trip via preload. Screenshots reais em test-evidence/.
 */
async function runSelfTest(win: BrowserWindow): Promise<void> {
  const api = (expr: string) => win.webContents.executeJavaScript(expr);
  const result: Record<string, unknown> = { startedAt: new Date().toISOString() };
  const shotDir = path.dirname(selfTestOut || process.cwd());
  const takeShot = async (name: string): Promise<number> => {
    const shot = await win.webContents.capturePage();
    const shotPath = path.join(shotDir, name);
    fs.mkdirSync(path.dirname(shotPath), { recursive: true });
    fs.writeFileSync(shotPath, shot.toPNG());
    return fs.statSync(shotPath).size;
  };
  const waitForText = async (text: string, timeoutMs = 20000): Promise<boolean> => {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      if (await api(`document.body.innerText.includes(${JSON.stringify(text)})`)) return true;
      await new Promise((r) => setTimeout(r, 500));
    }
    return false;
  };

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
  const shotPath = path.join(shotDir, 'screenshot.png');
  fs.mkdirSync(path.dirname(shotPath), { recursive: true });
  fs.writeFileSync(shotPath, shot.toPNG());
  result.screenshot = shotPath;
  result.screenshotBytes = fs.statSync(shotPath).size;

  // --- Fase 3: navegação real no fluxo (sessão local de demonstração) ---
  await api(`localStorage.setItem('pinklogic.auth.session', ${JSON.stringify(JSON.stringify({ email: 'selftest@pinklogic.local', name: 'Self-test', role: 'Self-test' }))})`);
  await api(`location.hash = '#/criacao/carrossel-fluxo'`);
  result.flowVisible = await waitForText('Fluxo de Carrosséis');
  result.flowUrl = win.webContents.getURL();
  result.flowDemoBanner = await api(`document.querySelector('[data-testid="ai-demo-banner"]') !== null`);
  result.flowAiLink = await api(`document.querySelector('[data-testid="go-ai-connection"]') !== null`);
  result.flowBodySample = await api(`document.body.innerText.slice(0, 300)`);
  // Dar tempo ao React para pintar a rota antes da captura.
  await new Promise((r) => setTimeout(r, 1500));
  result.screenshotFlowBytes = await takeShot('screenshot-flow.png');
  result.screenshotFlow = path.join(shotDir, 'screenshot-flow.png');

  await api(`location.hash = '#/sistema/ia'`);
  // 'Ligação de IA' também existe na página do fluxo (botão do passo 2) —
  // esperar pelo texto próprio do ecrã de ligação, não pelo título.
  result.iaVisible = await waitForText('Modo de teste (predefinido)');
  result.iaUrl = win.webContents.getURL();
  result.iaBodySample = await api(`document.body.innerText.slice(0, 300)`);
  await new Promise((r) => setTimeout(r, 1500));
  result.screenshotIaBytes = await takeShot('screenshot-ia.png');
  result.screenshotIa = path.join(shotDir, 'screenshot-ia.png');

  // Estado efectivo da IA no main (predefinição tem de ser modo de teste).
  try {
    const aiState = await api(`window.pinkLogicDesktop.getAiConnection()`) as { settings?: { mode?: string } } | null;
    result.aiMode = aiState?.settings?.mode ?? null;
    result.aiModeTeste = result.aiMode === 'teste';
  } catch (e) {
    result.aiMode = null;
    result.aiModeTeste = false;
    result.aiModeError = e instanceof Error ? e.message : String(e);
  }

  // --- Fase 3: round-trip do projecto de prova via preload (rascunho desktop) ---
  const projectFile = process.env.PINK_DESKTOP_SELFTEST_PROJECT || '';
  if (projectFile && fs.existsSync(projectFile)) {
    const projectData = JSON.parse(fs.readFileSync(projectFile, 'utf8')) as { title?: string; slides?: unknown[] };
    const userData = app.getPath('userData');
    const meta = saveDraft(userData, {
      id: 'fase3-primeira-prova',
      title: projectData.title || 'Carrossel Fase 3 — primeira prova',
      updatedAt: new Date().toISOString(),
      data: projectData,
    });
    result.projectDraftMeta = meta;
    const reloaded = await api(`window.pinkLogicDesktop.loadDraft('fase3-primeira-prova')`) as { data?: { title?: string; slides?: unknown[] } } | null;
    result.projectRoundTripOk =
      reloaded?.data?.title === projectData.title &&
      Array.isArray(reloaded?.data?.slides) &&
      (reloaded?.data?.slides as unknown[]).length === (projectData.slides ?? []).length;
    result.projectDraftFile = path.join(draftsDir(userData), 'fase3-primeira-prova.json');
    result.projectDraftFileExists = fs.existsSync(result.projectDraftFile as string);
  } else {
    result.projectRoundTripOk = null;
    result.projectCheck = 'skipped — PINK_DESKTOP_SELFTEST_PROJECT sem ficheiro de prova';
  }

  result.finishedAt = new Date().toISOString();
  result.ok = result.apiPresent === true && result.roundTripOk === true && (result.screenshotBytes as number) > 0
    && (result.rootChildren as number) > 0 && (result.bodyTextLength as number) > 0
    && result.flowVisible === true && result.flowDemoBanner === true && result.flowAiLink === true
    && result.iaVisible === true && result.aiModeTeste === true
    && (result.screenshotFlowBytes as number) > 0 && (result.screenshotIaBytes as number) > 0
    && (result.projectRoundTripOk === true || result.projectRoundTripOk === null);
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
  stopTransfer(); chatgptConnection?.cancel();
  if (process.platform !== 'darwin') app.quit();
});
