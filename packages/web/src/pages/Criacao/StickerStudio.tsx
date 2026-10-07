import { useState } from 'react';
import confetti from 'canvas-confetti';
import { Wand2, Dices, Download, Trash2, Sparkles } from 'lucide-react';
import { useBrand } from '../../providers/BrandProvider';
import { apiPost } from '../../lib/apiClient';

type Sticker = { id: string; url: string; label: string; rot: number; loaded: boolean };

const STYLES = [
  { id: 'kawaii', name: 'Kawaii', emoji: '🍡' },
  { id: 'retro', name: 'Retrô 90s', emoji: '📼' },
  { id: 'neon', name: 'Neon', emoji: '⚡' },
  { id: '3d', name: '3D brilhante', emoji: '🫧' },
  { id: 'meme', name: 'Meme', emoji: '😜' },
  { id: 'watercolor', name: 'Aquarela', emoji: '🎨' },
  { id: 'pixel', name: 'Pixel 8-bit', emoji: '👾' },
  { id: 'graffiti', name: 'Grafite', emoji: '🔥' },
];

const IDEAS = [
  'gatinho empreendedor tomando café às 6h da manhã',
  'unicórnio contando dinheiro com óculos escuros',
  'abacaxi de óculos escuros dizendo "bora"',
  'foguetinho fofo decolando com um sorriso',
  'robô simpático segurando um coração',
  'cupcake ninja super concentrado',
  'cacto motivacional com coroa dourada',
  'panda designer com tablet gráfico',
  'sol sorridente de fone de ouvido',
  'dinossauro vendedor fazendo sinal de joinha',
  'estrelinha comemorando uma venda',
  'coração com óculos escuros e pose de chefe',
];

const rand = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

