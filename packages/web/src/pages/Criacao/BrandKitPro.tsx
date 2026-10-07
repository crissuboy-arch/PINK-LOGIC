import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  Trash2, 
  Sparkles, 
  Download, 
  Eye, 
  RefreshCw, 
  Globe, 
  CreditCard, 
  Shirt, 
  Box, 
  Store, 
  Plus
} from 'lucide-react';

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

import { useBrand, type BrandSchema } from '../../providers/BrandProvider';
import { useCentralStore } from '../../store/CentralStore';

interface ExtractedBrandDNA {
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
  aesthetic: string;
  tone: string;
}

const analyzeLogoAndGetDNA = (dataUrl: string): Promise<ExtractedBrandDNA> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 50;
      canvas.height = 50;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(getFallbackDNA());
        return;
      }
      ctx.drawImage(img, 0, 0, 50, 50);
      const imgData = ctx.getImageData(0, 0, 50, 50).data;

      // RGB to HSL helper
      const rgbToHsl = (r: number, g: number, b: number) => {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h = 0, s = 0, l = (max + min) / 2;
        if (max !== min) {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
          }
          h /= 6;
        }
        return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
      };

      // Count colors and analyze characteristics
      let totalPixels = 0;
      let darkPixels = 0;
      let lightPixels = 0;
      let femininePixels = 0;
      let lowSatPixels = 0;
      
      const colorsMap: Record<string, number> = {};
      const colorsHsl: Record<string, { h: number, s: number, l: number }> = {};

      for (let i = 0; i < imgData.length; i += 4) {
        const r = imgData[i];
        const g = imgData[i + 1];
        const b = imgData[i + 2];
        const a = imgData[i + 3];
        if (a < 50) continue; // Skip transparent

        totalPixels++;
        const hsl = rgbToHsl(r, g, b);

        // Classify pixel properties
        if (hsl.l < 22) darkPixels++;
        if (hsl.l > 78) lightPixels++;
        if (hsl.s < 30) lowSatPixels++;
        
        // Pink / Magenta / Rose range: H 315-355
        if ((hsl.h >= 310 && hsl.h <= 355) && hsl.s > 35 && hsl.l > 35 && hsl.l < 85) {
          femininePixels++;
        }

        // Format to Hex
        const hex = '#' + [r, g, b].map(x => {
          const s = x.toString(16);
          return s.length === 1 ? '0' + s : s;
        }).join('').toUpperCase();

        colorsMap[hex] = (colorsMap[hex] || 0) + 1;
        colorsHsl[hex] = hsl;
      }

      if (totalPixels === 0) {
        resolve(getFallbackDNA());
        return;
      }

      // Group colors and find dominant ones
      const sortedColors = Object.entries(colorsMap).sort((a, b) => b[1] - a[1]);
      
      // Filter out grays/whites/blacks for primary/secondary/accent selection
      const colorfulBrandColors = sortedColors.filter(([hex]) => {
        const hsl = colorsHsl[hex];
        return hsl.s > 15 && hsl.l > 15 && hsl.l < 85;
      });

      const listToPick = colorfulBrandColors.length >= 3 ? colorfulBrandColors : sortedColors;
      
      // Extract up to 3 distinct colorful tones (avoiding duplicate hues)
      const pickedColors: string[] = [];
      for (const [hex] of listToPick) {
        const hsl = colorsHsl[hex];
        const isDistinct = pickedColors.every(pickedHex => {
          const pickedHsl = colorsHsl[pickedHex];
          return Math.abs(pickedHsl.h - hsl.h) > 35 || Math.abs(pickedHsl.l - hsl.l) > 35;
        });
        if (isDistinct || pickedColors.length === 0) {
          pickedColors.push(hex);
        }
        if (pickedColors.length >= 3) break;
      }

      // Fill in remaining colors
      while (pickedColors.length < 3) {
        const next = sortedColors.find(([hex]) => !pickedColors.includes(hex));
        if (next) {
          pickedColors.push(next[0]);
        } else {
          pickedColors.push(pickedColors.length === 0 ? '#FF2D9B' : pickedColors.length === 1 ? '#FF4DB2' : '#00E5FF');
        }
      }

      const primary = pickedColors[0];
      const secondary = pickedColors[1];
      const accent = pickedColors[2];

      // Determine aesthetic identity
      let aesthetic = 'sophisticated';
      let tone = 'Premium, elegante e de alta conversão';

      const darkRatio = darkPixels / totalPixels;
      const lightRatio = lightPixels / totalPixels;
      const feminineRatio = femininePixels / totalPixels;
      const lowSatRatio = lowSatPixels / totalPixels;

      if (feminineRatio > 0.15) {
        aesthetic = 'feminine';
        tone = 'Feminina, moderna, acolhedora e estética';
      } else if (darkRatio > 0.55) {
        aesthetic = 'dark luxury';
        tone = 'Premium escuro, luxuoso, exclusivo e misterioso';
      } else if (lightRatio > 0.55) {
        aesthetic = 'clean';
        tone = 'Clean, minimalista, alta legibilidade e clara';
      } else if (lowSatRatio > 0.50) {
        aesthetic = 'sophisticated';
        tone = 'Sofisticada, corporativa, neutra e profissional';
      } else {
        aesthetic = 'premium';
        tone = 'Premium, inovadora, vibrante e tecnológica';
      }

      // Generate background, surface, and text
      let background = '#0D0D12';
      let surface = '#15151F';
      let text = '#FFFFFF';

      if (aesthetic === 'clean') {
        background = '#FAFAFD';
        surface = '#FFFFFF';
        text = '#12121A';
      } else if (aesthetic === 'dark luxury') {
        background = '#0A0A0F';
        surface = '#12121A';
        text = '#FFFFFF';
      } else if (aesthetic === 'feminine') {
        background = '#0E0A0D';
        surface = '#181217';
        text = '#FFFFFF';
      } else if (aesthetic === 'sophisticated') {
        background = '#0B0C10';
        surface = '#13151D';
        text = '#F0F1F5';
      } else {
        background = '#0D0D12';
        surface = '#151520';
        text = '#FFFFFF';
      }

      resolve({
        palette: { primary, secondary, accent, background, surface, text },
        aesthetic,
        tone
      });
    };
    img.onerror = () => resolve(getFallbackDNA());
    img.src = dataUrl;
  });
};

