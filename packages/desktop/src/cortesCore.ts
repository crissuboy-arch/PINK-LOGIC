/**
 * Cortes Virais — núcleo PURO (sem Electron, sem rede, sem ffmpeg).
 *
 * Regra de ouro (a mesma do otimizevideo): a IA NUNCA escolhe tempos. Ela só
 * vê a transcrição dividida em unidades numeradas e devolve ids. É este código
 * que converte id -> segundos, a partir dos timestamps reais de cada palavra.
 * Assim o corte nunca cai a meio de uma palavra e o resultado é verificável.
 */

export interface Word { word: string; start: number; end: number }

export interface Unit { id: number; start: number; end: number; text: string; words: Word[] }

export interface ClipPick { startUnit: number; endUnit: number; hook: string; score: number; reason: string }

export interface Clip {
  index: number;
  start: number;
  end: number;
  hook: string;
  score: number;
  reason: string;
  words: Word[];
}

export interface SelectOptions { clips: number; minSec: number; maxSec: number }

const SENTENCE_END = /[.!?…]$/;

/** Divide as palavras em unidades (frases, ou pausas > pauseSec, ou teto de maxUnitSec). */
export function buildUnits(words: Word[], pauseSec = 0.6, maxUnitSec = 12): Unit[] {
  const clean = words
    .filter((w) => w && typeof w.word === 'string' && w.word.trim() && Number.isFinite(w.start) && Number.isFinite(w.end) && w.end >= w.start)
    .map((w) => ({ word: w.word.trim(), start: w.start, end: w.end }));
  const units: Unit[] = [];
  let current: Word[] = [];
  const flush = () => {
    if (!current.length) return;
    units.push({
      id: units.length,
      start: current[0].start,
      end: current[current.length - 1].end,
      text: current.map((w) => w.word).join(' '),
      words: current,
    });
    current = [];
  };
  for (let i = 0; i < clean.length; i++) {
    const w = clean[i];
    const prev = current[current.length - 1];
    if (prev && w.start - prev.end > pauseSec) flush();
    if (current.length && w.end - current[0].start > maxUnitSec) flush();
    current.push(w);
    if (SENTENCE_END.test(w.word)) flush();
  }
  flush();
  return units;
}

/** Texto enviado à IA: uma linha por unidade, com id e duração — nunca timestamps absolutos. */
export function unitsForPrompt(units: Unit[]): string {
  return units.map((u) => `[${String(u.id).padStart(3, '0')}] ${(u.end - u.start).toFixed(1)}s "${u.text}"`).join('\n');
}

export function selectionPrompt(units: Unit[], opts: SelectOptions): { system: string; user: string } {
  const system =
    'És editor de vídeos curtos virais (Reels, TikTok, Shorts). Recebes a transcrição dividida em unidades numeradas. ' +
    'Escolhe os melhores cortes e devolve APENAS JSON no formato {"clips":[{"startUnit":n,"endUnit":n,"hook":"...","score":0-10,"reason":"..."}]}. ' +
    'Nunca inventes tempos: usa só os ids das unidades. Cada corte deve começar numa frase que prenda logo (promessa, pergunta, afirmação forte) ' +
    'e terminar numa ideia completa. Os cortes não podem sobrepor-se. O "hook" é o texto de 3 a 9 palavras que aparece no ecrã nos primeiros segundos: ' +
    'curioso, concreto, sem clickbait falso e sem prometer o que o vídeo não entrega. Escreve o hook na língua do vídeo.';
  const user =
    `Escolhe até ${opts.clips} cortes, cada um com ${opts.minSec} a ${opts.maxSec} segundos de duração somada das unidades.\n\n` +
    unitsForPrompt(units);
  return { system, user };
}

export class SelectionError extends Error {}

/**
 * Valida a resposta da IA e converte ids em tempos reais.
 * Rejeita ids inexistentes, intervalos invertidos, durações fora dos limites e sobreposições.
 * Cortes inválidos são descartados individualmente; se nenhum sobrar, lança erro.
 */
