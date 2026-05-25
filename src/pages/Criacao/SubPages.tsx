import { useState, useRef, useEffect } from 'react';
import { 
  Smartphone, 
  FileText, 
  Palette, 
  Eye, 
  Sticker, 
  Copy as CopyIcon, 
  Zap,
  Image as ImageIcon,
  Download,
  Type,
  Trash2,
  Upload,
  Plus
} from 'lucide-react';
import { mockCopy } from '../../ai/mockGenerators';

const SubPageWrapper = ({ title, icon: Icon, children }: any) => (
  <div className="sub-page">
    <header className="page-header">
      <div className="title-group">
        <div className="icon-badge"><Icon size={24} /></div>
        <div>
          <h1 className="brand-font">{title}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Ferramenta especializada de criação</p>
        </div>
      </div>
    </header>
    {children}
    <style>{`
      .sub-page { display: flex; flex-direction: column; gap: 2rem; }
      .icon-badge { 
        width: 48px; height: 48px; border-radius: 12px; 
        background: var(--gradient); color: white; 
        display: flex; align-items: center; justify-content: center;
      }
      .title-group { display: flex; align-items: center; gap: 1rem; }
    `}</style>
  </div>
);

export const StoryCreator = () => {
  const [storyText, setStoryText] = useState('Nova Story');
  const [textColor, setTextColor] = useState('#ffffff');
  const [bgColor, setBgColor] = useState('#FF2D8D');

  return (
    <SubPageWrapper title="Story Creator" icon={Smartphone}>
      <div className="editor-container">
        <div className="card toolbar" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 className="section-title-sm">Personalizar</h3>
          <div className="form-group">
            <label>Texto</label>
            <input type="text" className="input-field" value={storyText} onChange={e => setStoryText(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Cor do Texto</label>
            <input type="color" className="input-field" value={textColor} onChange={e => setTextColor(e.target.value)} style={{ height: 40, padding: 2 }} />
          </div>
          <div className="form-group">
            <label>Fundo</label>
            <input type="color" className="input-field" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ height: 40, padding: 2 }} />
          </div>
          <button className="btn-primary" style={{ justifyContent: 'center', marginTop: '0.5rem' }} onClick={() => {
            const canvas = document.createElement('canvas');
            canvas.width = 540; canvas.height = 960;
            const ctx = canvas.getContext('2d')!;
            ctx.fillStyle = bgColor; ctx.fillRect(0, 0, 540, 960);
            ctx.fillStyle = textColor;
            ctx.font = 'bold 48px Outfit, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const lines = storyText.split('\n');
            lines.forEach((l, i) => ctx.fillText(l, 270, 480 + (i - (lines.length-1)/2) * 70));
            const link = document.createElement('a');
            link.download = 'story.png';
            link.href = canvas.toDataURL();
            link.click();
          }}>
            <Download size={18} /> Exportar Story
          </button>
        </div>
        <div className="canvas-v-wrapper">
          <div className="canvas-v" style={{ background: bgColor, position: 'relative' }}>
            <span style={{ color: textColor, fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 800, textAlign: 'center', padding: '1rem', whiteSpace: 'pre-wrap' }}>{storyText}</span>
          </div>
        </div>
      </div>
      <style>{`
        .templates-vertical { display: flex; flex-direction: column; gap: 1rem; }
        .template-v { aspect-ratio: 9/16; background: var(--input); border-radius: 8px; border: 1px solid var(--border); }
        .canvas-v-wrapper { flex: 1; display: flex; justify-content: center; }
        .canvas-v { width: 300px; height: 533px; background: white; box-shadow: 0 0 30px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: #ccc; border-radius: 24px; overflow: hidden; }
        .editor-container { display: grid; grid-template-columns: 280px 1fr; gap: 2rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
        .form-group label { font-size: 0.8rem; color: var(--text-secondary); font-weight: 600; }
      `}</style>
    </SubPageWrapper>
  );
};

