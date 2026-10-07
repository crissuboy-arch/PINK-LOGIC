import { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, Download, Video, Image as ImageIcon, FileText, Palette, Shuffle } from 'lucide-react';
import { useBrand } from '../../providers/BrandProvider';

/* ───────────────────────── Configurações ───────────────────────── */

const FORMATS = [
  { id: '9:16', name: 'Reels / TikTok / Shorts', w: 1080, h: 1920 },
  { id: '1:1', name: 'Feed quadrado', w: 1080, h: 1080 },
  { id: '4:5', name: 'Feed retrato', w: 1080, h: 1350 },
  { id: '16:9', name: 'YouTube / horizontal', w: 1920, h: 1080 },
];

const STYLES = [
  { id: 'karaoke', name: 'Karaokê', emoji: '🎤' },
  { id: 'pop', name: 'Pop (estilo viral)', emoji: '💥' },
  { id: 'typewriter', name: 'Máquina de escrever', emoji: '⌨️' },
  { id: 'bounce', name: 'Pulinho', emoji: '🏀' },
  { id: 'glow', name: 'Neon pulsante', emoji: '💡' },
  { id: 'shake', name: 'Tremida', emoji: '🫨' },
  { id: 'slide', name: 'Sobe e aparece', emoji: '⬆️' },
  { id: 'box', name: 'Caixa de destaque', emoji: '🟨' },
  { id: 'wave', name: 'Onda', emoji: '🌊' },
  { id: 'rainbow', name: 'Arco-íris', emoji: '🌈' },
];

// Cores: nome → hex. Cobre o círculo cromático inteiro + neutros.
const COLORS: [string, string][] = [
  ['Branco', '#FFFFFF'], ['Preto', '#000000'], ['Cinza', '#9CA3AF'], ['Vermelho', '#FF2D2D'], ['Coral', '#FF6B6B'],
  ['Laranja', '#FF8A00'], ['Âmbar', '#FFB703'], ['Amarelo', '#FFE600'], ['Lima', '#B6FF00'], ['Verde', '#16C784'],
  ['Menta', '#3DFFB5'], ['Turquesa', '#00E5D4'], ['Ciano', '#00D1FF'], ['Azul', '#2F80FF'], ['Royal', '#4B3BFF'],
  ['Violeta', '#8A4DFF'], ['Roxo', '#BF5AF2'], ['Magenta', '#FF2DDF'], ['Rosa', '#FF2D8D'], ['Pink claro', '#FF9AD5'],
  ['Pêssego', '#FFC9A8'], ['Dourado', '#E8B64C'], ['Marrom', '#8B5A2B'], ['Marinho', '#0B1F4D'],
];

const FONTS = [
  { id: 'impact', name: 'Impacto (viral)', css: 'Impact, "Arial Black", sans-serif', weight: 900 },
  { id: 'black', name: 'Arial Black', css: '"Arial Black", Arial, sans-serif', weight: 900 },
  { id: 'rounded', name: 'Arredondada', css: '"Trebuchet MS", "Segoe UI", sans-serif', weight: 800 },
  { id: 'fun', name: 'Divertida', css: '"Comic Sans MS", "Chalkboard SE", cursive', weight: 700 },
  { id: 'serif', name: 'Elegante', css: 'Georgia, "Times New Roman", serif', weight: 700 },
  { id: 'mono', name: 'Código', css: '"Courier New", monospace', weight: 700 },
];

const SAMPLE = 'Você não precisa de mais seguidores\nPrecisa de quem compra\nComece a vender hoje';

type Cfg = {
  lines: string[]; style: string; text: string; hi: string; outline: string; bgMode: string; bg1: string; bg2: string;
  bgImg: HTMLImageElement | null; font: string; size: number; speed: number; pos: string; w: number; h: number; outlineOn: boolean;
};

/* ───────────────────────── Renderização ───────────────────────── */

const easeOutBack = (x: number) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const HOLD = 0.7;

function timeline(lines: string[], wordDur: number) {
  let t = 0;
  const items = lines.map(line => {
    const words = line.trim().split(/\s+/).filter(Boolean);
    const dur = words.length * wordDur + HOLD;
    const it = { words, start: t, dur };
    t += dur; return it;
  });
  return { items, total: Math.max(t, 1) };
}

