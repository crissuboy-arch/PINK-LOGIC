import { useMemo, useState } from 'react';
import { Copy, Check, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useBrand } from '../../providers/BrandProvider';
import { apiPost } from '../../lib/apiClient';

type CopyResponse = {
  text: string;
  metadata: { provider: string; check: 'passed' | 'failed'; violations: string[]; regenerated: boolean };
};

const FORMATS = ['Legenda de post', 'Headline', 'Roteiro de Reels', 'Anúncio Meta', 'E-mail', 'WhatsApp', 'Carrossel (texto dos slides)'];
const OBJECTIVES = ['Vender', 'Captar lead', 'Engajar', 'Educar'];
const FRAMEWORKS = ['AIDA com PAS', 'PAS', 'BAB', '4Ps', 'Storytelling'];
const LANGS = ['PT-BR', 'PT-PT', 'EN', 'ES', 'FR'];

// Limites de caracteres por rede (referência de mercado; confirmar na plataforma).
const LIMITS = [
  { name: 'Instagram (legenda)', max: 2200 },
  { name: 'Meta Ads (texto principal, visível ≈125)', max: 125 },
  { name: 'X / Twitter', max: 280 },
  { name: 'LinkedIn', max: 3000 },
];

export default function CopyGeneratorPage() {
  const { activeBrand } = useBrand();
  const [prompt, setPrompt] = useState('');
  const [audience, setAudience] = useState('');
  const [pain, setPain] = useState('');
  const [desire, setDesire] = useState('');
  const [objection, setObjection] = useState('');
  const [format, setFormat] = useState(FORMATS[0]);
  const [objective, setObjective] = useState(OBJECTIVES[0]);
  const [framework, setFramework] = useState(FRAMEWORKS[0]);
  const [language, setLanguage] = useState(LANGS[0]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CopyResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const chars = useMemo(() => (result?.text || '').length, [result]);

  const generate = async () => {
    if (!prompt.trim()) { setError('Descreva o produto ou o tema da peça.'); return; }
    setLoading(true); setError(null); setResult(null);
    const r = await apiPost<CopyResponse>('/api/generate', {
      module: 'copy',
      prompt: prompt.trim(),
      options: {
        brand: activeBrand ? `${activeBrand.name} — tom: ${activeBrand.tone || 'a definir'}` : undefined,
        audience, pain, desire, objection, objective, format, framework, language,
      },
    });
    setLoading(false);
    if (!r.ok) { setError(r.error || 'Falha ao gerar.'); return; }
    setResult(r.data!);
  };

  const copyText = async () => {
    if (!result) return;
    try { await navigator.clipboard.writeText(result.text); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* sem permissão */ }
  };

  const label = { fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4, display: 'block' } as const;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 420px) minmax(0, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
      <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        <div>
          <h2 className="brand-font" style={{ fontSize: '1.6rem', margin: 0 }}>Gerador de Copy</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Texto que toca na dor real do público{activeBrand ? ` — marca ativa: ${activeBrand.name}` : ''}.
          </p>
        </div>

        <label><span style={label}>Produto / tema *</span>
          <textarea className="input-field" rows={3} value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Ex.: Ebook de receitas fit para quem não tem tempo de cozinhar" /></label>
        <label><span style={label}>Público</span>
          <input className="input-field" value={audience} onChange={e => setAudience(e.target.value)} placeholder="Ex.: mulheres 30–45, trabalham fora, sem tempo" /></label>
        <label><span style={label}>Dor principal</span>
          <input className="input-field" value={pain} onChange={e => setPain(e.target.value)} placeholder="Ex.: chega em casa exausta e pede delivery de novo" /></label>
        <label><span style={label}>Desejo principal</span>
          <input className="input-field" value={desire} onChange={e => setDesire(e.target.value)} placeholder="Ex.: comer bem sem passar a noite na cozinha" /></label>
        <label><span style={label}>Objeção principal</span>
          <input className="input-field" value={objection} onChange={e => setObjection(e.target.value)} placeholder="Ex.: já tentei outras dietas e desisti" /></label>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <label><span style={label}>Formato</span>
            <select className="input-field" value={format} onChange={e => setFormat(e.target.value)}>{FORMATS.map(f => <option key={f}>{f}</option>)}</select></label>
          <label><span style={label}>Objetivo</span>
            <select className="input-field" value={objective} onChange={e => setObjective(e.target.value)}>{OBJECTIVES.map(f => <option key={f}>{f}</option>)}</select></label>
          <label><span style={label}>Framework</span>
            <select className="input-field" value={framework} onChange={e => setFramework(e.target.value)}>{FRAMEWORKS.map(f => <option key={f}>{f}</option>)}</select></label>
          <label><span style={label}>Idioma</span>
            <select className="input-field" value={language} onChange={e => setLanguage(e.target.value)}>{LANGS.map(f => <option key={f}>{f}</option>)}</select></label>
        </div>

        <button className="btn-primary" onClick={generate} disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Sparkles size={16} /> {loading ? 'A gerar…' : 'Gerar copy'}
        </button>
        {error && (
          <div role="alert" style={{ display: 'flex', gap: 8, color: 'var(--error)', fontSize: '0.85rem' }}>
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} /> <span>{error}</span>
          </div>
        )}
      </div>

      <div className="card" style={{ padding: '1.5rem', minHeight: 320 }}>
        {!result && !loading && (
          <p style={{ color: 'var(--text-secondary)' }}>O resultado aparece aqui. Quanto mais específicas a dor e a objeção, melhor a copy.</p>
        )}
        {loading && <p style={{ color: 'var(--text-secondary)' }}>A escrever e a verificar contra a lista de bloqueio…</p>}
        {result && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 12, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: result.metadata.check === 'passed' ? 'var(--success)' : 'var(--warning)' }}>
                <ShieldCheck size={14} />
                {result.metadata.check === 'passed' ? 'Passou na checagem anti-IA' : `Revisar: ${result.metadata.violations.join('; ')}`}
                {result.metadata.regenerated ? ' (reescrita 1×)' : ''}
              </span>
              <button className="btn-secondary" onClick={copyText} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.65, fontSize: '0.95rem' }}>{result.text}</div>
            <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {chars} caracteres · {LIMITS.map(l => `${l.name}: ${chars <= l.max ? 'cabe' : `excede ${chars - l.max}`}`).join(' · ')}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
