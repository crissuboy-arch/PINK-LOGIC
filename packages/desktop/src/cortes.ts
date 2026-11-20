/**
 * Cortes Virais — parte com I/O (processo main do Electron).
 *
 * Fluxo: vídeo -> áudio (ffmpeg) -> transcrição com tempo por palavra (OpenAI
 * Whisper) -> a IA escolhe unidades (ids) e escreve os ganchos -> o código
 * converte ids em tempos -> ffmpeg corta, recorta para 9:16 e queima a legenda.
 *
 * Custos: as duas chamadas pagas passam pelo MESMO gate da ligação de IA
 * (modo 'api' + opt-in + chave + limite por chamada + teto mensal, com reserva
 * antes da chamada). Sem isso, recusa SEM chamar a rede. O vídeo nunca sai da
 * máquina: só o áudio mono comprimido vai para a transcrição.
 */
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { loadApiKey, loadDiskConfig, saveDiskConfig } from './secrets';
import { TEXT_PRICES } from './paidCopy';
import {
  buildAss, buildUnits, resolveSelection, safeFileName, selectionPrompt, videoFilter,
  type CaptionStyle, type Clip, type Word,
} from './cortesCore';

export const WHISPER_USD_PER_MIN = 0.006;
const MAX_AUDIO_BYTES = 24 * 1024 * 1024;

export interface CortesInput {
  videoPath: string;
  outputRoot: string;
  clips: number;
  minSec: number;
  maxSec: number;
  style: CaptionStyle;
  accent: string;
  language?: string;
}

export interface CortesProgress { stage: 'audio' | 'transcricao' | 'selecao' | 'render' | 'fim'; message: string; current?: number; total?: number }

export interface CortesResultClip { index: number; file: string; start: number; end: number; hook: string; score: number; reason: string }

export interface CortesResult { outputDir: string; clips: CortesResultClip[]; dropped: string[]; costUsd: number; durationSec: number }

type Emit = (p: CortesProgress) => void;

// ------------------------------------------------------------------ ffmpeg

export function resolveFfmpeg(userDataPath: string): string {
  const exe = process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';
  const candidates = [
    process.env.PINK_FFMPEG,
    path.join(userDataPath, 'bin', exe),
  ];
  try {
    // Binário empacotado (dependência opcional); em app empacotado vive fora do asar.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const bundled = require('ffmpeg-static') as string | null;
    if (bundled) candidates.push(bundled.replace('app.asar', 'app.asar.unpacked'));
  } catch { /* sem ffmpeg-static: segue para o PATH */ }
  for (const c of candidates) if (c && fs.existsSync(c)) return c;
  return 'ffmpeg';
}

function run(bin: string, args: string[], cwd?: string): Promise<{ code: number; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { cwd, windowsHide: true });
    let stderr = '';
    child.stderr.on('data', (d) => { stderr = (stderr + d.toString()).slice(-20000); });
    child.on('error', (e) => reject(new Error(
      (e as NodeJS.ErrnoException).code === 'ENOENT'
        ? 'ffmpeg não encontrado. Instala o ffmpeg ou coloca ffmpeg.exe na pasta «bin» dos dados da app.'
        : `Falha ao iniciar o ffmpeg: ${e.message}`)));
    child.on('close', (code) => resolve({ code: code ?? -1, stderr }));
  });
}

/** Verifica se o ffmpeg arranca (para a UI avisar antes de o utilizador escolher o vídeo). */
export async function checkFfmpeg(userData: string): Promise<{ found: boolean; path: string }> {
  const bin = resolveFfmpeg(userData);
  try {
    const { code } = await run(bin, ['-hide_banner', '-version']);
    return { found: code === 0, path: bin };
  } catch {
    return { found: false, path: bin };
  }
}

export async function probeDuration(ffmpeg: string, file: string): Promise<number> {
  const { stderr } = await run(ffmpeg, ['-hide_banner', '-i', file]);
  const m = /Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/.exec(stderr);
  if (!m) throw new Error('Não consegui ler a duração do vídeo. O ficheiro está corrompido ou não é um vídeo?');
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
}

// ------------------------------------------------------------------ gate de custo

function monthKey(): string { return new Date().toISOString().slice(0, 7); }

interface Gate { model: string; key: string; reserve(amount: number): void; settle(reserved: number, actual: number): void; check(amount: number): void }