export function resolveSelection(raw: unknown, units: Unit[], opts: SelectOptions): { clips: Clip[]; dropped: string[] } {
  if (!raw || typeof raw !== 'object' || !Array.isArray((raw as { clips?: unknown }).clips)) {
    throw new SelectionError('A IA não devolveu a lista de cortes no formato esperado.');
  }
  const dropped: string[] = [];
  const accepted: Clip[] = [];
  const picks = (raw as { clips: ClipPick[] }).clips.slice(0, Math.max(opts.clips * 2, opts.clips));
  const sorted = picks
    .map((p, i) => ({ p, i }))
    .sort((a, b) => (Number(b.p?.score) || 0) - (Number(a.p?.score) || 0));
  for (const { p, i } of sorted) {
    if (accepted.length >= opts.clips) break;
    const tag = `corte ${i + 1}`;
    if (!p || !Number.isInteger(p.startUnit) || !Number.isInteger(p.endUnit)) { dropped.push(`${tag}: ids inválidos`); continue; }
    if (p.startUnit < 0 || p.endUnit >= units.length || p.endUnit < p.startUnit) { dropped.push(`${tag}: ids fora do intervalo`); continue; }
    const first = units[p.startUnit];
    const last = units[p.endUnit];
    const duration = last.end - first.start;
    if (duration < opts.minSec || duration > opts.maxSec) { dropped.push(`${tag}: duração ${duration.toFixed(1)}s fora de ${opts.minSec}-${opts.maxSec}s`); continue; }
    if (accepted.some((c) => first.start < c.end && last.end > c.start)) { dropped.push(`${tag}: sobrepõe outro corte`); continue; }
    const hook = typeof p.hook === 'string' ? p.hook.replace(/\s+/g, ' ').trim().slice(0, 90) : '';
    if (!hook) { dropped.push(`${tag}: sem gancho`); continue; }
    const words: Word[] = [];
    for (let u = p.startUnit; u <= p.endUnit; u++) words.push(...units[u].words);
    accepted.push({
      index: 0,
      start: first.start,
      end: last.end,
      hook,
      score: Math.min(10, Math.max(0, Number(p.score) || 0)),
      reason: typeof p.reason === 'string' ? p.reason.slice(0, 240) : '',
      words,
    });
  }
  if (!accepted.length) throw new SelectionError(`Nenhum corte válido. ${dropped.join('; ')}`.trim());
  accepted.sort((a, b) => a.start - b.start);
  accepted.forEach((c, i) => { c.index = i + 1; });
  return { clips: accepted, dropped };
}

// ---------------------------------------------------------------- legendas ASS

export type CaptionStyle = 'destaque' | 'limpo' | 'karaoke';

export interface AssOptions {
  width: number;
  height: number;
  style: CaptionStyle;
  /** Cor de destaque da marca em #RRGGBB. */
  accent: string;
  /** Segundos em que o gancho fica no topo. */
  hookSec: number;
  /** Palavras por bloco de legenda. */
  wordsPerLine: number;
}

export function assColor(hex: string, alpha = 0): string {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim());
  const v = m ? m[1] : 'FF2D8D';
  const r = v.slice(0, 2), g = v.slice(2, 4), b = v.slice(4, 6);
  return `&H${alpha.toString(16).toUpperCase().padStart(2, '0')}${b}${g}${r}`.toUpperCase();
}

export function assTime(sec: number): string {
  const s = Math.max(0, sec);
  const cs = Math.round(s * 100);
  const h = Math.floor(cs / 360000);
  const m = Math.floor((cs % 360000) / 6000);
  const ss = Math.floor((cs % 6000) / 100);
  const c = cs % 100;
  return `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}.${String(c).padStart(2, '0')}`;
}

/** Escapa texto para uma linha Dialogue (chavetas e quebras têm significado em ASS). */
export function assEscape(text: string): string {
  return text.replace(/\\/g, '＼').replace(/\{/g, '(').replace(/\}/g, ')').replace(/\r?\n/g, ' ');
}

/** Quebra o gancho em 2 linhas equilibradas para caber no ecrã vertical. */
export function wrapHook(hook: string, maxChars = 22): string {
  const words = hook.split(' ');
  if (hook.length <= maxChars || words.length < 3) return hook;
  let best = 1, bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' ').length;
    const b = words.slice(i).join(' ').length;
    const diff = Math.abs(a - b);
    if (diff < bestDiff) { bestDiff = diff; best = i; }
  }
  return `${words.slice(0, best).join(' ')}\\N${words.slice(best).join(' ')}`;
}

