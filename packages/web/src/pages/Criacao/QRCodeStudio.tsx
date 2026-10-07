import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Sparkles, 
  Upload, 
  QrCode, 
  Link as LinkIcon, 
  MessageSquare, 
  CreditCard, 
  User, 
  MapPin, 
  FileText, 
  Menu
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

import { useBrand } from '../../providers/BrandProvider';

type QRType = 'url' | 'whatsapp' | 'pix' | 'instagram' | 'contact' | 'location' | 'pdf' | 'menu';

const QRCodeStudio: React.FC = () => {
  const { activeBrand } = useBrand();

  const [qrType, setQrType] = useState<QRType>('url');
  
  // Input fields
  const [url, setUrl] = useState('https://www.ofensivacriativa.com.br');
  const [phone, setPhone] = useState('5511987654321');
  const [message, setMessage] = useState('Olá! Gostaria de saber mais sobre os serviços.');
  const [pixKey, setPixKey] = useState('pix@ofensivacriativa.com.br');
  const [pixName, setPixName] = useState('Ofensiva Criativa LTDA');
  const [instagramUser, setInstagramUser] = useState('ofensivacriativa');
  const [contactName, setContactName] = useState('Cristiane Silva');
  const [contactPhone, setContactPhone] = useState('(11) 98765-4321');
  const [latitude, setLatitude] = useState('-23.55052');
  const [longitude, setLongitude] = useState('-46.633308');

  // Customization
  const [fgColor, setFgColor] = useState(activeBrand?.palette.primary || '#FF2D8D');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  // Segue a marca ativa quando ela muda (antes só valia na 1.ª renderização).
  useEffect(() => {
    if (activeBrand?.palette.primary) setFgColor(activeBrand.palette.primary);
    if (activeBrand?.logo) setLogoBase64(activeBrand.logo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBrand?.id, activeBrand?.palette.primary]);
  const [includeLogo, setIncludeLogo] = useState(true);
  const [logoBase64, setLogoBase64] = useState(activeBrand?.logo || '');

  const [generatedQR, setGeneratedQR] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Sync brand colors on activeBrand load
  useEffect(() => {
    if (activeBrand) {
      setFgColor(activeBrand.palette.primary);
      setLogoBase64(activeBrand.logo || '');
    }
  }, [activeBrand]);

  const getQRData = () => {
    if (qrType === 'url') return url;
    if (qrType === 'whatsapp') {
      return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    }
    if (qrType === 'pix') {
      // Mock static standard Pix copy-paste payload
      return `00020101021126360014br.gov.bcb.pix0114${pixKey}5204000053039865802BR5925${pixName.slice(0, 25)}6009SAO PAULO62070503***6304`;
    }
    if (qrType === 'instagram') {
      return `https://instagram.com/${instagramUser}`;
    }
    if (qrType === 'contact') {
      return `BEGIN:VCARD\nVERSION:3.0\nN:${contactName}\nTEL:${contactPhone}\nEND:VCARD`;
    }
    if (qrType === 'location') {
      return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    }
    return url; // Default fallback
  };

  const generateQRCode = () => {
    setIsGenerating(true);
    const data = getQRData();
    const cleanFg = fgColor.replace('#', '');
    const cleanBg = bgColor.replace('#', '');

    // Setup rendering canvas locally
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d')!;

    // Background fill
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 400, 400);

    // Call QR server API to get basic matrix
    const baseQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data)}&color=${cleanFg}&bgcolor=${cleanBg}`;

    const qrImg = new Image();
    qrImg.crossOrigin = 'anonymous';
    qrImg.src = baseQrUrl;
    qrImg.onload = () => {
      // Draw base QR code centered
      ctx.drawImage(qrImg, 50, 50, 300, 300);

      // Logo overlay compositor
      if (includeLogo && logoBase64) {
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        logoImg.src = logoBase64;
        logoImg.onload = () => {
          // Draw card base for logo to clear QR modules
          ctx.fillStyle = bgColor;
          ctx.fillRect(160, 160, 80, 80);
          ctx.strokeStyle = fgColor;
          ctx.lineWidth = 3;
          ctx.strokeRect(161, 161, 78, 78);

          // Draw the brand logo inside
          ctx.drawImage(logoImg, 170, 170, 60, 60);
          setGeneratedQR(canvas.toDataURL('image/png'));
          setIsGenerating(false);
        };
        logoImg.onerror = () => {
          setGeneratedQR(canvas.toDataURL('image/png'));
          setIsGenerating(false);
        };
      } else {
        setGeneratedQR(canvas.toDataURL('image/png'));
        setIsGenerating(false);
      }
    };
    qrImg.onerror = () => {
      alert('Erro ao contatar servidor de QR Code.');
      setIsGenerating(false);
    };
  };

  const handleCustomLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setLogoBase64(ev.target?.result as string);
        setIncludeLogo(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Auto trigger generation on settings update
  useEffect(() => {
    generateQRCode();
  }, [qrType, url, phone, message, pixKey, pixName, instagramUser, contactName, contactPhone, latitude, longitude, fgColor, bgColor, includeLogo, logoBase64]);

  return (
    <div className="brandkit-pro-container" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Header */}
      <div>
        <h1 className="neon-text" style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>QR Code Studio</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>Gere códigos QR personalizados de alta performance com a identidade da sua marca</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Control Card */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(17, 17, 24, 0.4)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)' }}>
          
          {/* Navigation inputs types */}
          <div>
            <label style={{ fontSize: '0.8rem', color: '#A1A1B5', marginBottom: '8px', display: 'block' }}>Tipo do QR Code</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              {[
                { id: 'url', label: 'Website', icon: LinkIcon },
                { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
                { id: 'pix', label: 'Pix', icon: CreditCard },
                { id: 'instagram', label: 'Instagram', icon: Instagram },
                { id: 'contact', label: 'Contato', icon: User },
                { id: 'location', label: 'Local', icon: MapPin },
                { id: 'pdf', label: 'Ebook PDF', icon: FileText },
                { id: 'menu', label: 'Cardápio', icon: Menu }
              ].map(type => (
                <button
                  key={type.id}
                  onClick={() => setQrType(type.id as QRType)}
                  className={`btn-secondary ${qrType === type.id ? 'active' : ''}`}
                  style={{
                    fontSize: '0.72rem',
                    height: '34px',
                    borderColor: qrType === type.id ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                    background: qrType === type.id ? 'rgba(255, 47, 191, 0.08)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    padding: '0 4px'
                  }}
                >
                  <type.icon size={13} />
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Render inputs based on active type */}
          <div className="card" style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px' }}>
            {qrType === 'url' && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>URL do Website</label>
                <input type="text" className="input-field" value={url} onChange={e => setUrl(e.target.value)} />
              </div>
            )}

            {qrType === 'whatsapp' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Número do WhatsApp (Código do País + DDD + Número)</label>
                  <input type="text" className="input-field" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Ex: 5511987654321" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Mensagem Padrão</label>
                  <input type="text" className="input-field" value={message} onChange={e => setMessage(e.target.value)} />
                </div>
              </div>
            )}

            {qrType === 'pix' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Chave Pix (E-mail, CPF, CNPJ ou Telefone)</label>
                  <input type="text" className="input-field" value={pixKey} onChange={e => setPixKey(e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Nome do Favorecido</label>
                  <input type="text" className="input-field" value={pixName} onChange={e => setPixName(e.target.value)} />
                </div>
              </div>
            )}

            {qrType === 'instagram' && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Nome de Usuário (@instagram)</label>
                <input type="text" className="input-field" value={instagramUser} onChange={e => setInstagramUser(e.target.value)} />
              </div>
            )}

            {qrType === 'contact' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Nome do Contato</label>
                  <input type="text" className="input-field" value={contactName} onChange={e => setContactName(e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Telefone</label>
                  <input type="text" className="input-field" value={contactPhone} onChange={e => setContactPhone(e.target.value)} />
                </div>
              </div>
            )}

            {qrType === 'location' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Latitude</label>
                  <input type="text" className="input-field" value={latitude} onChange={e => setLatitude(e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Longitude</label>
                  <input type="text" className="input-field" value={longitude} onChange={e => setLongitude(e.target.value)} />
                </div>
              </div>
            )}

            {qrType === 'pdf' && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Link de Download do Ebook / PDF</label>
                <input type="text" className="input-field" value={url} onChange={e => setUrl(e.target.value)} />
              </div>
            )}

            {qrType === 'menu' && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Link do Cardápio / Menu Digital</label>
                <input type="text" className="input-field" value={url} onChange={e => setUrl(e.target.value)} />
              </div>
            )}
          </div>

          {/* Styling Customization options */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group">
              <label>Cor do QR Code</label>
              <input type="color" className="input-field" value={fgColor} onChange={e => setFgColor(e.target.value)} style={{ padding: '2px', height: '36px', cursor: 'pointer' }} />
            </div>
            <div className="form-group">
              <label>Fundo</label>
              <input type="color" className="input-field" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ padding: '2px', height: '36px', cursor: 'pointer' }} />
            </div>
          </div>

          {/* Logo overlay checkbox and upload */}
          <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '0.76rem', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
              <input type="checkbox" checked={includeLogo} onChange={e => setIncludeLogo(e.target.checked)} style={{ accentColor: 'var(--primary)' }} />
              <span>Incluir Logo no Centro</span>
            </label>

            {includeLogo && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {logoBase64 ? <img src={logoBase64} style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain' }} /> : <QrCode size={20} />}
                </div>
                <button 
                  className="btn-secondary" 
                  style={{ height: '32px', fontSize: '0.72rem', flex: 1, justifyContent: 'center' }}
                  onClick={() => document.getElementById('qr-logo-upload')?.click()}
                >
                  Carregar Logo
                </button>
                <input id="qr-logo-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCustomLogoUpload} />
              </div>
            )}
          </div>
        </div>

        {/* Right Preview Showcase */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
          
          <div className="card" style={{ 
            width: '100%', 
            minHeight: '400px', 
            background: '#07070a', 
            borderRadius: '16px', 
            border: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '2rem',
            position: 'relative'
          }}>
            {generatedQR ? (
              <div style={{ 
                padding: '16px', 
                background: bgColor, 
                borderRadius: '16px', 
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `4px solid ${fgColor}25`
              }}>
                <img src={generatedQR} alt="QR Code" style={{ width: '280px', height: '280px' }} />
              </div>
            ) : (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Gerando Código QR...</span>
            )}
          </div>

          <button 
            className="btn-primary w-full"
            style={{ justifyContent: 'center', height: '42px' }}
            onClick={() => {
              if (generatedQR) {
                const link = document.createElement('a');
                link.download = `qrcode-${qrType}.png`;
                link.href = generatedQR;
                link.click();
              }
            }}
          >
            <Download size={18} /> Exportar QR Code (PNG)
          </button>

        </div>

      </div>

    </div>
  );
};

export default QRCodeStudio;
