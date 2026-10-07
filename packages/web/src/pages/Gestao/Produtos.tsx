import { useState } from 'react';
import { 
  Plus, 
  ExternalLink, 
  Tag, 
  Globe, 
  DollarSign, 
  BookOpen, 
  Layers,
  Search,
  MoreVertical
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useProducts, type ProductItem } from '../../contexts/ProductContext';

const Produtos = () => {
  const { t } = useLanguage();
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', category: '', link: '', platform: 'hotmart', price: '', type: 'ebook', model: 'direto' });

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openNew = () => {
    setEditId(null);
    setForm({ name: '', category: '', link: '', platform: 'hotmart', price: '', type: 'ebook', model: 'direto' });
    setShowForm(true);
  };

  const openEdit = (p: ProductItem) => {
    setEditId(p.id);
    setForm({ name: p.name, category: p.category, link: p.link, platform: p.platform, price: p.price, type: p.type, model: p.model });
    setShowForm(true);
  };

  const save = () => {
    if (editId) {
      updateProduct(editId, form);
    } else {
      addProduct(form);
    }
    setShowForm(false);
    setEditId(null);
  };

  return (
    <div className="produtos-page">
      <header className="page-header">
        <div>
          <h1 className="brand-font">{t('produtos.title')}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{t('produtos.subtitle')}</p>
        </div>
        <button className="btn-primary" onClick={openNew}>
          <Plus size={18} />
          <span>{t('produtos.new_product')}</span>
        </button>
      </header>

      <div className="produtos-tools">
        <div className="search-bar">
          <Search size={18} />
          <input type="text" placeholder={t('produtos.search_placeholder')} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
      </div>

      <div className="produtos-grid">
        {filteredProducts.map(product => (
          <div key={product.id} className="card product-card">
            <div className="product-card-header">
              <div className="product-type-badge">
                {product.type === 'ebook' ? <BookOpen size={14} /> : <Layers size={14} />}
                <span>{product.type}</span>
              </div>
              <div className="dropdown" style={{ position: 'relative' }}>
                <button className="icon-btn-sm"><MoreVertical size={18} /></button>
                <div className="dropdown-content">
                  <button onClick={() => openEdit(product)}>✏️ Editar</button>
                  <button onClick={() => deleteProduct(product.id)} className="danger">🗑️ Excluir</button>
                </div>
              </div>
            </div>
            <div className="product-main">
              <h3>{product.name}</h3>
              <div className="product-meta">
                <Tag size={14} />
                <span>{product.category}</span>
              </div>
            </div>
            <div className="product-details-grid">
              <div className="p-detail">
                <Globe size={14} />
                <span>{product.platform}</span>
              </div>
              <div className="p-detail">
                <DollarSign size={14} />
                <span>{product.price}</span>
              </div>
              <div className="p-detail">
                <Layers size={14} />
                <span style={{ textTransform: 'capitalize' }}>{product.model}</span>
              </div>
            </div>
            <div className="product-footer">
              <a href={product.link} target="_blank" rel="noopener noreferrer" className="product-link">
                <span>{t('produtos.sales_page')}</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="card modal-content product-modal">
            <h2 className="brand-font">{editId ? 'Editar Produto' : t('produtos.new_product')}</h2>
            <form className="product-form" onSubmit={(e) => { e.preventDefault(); save(); }}>
              <div className="form-group">
                <label>{t('produtos.name')}</label>
                <input type="text" className="input-field" placeholder={t('produtos.name_placeholder')} required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Categoria</label>
                  <input type="text" className="input-field" placeholder="Ex: Marketing" required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Preço</label>
                  <input type="text" className="input-field" placeholder="R$ 0,00" required value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Plataforma</label>
                  <select className="input-field" required value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}>
                    <option value="hotmart">Hotmart</option>
                    <option value="kiwify">Kiwify</option>
                    <option value="eduzz">Eduzz</option>
                    <option value="outra">Outra</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Tipo</label>
                  <select className="input-field" required value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    <option value="ebook">Ebook</option>
                    <option value="curso">Curso</option>
                    <option value="fisico">Físico</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Link de Vendas</label>
                <input type="url" className="input-field" placeholder="https://" required value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Modelo de Venda</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input type="radio" name="model" value="direto" checked={form.model === 'direto'} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} />
                    <span>Venda Direta</span>
                  </label>
                  <label className="radio-label">
                    <input type="radio" name="model" value="funil" checked={form.model === 'funil'} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} />
                    <span>Funil</span>
                  </label>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => { setShowForm(false); setEditId(null); }}>{t('common.cancel')}</button>
                <button type="submit" className="btn-primary">{editId ? 'Salvar' : t('produtos.new_product')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .produtos-page { display: flex; flex-direction: column; gap: 2rem; }
        .produtos-tools { display: flex; gap: 1rem; align-items: center; }
        .search-bar { flex: 1; background: var(--input); border: 1px solid var(--border); border-radius: 100px; padding: 0.6rem 1.25rem; display: flex; align-items: center; gap: 0.75rem; color: var(--text-secondary); }
        .search-bar input { background: none; border: none; outline: none; color: white; width: 100%; font-size: 0.9rem; }
        .produtos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
        .product-card { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
        .product-card-header { display: flex; justify-content: space-between; align-items: center; }
        .product-type-badge { display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.6rem; background: rgba(255,45,141,0.1); color: var(--primary); border-radius: 6px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
        .product-main h3 { font-size: 1.25rem; margin-bottom: 0.4rem; }
        .product-meta { display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; color: var(--text-secondary); }
        .product-details-grid { display: grid; grid-template-columns: 1fr; gap: 0.75rem; padding: 1rem; background: rgba(255,255,255,0.02); border-radius: var(--radius-md); }
        .p-detail { display: flex; align-items: center; gap: 0.75rem; font-size: 0.85rem; color: var(--text-secondary); }
        .product-footer { margin-top: auto; padding-top: 1rem; }
        .product-link { display: flex; align-items: center; justify-content: center; gap: 0.5rem; color: var(--primary); font-weight: 600; font-size: 0.9rem; transition: var(--transition); }
        .product-link:hover { color: var(--secondary); }
        .product-modal { width: 550px; }
        .radio-group { display: flex; gap: 2rem; margin-top: 0.5rem; }
        .radio-label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.9rem; }
        .radio-label input { accent-color: var(--primary); }
        .dropdown { position: relative; }
        .dropdown-content { position: absolute; right: 0; top: 100%; background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 0.4rem; display: none; flex-direction: column; gap: 0.2rem; min-width: 140px; z-index: 10; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        .dropdown:hover .dropdown-content { display: flex; }
        .dropdown-content button { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.85rem; color: var(--text-secondary); border-radius: 6px; transition: var(--transition); background: none; border: none; width: 100%; }
        .dropdown-content button:hover { background: var(--input); color: white; }
        .dropdown-content button.danger:hover { color: #ef4444; background: rgba(239,68,68,0.1); }
      `}</style>
    </div>
  );
};

export default Produtos;