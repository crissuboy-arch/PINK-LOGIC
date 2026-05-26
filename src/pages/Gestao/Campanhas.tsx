import { useState, useMemo } from 'react';
import { 
  Plus, 
  Package, 
  Target, 
  MessageCircle, 
  ChevronRight,
  MoreHorizontal,
  Calendar as CalendarIcon,
  Trash2,
  Edit2
} from 'lucide-react';

import { useLanguage } from '../../contexts/LanguageContext';
import { useProducts } from '../../contexts/ProductContext';
import { useCentralStore } from '../../store/CentralStore';
import type { Campaign } from '../../store/types';

const Campanhas = () => {
  const { t } = useLanguage();
  const { products: allProducts } = useProducts();
  const productOptions = useMemo(() => allProducts.map(p => p.name), [allProducts]);
  
  const {
    campaigns: centralCampaigns,
    activeProjectId,
    createCampaign,
    updateCampaign,
    deleteCampaign,
  } = useCentralStore();

  const campaigns = useMemo(() => {
    return centralCampaigns.filter(c => c.projectId === activeProjectId);
  }, [centralCampaigns, activeProjectId]);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    name: '',
    mainProduct: '',
    secondaryProduct: '',
    message: '',
    status: 'draft' as Campaign['status'],
    goal: '',
    cta: '',
    startDate: '',
    endDate: '',
  });

  const [showDropdownId, setShowDropdownId] = useState<string | null>(null);

  const openNew = () => {
    setEditId(null);
    setForm({
      name: '',
      mainProduct: '',
      secondaryProduct: '',
      message: '',
      status: 'draft',
      goal: '',
      cta: '',
      startDate: new Date().toISOString().substring(0, 10),
      endDate: '',
    });
    setShowForm(true);
  };

  const openEdit = (c: Campaign) => {
    setEditId(c.id);
    setForm({
      name: c.name,
      mainProduct: c.mainProduct,
      secondaryProduct: c.secondaryProduct,
      message: c.message,
      status: c.status,
      goal: c.goal || '',
      cta: c.cta || '',
      startDate: c.startDate ? c.startDate.substring(0, 10) : '',
      endDate: c.endDate ? c.endDate.substring(0, 10) : '',
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (editId) {
      await updateCampaign(editId, {
        name: form.name,
        mainProduct: form.mainProduct,
        secondaryProduct: form.secondaryProduct,
        message: form.message,
        status: form.status,
        goal: form.goal,
        cta: form.cta,
        startDate: form.startDate,
        endDate: form.endDate || undefined,
      });
    } else {
      await createCampaign({
        projectId: activeProjectId || 'default-project-1',
        name: form.name,
        mainProduct: form.mainProduct,
        secondaryProduct: form.secondaryProduct,
        message: form.message,
        status: form.status,
        goal: form.goal,
        cta: form.cta,
        startDate: form.startDate,
        endDate: form.endDate || undefined,
        linkedPostIds: [],
      });
    }
    setShowForm(false);
    setEditId(null);
  };

  return (
    <div className="campanhas-page">
      <header className="page-header">
        <div>
          <h1 className="brand-font">{t('campaigns.title')}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{t('campaigns.subtitle')}</p>
        </div>
        
        <button className="btn-primary" onClick={openNew}>
          <Plus size={18} />
          <span>{t('campaigns.new_campaign')}</span>
        </button>
      </header>

      <div className="campanhas-grid">
        {campaigns.map(campaign => (
          <div key={campaign.id} className="card campaign-card" style={{ position: 'relative' }}>
            <div className="campaign-header">
              <div className="campaign-info">
                <div className={`status-badge ${campaign.status}`} style={{
                  display: 'inline-block',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  background: campaign.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  color: campaign.status === 'active' ? '#10b981' : 'var(--text-secondary)'
                }}>
                  {campaign.status === 'active' ? t('campaigns.status_active') : t('campaigns.status_draft')}
                </div>
                <h3 style={{ marginTop: '0.5rem', color: 'white', fontSize: '1.2rem' }}>{campaign.name}</h3>
              </div>
              <div style={{ position: 'relative' }}>
                <button className="icon-btn-sm" onClick={() => setShowDropdownId(showDropdownId === campaign.id ? null : campaign.id)}>
                  <MoreHorizontal size={18} />
                </button>
                {showDropdownId === campaign.id && (
                  <div className="dropdown-menu-box" style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: '120px',
                    overflow: 'hidden'
                  }}>
                    <button onClick={() => { openEdit(campaign); setShowDropdownId(null); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', fontSize: '0.8rem', color: 'white', borderBottom: '1px solid var(--border)', width: '100%', textAlign: 'left' }}>
                      <Edit2 size={12} /> Editar
                    </button>
                    <button onClick={() => { deleteCampaign(campaign.id); setShowDropdownId(null); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', fontSize: '0.8rem', color: '#ef4444', width: '100%', textAlign: 'left' }}>
                      <Trash2 size={12} /> Excluir
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="campaign-details">
              <div className="detail-item">
                <Package size={16} />
                <div className="detail-text">
                  <span className="detail-label">{t('campaigns.main_product')}</span>
                  <span className="detail-value">{campaign.mainProduct}</span>
                </div>
              </div>
              <div className="detail-item">
                <Target size={16} />
                <div className="detail-text">
                  <span className="detail-label">{t('campaigns.secondary_product')}</span>
                  <span className="detail-value">{campaign.secondaryProduct || 'Nenhum'}</span>
                </div>
              </div>
              
              {campaign.goal && (
                <div className="detail-item">
                  <Target size={16} style={{ color: 'var(--primary)' }} />
                  <div className="detail-text">
                    <span className="detail-label">Meta / Objetivo</span>
                    <span className="detail-value">{campaign.goal}</span>
                  </div>
                </div>
              )}

              {campaign.startDate && (
                <div className="detail-item">
                  <CalendarIcon size={16} />
                  <div className="detail-text">
                    <span className="detail-label">Período</span>
                    <span className="detail-value" style={{ fontSize: '0.8rem' }}>
                      {new Date(campaign.startDate).toLocaleDateString()}
                      {campaign.endDate ? ` a ${new Date(campaign.endDate).toLocaleDateString()}` : ' (Contínuo)'}
                    </span>
                  </div>
                </div>
              )}

              <div className="detail-item full-width">
                <MessageCircle size={16} />
                <div className="detail-text">
                  <span className="detail-label">{t('campaigns.message')}</span>
                  <p className="detail-value" style={{ fontWeight: 400, marginTop: '2px' }}>{campaign.message}</p>
                </div>
              </div>

              {campaign.cta && (
                <div className="detail-item full-width" style={{ borderTop: '1px solid rgba(255,255,255,0.02)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                  <div className="detail-text">
                    <span className="detail-label">Chamada para Ação (CTA)</span>
                    <span className="detail-value" style={{ color: 'var(--primary)', fontStyle: 'italic' }}>"{campaign.cta}"</span>
                  </div>
                </div>
              )}
            </div>

            <div className="campaign-footer">
              <button className="btn-secondary-sm" onClick={() => openEdit(campaign)}>{t('common.edit')}</button>
              <button className="btn-primary-sm">
                <span>{t('campaigns.view_strategy')}</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ))}
        {campaigns.length === 0 && (
          <div className="card" style={{ gridColumn: 'span 3', padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Nenhuma campanha cadastrada para este projeto. Clique em "Nova Campanha" para começar.
          </div>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="card modal-content" style={{ maxWidth: '600px', width: '100%' }}>
            <h2 className="brand-font">{editId ? 'Editar Campanha' : t('campaigns.new_campaign')}</h2>
            <form className="campaign-form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <div className="form-group">
                <label>{t('campaigns.name')}</label>
                <input type="text" className="input-field" placeholder={t('campaigns.name_placeholder')} required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{t('campaigns.main_product')}</label>
                  <select className="input-field" required value={form.mainProduct} onChange={e => setForm(f => ({ ...f, mainProduct: e.target.value }))}>
                    <option value="">Selecione um produto...</option>
                    {productOptions.map(name => <option key={name} value={name}>{name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>{t('campaigns.secondary_product')}</label>
                  <select className="input-field" value={form.secondaryProduct} onChange={e => setForm(f => ({ ...f, secondaryProduct: e.target.value }))}>
                    <option value="">Nenhum</option>
                    {productOptions.map(name => <option key={name} value={name}>{name}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Meta / Objetivo</label>
                  <input type="text" className="input-field" placeholder="Ex: 50 leads qualificados" value={form.goal} onChange={e => setForm(f => ({ ...f, goal: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>CTA Principal</label>
                  <input type="text" className="input-field" placeholder="Ex: Compre com frete grátis" value={form.cta} onChange={e => setForm(f => ({ ...f, cta: e.target.value }))} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Data de Início</label>
                  <input type="date" className="input-field" required value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Data de Término (Opcional)</label>
                  <input type="date" className="input-field" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
                </div>
              </div>

              <div className="form-group">
                <label>{t('campaigns.message')}</label>
                <textarea className="input-field" rows={3} placeholder="Qual a mensagem principal da campanha?" required value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select className="input-field" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Campaign['status'] }))}>
                  <option value="draft">Rascunho</option>
                  <option value="active">Ativa</option>
                  <option value="completed">Concluída</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => { setShowForm(false); setEditId(null); }}>{t('common.cancel')}</button>
                <button type="submit" className="btn-primary">{editId ? t('common.save') : t('campaigns.new_campaign')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .campanhas-page {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .campanhas-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 1.5rem;
        }

        .campaign-card {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding: 1.5rem;
        }

        .campaign-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .campaign-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .detail-item {
          display: flex;
          gap: 0.75rem;
          color: var(--text-secondary);
        }

        .detail-item.full-width {
          grid-column: span 2;
          background: rgba(255, 255, 255, 0.02);
          padding: 0.75rem;
          border-radius: 8px;
        }

        .detail-text {
          display: flex;
          flex-direction: column;
        }

        .detail-label {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .detail-value {
          font-size: 0.9rem;
          color: white;
          font-weight: 500;
        }

        .campaign-footer {
          display: flex;
          justify-content: space-between;
          margin-top: auto;
          padding-top: 1rem;
          border-top: 1px solid var(--border);
        }

        .btn-secondary-sm {
          padding: 0.5rem 1rem;
          border-radius: 8px;
          background: var(--input);
          color: white;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .btn-primary-sm {
          padding: 0.5rem 1rem;
          border-radius: 8px;
          background: var(--gradient);
          color: white;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.85rem;
          font-weight: 600;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          padding: 2.5rem;
          border-radius: var(--radius-lg);
        }

        .campaign-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1rem;
        }

        textarea.input-field {
          resize: none;
        }
      `}</style>
    </div>
  );
};

export default Campanhas;