/**
 * Gera o ficheiro .ass de UM corte. Os tempos das palavras são relativos ao início do corte.
 * Estilo "destaque": a palavra falada fica na cor da marca e um pouco maior (efeito CapCut).
 */
export function buildAss(clip: Clip, opts: AssOptions): string {
  const { width, height } = opts;
  const accent = assColor(opts.accent);
  const white = '&H00FFFFFF';
  const outline = '&H00000000';
  const fontSize = Math.round(height * 0.042);
  const hookSize = Math.round(height * 0.036);
  const marginV = Math.round(height * 0.22);
  const header = [
    '[Script Info]',
    'ScriptType: v4.00+',
    `PlayResX: ${width}`,
    `PlayResY: ${height}`,
    'WrapStyle: 0',
    'ScaledBorderAndShadow: yes',
    '',
    '[V4+ Styles]',
    'Format: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding',
    `Style: Legenda,Arial,${fontSize},${white},${white},${outline},&H80000000,-1,0,0,0,100,100,0,0,1,${Math.max(3, Math.round(fontSize * 0.12))},0,2,60,60,${marginV},1`,
    `Style: Gancho,Arial,${hookSize},&H00000000,&H00000000,${accent},&H00000000,-1,0,0,0,100,100,0,0,3,${Math.round(hookSize * 0.35)},0,8,70,70,${Math.round(height * 0.1)},1`,
    '',
    '[Events]',
    'Format: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text',
  ];
  const duration = clip.end - clip.start;
  const lines: string[] = [];

  const hookEnd = Math.min(Math.max(opts.hookSec, 1), duration);
  lines.push(`Dialogue: 2,${assTime(0)},${assTime(hookEnd)},Gancho,,0,0,0,,{\\fad(120,200)}${wrapHook(assEscape(clip.hook))}`);

  const rel = clip.words.map((w) => ({
    text: assEscape(w.word),
    start: Math.max(0, w.start - clip.start),
    end: Math.min(duration, Math.max(w.end, w.start + 0.05) - clip.start),
  }));
  const per = Math.max(1, Math.min(6, Math.round(opts.wordsPerLine)));
  for (let i = 0; i < rel.length; i += per) {
    const group = rel.slice(i, i + per);
    const blockStart = group[0].start;
    const nextStart = rel[i + per]?.start;
    const blockEnd = Math.min(duration, nextStart !== undefined ? Math.min(nextStart, group[group.length - 1].end + 0.4) : group[group.length - 1].end + 0.3);
    if (opts.style === 'limpo') {
      lines.push(`Dialogue: 1,${assTime(blockStart)},${assTime(blockEnd)},Legenda,,0,0,0,,${group.map((g) => g.text.toUpperCase()).join(' ')}`);
      continue;
    }
    // destaque / karaoke: uma linha por palavra falada, com a palavra ativa em destaque.
    for (let k = 0; k < group.length; k++) {
      const start = group[k].start;
      const end = k + 1 < group.length ? group[k + 1].start : blockEnd;
      if (end <= start) continue;
      const text = group
        .map((g, idx) => (idx === k
          ? `{\\c${accent}\\fscx118\\fscy118}${g.text.toUpperCase()}{\\c${white}\\fscx100\\fscy100}`
          : g.text.toUpperCase()))
        .join(' ');
      lines.push(`Dialogue: 1,${assTime(start)},${assTime(end)},Legenda,,0,0,0,,${text}`);
    }
  }
  return `${header.join('\n')}\n${lines.join('\n')}\n`;
}

/** Caminho do filtro `subtitles` do ffmpeg: escapa \ : ' e [ ] , para funcionar em Windows. */
export function ffmpegFilterPath(p: string): string {
  return p.replace(/\\/g, '/').replace(/:/g, '\\:').replace(/'/g, "\\'").replace(/\[/g, '\\[').replace(/\]/g, '\\]').replace(/,/g, '\\,');
}

/** Filtro de vídeo: corta ao centro para 9:16, escala e queima a legenda. */
export function videoFilter(assPath: string, width = 1080, height = 1920): string {
  return `crop='min(iw,ih*${width}/${height})':'min(ih,iw*${height}/${width})',scale=${width}:${height},setsar=1,subtitles='${ffmpegFilterPath(assPath)}'`;
}

export function safeFileName(text: string, max = 40): string {
  const base = text
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase().slice(0, max);
  return base || 'corte';
}