const getFallbackDNA = (): ExtractedBrandDNA => {
  return {
    palette: {
      primary: '#FF2D9B',
      secondary: '#FF4DB2',
      accent: '#00E5FF',
      background: '#0D0D12',
      surface: '#15151F',
      text: '#FFFFFF'
    },
    aesthetic: 'premium',
    tone: 'Premium, inovadora, vibrante e tecnológica'
  };
};

const BrandKitPro: React.FC = () => {
  const { brands, activeBrand, setActiveBrand, createBrand, updateBrand, removeBrand } = useBrand();
  const { activeProjectId } = useCentralStore();

  const [brandName, setBrandName] = useState('');
  const [slogan, setSlogan] = useState('');
  const [logo, setLogo] = useState('');
  const [logoWhite, setLogoWhite] = useState('');
  const [favicon, setFavicon] = useState('');
  const [watermark, setWatermark] = useState('');
  const [primaryFont, setPrimaryFont] = useState('Outfit');
  const [secondaryFont, setSecondaryFont] = useState('Inter');
  const [palette, setPalette] = useState<string[]>(['#FF2D8D', '#7B4DFF', '#00E0FF', '#0D0D12', '#15151F', '#FFFFFF']);
  const [autoBrandActive, setAutoBrandActive] = useState(false);
  
  const [isExtracting, setIsExtracting] = useState(false);
  const [showNewBrandModal, setShowNewBrandModal] = useState(false);
  const [newBrandNameInput, setNewBrandNameInput] = useState('');
  const [previewTab, setPreviewTab] = useState<'card' | 'instagram' | 'website' | 'uniform' | 'storefront' | 'packaging'>('card');

  // Load auto brand status
  useEffect(() => {
    const isAuto = localStorage.getItem('pink_logic_auto_brand') === 'true';
    setAutoBrandActive(isAuto);
  }, []);

  // Load state from activeBrand
  useEffect(() => {
    if (activeBrand) {
      setBrandName(activeBrand.name);
      setSlogan(activeBrand.tone || 'Identidade Visual Premium');
      setLogo(activeBrand.logo || '');
      setLogoWhite(activeBrand.socialLinks?.instagram || '');
      setFavicon(activeBrand.socialLinks?.tiktok || '');
      setWatermark(activeBrand.socialLinks?.youtube || '');
      setPrimaryFont(activeBrand.typography?.heading || 'Outfit');
      setSecondaryFont(activeBrand.typography?.body || 'Inter');
      
      setPalette(
        activeBrand.palette.surface ? [
          activeBrand.palette.primary,
          activeBrand.palette.secondary,
          activeBrand.palette.accent,
          activeBrand.palette.background,
          activeBrand.palette.surface,
          activeBrand.palette.text
        ] : activeBrand.colors.length >= 6 ? activeBrand.colors : [
          activeBrand.palette.primary,
          activeBrand.palette.secondary,
          activeBrand.palette.accent,
          activeBrand.palette.background,
          activeBrand.palette.background === '#0D0D12' || activeBrand.palette.background === '#0D0D0D' ? '#15151F' : '#FAFAFD',
          activeBrand.palette.text
        ]
      );
    }
  }, [activeBrand]);

  const handleUpdate = (fieldUpdates: Partial<BrandSchema>) => {
    if (!activeBrand) return;
    updateBrand(activeBrand.id, fieldUpdates);
  };

  const handleExtractColors = async () => {
    if (!logo) return;
    setIsExtracting(true);
    try {
      const extracted = await analyzeLogoAndGetDNA(logo);
      const { palette: ep, aesthetic, tone } = extracted;
      const colorsArr = [ep.primary, ep.secondary, ep.accent, ep.background, ep.surface, ep.text];
      setPalette(colorsArr);
      handleUpdate({
        colors: colorsArr,
        visualStyle: aesthetic,
        tone: tone,
        palette: {
          primary: ep.primary,
          secondary: ep.secondary,
          accent: ep.accent,
          background: ep.background,
          surface: ep.surface,
          text: ep.text
        },
        brandDNA: {
          logo: logo,
          colors: ep,
          typography: {
            heading: primaryFont,
            body: secondaryFont
          },
          glowStyle: ep.primary,
          aesthetic,
          tone
        }
      });
      alert(`Identidade ${aesthetic.toUpperCase()} detectada! Paleta de 6 cores sincronizada.`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSyncStyle = () => {
    if (!activeBrand) return;
    try {
      const allStr = localStorage.getItem('pinklogic.projects.editor');
      const all = allStr ? JSON.parse(allStr) : {};
      const projId = activeProjectId || 'default';
      const projectData = all[projId];
      if (!projectData || !projectData.slides) {
        alert('Nenhum design do editor encontrado para sincronizar neste projeto. Abra o Editor primeiro!');
        return;
      }

      const pColors = activeBrand.colors.length >= 3 ? activeBrand.colors : ['#FF2D8D', '#7B4DFF', '#00E0FF'];
      const headingFont = activeBrand.typography?.heading || 'Outfit';
      const bodyFont = activeBrand.typography?.body || 'Inter';

      const updatedSlides = projectData.slides.map((slide: any) => {
        const updatedElements = slide.elements.map((el: any) => {
          if (el.type === 'text') {
            const isHeading = el.fontSize && el.fontSize >= 32;
            return {
              ...el,
              fontFamily: isHeading ? headingFont : bodyFont,
              color: isHeading ? pColors[0] : pColors[4] || '#ffffff'
            };
          }
          if (el.type === 'shape') {
            return {
              ...el,
              color: pColors[0]
            };
          }
          return el;
        });

        let updatedBg = { ...slide.background };
        if (slide.background.type === 'color') {
          updatedBg.value = pColors[3] || '#0D0D0D';
        }

        return {
          ...slide,
          background: updatedBg,
          elements: updatedElements
        };
      });

      all[projId] = {
        ...projectData,
        slides: updatedSlides,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('pinklogic.projects.editor', JSON.stringify(all));
      
      alert('Sincronização global concluída! Fontes e cores do Brand Kit aplicadas em todos os slides do Editor.');
    } catch (e) {
      console.error(e);
      alert('Erro ao sincronizar estilos: ' + (e as Error).message);
    }
  };

  const handleCreateBrand = () => {
    if (!newBrandNameInput.trim()) return;
    const newBrand = createBrand({
      projectId: activeProjectId || 'default',
      name: newBrandNameInput.trim(),
      palette: {
        primary: '#FF2D8D',
        secondary: '#7B4DFF',
        accent: '#00E0FF',
        background: '#0D0D12',
        text: '#FFFFFF'
      },
      typography: {
        heading: 'Outfit',
        body: 'Inter'
      }
    });
    setActiveBrand(newBrand);
    setShowNewBrandModal(false);
    setNewBrandNameInput('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'logo' | 'logoWhite' | 'favicon' | 'watermark') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target?.result as string;
        if (target === 'logo') {
          setLogo(base64);
          handleUpdate({ logo: base64 });
        } else if (target === 'logoWhite') {
          setLogoWhite(base64);
          handleUpdate({ socialLinks: { ...activeBrand?.socialLinks, instagram: base64 } });
        } else if (target === 'favicon') {
          setFavicon(base64);
          handleUpdate({ socialLinks: { ...activeBrand?.socialLinks, tiktok: base64 } });
        } else if (target === 'watermark') {
          setWatermark(base64);
          handleUpdate({ socialLinks: { ...activeBrand?.socialLinks, youtube: base64 } });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="brandkit-pro-container" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 className="neon-text" style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>Brand Kit Pro</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>Evolua e gerencie a identidade visual completa do seu ecossistema</p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Auto Brand Apply Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 45, 155, 0.04)', padding: '0 12px', borderRadius: '8px', border: '1px solid rgba(255, 45, 155, 0.2)', height: '40px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <input 
                type="checkbox" 
                checked={autoBrandActive} 
                onChange={(e) => {
                  setAutoBrandActive(e.target.checked);
                  localStorage.setItem('pink_logic_auto_brand', e.target.checked ? 'true' : 'false');
                }}
                style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--primary)' }}
              />
              Modo Auto-Brand
            </label>
          </div>

          <select 
            className="input-field" 
            style={{ width: '220px', height: '40px' }}
            value={activeBrand?.id || ''}
            onChange={(e) => {
              const found = brands.find(b => b.id === e.target.value);
              if (found) setActiveBrand(found);
            }}
          >
            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          
          <button 
            className="btn-secondary" 
            onClick={handleSyncStyle}
            style={{ height: '40px', gap: '6px', borderColor: 'var(--primary)', color: 'var(--primary)', background: 'rgba(255, 47, 191, 0.05)' }}
          >
            <Sparkles size={16} /> Sincronizar Estilo
          </button>

          <button 
            className="btn-primary" 
            onClick={() => setShowNewBrandModal(true)}
            style={{ height: '40px', gap: '6px' }}
          >
            <Plus size={16} /> Nova Marca
          </button>
        </div>
      </div>

      {activeBrand ? (
        <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: '2rem', alignItems: 'start' }}>
          
          {/* Settings Left Panel */}
          <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'rgba(17, 17, 24, 0.4)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'white' }}>Parâmetros da Marca</h3>
              
              {activeBrand.brandDNA?.aesthetic && (
                <span style={{ 
                  fontSize: '0.65rem', 
                  padding: '3px 8px', 
                  borderRadius: '12px', 
                  background: 'rgba(255, 45, 155, 0.1)', 
                  border: '1px solid var(--primary)', 
                  color: 'var(--primary)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {activeBrand.brandDNA.aesthetic}
                </span>
              )}
            </div>
            
            <div className="form-group">
              <label>Nome da Marca</label>
              <input 
                type="text" 
                className="input-field" 
                value={brandName} 
                onChange={e => {
                  setBrandName(e.target.value);
                  handleUpdate({ name: e.target.value });
                }} 
              />
            </div>

            <div className="form-group">
              <label>Slogan da Marca</label>
              <input 
                type="text" 
                className="input-field" 
                value={slogan} 
                onChange={e => {
                  setSlogan(e.target.value);
                  handleUpdate({ tone: e.target.value }); // Map to tone for persistence
                }} 
              />
            </div>

            {/* Logo Uploaders Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label>Logo Colorida</label>
                <div 
                  onClick={() => document.getElementById('logo-col-file')?.click()}
                  style={{
                    border: '1px dashed rgba(255,255,255,0.12)',
                    borderRadius: '8px',
                    height: '80px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    background: 'rgba(255,255,255,0.01)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {logo ? (
                    <img src={logo} alt="Logo Colorida" style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} />
                  ) : (
                    <>
                      <Upload size={16} style={{ color: '#A1A1B5', marginBottom: '4px' }} />
                      <span style={{ fontSize: '0.65rem', color: '#A1A1B5' }}>Upload</span>
                    </>
                  )}
                  <input id="logo-col-file" type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'logo')} />
                </div>
              </div>

              <div className="form-group">
                <label>Logo Branca</label>
                <div 
                  onClick={() => document.getElementById('logo-w-file')?.click()}
                  style={{
                    border: '1px dashed rgba(255,255,255,0.12)',
                    borderRadius: '8px',
                    height: '80px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    background: 'rgba(255,255,255,0.01)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {logoWhite ? (
                    <img src={logoWhite} alt="Logo Branca" style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', filter: 'brightness(10)' }} />
                  ) : (
                    <>
                      <Upload size={16} style={{ color: '#A1A1B5', marginBottom: '4px' }} />
                      <span style={{ fontSize: '0.65rem', color: '#A1A1B5' }}>Upload</span>
                    </>
                  )}
                  <input id="logo-w-file" type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'logoWhite')} />
                </div>
              </div>

              <div className="form-group">
                <label>Favicon</label>
                <div 
                  onClick={() => document.getElementById('logo-fav-file')?.click()}
                  style={{
                    border: '1px dashed rgba(255,255,255,0.12)',
                    borderRadius: '8px',
                    height: '80px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    background: 'rgba(255,255,255,0.01)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {favicon ? (
                    <img src={favicon} alt="Favicon" style={{ maxWidth: '60%', maxHeight: '60%', objectFit: 'contain' }} />
                  ) : (
                    <>
                      <Upload size={16} style={{ color: '#A1A1B5', marginBottom: '4px' }} />
                      <span style={{ fontSize: '0.65rem', color: '#A1A1B5' }}>Upload</span>
                    </>
                  )}
                  <input id="logo-fav-file" type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'favicon')} />
                </div>
              </div>

              <div className="form-group">
                <label>Marca d'água</label>
                <div 
                  onClick={() => document.getElementById('logo-water-file')?.click()}
                  style={{
                    border: '1px dashed rgba(255,255,255,0.12)',
                    borderRadius: '8px',
                    height: '80px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    background: 'rgba(255,255,255,0.01)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {watermark ? (
                    <img src={watermark} alt="Marca d'água" style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain', opacity: 0.5 }} />
                  ) : (
                    <>
                      <Upload size={16} style={{ color: '#A1A1B5', marginBottom: '4px' }} />
                      <span style={{ fontSize: '0.65rem', color: '#A1A1B5' }}>Upload</span>
                    </>
                  )}
                  <input id="logo-water-file" type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'watermark')} />
                </div>
              </div>
            </div>

            {/* Typography selection */}
            <div className="form-row-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label>Fonte Títulos</label>
                <select 
                  className="input-field" 
                  value={primaryFont}
                  onChange={e => {
                    setPrimaryFont(e.target.value);
                    handleUpdate({ typography: { heading: e.target.value, body: secondaryFont } });
                  }}
                >
                  <option value="Outfit">Outfit</option>
                  <option value="Playfair Display">Playfair Display</option>
                  <option value="Anton">Anton</option>
                  <option value="Great Vibes">Great Vibes</option>
                  <option value="Sacramento">Sacramento</option>
                </select>
              </div>
              <div className="form-group">
                <label>Fonte Corpo</label>
                <select 
                  className="input-field" 
                  value={secondaryFont}
                  onChange={e => {
                    setSecondaryFont(e.target.value);
                    handleUpdate({ typography: { heading: primaryFont, body: e.target.value } });
                  }}
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Parisienne">Parisienne</option>
                  <option value="Alex Brush">Alex Brush</option>
                </select>
              </div>
            </div>

            {/* Palette */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ margin: 0 }}>Paleta de Cores</label>
                <button 
                  className="btn-secondary" 
                  onClick={handleExtractColors}
                  disabled={!logo || isExtracting}
                  style={{ 
                    height: '24px', 
                    fontSize: '0.65rem', 
                    padding: '0 8px', 
                    borderColor: 'var(--primary)', 
                    color: 'var(--primary)',
                    background: 'rgba(255, 47, 191, 0.05)'
                  }}
                >
                  {isExtracting ? 'Processando...' : 'Extrair da Logo'}
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {palette.map((color, index) => (
                  <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <input 
                      type="color" 
                      value={color} 
                      onChange={(e) => {
                        const newPalette = [...palette];
                        newPalette[index] = e.target.value;
                        setPalette(newPalette);
                        handleUpdate({
                          colors: newPalette,
                          palette: {
                            primary: newPalette[0],
                            secondary: newPalette[1],
                            accent: newPalette[2],
                            background: newPalette[3],
                            surface: newPalette[4],
                            text: newPalette[5],
                          }
                        });
                      }}
                      style={{ width: '100%', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: 'none' }}
                    />
                    <span style={{ fontSize: '0.6rem', color: '#A1A1B5', fontFamily: 'monospace' }}>{color}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Remove Brand button */}
            <button 
              className="btn-secondary w-full"
              style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#EF4444', height: '36px', justifyContent: 'center', fontSize: '0.75rem', marginTop: '0.5rem' }}
              onClick={() => {
                if (brands.length <= 1) {
                  alert('Você deve manter pelo menos uma identidade visual!');
                  return;
                }
                if (confirm('Deseja realmente deletar esta marca?')) {
                  removeBrand(activeBrand.id);
                }
              }}
            >
              <Trash2 size={14} /> Deletar Identidade Visual
            </button>
          </div>

          {/* Previews Right Showcase Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Nav tabs for preview options */}
            <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '6px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
              {([
                { id: 'card', label: 'Cartão', icon: CreditCard },
                { id: 'instagram', label: 'Instagram', icon: Instagram },
                { id: 'website', label: 'Website', icon: Globe },
                { id: 'uniform', label: 'Uniforme', icon: Shirt },
                { id: 'storefront', label: 'Fachada', icon: Store },
                { id: 'packaging', label: 'Embalagem', icon: Box }
              ] as const).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setPreviewTab(tab.id)}
                  className={`btn-secondary ${previewTab === tab.id ? 'active' : ''}`}
                  style={{
                    flex: 1,
                    fontSize: '0.75rem',
                    height: '34px',
                    borderColor: previewTab === tab.id ? 'var(--primary)' : 'transparent',
                    background: previewTab === tab.id ? 'rgba(255, 47, 191, 0.08)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <tab.icon size={14} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Active Preview Showcase Frame */}
            <div className="card" style={{ 
              minHeight: '440px', 
              background: '#0a0a0f', 
              borderRadius: '16px', 
              border: '1px solid rgba(255,255,255,0.05)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '2rem',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Background ambient lighting */}
              <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '300px', height: '300px', borderRadius: '50%', background: palette[0], opacity: 0.08, filter: 'blur(80px)' }} />
              <div style={{ position: 'absolute', bottom: '-100px', right: '-100px', width: '300px', height: '300px', borderRadius: '50%', background: palette[1], opacity: 0.08, filter: 'blur(80px)' }} />

              {/* CARD PREVIEW */}
              {previewTab === 'card' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', width: '100%', maxWidth: '640px' }}>
                  {/* Front of card */}
                  <div style={{ 
                    height: '180px', 
                    background: palette[3], 
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    position: 'relative',
                    color: palette[5]
                  }}>
                    {logo ? (
                      <img src={logo} alt="Logo" style={{ maxHeight: '55px', maxWidth: '80%', objectFit: 'contain' }} />
                    ) : (
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: primaryFont }}>{brandName}</span>
                    )}
                    <span style={{ fontSize: '0.65rem', letterSpacing: '4px', opacity: 0.7, textTransform: 'uppercase', textAlign: 'center' }}>{slogan}</span>
                  </div>

                  {/* Back of card */}
                  <div style={{ 
                    height: '180px', 
                    background: '#ffffff', 
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    color: '#1a1a1a',
                    border: '1px solid rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Cristiane Silva</span>
                        <span style={{ fontSize: '0.6rem', color: '#666' }}>Diretora de Branding</span>
                      </div>
                      {logo ? (
                        <img src={logo} alt="Logo" style={{ maxHeight: '25px', maxWidth: '80px', objectFit: 'contain' }} />
                      ) : (
                        <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>{brandName}</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.55rem', color: '#444' }}>
                      <span>✉ contato@ofensivacriativa.com.br</span>
                      <span>☏ (11) 98765-4321</span>
                      <span>🌐 www.ofensivacriativa.com.br</span>
                    </div>
                  </div>
                </div>
              )}

              {/* INSTAGRAM PREVIEW */}
              {previewTab === 'instagram' && (
                <div style={{ width: '320px', background: '#000', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 15px 35px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
                  {/* Insta Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: palette[0], display: 'flex', alignItems: 'center', justifyItems: 'center', overflow: 'hidden', padding: '2px' }}>
                      {favicon ? <img src={favicon} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} /> : <span style={{ color: 'white', fontSize: '0.6rem', fontWeight: 800, margin: '0 auto' }}>PL</span>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'white' }}>{brandName.toLowerCase().replace(/\s+/g, '')}</span>
                      <span style={{ fontSize: '0.55rem', color: '#888' }}>Patrocinado</span>
                    </div>
                  </div>
                  {/* Insta Image */}
                  <div style={{ width: '320px', height: '320px', background: palette[3], display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', color: palette[5], padding: '24px' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg, ${palette[0]}, ${palette[1]})` }} />
                    {logo ? (
                      <img src={logo} alt="Logo" style={{ maxHeight: '70px', maxWidth: '80%', objectFit: 'contain' }} />
                    ) : (
                      <span style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: primaryFont }}>{brandName}</span>
                    )}
                    <p style={{ fontFamily: secondaryFont, fontSize: '0.8rem', opacity: 0.8, textAlign: 'center', margin: '15px 0 0 0', lineHeight: 1.4 }}>Design Visual de Alta Performance</p>
                    <button style={{ marginTop: '20px', background: palette[0], color: 'white', fontSize: '0.7rem', fontWeight: 700, padding: '6px 16px', borderRadius: '20px', border: 'none', boxShadow: `0 0 15px ${palette[0]}50` }}>Saiba Mais</button>
                  </div>
                </div>
              )}

              {/* WEBSITE PREVIEW */}
              {previewTab === 'website' && (
                <div style={{ width: '100%', maxWidth: '640px', background: '#0b0b0f', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', boxShadow: '0 15px 35px rgba(0,0,0,0.6)' }}>
                  {/* Browser bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} />
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} />
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: '4px', height: '18px', display: 'flex', alignItems: 'center', padding: '0 8px', marginLeft: '12px' }}>
                      <span style={{ fontSize: '0.55rem', color: '#888' }}>https://{brandName.toLowerCase().replace(/\s+/g, '')}.com.br</span>
                    </div>
                  </div>
                  {/* Hero Web Page */}
                  <div style={{ height: '240px', background: palette[3], padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', color: palette[5] }}>
                    {/* NavBar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {logo ? (
                        <img src={logo} alt="Logo" style={{ maxHeight: '28px', maxWidth: '120px', objectFit: 'contain' }} />
                      ) : (
                        <span style={{ fontSize: '0.9rem', fontWeight: 800, fontFamily: primaryFont }}>{brandName}</span>
                      )}
                      <div style={{ display: 'flex', gap: '15px', fontSize: '0.65rem', opacity: 0.8 }}>
                        <span>Home</span>
                        <span>Serviços</span>
                        <span>Sobre</span>
                        <span>Contato</span>
                      </div>
                    </div>
                    {/* Title */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '20px' }}>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, fontFamily: primaryFont, color: 'white' }}>Inovação visual sob medida para marcas modernas</h2>
                      <span style={{ fontSize: '0.72rem', opacity: 0.7, fontFamily: secondaryFont }}>{slogan.toUpperCase()}</span>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        <button style={{ padding: '6px 12px', background: palette[0], color: 'white', fontSize: '0.65rem', fontWeight: 700, borderRadius: '4px' }}>Começar Agora</button>
                        <button style={{ padding: '6px 12px', border: `1px solid ${palette[2]}`, color: palette[2], fontSize: '0.65rem', fontWeight: 700, borderRadius: '4px' }}>Ver Portfólio</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* UNIFORM PREVIEW */}
              {previewTab === 'uniform' && (
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                  {/* T-shirt mockup shape */}
                  <div style={{ position: 'relative', width: '220px', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{
                      width: '180px',
                      height: '180px',
                      background: palette[3],
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '24px 24px 4px 4px',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                    }}>
                      {/* sleeves */}
                      <div style={{ position: 'absolute', top: 0, left: '-25px', width: '40px', height: '60px', background: palette[3], borderRadius: '12px 0 0 12px', transform: 'rotate(-25deg)', border: '1px solid rgba(255,255,255,0.03)' }} />
                      <div style={{ position: 'absolute', top: 0, right: '-25px', width: '40px', height: '60px', background: palette[3], borderRadius: '0 12px 12px 0', transform: 'rotate(25deg)', border: '1px solid rgba(255,255,255,0.03)' }} />
                      
                      {/* Collar */}
                      <div style={{ position: 'absolute', top: 0, width: '60px', height: '20px', background: '#000', borderRadius: '0 0 30px 30px' }} />
                      
                      {/* Logo on chest */}
                      {logoWhite ? (
                        <img src={logoWhite} alt="Chest Logo" style={{ maxHeight: '35px', maxWidth: '70%', objectFit: 'contain', filter: 'brightness(10)' }} />
                      ) : logo ? (
                        <img src={logo} alt="Chest Logo" style={{ maxHeight: '35px', maxWidth: '70%', objectFit: 'contain' }} />
                      ) : (
                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'white' }}>{brandName}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STOREFRONT PREVIEW */}
              {previewTab === 'storefront' && (
                <div style={{ width: '100%', maxWidth: '520px', height: '300px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', position: 'relative', overflow: 'hidden', boxShadow: '0 15px 30px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  {/* Glass window */}
                  <div style={{ flex: 1, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {/* Glowing brand signboard */}
                    <div style={{ 
                      padding: '16px 36px', 
                      background: palette[3], 
                      border: `2px solid ${palette[0]}`,
                      borderRadius: '8px', 
                      boxShadow: `0 0 25px ${palette[0]}50`,
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      gap: '4px',
                      color: palette[5]
                    }}>
                      {logo ? (
                        <img src={logo} alt="Logo" style={{ maxHeight: '45px', maxWidth: '200px', objectFit: 'contain' }} />
                      ) : (
                        <span style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: primaryFont }}>{brandName}</span>
                      )}
                      <span style={{ fontSize: '0.55rem', letterSpacing: '4px', opacity: 0.8 }}>{slogan}</span>
                    </div>
                  </div>
                  {/* Shop Entrance Base */}
                  <div style={{ height: '40px', background: '#111', borderTop: '2px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', padding: '0 20px', alignItems: 'center' }}>
                    <span style={{ width: '40px', height: '100%', borderLeft: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.1)' }} />
                    <span style={{ width: '60px', height: '80%', background: '#222', borderRadius: '4px 4px 0 0' }} />
                    <span style={{ width: '40px', height: '100%', borderLeft: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.1)' }} />
                  </div>
                </div>
              )}

              {/* PACKAGING PREVIEW */}
              {previewTab === 'packaging' && (
                <div style={{ position: 'relative', width: '220px', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* 3D Box Mockup using CSS */}
                  <div style={{
                    width: '140px',
                    height: '140px',
                    background: palette[3],
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '12px',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.6)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                    gap: '10px',
                    color: palette[5],
                    position: 'relative'
                  }}>
                    {/* Ribbon accent */}
                    <div style={{ position: 'absolute', top: 0, left: '20px', bottom: 0, width: '15px', background: `linear-gradient(180deg, ${palette[0]}, ${palette[1]})`, opacity: 0.8 }} />
                    
                    {logo ? (
                      <img src={logo} alt="Logo" style={{ maxHeight: '40px', maxWidth: '90%', objectFit: 'contain', zIndex: 1 }} />
                    ) : (
                      <span style={{ fontSize: '1rem', fontWeight: 800, fontFamily: primaryFont, zIndex: 1 }}>{brandName}</span>
                    )}
                    <span style={{ fontSize: '0.5rem', letterSpacing: '2px', opacity: 0.8, textTransform: 'uppercase', zIndex: 1, textAlign: 'center' }}>{slogan}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom active palette tokens values display */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.75rem' }}>
              {[
                { label: 'Primária', color: palette[0] },
                { label: 'Secundária', color: palette[1] },
                { label: 'Destaque', color: palette[2] },
                { label: 'Fundo', color: palette[3] },
                { label: 'Superfície', color: palette[4] },
                { label: 'Texto', color: palette[5] }
              ].map((token, index) => (
                <div key={index} className="card" style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.62rem', color: '#A1A1B5', fontWeight: 600 }}>{token.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: token.color, border: '1px solid rgba(255,255,255,0.1)' }} />
                    <span style={{ fontSize: '0.7rem', color: 'white', fontWeight: 600, fontFamily: 'monospace' }}>{token.color}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      ) : (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Carregando dados da marca...</p>
        </div>
      )}

      {/* New Brand Kit Modal */}
      {showNewBrandModal && (
        <div className="modal-overlay" style={{ position: 'fixed' }}>
          <div className="modal-content" style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'white', margin: 0 }}>Nova Identidade Visual</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label>Nome da Marca</label>
              <input 
                type="text" 
                className="input-field" 
                value={newBrandNameInput}
                onChange={e => setNewBrandNameInput(e.target.value)}
                placeholder="Ex: Ofensiva Criativa"
              />
            </div>
            <div className="modal-footer" style={{ marginTop: '0.5rem' }}>
              <button 
                className="btn-secondary" 
                onClick={() => {
                  setShowNewBrandModal(false);
                  setNewBrandNameInput('');
                }}
              >
                Cancelar
              </button>
              <button 
                className="btn-primary" 
                onClick={handleCreateBrand}
              >
                Criar Marca
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BrandKitPro;