function drawFrame(ctx: CanvasRenderingContext2D, cfg: Cfg, tRaw: number) {
  const { w, h } = cfg;
  const wordDur = 0.55 / cfg.speed;
  const tl = timeline(cfg.lines, wordDur);
  const t = tRaw % tl.total;

  ctx.clearRect(0, 0, w, h);
  if (cfg.bgMode === 'solid') { ctx.fillStyle = cfg.bg1; ctx.fillRect(0, 0, w, h); }
  else if (cfg.bgMode === 'chroma') { ctx.fillStyle = '#00FF00'; ctx.fillRect(0, 0, w, h); }
  else if (cfg.bgMode === 'gradient') {
    const g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, cfg.bg1); g.addColorStop(1, cfg.bg2);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  } else if (cfg.bgMode === 'image' && cfg.bgImg) {
    const im = cfg.bgImg; const s = Math.max(w / im.width, h / im.height);
    ctx.drawImage(im, (w - im.width * s) / 2, (h - im.height * s) / 2, im.width * s, im.height * s);
  }

  const item = tl.items.find(i => t >= i.start && t < i.start + i.dur) || tl.items[0];
  if (!item || !item.words.length) return;
  const local = t - item.start;
  const active = Math.min(item.words.length - 1, Math.floor(local / wordDur));
  const wp = clamp((local - active * wordDur) / wordDur);
  const lineAlpha = clamp(local / 0.15) * clamp((item.dur - local) / 0.2);

  const f = FONTS.find(x => x.id === cfg.font) || FONTS[0];
  const base = (cfg.w >= cfg.h ? cfg.h : cfg.w) * 0.085 * cfg.size;
  ctx.font = `${f.weight} ${base}px ${f.css}`;
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.lineJoin = 'round';

  // quebra em linhas
  const gap = base * 0.28; const maxW = w * 0.84;
  const widths = item.words.map(wd => ctx.measureText(wd).width);
  const rows: number[][] = [[]]; let cur = 0;
  item.words.forEach((_, i) => {
    if (cur + widths[i] > maxW && rows[rows.length - 1].length) { rows.push([]); cur = 0; }
    rows[rows.length - 1].push(i); cur += widths[i] + gap;
  });
  const rowH = base * 1.25; const blockH = rows.length * rowH;
  const y0 = cfg.pos === 'top' ? h * 0.18 : cfg.pos === 'center' ? (h - blockH) / 2 : h * 0.72 - blockH / 2;

  rows.forEach((row, ri) => {
    const rowW = row.reduce((a, i) => a + widths[i], 0) + gap * (row.length - 1);
    let x = (w - rowW) / 2; const y = y0 + ri * rowH + rowH / 2;
    row.forEach(i => {
      const word = item.words[i]; const ww = widths[i]; const isAct = i === active;
      const progressive = ['pop', 'typewriter', 'bounce', 'slide'].includes(cfg.style);
      if (progressive && i > active) { x += ww + gap; return; }

      let scale = 1, dx = 0, dy = 0, rot = 0, alpha = lineAlpha, fill = isAct ? cfg.hi : cfg.text, shown = word, glow = 0;
      const since = local - i * wordDur;
      switch (cfg.style) {
        case 'pop': scale = 0.3 + 0.7 * easeOutBack(clamp(since / 0.28)); break;
        case 'bounce': dy = -Math.abs(Math.sin(clamp(since / 0.5) * Math.PI)) * base * 0.35 * (1 - clamp(since / 0.5)); scale = 1 + (isAct ? 0.08 : 0); break;
        case 'slide': { const p = clamp(since / 0.3); dy = (1 - p) * base * 0.8; alpha *= p; break; }
        case 'typewriter': if (isAct) shown = word.slice(0, Math.max(1, Math.ceil(wp * word.length))); fill = cfg.text; break;
        case 'glow': glow = (isAct ? 1 : 0.35) * (0.7 + 0.3 * Math.sin(t * 8)) * base * 0.55; break;
        case 'shake': if (isAct) { dx = Math.sin(t * 90) * base * 0.05; dy = Math.cos(t * 70) * base * 0.05; rot = Math.sin(t * 60) * 0.04; } break;
        case 'box': break;
        case 'rainbow': fill = `hsl(${(t * 140 + i * 45) % 360}, 95%, 62%)`; break;
        case 'wave': break;
      }

      ctx.save();
      ctx.globalAlpha = clamp(alpha);
      ctx.translate(x + ww / 2 + dx, y + dy); ctx.rotate(rot); ctx.scale(scale, scale);
      const lx = -ww / 2;

      if (cfg.style === 'box' && isAct) {
        ctx.fillStyle = cfg.hi; ctx.beginPath();
        ctx.roundRect(lx - base * 0.18, -base * 0.62, ww + base * 0.36, base * 1.24, base * 0.22); ctx.fill();
        fill = cfg.text === cfg.hi ? '#000000' : cfg.text;
      }
      if (glow) { ctx.shadowColor = cfg.hi; ctx.shadowBlur = glow; }

      const drawText = (str: string, px: number, py: number, fs: string) => {
        if (cfg.outlineOn) { ctx.lineWidth = base * 0.13; ctx.strokeStyle = cfg.outline; ctx.strokeText(str, px, py); }
        ctx.fillStyle = fs; ctx.fillText(str, px, py);
      };

      if (cfg.style === 'wave') {
        let cx = lx;
        [...word].forEach((ch, k) => {
          const cw = ctx.measureText(ch).width;
          drawText(ch, cx, Math.sin(t * 6 + (i * 4 + k) * 0.7) * base * 0.12, isAct ? cfg.hi : cfg.text);
          cx += cw;
        });
      } else drawText(shown, lx, 0, fill);
      ctx.restore();
      x += ww + gap;
    });
  });
}

