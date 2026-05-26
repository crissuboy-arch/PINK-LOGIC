import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Package, 
  Target, 
  MessageCircle, 
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';

import { useLanguage } from '../../contexts/LanguageContext';
import { useProducts } from '../../contexts/ProductContext';

const STORAGE_KEY = 'pink_logic_campaigns';

interface Campaign {
  id: string;
  name: string;
  mainProduct: string;
  secondaryProduct: string;
  message: string;
  status: 'active' | 'draft';
}

const Campanhas = () => {
  const { t } = useLanguage();
  const { products: allProducts } = useProducts();
  const productOptions = useMemo(() => allProducts.map(p => p.name), [allProducts]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : null;
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === 'object') return Object.values(parsed) as Campaign[];
      return [
        { id: '1', name: 'Lançamento Ebook Fit', mainProduct: 'Ebook Receitas Fit', secondaryProduct: 'Guia de Treinos', message: 'Emagreça com saúde em 30 dias', status: 'active' },
        { id: '2', name: 'Black Friday Social Media', mainProduct: 'Curso Social Media', secondaryProduct: 'Pack de Templates', message: 'O maior desconto do ano para sua carreira', status: 'draft' },
      ];
    } catch { return []; }
  });
  const [form, setForm] = useState({ name: '', mainProduct: '', secondaryProduct: '', message: '', status: 'draft' as Campaign['status'] });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
  }, [campaigns]);

  const openNew = () => {
    setEditId(null);
    setForm({ name: '', mainProduct: '', secondaryProduct: '', message: '', status: 'draft' });
    setShowForm(true);
  };

  const openEdit = (c: Campaign) => {
    setEditId(c.id);
    setForm({ name: c.name, mainProduct: c.mainProduct, secondaryProduct: c.secondaryProduct, message: c.message, status: c.status });
    setShowForm(true);
  };

  const save = () => {
    if (editId) {
      setCampaigns(prev => prev.map(c => c.id === editId ? { ...c, ...form } : c));
    } else {
      setCampaigns(prev => [...prev, { ...form, id: Math.random().toString(36).substr(2, 9) }]);
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
          <div key={campaign.id} className="card campaign-card">
            <div className="campaign-header">
              <div className="campaign-info">
                <div className={`status-badge ${campaign.status}`}>
                  {campaign.status === 'active' ? t('campaigns.status_active') : t('campaigns.status_draft')}
                </div>
                <h3>{campaign.name}</h3>
              </div>
              <button className="icon-btn-sm">
                <MoreHorizontal size={18} />
              </button>
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
              <div className="detail-item full-width">
                <MessageCircle size={16} />
                <div className="detail-text">
                  <span className="detail-label">{t('campaigns.message')}</span>
                  <p className="detail-value">{campaign.message}</p>
                </div>
              </div>
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
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="card modal-content">
            <h2 className="brand-font">{editId ? 'Editar Campanha' : t('campaigns.new_campaign')}</h2>
            <form className="campaign-form" onSubmit={(e) => { e.preventDefault(); save(); }}>
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
              <div className="form-group">
                <label>{t('campaigns.message')}</label>
                <textarea className="input-field" rows={3} placeholder="Qual a mensagem principal da campanha?" required value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select className="input-field" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Campaign['status'] }))}>
                  <option value="draft">Rascunho</option>
                  <option value="active">Ativa</option>
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

        .campaign-info h3 {
          font-size: 1.25rem;
          margin-top: 0.5rem;
        }

        .status-badge {
          display: inline-block;
          padding: 0.2rem 0.6rem;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .status-badge.active {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .status-badge.draft {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-secondary);
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
          width: 500px;
          padding: 2rem;
        }

        .modal-content h2 {
          margin-bottom: 2rem;
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
