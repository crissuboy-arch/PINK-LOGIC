import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Sparkles, 
  Eye, 
  Layout, 
  RefreshCw, 
  Image as ImageIcon,
  CreditCard,
  Shirt,
  Store,
  User,
  Box
} from 'lucide-react';
import { useBrand } from '../../providers/BrandProvider';
import { useCentralStore } from '../../store/CentralStore';

type LogoStyle = 'Minimalista' | 'Luxo' | 'Corporativo' | 'Futurista' | 'Industrial' | 'Feminino' | 'Tech' | 'Premium Dark' | 'Neon' | 'Clean';

const LogoStudioIA: React.FC = () => {
  const { activeBrand, updateBrand } = useBrand();
  const { activeProjectId } = useCentralStore();

  const [brandName, setBrandName] = useState(activeBrand?.name || 'PinkLogic');
  const [slogan, setSlogan] = useState(activeBrand?.tone || 'LOGIC OF CREATION');
  const [logoStyle, setLogoStyle] = useState<LogoStyle>('Luxo');
  const [symbolPrompt, setSymbolPrompt] = useState('Mascote leão minimalista geométrico moderno, dourado e preto');
  const [primaryColor, setPrimaryColor] = useState(activeBrand?.palette.primary || '#FF2D8D');
  const [secondaryColor, setSecondaryColor] = useState(activeBrand?.palette.secondary || '#7B4DFF');
  const [layout, setLayout] = useState<'vertical' | 'horizontal' | 'icon-only'>('vertical');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [aiGraphicUrl, setAiGraphicUrl] = useState<string | null>(null);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  
  const [previewMock, setPreviewMock] = useState<'card' | 'storefront' | 'uniform' | 'profile' | 'box'>('card');

  // Load from active brand
  useEffect(() => {
    if (activeBrand) {
      setBrandName(activeBrand.name);
      setPrimaryColor(activeBrand.palette.primary);
      setSecondaryColor(activeBrand.palette.secondary);
      if (activeBrand.tone) setSlogan(activeBrand.tone);

      const isAutoBrand = localStorage.getItem('pink_logic_auto_brand') === 'true';
      if (isAutoBrand) {
        const aesthetic = activeBrand.brandDNA?.aesthetic || activeBrand.visualStyle || '';
        if (aesthetic === 'feminine' || aesthetic === 'feminina') {
          setLogoStyle('Feminino');
          setSymbolPrompt('Flor delicada ou borboleta elegante, linhas minimalistas finas');
        } else if (aesthetic === 'dark luxury') {
          setLogoStyle('Luxo');
          setSymbolPrompt('Monograma elegante ou brasão real, dourado e preto');
        } else if (aesthetic === 'clean') {
          setLogoStyle('Clean');
          setSymbolPrompt('Símbolo geométrico orgânico, minimalista e limpo');
        } else if (aesthetic === 'sophisticated') {
          setLogoStyle('Minimalista');
          setSymbolPrompt('Símbolo corporativo moderno e sofisticado, linhas limpas');
        } else if (aesthetic === 'premium') {
          setLogoStyle('Futurista');
          setSymbolPrompt('Emblema tech neon de alto brilho');
        }
      }
    }
  }, [activeBrand]);

  const handleGenerateAIGraphic = () => {
    setIsGenerating(true);
    
    // Construct rich style prompts
    let styleInstruction = '';
    if (logoStyle === 'Minimalista') styleInstruction = 'flat vector logo icon, geometric, clean line art, white background';
    else if (logoStyle === 'Luxo') styleInstruction = 'luxury premium vector brand emblem, elegant gold accents, royal monogram, solid dark background';
    else if (logoStyle === 'Corporativo') styleInstruction = 'corporate business identity icon, tech emblem, solid blue gradients, white background';
    else if (logoStyle === 'Futurista') styleInstruction = 'futuristic neon brand logo symbol, glowing synthwave cyber graphic, black background';
    else if (logoStyle === 'Industrial') styleInstruction = 'grunge industrial machinery stamp, metallic steel texture, rustic vector icon';
    else if (logoStyle === 'Feminino') styleInstruction = 'soft feminine pastel vector floral emblem, rose gold delicate illustration, clean beauty style';
    else if (logoStyle === 'Tech') styleInstruction = 'abstract technology microchip nodes vector icon, digital cyber graphic, white background';
    else if (logoStyle === 'Premium Dark') styleInstruction = 'sleek obsidian black dark design brand mark, carbon fiber texture vector badge';
    else if (logoStyle === 'Neon') styleInstruction = 'cyberpunk neon glowing wireframe sign vector icon, bright pink and cyan, dark background';
    else if (logoStyle === 'Clean') styleInstruction = 'organic clean minimalist design logo vector symbol, eco friendly green, clean white background';

    const fullPrompt = `${symbolPrompt}, ${styleInstruction}, logo design, graphic vector graphic, centered, high resolution, no text, no words`;
    const aiUrl = `https://image.pollinations.ai/p/${encodeURIComponent(fullPrompt)}?width=512&height=512&seed=${Math.floor(Math.random() * 1000000)}&nologo=true`;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = aiUrl;
    img.onload = () => {
      setAiGraphicUrl(aiUrl);
      setIsGenerating(false);
      // Automatically rebuild canvas base64 logo once graphic loads
      setTimeout(() => buildFinalLogo(aiUrl), 100);
    };
    img.onerror = () => {
      alert('Erro ao contatar servidor de IA. Usando fallback de símbolo local.');
      setIsGenerating(false);
    };
  };

  const buildFinalLogo = (graphicSrc?: string | null, transparent = false): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 600;
      const ctx = canvas.getContext('2d')!;

      // Background
      if (!transparent) {
        ctx.fillStyle = logoStyle === 'Premium Dark' || logoStyle === 'Luxo' ? '#07070A' : '#0B0B12';
        ctx.fillRect(0, 0, 600, 600);
      }

      const drawTextAndLayout = () => {
        // Draw Texts
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        let headingFont = 'bold 54px Outfit, sans-serif';
        if (logoStyle === 'Minimalista' || logoStyle === 'Clean') headingFont = '300 54px Roboto, sans-serif';
        else if (logoStyle === 'Luxo') headingFont = 'bold 52px Playfair Display, serif';
        else if (logoStyle === 'Futurista' || logoStyle === 'Neon') {
          headingFont = '900 54px Anton, sans-serif';
          ctx.shadowColor = primaryColor;
          ctx.shadowBlur = 12;
        }

        if (layout === 'vertical') {
          ctx.font = headingFont;
          ctx.fillText(brandName, 300, 420);
          
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#A1A1B5';
          ctx.font = '500 16px Inter, sans-serif';
          ctx.letterSpacing = '6px';
          ctx.fillText(slogan.toUpperCase(), 300, 480);
        } else if (layout === 'horizontal') {
          ctx.textAlign = 'left';
          ctx.font = headingFont;
          ctx.fillText(brandName, 260, 270);
          
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#A1A1B5';
          ctx.font = '500 14px Inter, sans-serif';
          ctx.letterSpacing = '5px';
          ctx.fillText(slogan.toUpperCase(), 260, 320);
        }

        const dataUrl = canvas.toDataURL('image/png');
        if (!transparent) setLogoBase64(dataUrl);
        resolve(dataUrl);
      };

      const activeGraphic = graphicSrc || aiGraphicUrl;
      if (activeGraphic) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            if (layout === 'vertical') {
              ctx.drawImage(img, 200, 100, 200, 200);
            } else if (layout === 'horizontal') {
              ctx.drawImage(img, 40, 200, 180, 180);
            } else {
              // Icon Only
              ctx.drawImage(img, 150, 150, 300, 300);
            }
          } catch (e) {
            console.error(e);
          }
          drawTextAndLayout();
        };
        img.onerror = () => {
          drawFallbackSymbol(ctx);
          drawTextAndLayout();
        };
        img.src = activeGraphic;
      } else {
        drawFallbackSymbol(ctx);
        drawTextAndLayout();
      }
    });
  };

  const drawFallbackSymbol = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    const grad = ctx.createLinearGradient(200, 200, 400, 400);
    grad.addColorStop(0, primaryColor);
    grad.addColorStop(1, secondaryColor);
    ctx.fillStyle = grad;
    
    // Draw abstract geometric crown/shapes as fallback
    ctx.beginPath();
    if (layout === 'vertical') {
      ctx.arc(300, 220, 70, 0, Math.PI * 2);
    } else if (layout === 'horizontal') {
      ctx.arc(130, 300, 60, 0, Math.PI * 2);
    } else {
      ctx.arc(300, 300, 120, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.restore();
  };

  const handleExportPNG = async () => {
    const b64 = await buildFinalLogo(aiGraphicUrl, false);
    const filename = `logo-${brandName.toLowerCase().replace(/\s+/g, '-')}.png`;
    const link = document.createElement('a');
    link.download = filename;
    link.href = b64;
    link.click();
  };

  const handleExportSVG = async () => {
    // Generate clean vector wrapper file
    const svgContent = `<svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="600" height="600" fill="${logoStyle === 'Premium Dark' ? '#07070A' : '#0B0B12'}"/>
      <image href="${aiGraphicUrl || ''}" x="${layout === 'vertical' ? 200 : 40}" y="${layout === 'vertical' ? 100 : 200}" width="${layout === 'vertical' ? 200 : 180}" height="${layout === 'vertical' ? 200 : 180}"/>
      <text x="${layout === 'vertical' ? 300 : 260}" y="${layout === 'vertical' ? 420 : 270}" fill="white" font-family="Outfit, sans-serif" font-size="54" font-weight="bold" text-anchor="${layout === 'vertical' ? 'middle' : 'start'}">${brandName}</text>
      <text x="${layout === 'vertical' ? 300 : 260}" y="${layout === 'vertical' ? 480 : 320}" fill="#A1A1B5" font-family="Inter, sans-serif" font-size="16" letter-spacing="5" text-anchor="${layout === 'vertical' ? 'middle' : 'start'}">${slogan.toUpperCase()}</text>
    </svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const link = document.createElement('a');
    link.download = `logo-${brandName.toLowerCase().replace(/\s+/g, '-')}.svg`;
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const handleApplyToBrandKit = async () => {
    if (!activeBrand) return;
    setIsApplying(true);
    try {
      const transparentLogoB64 = await buildFinalLogo(aiGraphicUrl, true);
      updateBrand(activeBrand.id, { logo: transparentLogoB64 });
      alert('Logo aplicada com sucesso ao Brand Kit ativo!');
    } catch (e) {
      console.error(e);
    } finally {
      setIsApplying(false);
    }
  };

  // Re-run canvas build whenever style/colors/layout change
  useEffect(() => {
    buildFinalLogo();
  }, [brandName, slogan, logoStyle, layout, primaryColor, secondaryColor]);

  return (
    <div className="brandkit-pro-container" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Header section */}
      <div>
        <h1 className="neon-text" style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>Logo Studio IA</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>Crie logotipos vetoriais icônicos e exclusivos a partir de inteligência artificial</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left control card */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'rgba(17, 17, 24, 0.4)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} style={{ color: 'var(--primary)' }} />
            <span>Estúdio de Criação</span>
          </h3>

          <div className="form-group">
            <label>Nome do Logotipo</label>
            <input type="text" className="input-field" value={brandName} onChange={e => setBrandName(e.target.value)} maxLength={20} />
          </div>

          <div className="form-group">
            <label>Slogan de Apoio</label>
            <input type="text" className="input-field" value={slogan} onChange={e => setSlogan(e.target.value)} maxLength={30} />
          </div>

          <div className="form-group">
            <label>Estilo do Design</label>
            <select 
              className="input-field" 
              value={logoStyle} 
              onChange={e => setLogoStyle(e.target.value as LogoStyle)}
            >
              <option value="Minimalista">Minimalista</option>
              <option value="Luxo">Luxo & Monograma</option>
              <option value="Corporativo">Corporativo Clean</option>
              <option value="Futurista">Futurista (Neon)</option>
              <option value="Industrial">Industrial Bruto</option>
              <option value="Feminino">Feminino / Floral</option>
              <option value="Tech">Tech Microchip</option>
              <option value="Premium Dark">Sleek Premium Dark</option>
              <option value="Neon">Cyberpunk Glow</option>
              <option value="Clean">Ecológico / Clean</option>
            </select>
          </div>

          <div className="form-group">
            <label>Prompt do Símbolo Visual</label>
            <textarea 
              className="input-field" 
              style={{ minHeight: '60px', fontSize: '0.78rem' }}
              value={symbolPrompt}
              onChange={e => setSymbolPrompt(e.target.value)}
              placeholder="Descreva o mascote ou símbolo geométrico que a IA deve gerar..."
            />
          </div>

          <div className="form-row-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label>Orientação</label>
              <select className="input-field" value={layout} onChange={e => setLayout(e.target.value as any)}>
                <option value="vertical">Vertical</option>
                <option value="horizontal">Horizontal</option>
                <option value="icon-only">Apenas Símbolo</option>
              </select>
            </div>
            <div className="form-group">
              <label>Paleta Destaque</label>
              <div style={{ display: 'flex', gap: '4px' }}>
                <input type="color" className="input-field" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} style={{ padding: '2px', cursor: 'pointer', height: '34px' }} />
                <input type="color" className="input-field" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} style={{ padding: '2px', cursor: 'pointer', height: '34px' }} />
              </div>
            </div>
          </div>

          <button 
            className="btn-primary w-full" 
            style={{ justifyContent: 'center', height: '40px', marginTop: '0.5rem' }} 
            onClick={handleGenerateAIGraphic}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RefreshCw size={16} className="animate-spin" /> Gerando Símbolo IA...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} /> Gerar Símbolo por IA
              </span>
            )}
          </button>

          <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
            <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center', height: '36px', fontSize: '0.72rem' }} onClick={handleExportPNG}>
              Exportar PNG
            </button>
            <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center', height: '36px', fontSize: '0.72rem' }} onClick={handleExportSVG}>
              Exportar SVG
            </button>
          </div>

          {activeBrand && (
            <button 
              className="btn-secondary w-full" 
              style={{ borderColor: 'var(--primary)', color: 'white', background: 'rgba(255, 47, 191, 0.04)', height: '36px', justifyContent: 'center', fontSize: '0.72rem' }}
              onClick={handleApplyToBrandKit}
              disabled={isApplying}
            >
              {isApplying ? 'Aplicando...' : 'Salvar no Brand Kit Ativo'}
            </button>
          )}
        </div>

        {/* Right Preview Card & Mockups Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Main Visualizer Container */}
          <div className="card" style={{ 
            minHeight: '360px', 
            background: '#07070a', 
            border: '1px solid rgba(255, 255, 255, 0.06)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            position: 'relative',
            borderRadius: '16px',
            overflow: 'hidden',
            padding: '2rem'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})` }} />
            
            {logoBase64 ? (
              <img src={logoBase64} alt="Rendered Logo" style={{ maxWidth: '80%', maxHeight: '320px', objectFit: 'contain' }} />
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Carregando Canvas...</div>
            )}
          </div>

          {/* Quick Mockups Header & Selector */}
          <div>
            <h4 style={{ fontSize: '0.85rem', color: '#A1A1B5', margin: '0 0 10px 0', fontWeight: 600 }}>Aplicações Práticas da Logo</h4>
            <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.01)', padding: '6px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
              {([
                { id: 'card', label: 'Cartão de Visita', icon: CreditCard },
                { id: 'storefront', label: 'Fachada Comercial', icon: Store },
                { id: 'uniform', label: 'Uniforme / Camiseta', icon: Shirt },
                { id: 'profile', label: 'Avatar Social', icon: User },
                { id: 'box', label: 'Embalagem de Envio', icon: Box }
              ] as const).map(mock => (
                <button
                  key={mock.id}
                  onClick={() => setPreviewMock(mock.id)}
                  className={`btn-secondary ${previewMock === mock.id ? 'active' : ''}`}
                  style={{
                    flex: 1,
                    fontSize: '0.72rem',
                    height: '32px',
                    borderColor: previewMock === mock.id ? 'var(--primary)' : 'transparent',
                    background: previewMock === mock.id ? 'rgba(255, 47, 191, 0.08)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <mock.icon size={13} />
                  <span>{mock.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Render Active Mockup */}
          <div className="card" style={{ height: '240px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            
            {previewMock === 'card' && (
              <div style={{ width: '320px', height: '180px', background: '#FFFFFF', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', color: '#111', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>{brandName}</span>
                    <span style={{ fontSize: '0.55rem', opacity: 0.6 }}>{slogan.toUpperCase()}</span>
                  </div>
                  {aiGraphicUrl && <img src={aiGraphicUrl} alt="logo icon" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.55rem', opacity: 0.8 }}>
                  <span>✉ comercial@{brandName.toLowerCase().replace(/\s+/g, '')}.com.br</span>
                  <span>🌐 www.{brandName.toLowerCase().replace(/\s+/g, '')}.com.br</span>
                </div>
              </div>
            )}

            {previewMock === 'storefront' && (
              <div style={{ width: '400px', height: '180px', background: '#09090d', border: '2px solid rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '15px', padding: '10px 24px', background: '#000', border: `1.5px solid ${primaryColor}`, borderRadius: '4px', boxShadow: `0 0 15px ${primaryColor}40`, color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {aiGraphicUrl && <img src={aiGraphicUrl} alt="symbol" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>{brandName}</span>
                    <span style={{ fontSize: '0.45rem', opacity: 0.6, letterSpacing: '2px' }}>{slogan.toUpperCase()}</span>
                  </div>
                </div>
                {/* Store windows */}
                <div style={{ position: 'absolute', bottom: 0, left: '30px', right: '30px', height: '60px', border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.01)' }} />
              </div>
            )}

            {previewMock === 'uniform' && (
              <div style={{ width: '130px', height: '130px', background: '#111', borderRadius: '50% 50% 6px 6px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 8px 20px rgba(0,0,0,0.5)' }}>
                {/* sleeves */}
                <div style={{ position: 'absolute', top: 0, left: '-15px', width: '25px', height: '40px', background: '#111', borderRadius: '8px 0 0 8px', transform: 'rotate(-25deg)' }} />
                <div style={{ position: 'absolute', top: 0, right: '-15px', width: '25px', height: '40px', background: '#111', borderRadius: '0 8px 8px 0', transform: 'rotate(25deg)' }} />
                {/* Collar */}
                <div style={{ position: 'absolute', top: 0, width: '40px', height: '10px', background: '#000', borderRadius: '0 0 20px 20px' }} />
                {/* Small breast logo */}
                {aiGraphicUrl && <img src={aiGraphicUrl} alt="logo symbol" style={{ width: '28px', height: '28px', objectFit: 'contain', position: 'absolute', top: '35px' }} />}
              </div>
            )}

            {previewMock === 'profile' && (
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '3px', boxShadow: '0 8px 20px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#09090d', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {aiGraphicUrl ? (
                    <img src={aiGraphicUrl} alt="profile symbol" style={{ width: '70%', height: '70%', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ color: 'white', fontWeight: 800, fontSize: '1.5rem' }}>{brandName[0]}</span>
                  )}
                </div>
              </div>
            )}

            {previewMock === 'box' && (
              <div style={{ width: '120px', height: '120px', background: '#1C1610', border: '2px solid rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px', gap: '8px', position: 'relative', boxShadow: '0 10px 24px rgba(0,0,0,0.5)' }}>
                {/* Tape seal */}
                <div style={{ position: 'absolute', top: 0, bottom: 0, width: '12px', background: 'rgba(255,255,255,0.03)', borderLeft: '1px dashed rgba(255,255,255,0.1)', borderRight: '1px dashed rgba(255,255,255,0.1)' }} />
                {aiGraphicUrl && <img src={aiGraphicUrl} alt="emblem" style={{ width: '36px', height: '36px', objectFit: 'contain', zIndex: 1 }} />}
                <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'white', zIndex: 1 }}>{brandName}</span>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};

export default LogoStudioIA;