export const CopyGenerator = () => {
  const [copyInput, setCopyInput] = useState('');
  const [copy, setCopy] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  return (
    <SubPageWrapper title="Copy Generator" icon={FileText}>
      <div className="card" style={{ padding: '1.5rem' }}>
        <div className="form-group">
          <label>Sobre o que você quer escrever?</label>
          <textarea className="input-field" rows={4} placeholder="Descreva seu produto ou oferta..." value={copyInput} onChange={e => setCopyInput(e.target.value)} style={{ resize: 'none' }} />
        </div>
        <button className="btn-primary" style={{ marginTop: '1rem', justifyContent: 'center' }} disabled={isGenerating} onClick={() => {
          setIsGenerating(true);
          setTimeout(() => {
            setCopy(mockCopy(copyInput));
            setIsGenerating(false);
          }, 600 + Math.random() * 400);
        }}>
          <Zap size={18} />
          <span>{isGenerating ? 'Gerando...' : 'Gerar Copy de Alta Conversão'}</span>
        </button>
      </div>
      {copy && (
        <div className="card" style={{ padding: '1.5rem', position: 'relative' }}>
          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', lineHeight: '1.6', color: 'white' }}>{copy}</pre>
          <button className="copy-btn" onClick={() => navigator.clipboard.writeText(copy)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--input)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.4rem 0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}>
            <CopyIcon size={14} />
            <span>Copiar</span>
          </button>
        </div>
      )}
    </SubPageWrapper>
  );
};

export const LogoMaker = () => {
  const [brandName, setBrandName] = useState('Pink Logic');
  const [activeStyle, setActiveStyle] = useState('Moderno');

  return (
    <SubPageWrapper title="Logo Maker" icon={Palette}>
      <div className="card grid-2" style={{ padding: '1.5rem' }}>
        <div className="controls" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label>Nome da Marca</label>
            <input type="text" className="input-field" value={brandName} onChange={e => setBrandName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Estilo Visual</label>
            <div className="style-chips">
              {['Moderno', 'Clean', 'Minimal'].map(s => (
                <span key={s} className={`chip ${activeStyle === s ? 'active' : ''}`} onClick={() => setActiveStyle(s)}>{s}</span>
              ))}
            </div>
          </div>
          <button className="btn-primary" style={{ justifyContent: 'center' }} onClick={() => {
            const canvas = document.createElement('canvas');
            canvas.width = 800; canvas.height = 400;
            const ctx = canvas.getContext('2d')!;
            ctx.fillStyle = '#0d0d12'; ctx.fillRect(0, 0, 800, 400);
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            if (activeStyle === 'Moderno') {
              const gradient = ctx.createLinearGradient(0, 0, 800, 0);
              gradient.addColorStop(0, '#FF2D8D'); gradient.addColorStop(1, '#B026FF');
              ctx.fillStyle = gradient;
              ctx.roundRect(340, 140, 120, 120, 20); ctx.fill();
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 64px Outfit, sans-serif';
            } else if (activeStyle === 'Clean') {
              ctx.fillStyle = '#FF2D8D';
              ctx.beginPath(); ctx.arc(400, 200, 50, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = '#ffffff';
              ctx.font = '600 56px Inter, sans-serif';
            } else {
              ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4;
              ctx.roundRect(340, 140, 120, 120, 12); ctx.stroke();
              ctx.fillStyle = '#ffffff';
              ctx.font = '300 64px Roboto, sans-serif';
            }
            ctx.fillText(brandName, 400, 300);
            const link = document.createElement('a');
            link.download = 'logo.png'; link.href = canvas.toDataURL(); link.click();
          }}>
            <Download size={18} /> Exportar PNG
          </button>
        </div>
        <div className="preview-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--input)', borderRadius: 12, padding: '3rem' }}>
          {activeStyle === 'Moderno' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 50, height: 50, background: 'var(--gradient)', borderRadius: 12 }} />
              <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.8rem', letterSpacing: '2px' }}>{brandName}</span>
            </div>
          ) : activeStyle === 'Clean' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 50, height: 50, background: '#FF2D8D', borderRadius: '50%' }} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '1.6rem', letterSpacing: '1px' }}>{brandName}</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 50, height: 50, borderRadius: 12, border: '3px solid white' }} />
              <span style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 300, fontSize: '1.8rem', letterSpacing: '4px', textTransform: 'uppercase' }}>{brandName}</span>
            </div>
          )}
        </div>
      </div>
      <style>{`
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
        .form-group label { font-size: 0.8rem; color: var(--text-secondary); font-weight: 600; }
        .style-chips { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
        .chip { padding: 0.4rem 1rem; border-radius: 100px; background: var(--input); border: 1px solid var(--border); font-size: 0.8rem; cursor: pointer; transition: var(--transition); }
        .chip.active { background: var(--primary); color: white; border-color: var(--primary); }
      `}</style>
    </SubPageWrapper>
  );
};

