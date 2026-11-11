import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Calendar, 
  Clock, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Globe, 
  LogOut, 
  Check, 
  Image as ImageIcon,
  Smartphone,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePublisher } from '../../contexts/PublisherContext';
import type { PublisherPlatform } from '../../types/publisher';
import { supabase } from '../../lib/supabaseClient';
import { apiUrl } from '../../lib/apiClient';
import {
  getPostApprovalState,
  APPROVAL_STATE_LABELS,
  APPROVAL_STATE_PILL_CLASS,
  getApproveButtonState,
} from '../../lib/postApprovalState';

// Custom SVG Icons to avoid lucide-react version incompatibilities
const InstagramIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const FacebookIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const LinkedinIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const TwitterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
  </svg>
);

// Platform Config with styling & icons
const PLATFORMS_CONFIG: Record<PublisherPlatform, {
  name: string;
  color: string;
  bg: string;
  border: string;
  icon: React.ComponentType<any>;
}> = {
  Instagram: { name: 'Instagram', color: 'var(--primary)', bg: 'color-mix(in srgb, var(--primary) 8%, transparent)', border: 'color-mix(in srgb, var(--primary) 30%, transparent)', icon: InstagramIcon },
  Facebook: { name: 'Facebook', color: '#1877F2', bg: 'rgba(24, 119, 242, 0.08)', border: 'rgba(24, 119, 242, 0.3)', icon: FacebookIcon },
  LinkedIn: { name: 'LinkedIn', color: '#0A66C2', bg: 'rgba(10, 102, 194, 0.08)', border: 'rgba(10, 102, 194, 0.3)', icon: LinkedinIcon },
  'X/Twitter': { name: 'X / Twitter', color: '#FFFFFF', bg: 'rgba(255, 255, 255, 0.05)', border: 'rgba(255, 255, 255, 0.2)', icon: TwitterIcon },
  WordPress: { name: 'WordPress', color: '#21759B', bg: 'rgba(33, 117, 155, 0.08)', border: 'rgba(33, 117, 155, 0.3)', icon: Globe },
  Blog: { name: 'Blog Interno', color: 'var(--secondary)', bg: 'rgba(176, 38, 255, 0.08)', border: 'rgba(176, 38, 255, 0.3)', icon: FileText }
};

const TIMEZONES = [
  'America/Sao_Paulo (GMT-3)',
  'America/New_York (GMT-5)',
  'Europe/London (GMT+1)',
  'UTC'
];

// Mock images for quick selection
const MOCK_IMAGES = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1618005198143-e52834643542?w=800&auto=format&fit=crop&q=60',
];