function openGate(userData: string): Gate {
  const config = loadDiskConfig(userData);
  if (config.settings.mode !== 'api' || config.settings.apiEnabled !== true) {
    throw new Error('A geração paga está desligada. Ativa a ligação de IA (modo API) nas definições para usar os Cortes Virais.');
  }
  const key = loadApiKey(userData);
  if (!key) throw new Error('Sem chave OpenAI configurada.');
  const model = config.settings.model;
  if (!TEXT_PRICES[model]) throw new Error('Modelo sem preço configurado; chamada recusada.');
  const ledger = (reserve: number, actual?: number) => {
    const c = loadDiskConfig(userData);
    if (c.spend.month !== monthKey()) c.spend = { month: monthKey(), spentUsd: 0, reservedUsd: 0 };
    if (actual === undefined) c.spend.reservedUsd = (c.spend.reservedUsd || 0) + reserve;
    else { c.spend.reservedUsd = Math.max(0, (c.spend.reservedUsd || 0) - reserve); c.spend.spentUsd += actual; }
    saveDiskConfig(userData, c);
  };
  return {
    model, key,
    reserve: (n) => ledger(n),
    settle: (r, a) => ledger(r, a),
    check: (amount) => {
      const c = loadDiskConfig(userData);
      const used = c.spend.month === monthKey() ? c.spend.spentUsd + (c.spend.reservedUsd || 0) : 0;
      if (amount > c.settings.maxPerCallUsd) throw new Error(`Custo estimado $${amount.toFixed(4)} acima do máximo por chamada ($${c.settings.maxPerCallUsd}). Aumenta o limite ou usa um vídeo mais curto.`);
      if (used + amount > c.settings.monthlyCapUsd) throw new Error('Limite mensal de IA atingido, incluindo reservas por confirmar.');
    },
  };
}

async function fetchWithTimeout(url: string, init: RequestInit, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try { return await fetch(url, { ...init, signal: controller.signal }); } finally { clearTimeout(timer); }
}

// ------------------------------------------------------------------ transcrição

async function transcribe(gate: Gate, audioPath: string, durationSec: number, language?: string): Promise<Word[]> {
  const size = fs.statSync(audioPath).size;
  if (size > MAX_AUDIO_BYTES) throw new Error('O áudio passa dos 24 MB aceites pela transcrição (vídeo demasiado longo). Corta o vídeo antes.');
  const cost = Math.ceil((durationSec / 60) * WHISPER_USD_PER_MIN * 1.1 * 1e6) / 1e6;
  gate.check(cost);
  gate.reserve(cost);
  const form = new FormData();
  form.append('model', 'whisper-1');
  form.append('response_format', 'verbose_json');
  form.append('timestamp_granularities[]', 'word');
  if (language && /^[a-z]{2}$/.test(language)) form.append('language', language);
  form.append('file', new Blob([fs.readFileSync(audioPath)], { type: 'audio/mpeg' }), 'audio.mp3');
  // Sem retries automáticos: um timeout pode já ter sido cobrado; a reserva fica até confirmação.
  const res = await fetchWithTimeout('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST', headers: { Authorization: `Bearer ${gate.key}` }, body: form,
  }, 300000);
  if (!res.ok) throw new Error(`A transcrição falhou (HTTP ${res.status}). A reserva foi mantida até confirmação da cobrança.`);
  gate.settle(cost, cost);
  const body = (await res.json()) as { words?: { word: string; start: number; end: number }[] };
  const words = (body.words ?? []).filter((w) => typeof w.word === 'string');
  if (!words.length) throw new Error('A transcrição voltou vazia. O vídeo tem fala audível?');
  return words;
}

// ------------------------------------------------------------------ seleção

