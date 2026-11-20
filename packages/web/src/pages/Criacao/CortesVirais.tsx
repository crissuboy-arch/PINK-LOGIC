import { useEffect, useState } from 'react';
import { Scissors, Upload, FolderOpen, Play, Loader2, AlertTriangle } from 'lucide-react';
import { useBrand } from '../../providers/BrandProvider';

/**
 * Cortes Virais — pega num vídeo longo e devolve vários cortes verticais (9:16)
 * com gancho no topo e legenda palavra a palavra.
 *
 * O processamento (ffmpeg + transcrição + escolha dos momentos) corre no app
 * desktop: o vídeo nunca sai do computador, só o áudio é transcrito. No browser
 * esta página só explica isso; a ponte window.pinkLogicDesktop não existe lá.
 */

type Style = 'destaque' | 'limpo' | 'karaoke';
type Stage = 'audio' | 'transcricao' | 'selecao' | 'render' | 'fim';

interface Progress { stage: Stage; message: string; current?: number; total?: number }
interface ClipResult { index: number; file: string; start: number; end: number; hook: string; score: number; reason: string }
interface RunResult { outputDir: string; clips: ClipResult[]; dropped: string[]; costUsd: number; durationSec: number }

const STYLES: { id: Style; name: string; hint: string }[] = [
  { id: 'destaque', name: 'Destaque', hint: 'A palavra falada acende na cor da marca' },
  { id: 'limpo', name: 'Limpo', hint: 'Blocos de 3 palavras, sem efeitos' },
  { id: 'karaoke', name: 'Karaokê', hint: 'Igual ao destaque, ritmo palavra a palavra' },
];

const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const fmtMb = (b: number) => `${(b / 1024 / 1024).toFixed(1)} MB`;

const card = { padding: '1.5rem', background: 'rgba(17, 17, 24, 0.4)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)' } as const;