export const StrategicVision = () => {
  const [images, setImages] = useState<string[]>(() => {
    try { const saved = localStorage.getItem('pink_logic_vision'); return saved ? JSON.parse(saved) : []; }
    catch { return []; }
  });
  const [urlInput, setUrlInput] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('pink_logic_vision', JSON.stringify(images));
  }, [images]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setImages(prev => [...prev, ev.target.result as string]);
      };
      reader.readAsDataURL(f);
    });
  };

  const addUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    setImages(prev => [...prev, url]);
    setUrlInput('');
  };

  return (
    <SubPageWrapper title="Vision Board" icon={Eye}>
      <div className="card" style={{ padding: '1rem 1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <div style={{ flex: 1, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input type="text" className="input-field" placeholder="Adicionar URL de imagem..." value={urlInput} onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addUrl()} style={{ flex: 1 }} />
          <button className="btn-primary" onClick={addUrl} disabled={!urlInput.trim()} style={{ padding: '0.5rem 1rem' }}>
            <Plus size={16} /> Adicionar
          </button>
        </div>
        <button className="btn-secondary" onClick={() => fileRef.current?.click()} style={{ padding: '0.5rem 1rem', whiteSpace: 'nowrap' }}>
          <Upload size={16} /> Upload
        </button>
      </div>
      <div className="vision-grid">
        {images.map((src, i) => (
          <div key={i} className="vision-item card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
            <img src={src} alt={`Inspiração ${i+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button onClick={() => setImages(prev => prev.filter((_, j) => j !== i))} style={{ position: 'absolute', top: 6, right: 6, width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <div className="vision-item card" onClick={() => fileRef.current?.click()} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', border: '2px dashed var(--border)', aspectRatio: 1 }}>
          <ImageIcon size={32} style={{ opacity: 0.3 }} />
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Adicionar Imagem</span>
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleUpload} />
      <style>{`
        .vision-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.5rem; }
        .vision-item { aspect-ratio: 1; border-radius: var(--radius-lg); transition: 0.3s; }
        .vision-item:hover { border-color: var(--primary); }
      `}</style>
    </SubPageWrapper>
  );
};

export const StickerStudio = () => {
  const [stickerText, setStickerText] = useState('PINK');
  const [stickerBg, setStickerBg] = useState('#FF2D8D');

  return (
    <SubPageWrapper title="Sticker Studio" icon={Sticker}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label>Texto do Sticker</label>
            <input type="text" className="input-field" value={stickerText} onChange={e => setStickerText(e.target.value)} maxLength={20} />
          </div>
          <div className="form-group">
            <label>Cor de Fundo</label>
            <input type="color" className="input-field" value={stickerBg} onChange={e => setStickerBg(e.target.value)} style={{ height: 40, padding: 2 }} />
          </div>
          <button className="btn-primary" style={{ justifyContent: 'center' }} onClick={() => {
            const canvas = document.createElement('canvas');
            canvas.width = 400; canvas.height = 400;
            const ctx = canvas.getContext('2d')!;
            ctx.fillStyle = stickerBg;
            ctx.beginPath(); ctx.roundRect(20, 20, 360, 360, 40); ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 64px Outfit, sans-serif';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(stickerText, 200, 200);
            const link = document.createElement('a');
            link.download = 'sticker.png'; link.href = canvas.toDataURL(); link.click();
          }}>
            <Download size={18} /> Exportar Sticker
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <div style={{ width: 200, height: 200, background: stickerBg, borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
            <span style={{ color: 'white', fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 800 }}>{stickerText}</span>
          </div>
        </div>
      </div>
      <style>{`
        .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
        .form-group label { font-size: 0.8rem; color: var(--text-secondary); font-weight: 600; }
      `}</style>
    </SubPageWrapper>
  );
};