async function pickClips(gate: Gate, units: ReturnType<typeof buildUnits>, input: CortesInput): Promise<{ raw: unknown; costUsd: number }> {
  const price = TEXT_PRICES[gate.model];
  const { system, user } = selectionPrompt(units, { clips: input.clips, minSec: input.minSec, maxSec: input.maxSec });
  const messages = [{ role: gate.model.startsWith('gpt-5') ? 'developer' : 'system', content: system }, { role: 'user', content: user }];
  const encoded = JSON.stringify(messages);
  if (encoded.length > 120000) throw new Error('Transcrição longa demais para uma só chamada. Usa um vídeo mais curto.');
  const maxOutput = 2048;
  const reservation = Math.ceil(((new TextEncoder().encode(encoded).length + 1024) * price.input + maxOutput * price.output) / 1e6 * 1.1 * 1e6) / 1e6;
  gate.check(reservation);
  gate.reserve(reservation);
  const res = await fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${gate.key}` },
    body: JSON.stringify({ model: gate.model, messages, max_completion_tokens: maxOutput, response_format: { type: 'json_object' }, store: false }),
  }, 90000);
  if (!res.ok) throw new Error(`A escolha dos cortes falhou (HTTP ${res.status}). A reserva foi mantida até confirmação da cobrança.`);
  const body = (await res.json()) as { usage?: { prompt_tokens?: number; completion_tokens?: number }; choices?: { message?: { content?: string } }[] };
  let costUsd = reservation;
  const u = body.usage;
  if (u && Number.isFinite(u.prompt_tokens) && Number.isFinite(u.completion_tokens)) {
    costUsd = Math.ceil((u.prompt_tokens! * price.input + u.completion_tokens! * price.output) / 1e6 * 1.1 * 1e6) / 1e6;
    gate.settle(reservation, costUsd);
  }
  let raw: unknown;
  try { raw = JSON.parse(body.choices?.[0]?.message?.content || ''); } catch { throw new Error('A IA devolveu um formato inválido. O consumo foi registado; nada foi cortado.'); }
  return { raw, costUsd };
}

// ------------------------------------------------------------------ render

async function renderClip(ffmpeg: string, input: string, outDir: string, clip: Clip, baseName: string, opts: CortesInput): Promise<string> {
  const stem = `${String(clip.index).padStart(2, '0')}-${safeFileName(clip.hook)}`;
  const assName = `${stem}.ass`;
  const outName = `${baseName}-${stem}.mp4`;
  const ass = buildAss(clip, { width: 1080, height: 1920, style: opts.style, accent: opts.accent, hookSec: 3, wordsPerLine: 3 });
  fs.writeFileSync(path.join(outDir, assName), ass, 'utf8');
  // cwd = pasta de saída e nome relativo no filtro: evita problemas de escape de caminhos (Windows).
  const args = [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-ss', clip.start.toFixed(3), '-to', clip.end.toFixed(3), '-i', input,
    '-vf', videoFilter(assName),
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', outName,
  ];
  const { code, stderr } = await run(ffmpeg, args, outDir);
  if (code !== 0) throw new Error(`O ffmpeg falhou ao gerar o corte ${clip.index}: ${stderr.split('\n').filter(Boolean).slice(-3).join(' | ')}`);
  fs.rmSync(path.join(outDir, assName), { force: true });
  return outName;
}

export function validateInput(i: CortesInput): CortesInput {
  if (!i || typeof i.videoPath !== 'string' || !fs.existsSync(i.videoPath)) throw new Error('Vídeo não encontrado.');
  const clips = Math.round(Number(i.clips));
  const minSec = Number(i.minSec);
  const maxSec = Number(i.maxSec);
  if (!(clips >= 1 && clips <= 8)) throw new Error('Número de cortes deve estar entre 1 e 8.');
  if (!(minSec >= 8 && maxSec <= 120 && minSec < maxSec)) throw new Error('Duração dos cortes inválida (8 a 120 s, mínimo menor que máximo).');
  if (!['destaque', 'limpo', 'karaoke'].includes(i.style)) throw new Error('Estilo de legenda desconhecido.');
  const accent = /^#[0-9a-fA-F]{6}$/.test(i.accent) ? i.accent : '#FF2D8D';
  return { ...i, clips, minSec, maxSec, accent, language: i.language && /^[a-z]{2}$/.test(i.language) ? i.language : undefined };
}

let busy = false;

export async function runCortes(userData: string, raw: CortesInput, emit: Emit): Promise<CortesResult> {
  if (busy) throw new Error('Já existe um processamento de cortes em curso.');
  busy = true;
  try {
    const input = validateInput(raw);
    const gate = openGate(userData);
    const ffmpeg = resolveFfmpeg(userData);
    const baseName = safeFileName(path.parse(input.videoPath).name, 30);
    const stamp = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19);
    const outputDir = path.join(input.outputRoot, `${baseName}-${stamp}`);
    fs.mkdirSync(outputDir, { recursive: true });

    emit({ stage: 'audio', message: 'A preparar o áudio…' });
    const durationSec = await probeDuration(ffmpeg, input.videoPath);
    const audioPath = path.join(outputDir, '_audio.mp3');
    const a = await run(ffmpeg, ['-y', '-hide_banner', '-loglevel', 'error', '-i', input.videoPath, '-vn', '-ac', '1', '-ar', '16000', '-b:a', '32k', audioPath]);
    if (a.code !== 0) throw new Error('O ffmpeg não conseguiu extrair o áudio do vídeo.');

    emit({ stage: 'transcricao', message: 'A transcrever a fala…' });
    const words = await transcribe(gate, audioPath, durationSec, input.language);
    fs.rmSync(audioPath, { force: true });

    emit({ stage: 'selecao', message: 'A escolher os melhores momentos e a escrever os ganchos…' });
    const units = buildUnits(words);
    const { raw: picked, costUsd: pickCost } = await pickClips(gate, units, input);
    const { clips, dropped } = resolveSelection(picked, units, { clips: input.clips, minSec: input.minSec, maxSec: input.maxSec });

    const out: CortesResultClip[] = [];
    for (const clip of clips) {
      emit({ stage: 'render', message: `A gerar o corte ${clip.index} de ${clips.length}…`, current: clip.index, total: clips.length });
      const file = await renderClip(ffmpeg, input.videoPath, outputDir, clip, baseName, input);
      out.push({ index: clip.index, file: path.join(outputDir, file), start: clip.start, end: clip.end, hook: clip.hook, score: clip.score, reason: clip.reason });
    }
    const costUsd = Math.round(((durationSec / 60) * WHISPER_USD_PER_MIN + pickCost) * 1e4) / 1e4;
    fs.writeFileSync(path.join(outputDir, 'cortes.json'), JSON.stringify({ source: path.basename(input.videoPath), clips: out.map((c) => ({ ...c, file: path.basename(c.file) })), dropped, costUsd }, null, 2), 'utf8');
    emit({ stage: 'fim', message: `${out.length} cortes prontos.` });
    return { outputDir, clips: out, dropped, costUsd, durationSec };
  } finally {
    busy = false;
  }
}