export default function CortesVirais() {
  const { activeBrand } = useBrand();
  const desktop = typeof window !== 'undefined' ? window.pinkLogicDesktop : undefined;

  const [ffmpegOk, setFfmpegOk] = useState<boolean | null>(null);
  const [video, setVideo] = useState<{ name: string; sizeBytes: number } | null>(null);
  const [clips, setClips] = useState(4);
  const [minSec, setMinSec] = useState(20);
  const [maxSec, setMaxSec] = useState(60);
  const [style, setStyle] = useState<Style>('destaque');
  const [accent, setAccent] = useState(activeBrand?.palette.primary || '#FF2D8D');
  const [language, setLanguage] = useState('');
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [result, setResult] = useState<RunResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!desktop?.cortesFfmpegStatus) return;
    void desktop.cortesFfmpegStatus().then((s) => setFfmpegOk(s.found)).catch(() => setFfmpegOk(false));
    return desktop.onCortesProgress?.((p) => setProgress(p));
  }, [desktop]);

  if (!desktop?.cortesRun) {
    return (
      <div style={{ padding: '2rem', maxWidth: '760px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h1 className="neon-text" style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>Cortes Virais</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
            Transforma um vídeo longo em vários cortes verticais com ganchos e legendas.
          </p>
        </div>
        <div className="card" style={card}>
          <p style={{ margin: 0, lineHeight: 1.6 }}>
            Esta ferramenta corre na <strong>app Pink Logic para Windows</strong>. O corte e a legenda são feitos no teu
            computador, por isso o vídeo não é enviado para lado nenhum e não há limite de tamanho do servidor.
            Abre o Pink Logic instalado para a usar.
          </p>
        </div>
      </div>
    );
  }

  const api = desktop as Required<NonNullable<typeof desktop>>;

  const pick = async () => {
    setError(null);
    const r = await api.cortesPickVideo();
    if (!r.canceled) { setVideo({ name: r.name, sizeBytes: r.sizeBytes }); setResult(null); setProgress(null); }
  };

  const run = async () => {
    setError(null); setResult(null); setRunning(true); setProgress({ stage: 'audio', message: 'A começar…' });
    try {
      setResult(await api.cortesRun({ clips, minSec, maxSec, style, accent, language: language || undefined }));
    } catch (e) {
      setError(e instanceof Error ? e.message.replace(/^Error invoking remote method '[^']+': (Error: )?/, '') : String(e));
    } finally {
      setRunning(false);
    }
  };

  const pct = progress?.stage === 'render' && progress.total
    ? 60 + Math.round(((progress.current ?? 0) / progress.total) * 40)
    : { audio: 8, transcricao: 25, selecao: 50, render: 60, fim: 100 }[progress?.stage ?? 'audio'];

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <style>{'@keyframes pl-spin{to{transform:rotate(360deg)}}'}</style>
      <div>
        <h1 className="neon-text" style={{ margin: 0, fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Scissors size={28} /> Cortes Virais
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
          Sobe um vídeo e recebe vários cortes verticais (9:16) com gancho no topo e legenda palavra a palavra.
        </p>
      </div>

      {ffmpegOk === false && (
        <div className="card" style={{ ...card, borderColor: 'rgba(255,170,0,0.4)', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
          <span style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
            Não encontrei o <strong>ffmpeg</strong> neste computador. Instala-o (<code>winget install Gyan.FFmpeg</code>) ou coloca o
            <code> ffmpeg.exe </code> na pasta «bin» dos dados da app, e volta a abrir esta página.
          </span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '2rem', alignItems: 'start' }}>
        <div className="card" style={{ ...card, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#A1A1B5', marginBottom: '8px', display: 'block' }}>Vídeo</label>
            <button className="btn-secondary" onClick={pick} disabled={running} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center', height: '44px' }}>
              <Upload size={16} /> {video ? 'Trocar vídeo' : 'Escolher vídeo'}
            </button>
            {video && <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{video.name} · {fmtMb(video.sizeBytes)}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Nº de cortes</label>
              <input type="number" min={1} max={8} className="input-field" value={clips} onChange={(e) => setClips(Number(e.target.value))} disabled={running} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Mín. (s)</label>
              <input type="number" min={8} max={110} className="input-field" value={minSec} onChange={(e) => setMinSec(Number(e.target.value))} disabled={running} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Máx. (s)</label>
              <input type="number" min={10} max={120} className="input-field" value={maxSec} onChange={(e) => setMaxSec(Number(e.target.value))} disabled={running} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: '#A1A1B5', marginBottom: '8px', display: 'block' }}>Estilo da legenda</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {STYLES.map((s) => (
                <button
                  key={s.id}
                  title={s.hint}
                  disabled={running}
                  onClick={() => setStyle(s.id)}
                  className={`btn-secondary ${style === s.id ? 'active' : ''}`}
                  style={{
                    fontSize: '0.78rem', height: '36px',
                    borderColor: style === s.id ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                    background: style === s.id ? 'rgba(255, 47, 191, 0.08)' : 'none',
                  }}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Cor de destaque</label>
              <input type="color" className="input-field" value={/^#[0-9a-fA-F]{6}$/.test(accent) ? accent : '#FF2D8D'} onChange={(e) => setAccent(e.target.value)} disabled={running} style={{ height: '40px', padding: '2px' }} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Idioma da fala</label>
              <select className="input-field" value={language} onChange={(e) => setLanguage(e.target.value)} disabled={running}>
                <option value="">Detetar sozinho</option>
                <option value="pt">Português</option>
                <option value="en">Inglês</option>
                <option value="es">Espanhol</option>
                <option value="fr">Francês</option>
              </select>
            </div>
          </div>

          <button className="btn-primary w-full" onClick={run} disabled={running || !video || ffmpegOk === false} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', height: '46px' }}>
            {running ? <Loader2 size={16} style={{ animation: 'pl-spin 1s linear infinite' }} /> : <Scissors size={16} />}
            {running ? 'A gerar…' : 'Gerar cortes'}
          </button>

          <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Usa a tua chave OpenAI (modo API ligado nas definições de IA): a transcrição custa cerca de $0,006 por minuto de vídeo e a
            escolha dos cortes alguns cêntimos. O gasto conta para o teu limite mensal.
          </p>
        </div>

        <div className="card" style={{ ...card, display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '260px' }}>
          {!running && !result && !error && (
            <p style={{ margin: 'auto', color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center' }}>
              Os cortes aparecem aqui, com o gancho que a IA escolheu para cada um.
            </p>
          )}

          {running && progress && (
            <div>
              <p style={{ margin: '0 0 10px', fontSize: '0.9rem' }}>{progress.message}</p>
              <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: 'var(--primary)', transition: 'width .4s' }} />
              </div>
            </div>
          )}

          {error && (
            <div role="alert" style={{ color: '#ff8a8a', fontSize: '0.88rem', lineHeight: 1.5 }}>
              <strong>Não foi possível gerar os cortes.</strong>
              <div style={{ marginTop: '6px' }}>{error}</div>
            </div>
          )}

          {result && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                <strong>{result.clips.length} cortes prontos</strong>
                <button className="btn-secondary" onClick={() => void api.cortesReveal(result.outputDir)} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', height: '32px' }}>
                  <FolderOpen size={14} /> Abrir pasta
                </button>
              </div>
              {result.clips.map((c) => (
                <div key={c.index} style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                    <strong style={{ fontSize: '0.92rem' }}>{c.index}. {c.hook}</strong>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {fmtTime(c.start)}–{fmtTime(c.end)} · nota {c.score}/10
                    </span>
                  </div>
                  {c.reason && <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{c.reason}</span>}
                  <button className="btn-secondary" onClick={() => void api.cortesOpen(c.file)} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', height: '30px' }}>
                    <Play size={13} /> Ver corte
                  </button>
                </div>
              ))}
              {result.dropped.length > 0 && (
                <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                  A IA propôs {result.dropped.length} corte(s) que não cumpriam as regras (duração, sobreposição) e foram ignorados.
                </p>
              )}
              <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Custo desta execução: ~${result.costUsd.toFixed(3)}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