const fmtSrt = (s: number) => {
  const ms = Math.round(s * 1000); const p = (n: number, l = 2) => String(n).padStart(l, '0');
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};

/* ───────────────────────── Componente ───────────────────────── */

function Swatches({ value, onChange, label }: { value: string; onChange: (c: string) => void; label: string }) {
  return (
    <div>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{label}</span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
        {COLORS.map(([n, c]) => (
          <button key={c} type="button" title={n} aria-label={`${label}: ${n}`} onClick={() => onChange(c)}
            style={{ width: 24, height: 24, borderRadius: '50%', background: c, cursor: 'pointer', padding: 0,
              border: value.toLowerCase() === c.toLowerCase() ? '3px solid var(--primary)' : '2px solid rgba(255,255,255,.25)' }} />
        ))}
        <input type="color" value={value} onChange={e => onChange(e.target.value)} aria-label={`${label} personalizada`}
          style={{ width: 30, height: 30, border: 'none', background: 'none', padding: 0, cursor: 'pointer' }} />
      </div>
    </div>
  );
}

export default function CaptionStudioPage() {
  const { activeBrand } = useBrand();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [text, setText] = useState(SAMPLE);
  const [style, setStyle] = useState('pop');
  const [fmt, setFmt] = useState('9:16');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [hiColor, setHiColor] = useState('#FFE600');
  const [outline, setOutline] = useState('#000000');
  const [outlineOn, setOutlineOn] = useState(true);
  const [bgMode, setBgMode] = useState('gradient');
  const [bg1, setBg1] = useState('#1B1035');
  const [bg2, setBg2] = useState('#FF2D8D');
  const [bgImg, setBgImg] = useState<HTMLImageElement | null>(null);
  const [font, setFont] = useState('impact');
  const [size, setSize] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [pos, setPos] = useState('bottom');
  const [playing, setPlaying] = useState(true);
  const [recording, setRecording] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const dims = FORMATS.find(f => f.id === fmt)!;
  const lines = useMemo(() => text.split('\n').map(l => l.trim()).filter(Boolean), [text]);
  const cfgRef = useRef<Cfg>(null as unknown as Cfg);
  cfgRef.current = { lines, style, text: textColor, hi: hiColor, outline, bgMode, bg1, bg2, bgImg, font, size, speed, pos, w: dims.w, h: dims.h, outlineOn };
  const clock = useRef({ t0: performance.now(), pausedAt: 0, rec: false });
  const total = useMemo(() => timeline(lines, 0.55 / speed).total, [lines, speed]);

  useEffect(() => {
    let raf = 0;
    const loop = (now: number) => {
      const c = canvasRef.current;
      if (c) {
        const ctx = c.getContext('2d');
        if (ctx) {
          const t = clock.current.pausedAt || (now - clock.current.t0) / 1000;
          drawFrame(ctx, cfgRef.current, t);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const togglePlay = () => {
    if (playing) clock.current.pausedAt = (performance.now() - clock.current.t0) / 1000 || 0.001;
    else { clock.current.t0 = performance.now() - clock.current.pausedAt * 1000; clock.current.pausedAt = 0; }
    setPlaying(!playing);
  };

  const applyBrand = () => {
    if (!activeBrand) return;
    setHiColor(activeBrand.palette.primary); setTextColor('#FFFFFF');
    setBg1(activeBrand.palette.background || '#0D0D12'); setBg2(activeBrand.palette.secondary || activeBrand.palette.primary);
    setBgMode('gradient');
  };

  const randomize = () => {
    const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
    setStyle(pick(STYLES).id); setHiColor(pick(COLORS)[1]); setFont(pick(FONTS).id);
    setBg1(pick(COLORS)[1]); setBg2(pick(COLORS)[1]); setBgMode('gradient');
  };

  const onImg = (file?: File) => {
    if (!file) return;
    const img = new Image(); img.onload = () => { setBgImg(img); setBgMode('image'); };
    img.src = URL.createObjectURL(file);
  };

  const download = (blob: Blob, name: string) => {
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  };

  const exportPng = () => {
    canvasRef.current?.toBlob(b => b && download(b, 'legenda.png'), 'image/png');
  };

  const exportSrt = () => {
    const tl = timeline(lines, 0.55 / speed);
    const out = tl.items.map((it, i) => `${i + 1}\n${fmtSrt(it.start)} --> ${fmtSrt(it.start + it.dur - HOLD * 0.3)}\n${it.words.join(' ')}\n`).join('\n');
    download(new Blob([out], { type: 'text/plain;charset=utf-8' }), 'legendas.srt');
  };

  const exportVideo = async () => {
    const c = canvasRef.current; if (!c || recording) return;
    if (typeof MediaRecorder === 'undefined') { setMsg('Este navegador não grava vídeo do canvas. Use o Chrome.'); return; }
    const types = ['video/mp4;codecs=avc1', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
    const mime = types.find(t => MediaRecorder.isTypeSupported(t)) || '';
    const ext = mime.startsWith('video/mp4') ? 'mp4' : 'webm';
    setMsg(null); setRecording(true);
    // reinicia o relógio para gravar 1 ciclo completo a partir do início
    const prevPaused = clock.current.pausedAt; clock.current.pausedAt = 0; clock.current.t0 = performance.now();
    const stream = c.captureStream(30);
    const rec = new MediaRecorder(stream, { mimeType: mime || undefined, videoBitsPerSecond: 8_000_000 });
    const chunks: BlobPart[] = [];
    rec.ondataavailable = e => e.data.size && chunks.push(e.data);
    rec.onstop = () => {
      download(new Blob(chunks, { type: mime || 'video/webm' }), `legenda-animada.${ext}`);
      setRecording(false); if (prevPaused) clock.current.pausedAt = prevPaused;
    };
    rec.start();
    setTimeout(() => rec.state !== 'inactive' && rec.stop(), total * 1000 + 150);
  };

  const label = { fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 6, display: 'block' } as const;
  const aspect = dims.w / dims.h;
  const previewH = aspect < 1 ? 560 : undefined;

  return (
    <div className="cap-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 440px) minmax(0, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
      <style>{`
        .cap-chip{ border:1px solid var(--border); background:transparent; color:var(--text-primary); border-radius:999px; padding:6px 12px; font-size:.8rem; cursor:pointer; transition:.15s; }
        .cap-chip:hover{ border-color:var(--primary); }
        .cap-chip.on{ background:var(--primary); border-color:var(--primary); color:#fff; }
        .cap-checker{ background-image: linear-gradient(45deg,#2a2a2a 25%,transparent 25%),linear-gradient(-45deg,#2a2a2a 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#2a2a2a 75%),linear-gradient(-45deg,transparent 75%,#2a2a2a 75%); background-size:20px 20px; background-position:0 0,0 10px,10px -10px,-10px 0; background-color:#1a1a1a; }
        @media (max-width: 900px){ .cap-grid{ grid-template-columns:1fr !important; } }
      `}</style>

      <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <h2 className="brand-font" style={{ fontSize: '1.6rem', margin: 0 }}>Legendas Animadas 🎬</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Legendas que se mexem, em todas as cores e formatos. Cada linha vira uma legenda.
          </p>
        </div>

        <label><span style={label}>Texto (uma legenda por linha)</span>
          <textarea className="input-field" rows={5} value={text} onChange={e => setText(e.target.value)} /></label>

        <div>
          <span style={label}>Animação</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {STYLES.map(s => <button key={s.id} type="button" className={`cap-chip ${style === s.id ? 'on' : ''}`} onClick={() => setStyle(s.id)}>{s.emoji} {s.name}</button>)}
          </div>
        </div>

        <div>
          <span style={label}>Formato</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {FORMATS.map(f => <button key={f.id} type="button" className={`cap-chip ${fmt === f.id ? 'on' : ''}`} onClick={() => setFmt(f.id)} title={f.name}>{f.id} · {f.name}</button>)}
          </div>
        </div>

        <Swatches label="Cor do texto" value={textColor} onChange={setTextColor} />
        <Swatches label="Cor de destaque" value={hiColor} onChange={setHiColor} />
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
            <input type="checkbox" checked={outlineOn} onChange={e => setOutlineOn(e.target.checked)} /> Contorno
          </label>
          <input type="color" value={outline} onChange={e => setOutline(e.target.value)} aria-label="Cor do contorno" />
          <button type="button" className="btn-secondary" onClick={applyBrand} disabled={!activeBrand} style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><Palette size={14} /> Cores da marca</button>
          <button type="button" className="btn-secondary" onClick={randomize} style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><Shuffle size={14} /> Surpreenda-me</button>
        </div>

        <div>
          <span style={label}>Fundo</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            {[['transp', 'Transparente'], ['solid', 'Cor'], ['gradient', 'Degradê'], ['chroma', 'Verde (chroma key)'], ['image', 'Imagem']].map(([id, n]) => (
              <button key={id} type="button" className={`cap-chip ${bgMode === id ? 'on' : ''}`} onClick={() => setBgMode(id)}>{n}</button>
            ))}
            {(bgMode === 'solid' || bgMode === 'gradient') && <input type="color" value={bg1} onChange={e => setBg1(e.target.value)} aria-label="Cor de fundo 1" />}
            {bgMode === 'gradient' && <input type="color" value={bg2} onChange={e => setBg2(e.target.value)} aria-label="Cor de fundo 2" />}
            {bgMode === 'image' && <input type="file" accept="image/*" onChange={e => onImg(e.target.files?.[0])} />}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <label><span style={label}>Fonte</span>
            <select className="input-field" value={font} onChange={e => setFont(e.target.value)}>{FONTS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></label>
          <label><span style={label}>Posição</span>
            <select className="input-field" value={pos} onChange={e => setPos(e.target.value)}>
              <option value="bottom">Embaixo</option><option value="center">Centro</option><option value="top">Em cima</option></select></label>
          <label><span style={label}>Tamanho {Math.round(size * 100)}%</span>
            <input type="range" min={0.6} max={1.6} step={0.05} value={size} onChange={e => setSize(Number(e.target.value))} style={{ width: '100%' }} /></label>
          <label><span style={label}>Velocidade {speed.toFixed(1)}×</span>
            <input type="range" min={0.5} max={2.5} step={0.1} value={speed} onChange={e => setSpeed(Number(e.target.value))} style={{ width: '100%' }} /></label>
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
        <div className={bgMode === 'transp' ? 'cap-checker' : ''} style={{ borderRadius: 14, overflow: 'hidden', maxWidth: '100%', lineHeight: 0 }}>
          <canvas ref={canvasRef} width={dims.w} height={dims.h}
            style={{ height: previewH, width: previewH ? undefined : '100%', maxWidth: '100%', aspectRatio: `${dims.w} / ${dims.h}`, display: 'block' }} />
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className="btn-secondary" onClick={togglePlay} style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
            {playing ? <Pause size={14} /> : <Play size={14} />} {playing ? 'Pausar' : 'Tocar'}
          </button>
          <button className="btn-primary" onClick={exportVideo} disabled={recording || !lines.length} style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
            <Video size={14} /> {recording ? `Gravando… (${total.toFixed(0)}s)` : 'Baixar vídeo'}
          </button>
          <button className="btn-secondary" onClick={exportPng} style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><ImageIcon size={14} /> PNG do quadro</button>
          <button className="btn-secondary" onClick={exportSrt} style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><FileText size={14} /> Arquivo .srt</button>
        </div>
        {msg && <div role="alert" style={{ color: 'var(--error)', fontSize: '0.85rem' }}>{msg}</div>}
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0, textAlign: 'center', maxWidth: 520 }}>
          <Download size={11} style={{ verticalAlign: -1 }} /> O vídeo é gravado em tempo real ({total.toFixed(1)} s) no formato {dims.w}×{dims.h}. Para editar no CapCut/Premiere, use o fundo
          <b> Verde (chroma key)</b> ou importe o .srt. O vídeo sai em MP4 quando o navegador suporta, senão em WebM.
        </p>
      </div>
    </div>
  );
}