export default function StickerStudioPage() {
  const { activeBrand } = useBrand();
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('kawaii');
  const [count, setCount] = useState(4);
  const [useBrandColors, setUseBrandColors] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stickers, setStickers] = useState<Sticker[]>([]);

  const generate = async (text = prompt) => {
    const clean = text.trim();
    if (!clean) { setError('Conte qual figurinha você quer — ou clique em "Surpreenda-me".'); return; }
    setLoading(true); setError(null);
    const colors = useBrandColors && activeBrand
      ? [activeBrand.palette.primary, activeBrand.palette.secondary, activeBrand.palette.accent].filter(Boolean)
      : [];
    const results = await Promise.all(
      Array.from({ length: count }, (_, i) =>
        apiPost<{ imageUrl: string }>('/api/generate', {
          module: 'sticker', prompt: clean,
          options: { style, colors, seed: Math.floor(Math.random() * 1e6) + i },
        }),
      ),
    );
    setLoading(false);
    const ok = results.filter(r => r.ok && r.data?.imageUrl);
    if (!ok.length) { setError(results[0]?.error || 'Não foi possível gerar agora.'); return; }
    setStickers(prev => [
      ...ok.map((r, i) => ({
        id: `${Date.now()}-${i}`, url: r.data!.imageUrl, label: clean,
        rot: Math.round((Math.random() * 10 - 5) * 10) / 10, loaded: false,
      })),
      ...prev,
    ]);
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.7 }, colors: colors.length ? colors : undefined });
  };

  const surprise = () => {
    const idea = rand(IDEAS);
    setPrompt(idea); setStyle(rand(STYLES).id);
    void generate(idea);
  };

  const download = async (s: Sticker) => {
    // PNG 512×512 (tamanho de figurinha do WhatsApp). Se o navegador bloquear o canvas, abre a imagem.
    try {
      const img = new Image(); img.crossOrigin = 'anonymous';
      await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej(new Error('img')); img.src = s.url; });
      const c = document.createElement('canvas'); c.width = 512; c.height = 512;
      c.getContext('2d')!.drawImage(img, 0, 0, 512, 512);
      const a = document.createElement('a'); a.href = c.toDataURL('image/png'); a.download = 'sticker.png'; a.click();
    } catch { window.open(s.url, '_blank', 'noopener'); }
  };

  const label = { fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 6, display: 'block' } as const;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 400px) minmax(0, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
      <style>{`
        @keyframes sk-wiggle { 0%,100%{transform:rotate(var(--r)) scale(1)} 25%{transform:rotate(calc(var(--r) - 4deg)) scale(1.06)} 75%{transform:rotate(calc(var(--r) + 4deg)) scale(1.06)} }
        @keyframes sk-pop { from{opacity:0; transform:scale(.6) rotate(var(--r))} to{opacity:1; transform:scale(1) rotate(var(--r))} }
        .sk-card{ --r:0deg; transform:rotate(var(--r)); animation:sk-pop .35s cubic-bezier(.2,1.4,.4,1) both; cursor:pointer; }
        .sk-card:hover{ animation:sk-wiggle .5s ease; }
        .sk-img{ filter: drop-shadow(0 0 0 #fff) drop-shadow(0 4px 10px rgba(0,0,0,.45)); border-radius:22px; background:#fff; }
        .sk-chip{ border:1px solid var(--border); background:transparent; color:var(--text-primary); border-radius:999px; padding:6px 12px; font-size:.8rem; cursor:pointer; transition:.15s; }
        .sk-chip:hover{ border-color:var(--primary); }
        .sk-chip.on{ background:var(--primary); border-color:var(--primary); color:#fff; transform:scale(1.05); }
        @media (max-width: 900px){ .sk-grid{ grid-template-columns:1fr !important; } }
      `}</style>

      <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <h2 className="brand-font" style={{ fontSize: '1.6rem', margin: 0 }}>Estúdio de Stickers ✨</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Figurinhas divertidas para Stories, WhatsApp e embalagens{activeBrand ? ` — marca: ${activeBrand.name}` : ''}.
          </p>
        </div>

        <label><span style={label}>O que a figurinha mostra?</span>
          <textarea className="input-field" rows={3} value={prompt} onChange={e => setPrompt(e.target.value)}
            placeholder="Ex.: gatinho empreendedor tomando café às 6h da manhã" /></label>

        <div>
          <span style={label}>Estilo</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {STYLES.map(s => (
              <button key={s.id} type="button" className={`sk-chip ${style === s.id ? 'on' : ''}`} onClick={() => setStyle(s.id)}>
                {s.emoji} {s.name}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
            Quantas?
            <select className="input-field" style={{ width: 80 }} value={count} onChange={e => setCount(Number(e.target.value))}>
              {[1, 2, 4, 6, 8].map(n => <option key={n}>{n}</option>)}
            </select>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
            <input type="checkbox" checked={useBrandColors} onChange={e => setUseBrandColors(e.target.checked)} /> Usar cores da marca
          </label>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-primary" disabled={loading} onClick={() => generate()} style={{ flex: 1, display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
            <Wand2 size={16} /> {loading ? 'Criando mágica…' : 'Criar figurinhas'}
          </button>
          <button className="btn-secondary" disabled={loading} onClick={surprise} title="Ideia e estilo aleatórios" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <Dices size={16} /> Surpreenda-me
          </button>
        </div>
        {error && <div role="alert" style={{ color: 'var(--error)', fontSize: '0.85rem' }}>{error}</div>}
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
          Dica: descreva personagem + ação + clima. O download sai em PNG 512×512 (tamanho de figurinha do WhatsApp).
        </p>
      </div>

      <div className="card sk-grid" style={{ padding: '1.5rem', minHeight: 320 }}>
        {!stickers.length && !loading && (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem 0' }}>
            <Sparkles size={36} style={{ color: 'var(--primary)' }} />
            <p>Suas figurinhas aparecem aqui. Clique em <b>Surpreenda-me</b> para começar.</p>
          </div>
        )}
        {loading && <p style={{ color: 'var(--text-secondary)' }}>Desenhando {count} figurinha(s)… pode levar alguns segundos.</p>}
        {!!stickers.length && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{stickers.length} figurinha(s) — clique para baixar</span>
              <button className="btn-ghost" onClick={() => setStickers([])} style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><Trash2 size={14} /> Limpar</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 18 }}>
              {stickers.map(s => (
                <div key={s.id} className="sk-card" style={{ ['--r' as string]: `${s.rot}deg` }} onClick={() => download(s)} title="Clique para baixar (PNG 512×512)">
                  <div style={{ position: 'relative', aspectRatio: '1 / 1' }}>
                    {!s.loaded && <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: 28 }}>🎨</div>}
                    <img className="sk-img" src={s.url} alt={s.label} loading="lazy" crossOrigin="anonymous"
                      onLoad={() => setStickers(prev => prev.map(x => x.id === s.id ? { ...x, loaded: true } : x))}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: s.loaded ? 1 : 0, transition: 'opacity .3s' }} />
                    <span style={{ position: 'absolute', right: 8, bottom: 8, background: 'rgba(0,0,0,.65)', borderRadius: 999, padding: 6, display: 'flex' }}><Download size={14} color="#fff" /></span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
