import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  Trash2, 
  Sparkles, 
  BookOpen, 
  Upload, 
  Image as ImageIcon, 
  Plus, 
  Search, 
  Grid,
  Layers,
  Award,
  ArrowUpRight,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useBrand } from '../../providers/BrandProvider';
import { useCentralStore } from '../../store/CentralStore';
import { useNavigate } from 'react-router-dom';

interface Asset {
  id: string;
  type: 'upload' | 'logo' | 'sticker' | 'model';
  url: string;
  name: string;
  createdAt: string;
}

const BrandManual: React.FC = () => {
  const { activeBrand, brands } = useBrand();
  const { activeProjectId } = useCentralStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'all' | 'upload' | 'logo' | 'sticker' | 'model'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const projectId = activeProjectId || 'default';

  // Load all assets from local storage
  const loadAssets = () => {
    try {
      const loadedAssets: Asset[] = [];

      // 1. Local Uploads
      const uploadsKey = `pink_logic_uploads_${projectId}`;
      const savedUploads = localStorage.getItem(uploadsKey);
      if (savedUploads) {
        const parsed = JSON.parse(savedUploads);
        parsed.forEach((url: string, idx: number) => {
          loadedAssets.push({
            id: `upload-${idx}-${url.substring(url.length - 10)}`,
            type: 'upload',
            url,
            name: `Upload #${idx + 1}`,
            createdAt: new Date().toLocaleDateString()
          });
        });
      }

      // 2. Logos (From active brand logo + any other brands)
      if (activeBrand?.logo) {
        loadedAssets.push({
          id: `logo-active-${activeBrand.id}`,
          type: 'logo',
          url: activeBrand.logo,
          name: `Logo - ${activeBrand.name}`,
          createdAt: new Date().toLocaleDateString()
        });
      }
      brands.forEach(b => {
        if (b.logo && b.id !== activeBrand?.id) {
          loadedAssets.push({
            id: `logo-${b.id}`,
            type: 'logo',
            url: b.logo,
            name: `Logo - ${b.name}`,
            createdAt: new Date().toLocaleDateString()
          });
        }
      });

      // 3. Stickers
      const stickersKey = `pink_logic_stickers_${projectId}`;
      const savedStickers = localStorage.getItem(stickersKey);
      if (savedStickers) {
        const parsed = JSON.parse(savedStickers);
        parsed.forEach((st: any) => {
          const url = st.generatedUrl || st.imageUrl;
          if (url) {
            loadedAssets.push({
              id: st.id || `sticker-${url.substring(url.length - 10)}`,
              type: 'sticker',
              url,
              name: st.text || 'Adesivo Premium',
              createdAt: new Date().toLocaleDateString()
            });
          }
        });
      }

      // 4. Models
      const savedModels = localStorage.getItem('pink_logic_custom_models');
      if (savedModels) {
        const parsed = JSON.parse(savedModels);
        parsed.forEach((url: string, idx: number) => {
          loadedAssets.push({
            id: `model-${idx}-${url.substring(url.length - 10)}`,
            type: 'model',
            url,
            name: `Modelo IA #${idx + 1}`,
            createdAt: new Date().toLocaleDateString()
          });
        });
      }

      setAssets(loadedAssets);
    } catch (e) {
      console.error('Error loading Assets OS', e);
    }
  };

  useEffect(() => {
    loadAssets();
  }, [projectId, activeBrand, brands]);

  // Handle file uploads
  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      try {
        const uploadsKey = `pink_logic_uploads_${projectId}`;
        const savedUploads = localStorage.getItem(uploadsKey);
        const current = savedUploads ? JSON.parse(savedUploads) : [];
        const updated = [base64, ...current];
        localStorage.setItem(uploadsKey, JSON.stringify(updated));
        loadAssets();
      } catch (err) {
        alert('Erro ao salvar upload. Limite de tamanho excedido.');
        console.error(err);
      }
    };
    reader.readAsDataURL(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  // Delete an asset
  const handleDeleteAsset = (asset: Asset, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Excluir permanentemente "${asset.name}"?`)) return;

    try {
      if (asset.type === 'upload') {
        const uploadsKey = `pink_logic_uploads_${projectId}`;
        const savedUploads = localStorage.getItem(uploadsKey);
        if (savedUploads) {
          const parsed = JSON.parse(savedUploads);
          const updated = parsed.filter((url: string) => url !== asset.url);
          localStorage.setItem(uploadsKey, JSON.stringify(updated));
        }
      } else if (asset.type === 'sticker') {
        const stickersKey = `pink_logic_stickers_${projectId}`;
        const savedStickers = localStorage.getItem(stickersKey);
        if (savedStickers) {
          const parsed = JSON.parse(savedStickers);
          const updated = parsed.filter((st: any) => (st.generatedUrl || st.imageUrl) !== asset.url && st.id !== asset.id);
          localStorage.setItem(stickersKey, JSON.stringify(updated));
        }
      } else if (asset.type === 'model') {
        const savedModels = localStorage.getItem('pink_logic_custom_models');
        if (savedModels) {
          const parsed = JSON.parse(savedModels);
          const updated = parsed.filter((url: string) => url !== asset.url);
          localStorage.setItem('pink_logic_custom_models', JSON.stringify(updated));
        }
      } else if (asset.type === 'logo') {
        alert('Para remover este logo, altere ou remova a imagem do logotipo diretamente no Brand Kit.');
        return;
      }

      loadAssets();
    } catch (err) {
      console.error('Failed to delete asset', err);
    }
  };

  // Apply in Editor
  const handleApplyInEditor = (asset: Asset) => {
    localStorage.setItem('pink_logic_editor_pending_asset', asset.url);
    navigate('/criacao/editor');
  };

  // Filtered Assets
  const filteredAssets = assets.filter(asset => {
    const matchesTab = activeTab === 'all' || asset.type === activeTab;
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          asset.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="brandkit-pro-container" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="neon-text" style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>Central de Assets OS</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
            Repositório operacional de arquivos e mídias geradas na plataforma
          </p>
        </div>

        <button 
          className="btn-primary" 
          onClick={() => fileInputRef.current?.click()}
          style={{ height: '40px', gap: '6px' }}
        >
          <Plus size={16} /> Carregar Novo Arquivo
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept="image/*" 
          onChange={onFileChange} 
        />
      </div>

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
        {[
          { label: 'Total de Uploads', val: assets.filter(a => a.type === 'upload').length, icon: Upload, color: '#FF2D9B' },
          { label: 'Stickers Gerados', val: assets.filter(a => a.type === 'sticker').length, icon: Sparkles, color: '#FF4DB2' },
          { label: 'Modelos de Recorte', val: assets.filter(a => a.type === 'model').length, icon: Layers, color: '#00E0FF' },
          { label: 'Logotipos de Marca', val: assets.filter(a => a.type === 'logo').length, icon: Award, color: '#FFB800' }
        ].map((stat, i) => (
          <div key={i} className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(21, 21, 21, 0.4)' }}>
            <div style={{ 
              width: '44px', 
              height: '44px', 
              borderRadius: '10px', 
              background: `rgba(${stat.color === '#FF2D9B' ? '255, 45, 155' : stat.color === '#FF4DB2' ? '255, 77, 178' : stat.color === '#00E0FF' ? '0, 224, 255' : '255, 184, 0'}, 0.1)`, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: stat.color 
            }}>
              <stat.icon size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>{stat.val}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Sidebar Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            { id: 'all', label: 'Todos os Assets', icon: Grid },
            { id: 'upload', label: 'Uploads Locais', icon: Upload },
            { id: 'logo', label: 'Logotipos', icon: Award },
            { id: 'sticker', label: 'Stickers Studio', icon: Sparkles },
            { id: 'model', label: 'Modelos de Recorte', icon: Layers }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`btn-secondary ${activeTab === tab.id ? 'active' : ''}`}
              style={{
                justifyContent: 'flex-start',
                fontSize: '0.8rem',
                height: '40px',
                padding: '0 12px',
                borderColor: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                background: activeTab === tab.id ? 'rgba(255, 47, 191, 0.06)' : 'none',
                gap: '8px'
              }}
            >
              <tab.icon size={16} style={{ color: activeTab === tab.id ? 'var(--primary)' : '#A1A1B5' }} />
              <span>{tab.label}</span>
              <span style={{ 
                marginLeft: 'auto', 
                fontSize: '0.7rem', 
                background: 'rgba(255, 255, 255, 0.04)', 
                padding: '2px 6px', 
                borderRadius: '8px',
                color: activeTab === tab.id ? 'var(--primary)' : '#888'
              }}>
                {tab.id === 'all' ? assets.length : assets.filter(a => a.type === tab.id).length}
              </span>
            </button>
          ))}
        </div>

        {/* Right Assets Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Search bar and Dragzone hint */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
              <input 
                type="text" 
                placeholder="Buscar arquivos por nome ou tipo..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  height: '40px',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '8px',
                  paddingLeft: '38px',
                  paddingRight: '12px',
                  color: 'white',
                  fontSize: '0.82rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div 
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            style={{
              padding: '2rem',
              borderRadius: '12px',
              border: isDragging ? '2px dashed var(--primary)' : '1px dashed rgba(255, 255, 255, 0.1)',
              background: isDragging ? 'rgba(255, 45, 155, 0.04)' : 'rgba(255, 255, 255, 0.01)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={28} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '0.85rem', color: '#E1E1E6', fontWeight: 500 }}>
              Arraste e solte arquivos aqui ou clique para selecionar
            </span>
            <span style={{ fontSize: '0.72rem', color: '#666' }}>
              Suporta PNG, JPG, WEBP e SVG
            </span>
          </div>

          {/* Grid list */}
          {filteredAssets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#666', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '12px', background: 'rgba(0,0,0,0.1)' }}>
              <ImageIcon size={44} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#A1A1B5' }}>Nenhum asset encontrado</div>
              <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>Faça upload de novos arquivos ou crie stickers no Sticker Studio</div>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
              gap: '1.25rem' 
            }}>
              {filteredAssets.map(asset => (
                <div 
                  key={asset.id} 
                  className="card asset-card"
                  onClick={() => handleApplyInEditor(asset)}
                  style={{ 
                    padding: '8px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '8px', 
                    position: 'relative',
                    border: '1px solid rgba(255,255,255,0.05)',
                    background: 'rgba(15, 15, 15, 0.4)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, border-color 0.2s ease',
                    overflow: 'hidden',
                    borderRadius: '12px'
                  }}
                >
                  {/* Preview Wrap */}
                  <div style={{ 
                    height: '140px', 
                    borderRadius: '8px', 
                    background: 'rgba(0,0,0,0.3)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.03)',
                    position: 'relative'
                  }}>
                    <img 
                      src={asset.url} 
                      alt={asset.name} 
                      style={{ 
                        maxHeight: '85%', 
                        maxWidth: '85%', 
                        objectFit: 'contain',
                        transition: 'transform 0.3s ease' 
                      }} 
                    />
                    
                    {/* Badge type */}
                    <span style={{
                      position: 'absolute',
                      bottom: '8px',
                      left: '8px',
                      fontSize: '0.6rem',
                      textTransform: 'uppercase',
                      padding: '2px 6px',
                      borderRadius: '6px',
                      background: 'rgba(0, 0, 0, 0.75)',
                      backdropFilter: 'blur(4px)',
                      color: asset.type === 'upload' ? '#FF2D9B' : asset.type === 'sticker' ? '#FF4DB2' : asset.type === 'model' ? '#00E0FF' : '#FFB800',
                      border: '1px solid rgba(255,255,255,0.05)',
                      fontWeight: 600
                    }}>
                      {asset.type === 'upload' ? 'Upload' : asset.type === 'sticker' ? 'Sticker' : asset.type === 'model' ? 'Modelo IA' : 'Logo'}
                    </span>
                  </div>

                  {/* Info footer */}
                  <div style={{ padding: '4px 6px' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#E1E1E6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={asset.name}>
                      {asset.name}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <span style={{ fontSize: '0.62rem', color: '#666' }}>{asset.createdAt}</span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button 
                          onClick={(e) => handleDeleteAsset(asset, e)}
                          title="Excluir"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#888',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'color 0.2s, background 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#FF2D9B';
                            e.currentTarget.style.background = 'rgba(255, 45, 155, 0.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#888';
                            e.currentTarget.style.background = 'none';
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Glow Hover Layer */}
                  <div className="glow-on-hover-effect" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    pointerEvents: 'none',
                    border: '1px solid transparent',
                    borderRadius: '12px',
                    transition: 'border-color 0.2s ease'
                  }} />
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

      {/* Styled JSX styles injected inside page */}
      <style>{`
        .asset-card:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 45, 155, 0.3) !important;
          box-shadow: 0 8px 24px rgba(255, 45, 155, 0.08);
        }
        .asset-card:hover img {
          transform: scale(1.05);
        }
        .asset-card:hover .glow-on-hover-effect {
          border-color: rgba(255, 45, 155, 0.2) !important;
        }
      `}</style>
    </div>
  );
};

export default BrandManual;