const PublicadorAutomatico: React.FC = () => {
  const { 
    scheduledPosts, 
    socialAccounts, 
    createScheduledPost,
    deleteScheduledPost,
    connectAccount,
    disconnectAccount,
    publishPostNow,
    refreshScheduledPosts
  } = usePublisher();

  // Aprovação humana (correção Achado 1): só a proprietária vê o botão.
  // A visibilidade é só UI — o endpoint impõe o dono no servidor.
  const [isOwner, setIsOwner] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!supabase) return;
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const res = await fetch(apiUrl('/api/auth/owner-status'), {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) return;
        const body = await res.json().catch(() => ({}));
        if (alive && body.isOwner === true) setIsOwner(true);
      } catch {
        // Sem confirmação de dono, o botão fica escondido (fail-closed na UI).
      }
    })();
    return () => { alive = false; };
  }, []);

  // Aprovar NÃO publica: só regista approved_by/approved_at no servidor.
  // Um post agendado aprovado fica elegível para a sua janela (cron) —
  // isso não é publicação imediata.
  const handleApprovePost = async (id: string) => {
    setErrorFeedback(null);
    setApprovingId(id);
    try {
      if (!supabase) throw new Error('Supabase não configurado.');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sessão expirada. Faça login novamente.');
      const res = await fetch(apiUrl(`/api/posts/${id}/approve`), {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Falha ao aprovar (${res.status}).`);
      }
      await refreshScheduledPosts();
      setSuccessFeedback('Post aprovado. A publicação continua a depender do agendamento — nada foi publicado agora.');
    } catch (error) {
      setErrorFeedback(error instanceof Error ? error.message : 'Falha ao aprovar.');
    } finally {
      setApprovingId(null);
    }
  };

  // Composer Form State
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [rawHashtags, setRawHashtags] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<PublisherPlatform[]>([]);
  
  // Date & Time Agendamento State
  const [date, setDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1); // tomorrow
    return today.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('09:00');
  const [timezone, setTimezone] = useState('America/Sao_Paulo (GMT-3)');

  // Selected preview tab
  const [previewPlatform, setPreviewPlatform] = useState<PublisherPlatform>('Instagram');

  // Account Connect UI helper
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [modalPlatform, setModalPlatform] = useState<PublisherPlatform | null>(null);
  const [accountNameInput, setAccountNameInput] = useState('');

  // Local feedback messages
  const [successFeedback, setSuccessFeedback] = useState<string | null>(null);
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);

  // Load temporary media sent from visual editor if present
  useEffect(() => {
    try {
      const tempMedia = localStorage.getItem('pink_logic_temp_editor_media');
      if (tempMedia) {
        setMediaUrl(tempMedia);
        localStorage.removeItem('pink_logic_temp_editor_media');
      }
    } catch (e) {
      console.warn('[PublicadorAutomatico] Failed to read temp editor media:', e);
    }
  }, []);

  const togglePlatformSelection = (plat: PublisherPlatform) => {
    setSelectedPlatforms(prev => 
      prev.includes(plat) ? prev.filter(p => p !== plat) : [...prev, plat]
    );
    // Set preview platform to the newly selected one
    setPreviewPlatform(plat);
  };

  const handleConnectRequest = (platform: PublisherPlatform) => {
    setModalPlatform(platform);
    setAccountNameInput('');
    setShowConnectModal(true);
  };

  const confirmConnect = () => {
    if (modalPlatform) {
      try { connectAccount(modalPlatform, accountNameInput || `conta_${modalPlatform.toLowerCase()}`); }
      catch (error) { setErrorFeedback(error instanceof Error ? error.message : 'Falha ao conectar.'); }
      setShowConnectModal(false);
      setModalPlatform(null);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorFeedback('Por favor, informe o título da publicação.');
      return;
    }

    if (selectedPlatforms.length === 0) {
      setErrorFeedback('Selecione pelo menos uma plataforma para agendamento.');
      return;
    }

    // Compose scheduled_at
    const scheduledDateTime = new Date(`${date}T${time}`);
    if (isNaN(scheduledDateTime.getTime())) {
      setErrorFeedback('Data ou hora inválida.');
      return;
    }

    // Process hashtags array
    const hashtags = rawHashtags
      .split(/[ ,#]+/)
      .map(t => t.trim())
      .filter(t => t.length > 0);

    try { await createScheduledPost({
      title,
      caption,
      hashtags,
      media_url: mediaUrl || undefined,
      media_type: mediaUrl ? 'image' : undefined,
      platforms: selectedPlatforms,
      scheduled_at: scheduledDateTime.toISOString(),
      timezone,
    }); } catch (error) { setErrorFeedback(error instanceof Error ? error.message : 'Falha ao salvar.'); return; }

    // Reset Composer
    setTitle('');
    setCaption('');
    setRawHashtags('');
    setMediaUrl('');
    setSelectedPlatforms([]);
    setErrorFeedback(null);
    
    setSuccessFeedback('Planejamento salvo. O envio automático às redes ainda não está configurado.');
    setTimeout(() => setSuccessFeedback(null), 4000);
  };

  // O estado exibido vem de getPostApprovalState (lib/postApprovalState):
  // 6 estados inequívocos (Rascunho, Pendente de aprovação, Aprovado,
  // Agendado, Publicado, Bloqueado) em vez do status cru da base.
  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleString('pt-BR', { 
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <div className="publicador-page">
      <header className="page-header">
        <div>
          <h1 className="brand-font neon-text">Publicador Automático</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Agende e envie suas publicações para múltiplas plataformas simultaneamente</p>
        </div>
      </header>

      {successFeedback && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="alert-success">
          <CheckCircle2 size={18} />
          <span>{successFeedback}</span>
        </motion.div>
      )}

      {errorFeedback && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="alert-danger">
          <AlertCircle size={18} />
          <span>{errorFeedback}</span>
        </motion.div>
      )}

      <div className="publisher-grid">
        {/* LEFT COLUMN: COMPOSER, CHANNELS, SCHEDULING */}
        <div className="left-column">
          <form onSubmit={handleScheduleSubmit} className="card form-card">
            <h3 className="card-title brand-font">Criar Nova Publicação</h3>

            <div className="form-group">
              <label>Título do Post (Interno)</label>
              <input 
                type="text" 
                className="input-field" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="Ex: Lançamento de produto principal"
              />
            </div>

            <div className="form-group">
              <label>Conteúdo / Legenda</label>
              <textarea 
                className="input-field textarea-field" 
                value={caption} 
                onChange={e => setCaption(e.target.value)} 
                placeholder="Escreva sua legenda aqui..."
                rows={4}
              />
            </div>

            <div className="form-group">
              <label>Hashtags (separadas por espaço ou vírgula)</label>
              <input 
                type="text" 
                className="input-field" 
                value={rawHashtags} 
                onChange={e => setRawHashtags(e.target.value)} 
                placeholder="dicas marketing vendas"
              />
            </div>

            <div className="form-group">
              <label>Imagem da Publicação (URL)</label>
              <input 
                type="text" 
                className="input-field" 
                value={mediaUrl} 
                onChange={e => setMediaUrl(e.target.value)} 
                placeholder="Insira a URL de uma imagem..."
              />
              <div className="quick-images">
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Ou use uma imagem modelo:</span>
                <div className="image-thumbs">
                  {MOCK_IMAGES.map((img, idx) => (
                    <img 
                      key={idx} 
                      src={img} 
                      alt={`Modelo ${idx + 1}`} 
                      className={`thumb ${mediaUrl === img ? 'active' : ''}`}
                      onClick={() => setMediaUrl(img)}
                    />
                  ))}
                  {mediaUrl && (
                    <button type="button" className="clear-img-btn" onClick={() => setMediaUrl('')}>Remover</button>
                  )}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Selecione os Canais</label>
              <div className="platforms-selection-grid">
                {(Object.keys(PLATFORMS_CONFIG) as PublisherPlatform[]).map(plat => {
                  const isSelected = selectedPlatforms.includes(plat);
                  const isConnected = socialAccounts.some(acc => acc.platform === plat && acc.status === 'connected');
                  const cfg = PLATFORMS_CONFIG[plat];
                  const Icon = cfg.icon;

                  return (
                    <button
                      key={plat}
                      type="button"
                      className={`platform-select-card ${isSelected ? 'selected' : ''} ${!isConnected ? 'disconnected-card' : ''}`}
                      onClick={() => {
                        if (!isConnected) {
                          handleConnectRequest(plat);
                        } else {
                          togglePlatformSelection(plat);
                        }
                      }}
                    >
                      <div className="card-icon-wrap" style={{ color: cfg.color, background: cfg.bg }}>
                        <Icon size={18} />
                      </div>
                      <span className="platform-name">{cfg.name}</span>
                      <div className="checkbox-indicator">
                        {isSelected ? <Check size={12} className="check-icon" /> : null}
                        {!isConnected ? <span className="connect-badge">Conectar</span> : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="scheduling-section">
              <h4 className="section-subtitle brand-font">Agendamento</h4>
              <div className="scheduling-row">
                <div className="form-group flex-1">
                  <label><Calendar size={14} style={{ marginRight: 4 }} /> Data</label>
                  <input 
                    type="date" 
                    className="input-field" 
                    value={date} 
                    onChange={e => setDate(e.target.value)} 
                  />
                </div>
                <div className="form-group flex-1">
                  <label><Clock size={14} style={{ marginRight: 4 }} /> Hora</label>
                  <input 
                    type="time" 
                    className="input-field" 
                    value={time} 
                    onChange={e => setTime(e.target.value)} 
                  />
                </div>
              </div>
              <div className="form-group" style={{ marginTop: '0.75rem' }}>
                <label>Timezone</label>
                <select 
                  className="input-field" 
                  value={timezone} 
                  onChange={e => setTimezone(e.target.value)}
                >
                  {TIMEZONES.map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" className="btn-primary submit-btn">
              <Send size={18} />
              <span>Agendar Publicação</span>
            </button>
          </form>

          {/* CONNECTED ACCOUNTS CARD */}
          <div className="card accounts-card" style={{ marginTop: '1.5rem' }}>
            <h3 className="card-title brand-font">Contas Conectadas (Mock)</h3>
            <div className="accounts-list">
              {socialAccounts.map(acc => {
                const cfg = PLATFORMS_CONFIG[acc.platform];
                const Icon = cfg?.icon || Globe;
                const isConnected = acc.status === 'connected';

                return (
                  <div key={acc.id} className="account-row">
                    <div className="account-info">
                      <div className="plat-badge" style={{ color: cfg?.color, background: cfg?.bg }}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <div className="account-name">{isConnected ? acc.account_name : 'Nenhuma conta vinculada'}</div>
                        <div className="platform-label">{acc.platform}</div>
                      </div>
                    </div>
                    {isConnected ? (
                      <button 
                        type="button" 
                        className="btn-disconnect" 
                        onClick={() => disconnectAccount(acc.id)}
                        title="Desconectar conta"
                      >
                        <LogOut size={14} />
                        <span>Desconectar</span>
                      </button>
                    ) : (
                      <button 
                        type="button" 
                        className="btn-connect-action"
                        onClick={() => handleConnectRequest(acc.platform)}
                      >
                        <span>Conectar</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PREVIEW PANEL */}
        <div className="right-column">
          <div className="card preview-card">
            <div className="preview-header">
              <Smartphone size={18} />
              <h3 className="brand-font">Visualização Prévia</h3>
            </div>
            
            <div className="preview-tabs">
              {(Object.keys(PLATFORMS_CONFIG) as PublisherPlatform[]).map(plat => (
                <button
                  key={plat}
                  type="button"
                  className={`preview-tab-btn ${previewPlatform === plat ? 'active' : ''}`}
                  onClick={() => setPreviewPlatform(plat)}
                >
                  {plat}
                </button>
              ))}
            </div>

            <div className="smartphone-body">
              <div className="smartphone-notch"></div>
              <div className="smartphone-content">
                
                {/* INSTAGRAM PREVIEW */}
                {previewPlatform === 'Instagram' && (
                  <div className="instagram-preview">
                    <div className="ig-header">
                      <div className="ig-avatar"></div>
                      <div className="ig-meta">
                        <span className="ig-username">pinklogic_ig</span>
                        <span className="ig-location">Patrocinado</span>
                      </div>
                    </div>
                    <div className="ig-image-holder">
                      {mediaUrl ? (
                        <img src={mediaUrl} alt="Post image" className="ig-image" />
                      ) : (
                        <div className="ig-image-placeholder">
                          <ImageIcon size={48} style={{ opacity: 0.2 }} />
                          <span>Sem Imagem</span>
                        </div>
                      )}
                    </div>
                    <div className="ig-actions">
                      <div className="ig-actions-left">
                        <span className="ig-heart">❤️</span>
                        <span className="ig-comment">💬</span>
                        <span className="ig-send">✈️</span>
                      </div>
                      <span className="ig-bookmark">📥</span>
                    </div>
                    <div className="ig-body">
                      <span className="ig-likes">1.234 curtidas</span>
                      <p className="ig-caption">
                        <span className="ig-username-bold">pinklogic_ig </span>
                        {caption || 'Escreva sua legenda no composer para visualizar aqui...'}
                      </p>
                      <p className="ig-tags">
                        {rawHashtags ? rawHashtags.split(/[ ,#]+/).filter(t => t).map(t => `#${t} `) : '#marketing #design'}
                      </p>
                    </div>
                  </div>
                )}

                {/* X/TWITTER PREVIEW */}
                {previewPlatform === 'X/Twitter' && (
                  <div className="twitter-preview">
                    <div className="tw-header">
                      <div className="tw-avatar"></div>
                      <div className="tw-meta">
                        <span className="tw-name notranslate" translate="no">PinkLogic AI</span>
                        <span className="tw-handle">@pinklogic_ai</span>
                      </div>
                    </div>
                    <div className="tw-body">
                      <p className="tw-text">
                        {caption || 'Escreva sua legenda no composer para visualizar aqui...'}
                        {rawHashtags && ' ' + rawHashtags.split(/[ ,#]+/).filter(t => t).map(t => `#${t}`).join(' ')}
                      </p>
                      {mediaUrl && (
                        <div className="tw-image-holder">
                          <img src={mediaUrl} alt="Post image" className="tw-image" />
                        </div>
                      )}
                      <div className="tw-timestamp">21:45 · 25 de mai de 2026 · <span className="notranslate" translate="no" style={{ color: 'var(--primary)' }}>PinkLogic</span></div>
                      <div className="tw-actions">
                        <span>💬 12</span>
                        <span>🔁 34</span>
                        <span>❤️ 156</span>
                        <span>📊 4.2k</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* LINKEDIN PREVIEW */}
                {previewPlatform === 'LinkedIn' && (
                  <div className="linkedin-preview">
                    <div className="li-header">
                      <div className="li-avatar"></div>
                      <div className="li-meta">
                        <span className="li-name notranslate" translate="no">PinkLogic Corporation</span>
                        <span className="li-sub">1.423 seguidores • Promovido</span>
                      </div>
                    </div>
                    <div className="li-body">
                      <p className="li-text">
                        {caption || 'Escreva sua legenda no composer para visualizar aqui...'}
                      </p>
                      <p className="li-tags">
                        {rawHashtags ? rawHashtags.split(/[ ,#]+/).filter(t => t).map(t => `#${t} `) : ''}
                      </p>
                      {mediaUrl && (
                        <div className="li-image-holder">
                          <img src={mediaUrl} alt="Post image" className="li-image" />
                        </div>
                      )}
                      <div className="li-actions">
                        <span>👍 Curtir</span>
                        <span>💬 Comentar</span>
                        <span>🔁 Compartilhar</span>
                        <span>✈️ Enviar</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* WORDPRESS / BLOG PREVIEW */}
                {(previewPlatform === 'WordPress' || previewPlatform === 'Blog') && (
                  <div className="blog-preview">
                    <div className="blog-category">{previewPlatform === 'WordPress' ? 'WORDPRESS SITE' : 'BLOG INTERNO'}</div>
                    <h2 className="blog-title">{title || 'Título da Publicação'}</h2>
                    <div className="blog-meta">Por Editor Pink • 25 de Maio de 2026</div>
                    {mediaUrl && (
                      <img src={mediaUrl} alt="Post cover" className="blog-image" />
                    )}
                    <div className="blog-content">
                      <p>{caption || 'Escreva sua legenda no composer para visualizar aqui...'}</p>
                      <div className="blog-tags">
                        {rawHashtags && rawHashtags.split(/[ ,#]+/).filter(t => t).map((t, i) => (
                          <span key={i} className="blog-tag-pill">#{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SCHEDULED POSTS LIST */}
      <div className="card posts-list-card" style={{ marginTop: '2rem' }}>
        <div className="list-header-row">
          <h3 className="card-title brand-font">Fila de Publicação</h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{scheduledPosts.length} postagens no total</span>
        </div>

        <div className="table-responsive">
          <table className="posts-table">
            <thead>
              <tr>
                <th>Postagem</th>
                <th>Canais</th>
                <th>Agendamento</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {scheduledPosts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-row">
                    Nenhum post agendado ainda. Use o composer acima para agendar o seu primeiro post.
                  </td>
                </tr>
              ) : (
                scheduledPosts.map(post => (
                  <tr key={post.id}>
                    <td>
                      <div className="post-cell">
                        {post.media_url ? (
                          <img src={post.media_url} alt="" className="post-cell-thumb" />
                        ) : (
                          <div className="post-cell-thumb placeholder-thumb">
                            <FileText size={16} />
                          </div>
                        )}
                        <div>
                          <div className="post-cell-title">{post.title}</div>
                          <div className="post-cell-caption">{post.caption ? post.caption.substring(0, 60) + '...' : 'Sem legenda'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="channels-cell">
                        {post.platforms.map(plat => {
                          const cfg = PLATFORMS_CONFIG[plat];
                          const Icon = cfg?.icon || Globe;
                          return (
                            <span 
                              key={plat} 
                              className="channel-icon-pill" 
                              style={{ color: cfg?.color, background: cfg?.bg, border: `1px solid ${cfg?.border}` }}
                              title={plat}
                            >
                              <Icon size={12} />
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td>
                      <div className="date-cell">
                        <div>{formatDate(post.scheduled_at)}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{post.timezone}</div>
                      </div>
                    </td>
                    <td>
                      <div>
                        {(() => {
                          const approvalState = getPostApprovalState(post);
                          return (
                            <span className={APPROVAL_STATE_PILL_CLASS[approvalState]}>
                              {APPROVAL_STATE_LABELS[approvalState]}
                            </span>
                          );
                        })()}
                        {post.status === 'failed' && post.error_message && (
                          <div className="error-tooltip" title={post.error_message}>
                            <AlertTriangle size={12} style={{ color: '#ef4444', marginLeft: 4 }} />
                            <span className="tooltip-text">{post.error_message}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="actions-cell">
                        {(() => {
                          const btnState = getApproveButtonState(post, isOwner);
                          if (btnState === 'hidden') return null;
                          const disabled = btnState === 'disabled-jev' || approvingId === post.id;
                          return (
                            <button
                              type="button"
                              className="btn-action-icon flex-center approve"
                              disabled={disabled}
                              onClick={() => handleApprovePost(post.id)}
                              title={btnState === 'disabled-jev'
                                ? 'O Jev reprovou este post — a aprovação não o desbloqueia. Reveja o conteúdo e reagende.'
                                : 'Aprovar para publicação (não publica agora)'}
                            >
                              <CheckCircle2 size={14} />
                            </button>
                          );
                        })()}
                        {post.status === 'scheduled' && (
                          <button
                            type="button"
                            className="btn-action-icon flex-center"
                            onClick={() => publishPostNow(post.id).catch(error => setErrorFeedback(error.message))}
                            title="Publicar agora"
                          >
                            <Send size={14} />
                          </button>
                        )}
                        <button 
                          type="button" 
                          className="btn-action-icon flex-center delete"
                          onClick={() => deleteScheduledPost(post.id)}
                          title="Excluir postagem"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONNECT MODAL MOCK */}
      <AnimatePresence>
        {showConnectModal && modalPlatform && (
          <div className="modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card modal-content"
            >
              <h2 className="brand-font" style={{ marginBottom: '0.5rem' }}>Conectar ao {modalPlatform}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Simulação de OAuth. Insira um nome de usuário para simular a conexão de sua conta empresarial.
              </p>

              <div className="form-group">
                <label>Nome da Conta / Perfil</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={accountNameInput} 
                  onChange={e => setAccountNameInput(e.target.value)} 
                  placeholder={modalPlatform === 'X/Twitter' ? '@seu_perfil' : 'Nome de usuário'}
                  autoFocus
                />
              </div>

              <div className="form-actions" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => { setShowConnectModal(false); setModalPlatform(null); }}>Cancelar</button>
                <button type="button" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={confirmConnect}>Conectar Conta</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .publicador-page {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .publisher-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 1.5rem;
          align-items: start;
        }

        @media (max-width: 1024px) {
          .publisher-grid {
            grid-template-columns: 1fr;
          }
        }

        .form-card {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .card-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: white;
          margin-bottom: 0.25rem;
        }

        .section-subtitle {
          font-size: 1.05rem;
          color: white;
          border-bottom: 1px solid var(--border);
          padding-bottom: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .form-group label {
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .textarea-field {
          resize: vertical;
          font-family: inherit;
        }

        .quick-images {
          margin-top: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .image-thumbs {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .image-thumbs img.thumb {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          object-fit: cover;
          cursor: pointer;
          border: 2px solid transparent;
          transition: var(--transition);
        }

        .image-thumbs img.thumb:hover {
          transform: scale(1.05);
        }

        .image-thumbs img.thumb.active {
          border-color: var(--primary);
          box-shadow: 0 0 10px color-mix(in srgb, var(--primary) 40%, transparent);
        }

        .clear-img-btn {
          font-size: 0.75rem;
          color: #ef4444;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.1);
        }

        .clear-img-btn:hover {
          background: rgba(239, 68, 68, 0.15);
        }

        .platforms-selection-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }

        @media (max-width: 640px) {
          .platforms-selection-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .platform-select-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 0.5rem;
          border-radius: var(--radius-md);
          background: var(--input);
          border: 1px solid var(--border);
          transition: var(--transition);
          position: relative;
          cursor: pointer;
        }

        .platform-select-card:hover {
          border-color: rgba(255, 255, 255, 0.15);
          background: rgba(255, 255, 255, 0.02);
        }

        .platform-select-card.selected {
          border-color: var(--primary);
          background: color-mix(in srgb, var(--primary) 4%, transparent);
        }

        .card-icon-wrap {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .platform-name {
          font-size: 0.8rem;
          font-weight: 600;
          color: white;
        }

        .checkbox-indicator {
          position: absolute;
          top: 8px;
          right: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .check-icon {
          color: var(--primary);
          background: color-mix(in srgb, var(--primary) 10%, transparent);
          border-radius: 50%;
          padding: 1px;
        }

        .connect-badge {
          font-size: 0.65rem;
          font-weight: 600;
          color: var(--text-secondary);
          background: rgba(255, 255, 255, 0.05);
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid var(--border);
        }

        .disconnected-card {
          opacity: 0.75;
        }

        .disconnected-card:hover {
          opacity: 1;
          border-color: var(--text-secondary);
        }

        .scheduling-row {
          display: flex;
          gap: 1rem;
        }

        .flex-1 {
          flex: 1;
        }

        .submit-btn {
          width: 100%;
          justify-content: center;
          padding: 0.85rem;
          font-size: 1rem;
          margin-top: 0.5rem;
        }

        /* ACCOUNTS CARD */
        .accounts-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .account-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          background: var(--input);
          border: 1px solid var(--border);
        }

        .account-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .plat-badge {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .account-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: white;
        }

        .platform-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .btn-disconnect {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          color: #ef4444;
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.1);
          padding: 0.4rem 0.75rem;
          border-radius: 100px;
          font-weight: 600;
          transition: var(--transition);
        }

        .btn-disconnect:hover {
          background: rgba(239, 68, 68, 0.15);
        }

        .btn-connect-action {
          font-size: 0.75rem;
          color: white;
          background: var(--gradient);
          padding: 0.4rem 0.75rem;
          border-radius: 100px;
          font-weight: 600;
          transition: var(--transition);
        }

        .btn-connect-action:hover {
          filter: brightness(1.1);
        }

        /* PREVIEW PANEL */
        .preview-card {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          position: sticky;
          top: 100px;
        }

        .preview-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: white;
        }

        .preview-tabs {
          display: flex;
          gap: 0.25rem;
          background: var(--input);
          padding: 0.25rem;
          border-radius: 8px;
          border: 1px solid var(--border);
          overflow-x: auto;
        }

        .preview-tab-btn {
          flex: 1;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
          padding: 0.5rem 0.25rem;
          border-radius: 6px;
          text-align: center;
          white-space: nowrap;
          transition: var(--transition);
        }

        .preview-tab-btn:hover {
          color: white;
        }

        .preview-tab-btn.active {
          color: white;
          background: var(--card);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        /* SMARTPHONE BODY MOCK */
        .smartphone-body {
          background: #000;
          border: 10px solid #1a1a24;
          border-radius: 40px;
          height: 520px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          display: flex;
          flex-direction: column;
        }

        .smartphone-notch {
          width: 120px;
          height: 18px;
          background: #1a1a24;
          border-bottom-left-radius: 12px;
          border-bottom-right-radius: 12px;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
        }

        .smartphone-content {
          flex: 1;
          padding: 24px 16px 16px 16px;
          overflow-y: auto;
          background: #0b0b0f;
          font-size: 0.8rem;
        }

        /* INSTAGRAM FEED PREVIEW */
        .instagram-preview {
          background: #000;
          border-radius: 12px;
          border: 1px solid #15151f;
          overflow: hidden;
        }

        .ig-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 8px 12px;
        }

        .ig-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--gradient);
        }

        .ig-meta {
          display: flex;
          flex-direction: column;
        }

        .ig-username {
          font-weight: 600;
          color: white;
        }

        .ig-location {
          font-size: 0.65rem;
          color: var(--text-secondary);
        }

        .ig-image-holder {
          aspect-ratio: 1;
          background: #111116;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .ig-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .ig-image-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
        }

        .ig-actions {
          display: flex;
          justify-content: space-between;
          padding: 8px 12px;
          font-size: 1rem;
        }

        .ig-actions-left {
          display: flex;
          gap: 0.75rem;
        }

        .ig-body {
          padding: 0 12px 12px 12px;
        }

        .ig-likes {
          font-weight: 600;
          color: white;
          display: block;
          margin-bottom: 4px;
        }

        .ig-username-bold {
          font-weight: 700;
          color: white;
        }

        .ig-caption {
          color: #eee;
          line-height: 1.3;
          word-break: break-word;
        }

        .ig-tags {
          color: #0095f6;
          margin-top: 4px;
        }

        /* TWITTER / X PREVIEW */
        .twitter-preview {
          background: #000;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid #15151f;
        }

        .tw-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 8px;
        }

        .tw-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: color-mix(in srgb, var(--primary) 40%, transparent);
        }

        .tw-meta {
          display: flex;
          flex-direction: column;
        }

        .tw-name {
          font-weight: 700;
          color: white;
        }

        .tw-handle {
          font-size: 0.7rem;
          color: var(--text-secondary);
        }

        .tw-text {
          color: #e7e9ea;
          line-height: 1.4;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .tw-image-holder {
          margin-top: 8px;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #2f3336;
        }

        .tw-image {
          width: 100%;
          display: block;
          max-height: 200px;
          object-fit: cover;
        }

        .tw-timestamp {
          margin-top: 12px;
          font-size: 0.7rem;
          color: var(--text-secondary);
          border-bottom: 1px solid #2f3336;
          padding-bottom: 8px;
        }

        .tw-actions {
          display: flex;
          justify-content: space-between;
          margin-top: 8px;
          color: var(--text-secondary);
          font-size: 0.7rem;
        }

        /* LINKEDIN PREVIEW */
        .linkedin-preview {
          background: #1d2226;
          padding: 12px;
          border-radius: 12px;
          color: #f3f5f7;
        }

        .li-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 8px;
        }

        .li-avatar {
          width: 36px;
          height: 36px;
          border-radius: 4px;
          background: var(--secondary);
        }

        .li-meta {
          display: flex;
          flex-direction: column;
        }

        .li-name {
          font-weight: 600;
          font-size: 0.85rem;
          color: white;
        }

        .li-sub {
          font-size: 0.65rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .li-text {
          line-height: 1.4;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .li-tags {
          color: #70b5f9;
          margin-top: 4px;
        }

        .li-image-holder {
          margin-top: 8px;
          margin-left: -12px;
          margin-right: -12px;
          background: #000;
        }

        .li-image {
          width: 100%;
          max-height: 220px;
          object-fit: cover;
          display: block;
        }

        .li-actions {
          display: flex;
          justify-content: space-between;
          margin-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 8px;
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.7);
        }

        /* BLOG PREVIEW */
        .blog-preview {
          background: #111116;
          padding: 16px;
          border-radius: 12px;
          border: 1px solid #1c1c28;
        }

        .blog-category {
          color: var(--primary);
          font-weight: 700;
          font-size: 0.65rem;
          letter-spacing: 0.05em;
          margin-bottom: 4px;
        }

        .blog-title {
          font-family: 'Outfit', sans-serif;
          color: white;
          font-size: 1.15rem;
          line-height: 1.25;
          margin-bottom: 6px;
        }

        .blog-meta {
          font-size: 0.65rem;
          color: var(--text-secondary);
          margin-bottom: 12px;
        }

        .blog-image {
          width: 100%;
          border-radius: 8px;
          max-height: 150px;
          object-fit: cover;
          margin-bottom: 12px;
        }

        .blog-content {
          color: #c9c9d4;
          line-height: 1.5;
          word-break: break-word;
        }

        .blog-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          margin-top: 12px;
        }

        .blog-tag-pill {
          background: rgba(255, 255, 255, 0.05);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.65rem;
          color: var(--text-secondary);
        }

        /* FILA / POSTS TABLE */
        .posts-list-card {
          padding: 1.5rem 0 0 0;
          overflow: hidden;
        }

        .list-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 1.5rem 1rem 1.5rem;
          border-bottom: 1px solid var(--border);
        }

        .table-responsive {
          overflow-x: auto;
          width: 100%;
        }

        .posts-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .posts-table th {
          padding: 1rem 1.5rem;
          font-size: 0.8rem;
          text-transform: uppercase;
          color: var(--text-secondary);
          font-weight: 600;
          background: rgba(255, 255, 255, 0.01);
          border-bottom: 1px solid var(--border);
        }

        .posts-table td {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--border);
          font-size: 0.85rem;
        }

        .posts-table tr:last-child td {
          border-bottom: none;
        }

        .posts-table tr:hover td {
          background: rgba(255, 255, 255, 0.01);
        }

        .empty-row {
          text-align: center;
          color: var(--text-secondary);
          padding: 3rem 1.5rem !important;
          font-style: italic;
        }

        .post-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .post-cell-thumb {
          width: 40px;
          height: 40px;
          border-radius: 6px;
          object-fit: cover;
        }

        .placeholder-thumb {
          background: var(--input);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
        }

        .post-cell-title {
          font-weight: 600;
          color: white;
        }

        .post-cell-caption {
          font-size: 0.75rem;
          color: var(--text-secondary);
          max-width: 250px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .channels-cell {
          display: flex;
          gap: 0.35rem;
        }

        .channel-icon-pill {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.25rem 0.6rem;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .status-pill.posted {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .status-pill.scheduled {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }

        .status-pill.publishing {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
          animation: pulse 1.5s infinite ease-in-out;
        }

        .status-pill.failed {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .status-pill.draft {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-secondary);
        }

        .status-pill.pending {
          background: rgba(168, 85, 247, 0.1);
          color: #a855f7;
        }

        .status-pill.approved {
          background: rgba(16, 185, 129, 0.05);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.4);
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        .actions-cell {
          display: flex;
          gap: 0.5rem;
        }

        .btn-action-icon {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: 1px solid var(--border);
          color: var(--text-secondary);
          transition: var(--transition);
        }

        .btn-action-icon:hover {
          color: white;
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.15);
        }

        .btn-action-icon.delete:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.05);
          border-color: rgba(239, 68, 68, 0.2);
        }

        .btn-action-icon.approve {
          color: #10b981;
        }

        .btn-action-icon.approve:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .flex-center {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* error tooltip styling */
        .error-tooltip {
          display: inline-flex;
          align-items: center;
          position: relative;
          cursor: help;
        }

        .error-tooltip .tooltip-text {
          visibility: hidden;
          width: 200px;
          background-color: #1c1c28;
          color: #fff;
          text-align: center;
          border-radius: 6px;
          padding: 8px;
          position: absolute;
          z-index: 10;
          bottom: 125%;
          left: 50%;
          transform: translateX(-50%);
          opacity: 0;
          transition: opacity 0.2s;
          border: 1px solid #ef4444;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          font-size: 0.75rem;
          line-height: 1.3;
        }

        .error-tooltip:hover .tooltip-text {
          visibility: visible;
          opacity: 1;
        }

        /* MODAL STYLING */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1.5rem;
        }

        .modal-content {
          background: var(--card);
          padding: 2rem;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          width: 100%;
          max-width: 440px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
        }

        /* ALERT STYLING */
        .alert-success {
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #10b981;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .alert-danger {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #ef4444;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
};

export default PublicadorAutomatico;
