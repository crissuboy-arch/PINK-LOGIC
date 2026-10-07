import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb, 
  Sparkles, 
  Save, 
  ChevronRight,
  Package,
  CheckCircle2,
  Edit2,
  Trash2,
  Filter
} from 'lucide-react';

import { useLanguage } from '../../contexts/LanguageContext';
import { useProducts } from '../../contexts/ProductContext';
import { useCentralStore } from '../../store/CentralStore';

interface Idea {
  id: number;
  title: string;
  description: string;
  category: string;
  product: string;
  saved: boolean;
}

const Ideias = () => {
  const { t } = useLanguage();
  const { activeProjectId, activeBrand } = useCentralStore();
  
  const [selectedProduct, setSelectedProduct] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [showManualForm, setShowManualForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [manualIdea, setManualIdea] = useState({ title: '', description: '', category: 'Conteúdo', product: '' });

  const { products: allProducts } = useProducts();
  const products = useMemo(() => allProducts.map(p => ({ id: p.id, name: p.name })), [allProducts]);

  const getStorageKey = () => `pink_logic_ideas_${activeProjectId || 'default'}`;

  // Load project-scoped ideas
  useEffect(() => {
    try {
      const saved = localStorage.getItem(getStorageKey());
      setIdeas(saved ? JSON.parse(saved) : []);
    } catch {
      setIdeas([]);
    }
  }, [activeProjectId]);

  const filteredIdeas = ideas.filter(idea =>
    !filterProduct || idea.product === filterProduct
  );

  const addManualIdea = () => {
    if (!manualIdea.title.trim() || !manualIdea.description.trim()) return;
    let updated;
    if (editId) {
      updated = ideas.map(i => i.id === editId ? { ...i, ...manualIdea } : i);
      setEditId(null);
    } else {
      updated = [...ideas, { id: Date.now(), ...manualIdea, saved: false }];
    }
    setIdeas(updated);
    localStorage.setItem(getStorageKey(), JSON.stringify(updated));
    setManualIdea({ title: '', description: '', category: 'Conteúdo', product: '' });
    setShowManualForm(false);
  };

  const startEdit = (idea: Idea) => {
    setEditId(idea.id);
    setManualIdea({ title: idea.title, description: idea.description, category: idea.category, product: idea.product });
    setShowManualForm(true);
  };

  const deleteIdea = (id: number) => {
    const updated = ideas.filter(i => i.id !== id);
    setIdeas(updated);
    localStorage.setItem(getStorageKey(), JSON.stringify(updated));
  };

  const generateIdeas = () => {
    if (!selectedProduct) return;
    setIsGenerating(true);
    setTimeout(() => {
      const productName = products.find(p => p.id === selectedProduct)?.name || '';
      const brandName = activeBrand?.name || 'Sua Marca';
      const brandTone = activeBrand?.tone || 'Profissional';
      const brandHashtags = activeBrand?.hashtags?.join(' ') || '';
      const brandCta = activeBrand?.cta || 'Saiba mais no link do perfil!';

      const newIdeas: Idea[] = [
        { 
          id: Date.now() + 1, 
          title: `3 Segredos sobre ${productName}`, 
          description: `Um carrossel de alto impacto em tom ${brandTone} mostrando como resolver as principais dores do seu cliente ideal. Finalize com as tags: ${brandHashtags}`, 
          category: 'Conteúdo', 
          product: selectedProduct, 
          saved: false 
        },
        { 
          id: Date.now() + 2, 
          title: `Bastidores de ${brandName}`, 
          description: `Grave um Reels dinâmico com a preparação e dedicação investidas em ${productName}. Mostre que o valor está nos detalhes!`, 
          category: 'Estratégia', 
          product: selectedProduct, 
          saved: false 
        },
        { 
          id: Date.now() + 3, 
          title: `Por que escolher ${productName}?`, 
          description: `Post institucional comparativo. Use o tom de comunicação da marca (${brandTone}) e chame o público com o CTA: "${brandCta}"`, 
          category: 'Marketing', 
          product: selectedProduct, 
          saved: false 
        },
      ];
      const updated = [...newIdeas, ...ideas];
      setIdeas(updated);
      localStorage.setItem(getStorageKey(), JSON.stringify(updated));
      setIsGenerating(false);
    }, 1500);
  };

  const toggleSave = (id: number) => {
    const updated = ideas.map(idea => idea.id === id ? { ...idea, saved: !idea.saved } : idea);
    setIdeas(updated);
    localStorage.setItem(getStorageKey(), JSON.stringify(updated));
  };

  const generatedCount = ideas.length;
  const savedCount = ideas.filter(i => i.saved).length;

  const uniqueProducts = [...new Set(ideas.map(i => i.product).filter(Boolean))];

  return (
    <div className="ideias-page">
      <header className="page-header">
        <div>
          <h1 className="brand-font">{t('ideas.title')}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{t('ideas.subtitle')}</p>
        </div>
      </header>

      <div className="ideias-content">
        <aside className="ideias-sidebar">
          <div className="card">
            <h3 className="section-title-sm">{t('ideas.settings')}</h3>
            <div className="form-group">
              <label>{t('ideas.select_product')}</label>
              <select className="input-field" value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}>
                <option value="">{t('ideas.select_product_placeholder')}</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            {activeBrand && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.7rem', color: '#A1A1B5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Brand Kit Ativo</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>{activeBrand.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <span style={{ fontSize: '0.7rem', color: '#A1A1B5' }}>Tom:</span>
                  <span style={{ fontSize: '0.7rem', background: 'rgba(255,47,191,0.1)', color: 'var(--primary)', padding: '2px 6px', borderRadius: '4px', textTransform: 'capitalize' }}>
                    {activeBrand.tone || 'Profissional'}
                  </span>
                </div>
              </div>
            )}

            <button className="btn-primary w-full" onClick={generateIdeas}
              disabled={!selectedProduct || isGenerating}
              style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}>
              {isGenerating ? (
                <><Sparkles size={18} className="animate-spin" /><span>{t('ideas.generating_btn')}</span></>
              ) : (
                <><Sparkles size={18} /><span>{t('ideas.generate_btn')}</span></>
              )}
            </button>
          </div>

          <div className="card">
            <h3 className="section-title-sm">{editId ? 'Editar Ideia' : 'Criar Ideia Manual'}</h3>
            {showManualForm ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="form-group">
                  <label>Título</label>
                  <input type="text" className="input-field" placeholder="Título da ideia" value={manualIdea.title}
                    onChange={e => setManualIdea({ ...manualIdea, title: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Descrição</label>
                  <textarea className="input-field" rows={3} placeholder="Descreva sua ideia..." value={manualIdea.description}
                    onChange={e => setManualIdea({ ...manualIdea, description: e.target.value })} style={{ resize: 'none' }} />
                </div>
                <div className="form-group">
                  <label>Categoria</label>
                  <select className="input-field" value={manualIdea.category}
                    onChange={e => setManualIdea({ ...manualIdea, category: e.target.value })}>
                    <option value="Conteúdo">Conteúdo</option>
                    <option value="Produto">Produto</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Estratégia">Estratégia</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Produto (opcional)</label>
                  <select className="input-field" value={manualIdea.product}
                    onChange={e => setManualIdea({ ...manualIdea, product: e.target.value })}>
                    <option value="">Nenhum</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => { setShowManualForm(false); setEditId(null); setManualIdea({ title: '', description: '', category: 'Conteúdo', product: '' }); }}>Cancelar</button>
                  <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={addManualIdea}>
                    {editId ? 'Salvar' : 'Salvar Ideia'}
                  </button>
                </div>
              </div>
            ) : (
              <button className="btn-secondary w-full" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }} onClick={() => setShowManualForm(true)}>
                <Save size={16} />
                <span>Criar Ideia Livre</span>
              </button>
            )}
          </div>

          <div className="card stats-card-sm">
            <div className="stat-row">
              <span className="stat-label">Total de Ideias</span>
              <span className="stat-value">{generatedCount}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Ideias Salvas</span>
              <span className="stat-value">{savedCount}</span>
            </div>
          </div>

          {uniqueProducts.length > 0 && (
            <div className="card filter-card">
              <h3 className="section-title-sm"><Filter size={14} /> Filtrar por Produto</h3>
              <div className="filter-chips">
                <button className={`chip ${filterProduct === '' ? 'active' : ''}`} onClick={() => setFilterProduct('')}>Todas</button>
                {uniqueProducts.map(pid => (
                  <button key={pid} className={`chip ${filterProduct === pid ? 'active' : ''}`} onClick={() => setFilterProduct(pid)}>
                    {products.find(p => p.id === pid)?.name || pid}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        <section className="ideias-main">
          <AnimatePresence mode="wait">
            {filteredIdeas.length > 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="ideas-list">
                {filteredIdeas.map((idea) => (
                  <motion.div key={idea.id} className="idea-card" layout
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <div className="idea-header">
                      <div className="idea-icon"><Lightbulb size={20} /></div>
                      <div className="idea-title-group">
                        <h4>{idea.title}</h4>
                        <span className="idea-category">{idea.category}</span>
                      </div>
                      <button className="icon-btn-sm" onClick={() => startEdit(idea)} title="Editar"><Edit2 size={16} /></button>
                      <button className="icon-btn-sm" onClick={() => deleteIdea(idea.id)} title="Excluir" style={{ color: '#ef4444' }}><Trash2 size={16} /></button>
                      <button className={`save-btn ${idea.saved ? 'saved' : ''}`} onClick={() => toggleSave(idea.id)}>
                        {idea.saved ? <CheckCircle2 size={20} /> : <Save size={20} />}
                      </button>
                    </div>
                    <p className="idea-description">{idea.description}</p>
                    <div className="idea-footer">
                      {idea.product && (
                        <div className="product-tag">
                          <Package size={14} />
                          <span>{products.find(p => p.id === idea.product)?.name || idea.product}</span>
                        </div>
                      )}
                      <button className="use-idea-btn">
                        <span>{t('ideas.use_idea')}</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-state">
                <div className="empty-icon"><Sparkles size={48} /></div>
                <h3>{t('ideas.empty_title')}</h3>
                <p>{t('ideas.empty_subtitle')}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>

      <style>{`
        .ideias-page { display: flex; flex-direction: column; gap: 2rem; }
        .ideias-content { display: grid; grid-template-columns: 320px 1fr; gap: 2rem; align-items: start; }
        .ideias-sidebar { display: flex; flex-direction: column; gap: 1.5rem; position: sticky; top: 100px; }
        .section-title-sm { font-size: 1rem; margin-bottom: 1rem; color: white; display: flex; align-items: center; gap: 0.5rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group label { font-size: 0.85rem; color: var(--text-secondary); }
        .stats-card-sm { display: flex; flex-direction: column; gap: 1rem; }
        .stat-row { display: flex; justify-content: space-between; align-items: center; }
        .stat-label { font-size: 0.85rem; color: var(--text-secondary); }
        .stat-value { font-weight: 700; color: white; }
        .filter-card { display: flex; flex-direction: column; gap: 0.75rem; }
        .filter-chips { display: flex; flex-wrap: wrap; gap: 0.4rem; }
        .filter-chips .chip { padding: 0.35rem 0.75rem; border-radius: 100px; background: var(--input); border: 1px solid var(--border); font-size: 0.75rem; cursor: pointer; color: var(--text-secondary); transition: var(--transition); }
        .filter-chips .chip.active { background: var(--primary); color: white; border-color: var(--primary); }
        .ideas-list { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
        .idea-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; transition: var(--transition); }
        .idea-card:hover { border-color: rgba(255, 45, 141, 0.3); transform: translateX(4px); }
        .idea-header { display: flex; align-items: center; gap: 1rem; }
        .idea-icon { width: 40px; height: 40px; border-radius: 10px; background: rgba(255, 45, 141, 0.1); color: var(--primary); display: flex; align-items: center; justify-content: center; }
        .idea-title-group { flex: 1; }
        .idea-title-group h4 { font-size: 1.1rem; margin-bottom: 0.1rem; }
        .idea-category { font-size: 0.75rem; color: var(--primary); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        .save-btn { color: var(--text-secondary); transition: var(--transition); background: none; border: none; cursor: pointer; }
        .save-btn:hover { color: white; }
        .save-btn.saved { color: #10b981; }
        .idea-description { color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; }
        .idea-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 1rem; border-top: 1px solid var(--border); }
        .product-tag { display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.75rem; background: var(--input); border-radius: 100px; font-size: 0.8rem; color: var(--text-secondary); }
        .use-idea-btn { display: flex; align-items: center; gap: 0.5rem; color: var(--primary); font-weight: 600; font-size: 0.85rem; background: none; border: none; cursor: pointer; }
        .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 6rem 2rem; text-align: center; background: rgba(255, 255, 255, 0.02); border: 2px dashed var(--border); border-radius: var(--radius-lg); }
        .empty-icon { color: var(--border); margin-bottom: 1.5rem; }
        .empty-state h3 { font-size: 1.25rem; margin-bottom: 0.5rem; }
        .empty-state p { color: var(--text-secondary); max-width: 400px; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Ideias;