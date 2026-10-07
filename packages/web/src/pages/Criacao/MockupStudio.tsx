import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { 
  Smartphone, 
  Laptop, 
  CreditCard, 
  Shirt, 
  Box, 
  Store, 
  Upload, 
  Download, 
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';
import { useBrand } from '../../providers/BrandProvider';
import { useCentralStore } from '../../store/CentralStore';

type MockupItem = 'card' | 'storefront' | 'uniform' | 'box' | 'laptop' | 'smartphone' | 'billboard' | 'mug' | 'sticker';

const MockupStudio: React.FC = () => {
  const { activeBrand } = useBrand();
  const { activeProjectId } = useCentralStore();
  const mockupRef = useRef<HTMLDivElement>(null);

  const [artworkSource, setArtworkSource] = useState<'logo' | 'editor' | 'upload'>('logo');
  const [customArtwork, setCustomArtwork] = useState<string | null>(null);
  const [editorDesign, setEditorDesign] = useState<string | null>(null);
  
  const [activeMockup, setActiveMockup] = useState<MockupItem>('laptop');
  const [isExporting, setIsExporting] = useState(false);

  // Load editor design if present in localStorage
  useEffect(() => {
    try {
      // Look for saved slide thumbnails or editor states
      const key = `pink_logic_editor_slide_thumb_${activeProjectId || 'default'}`;
      const savedThumb = localStorage.getItem(key);
      if (savedThumb) {
        setEditorDesign(savedThumb);
      } else {
        // Fallback mockup design representation
        setEditorDesign('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=512&auto=format&fit=crop');
      }
    } catch {
      // Ignore
    }
  }, [activeProjectId]);

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setCustomArtwork(ev.target?.result as string);
        setArtworkSource('upload');
      };
      reader.readAsDataURL(file);
    }
  };

  const getActiveArtwork = () => {
    if (artworkSource === 'logo') {
      return activeBrand?.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=256&auto=format&fit=crop';
    } else if (artworkSource === 'editor') {
      return editorDesign || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=512&auto=format&fit=crop';
    } else {
      return customArtwork || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=256&auto=format&fit=crop';
    }
  };

  const handleDownloadMockup = async () => {
    if (!mockupRef.current) return;
    setIsExporting(true);
    try {
      // Add slight delay to make sure UI states are stable
      await new Promise((resolve) => setTimeout(resolve, 150));
      
      const canvas = await html2canvas(mockupRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#07070a',
        scale: 2, // Export at high resolution
        logging: false
      });
      
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `mockup-${activeMockup}-${activeProjectId || 'default'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Erro ao compor mockup com html2canvas, usando fallback:', err);
      const link = document.createElement('a');
      link.download = `mockup-${activeMockup}-fallback.png`;
      link.href = getActiveArtwork();
      link.click();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="brandkit-pro-container" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Header */}
      <div>
        <h1 className="neon-text" style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>Mockup Studio</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>Projete suas criações e marca em cenários e dispositivos realistas instantaneamente</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Settings Panel */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'rgba(17, 17, 24, 0.4)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'white' }}>Selecione a Arte</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button 
              className={`btn-secondary ${artworkSource === 'logo' ? 'active' : ''}`}
              style={{
                justifyContent: 'flex-start',
                height: '42px',
                borderColor: artworkSource === 'logo' ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
                background: artworkSource === 'logo' ? 'rgba(255, 47, 191, 0.08)' : 'rgba(255,255,255,0.01)'
              }}
              onClick={() => setArtworkSource('logo')}
            >
              <Sparkles size={16} />
              <span style={{ marginLeft: '10px' }}>Logo do Brand Kit Ativo</span>
            </button>

            <button 
              className={`btn-secondary ${artworkSource === 'editor' ? 'active' : ''}`}
              style={{
                justifyContent: 'flex-start',
                height: '42px',
                borderColor: artworkSource === 'editor' ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
                background: artworkSource === 'editor' ? 'rgba(255, 47, 191, 0.08)' : 'rgba(255,255,255,0.01)'
              }}
              onClick={() => setArtworkSource('editor')}
            >
              <ImageIcon size={16} />
              <span style={{ marginLeft: '10px' }}>Último Design do Editor</span>
            </button>

            <div 
              onClick={() => document.getElementById('mockup-upload-file')?.click()}
              style={{
                border: '1px dashed rgba(255,255,255,0.12)',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.01)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                borderColor: artworkSource === 'upload' ? 'var(--primary)' : 'rgba(255,255,255,0.12)'
              }}
            >
              <Upload size={18} style={{ color: '#A1A1B5' }} />
              <span style={{ fontSize: '0.72rem', color: '#A1A1B5' }}>Carregar Arte Personalizada</span>
              <input id="mockup-upload-file" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCustomUpload} />
            </div>
          </div>

          <h3 style={{ fontSize: '1.1rem', margin: '0.5rem 0 0', color: 'white' }}>Mockups Disponíveis</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            {([
              { id: 'laptop', label: 'Notebook' },
              { id: 'smartphone', label: 'Celular' },
              { id: 'card', label: 'Cartão' },
              { id: 'uniform', label: 'Camiseta' },
              { id: 'box', label: 'Embalagem' },
              { id: 'storefront', label: 'Fachada' },
              { id: 'billboard', label: 'Outdoor' },
              { id: 'mug', label: 'Caneca' },
              { id: 'sticker', label: 'Adesivo' }
            ] as const).map(item => (
              <button
                key={item.id}
                onClick={() => setActiveMockup(item.id)}
                className={`btn-secondary ${activeMockup === item.id ? 'active' : ''}`}
                style={{
                  fontSize: '0.68rem',
                  height: '32px',
                  padding: 0,
                  borderColor: activeMockup === item.id ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                  background: activeMockup === item.id ? 'rgba(255, 47, 191, 0.08)' : 'rgba(255,255,255,0.01)',
                  justifyContent: 'center'
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button 
            className="btn-primary w-full"
            style={{ justifyContent: 'center', height: '42px', marginTop: '0.5rem' }}
            onClick={handleDownloadMockup}
            disabled={isExporting}
          >
            <Download size={18} /> {isExporting ? 'Processando Exportação...' : 'Exportar Mockup de Alta Res.'}
          </button>
        </div>

        {/* Right Preview Frame */}
        <div ref={mockupRef} className="card" style={{ 
          minHeight: '520px', 
          background: '#07070a', 
          borderRadius: '16px', 
          border: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '2.5rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Ambient light glow */}
          <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '350px', height: '350px', borderRadius: '50%', background: activeBrand?.palette.primary || '#FF2D8D', opacity: 0.08, filter: 'blur(90px)' }} />
          <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '350px', height: '350px', borderRadius: '50%', background: activeBrand?.palette.secondary || '#7B4DFF', opacity: 0.08, filter: 'blur(90px)' }} />

          {/* LAPTOP MOCKUP */}
          {activeMockup === 'laptop' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', width: '100%', maxWidth: '540px' }}>
              {/* Laptop Screen Frame */}
              <div style={{ 
                width: '460px', 
                height: '280px', 
                background: '#111', 
                borderRadius: '12px 12px 0 0', 
                padding: '10px 10px 0 10px', 
                boxShadow: '0 15px 35px rgba(0,0,0,0.5)',
                border: '3px solid #2d2d2d',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}>
                {/* Camera notch */}
                <div style={{ alignSelf: 'center', width: '40px', height: '8px', background: '#000', borderRadius: '0 0 4px 4px', marginBottom: '4px' }} />
                
                {/* Screen Content */}
                <div style={{ flex: 1, background: '#0d0d12', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <img src={getActiveArtwork()} alt="artwork logo" style={{ maxHeight: '75%', maxWidth: '85%', objectFit: 'contain' }} />
                </div>
              </div>
              {/* Laptop base */}
              <div style={{ width: '530px', height: '14px', background: '#444', borderRadius: '0 0 12px 12px', borderTop: '2px solid #666', boxShadow: '0 15px 25px rgba(0,0,0,0.4)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '60px', height: '4px', background: '#222', borderRadius: '0 0 6px 6px' }} />
              </div>
            </div>
          )}

          {/* SMARTPHONE MOCKUP */}
          {activeMockup === 'smartphone' && (
            <div style={{ 
              width: '240px', 
              height: '480px', 
              background: '#0d0d12', 
              borderRadius: '38px', 
              border: '8px solid #2d2d2d', 
              boxShadow: '0 20px 45px rgba(0,0,0,0.6)',
              padding: '12px',
              display: 'flex', 
              flexDirection: 'column', 
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Dynamic island */}
              <div style={{ position: 'absolute', top: '15px', left: '50%', transform: 'translateX(-50%)', width: '70px', height: '16px', background: '#000', borderRadius: '10px', zIndex: 10 }} />
              
              {/* Screen Content */}
              <div style={{ flex: 1, borderRadius: '28px', background: '#07070a', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.02)' }}>
                <img src={getActiveArtwork()} alt="mobile artwork" style={{ maxHeight: '80%', maxWidth: '85%', objectFit: 'contain' }} />
              </div>
              
              {/* Home indicator */}
              <div style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', width: '90px', height: '4px', background: '#444', borderRadius: '2px' }} />
            </div>
          )}

          {/* BUSINESS CARD MOCKUP */}
          {activeMockup === 'card' && (
            <div style={{ width: '420px', height: '240px', background: activeBrand?.palette.background || '#0D0D12', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', boxShadow: '0 20px 45px rgba(0,0,0,0.5)', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '16px', position: 'relative', transform: 'rotate(-4deg)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: activeBrand?.palette.primary || '#FF2D8D' }} />
              <img src={getActiveArtwork()} alt="Card logo" style={{ maxHeight: '80px', maxWidth: '80%', objectFit: 'contain' }} />
              <span style={{ fontSize: '0.72rem', letterSpacing: '4px', color: '#A1A1B5', textTransform: 'uppercase' }}>{activeBrand?.tone || 'Identidade Visual'}</span>
            </div>
          )}

          {/* UNIFORM T-SHIRT MOCKUP */}
          {activeMockup === 'uniform' && (
            <div style={{ 
              width: '260px', 
              height: '260px', 
              background: '#0d0d12', 
              borderRadius: '32px 32px 6px 6px', 
              position: 'relative', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 15px 35px rgba(0,0,0,0.6)',
              border: '2px solid rgba(255,255,255,0.05)'
            }}>
              {/* Sleeves */}
              <div style={{ position: 'absolute', top: 0, left: '-30px', width: '50px', height: '80px', background: '#0d0d12', borderRadius: '14px 0 0 14px', transform: 'rotate(-25deg)', borderLeft: '1px solid rgba(255,255,255,0.05)' }} />
              <div style={{ position: 'absolute', top: 0, right: '-30px', width: '50px', height: '80px', background: '#0d0d12', borderRadius: '0 14px 14px 0', transform: 'rotate(25deg)', borderRight: '1px solid rgba(255,255,255,0.05)' }} />
              {/* Collar */}
              <div style={{ position: 'absolute', top: 0, width: '70px', height: '22px', background: '#020204', borderRadius: '0 0 30px 30px' }} />
              
              {/* Front centered Graphic */}
              <div style={{ width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={getActiveArtwork()} alt="Tshirt graphic" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
              </div>
            </div>
          )}

          {/* PACKAGING BOX MOCKUP */}
          {activeMockup === 'box' && (
            <div style={{ 
              width: '240px', 
              height: '240px', 
              background: '#1C1510', 
              borderRadius: '16px', 
              border: '2px solid rgba(255,255,255,0.04)', 
              boxShadow: '0 20px 45px rgba(0,0,0,0.6)', 
              position: 'relative', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '24px'
            }}>
              {/* Cardboard top line seal tape */}
              <div style={{ position: 'absolute', top: 0, bottom: 0, width: '22px', background: 'rgba(255,255,255,0.02)', borderLeft: '1px dashed rgba(255,255,255,0.08)', borderRight: '1px dashed rgba(255,255,255,0.08)' }} />
              <img src={getActiveArtwork()} alt="Packaging print" style={{ maxHeight: '100px', maxWidth: '85%', objectFit: 'contain', zIndex: 1 }} />
              <span style={{ fontSize: '0.62rem', letterSpacing: '2px', color: '#A1A1B5', zIndex: 1, marginTop: '12px', textTransform: 'uppercase' }}>Ofensiva Criativa</span>
            </div>
          )}

          {/* STOREFRONT BILLBOARD */}
          {activeMockup === 'storefront' && (
            <div style={{ width: '480px', height: '240px', background: '#09090c', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
              {/* Signboard */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ 
                  padding: '16px 40px', 
                  background: '#040407', 
                  border: '2px solid var(--primary)', 
                  borderRadius: '6px', 
                  boxShadow: '0 0 20px rgba(255, 47, 191, 0.4)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <img src={getActiveArtwork()} alt="storefront billboard logo" style={{ maxHeight: '60px', maxWidth: '240px', objectFit: 'contain' }} />
                </div>
              </div>
              <div style={{ height: '36px', background: '#111', borderTop: '2px solid rgba(255,255,255,0.08)' }} />
            </div>
          )}

          {/* OUTDOOR BILLBOARD */}
          {activeMockup === 'billboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '520px' }}>
              {/* Board frame */}
              <div style={{ 
                width: '460px', 
                height: '240px', 
                background: '#fff', 
                border: '8px solid #222', 
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px'
              }}>
                <div style={{ width: '100%', height: '100%', background: '#0d0d12', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <img src={getActiveArtwork()} alt="billboard print" style={{ maxHeight: '90%', maxWidth: '90%', objectFit: 'contain' }} />
                </div>
              </div>
              {/* Stand poles */}
              <div style={{ width: '12px', height: '60px', background: '#222' }} />
              <div style={{ width: '80px', height: '6px', background: '#333', borderRadius: '4px' }} />
            </div>
          )}

          {/* COFFEE MUG MOCKUP */}
          {activeMockup === 'mug' && (
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
              {/* Mug cylindrical body */}
              <div style={{ 
                width: '180px', 
                height: '220px', 
                background: '#ffffff', 
                borderRadius: '16px', 
                boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
                border: '1px solid rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                position: 'relative'
              }}>
                <img src={getActiveArtwork()} alt="mug graphic print" style={{ maxHeight: '90px', maxWidth: '80%', objectFit: 'contain' }} />
              </div>
              {/* Mug handle */}
              <div style={{ 
                width: '50px', 
                height: '130px', 
                border: '16px solid #ffffff', 
                borderRadius: '0 50% 50% 0', 
                boxShadow: '8px 8px 16px rgba(0,0,0,0.2)',
                marginLeft: '-18px', 
                zIndex: -1 
              }} />
            </div>
          )}

          {/* STICKER DIE-CUT MOCKUP */}
          {activeMockup === 'sticker' && (
            <div style={{ 
              padding: '16px', 
              background: '#FFFFFF', 
              borderRadius: '24px', 
              boxShadow: '0 12px 28px rgba(0,0,0,0.3)', 
              border: '6px solid #FFFFFF', 
              outline: '1px solid rgba(0,0,0,0.15)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              width: '240px',
              height: '240px',
              transform: 'rotate(5deg)'
            }}>
              {/* Gloss shine overlay */}
              <div style={{ 
                position: 'absolute', inset: 0, 
                background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 45%, rgba(255,255,255,0) 100%)',
                zIndex: 2, pointerEvents: 'none'
              }} />
              
              <div style={{ width: '100%', height: '100%', background: '#0d0d12', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' }}>
                <img src={getActiveArtwork()} alt="sticker visual" style={{ maxHeight: '80%', maxWidth: '85%', objectFit: 'contain' }} />
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default MockupStudio;
