import { useState } from 'react';
import { 
  Sparkles, 
  Target, 
  Zap, 
  TrendingUp, 
  Package,
  BookOpen,
  DollarSign,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useProducts } from '../contexts/ProductContext';
import { mockStrategy } from '../ai/mockGenerators';

const Estrategia = () => {
  const { t } = useLanguage();
  const { products } = useProducts();
  const [activeTool, setActiveTool] = useState<'product' | 'content'>('product');
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const generateProduct = () => {
    setIsGenerating(true);
    setResult(null);
    setTimeout(() => {
      setResult(mockStrategy(input, 'product'));
      setIsGenerating(false);
    }, 800 + Math.random() * 600);
  };

  const generateContent = () => {
    setIsGenerating(true);
    setResult(null);
    setTimeout(() => {
      setResult(mockStrategy(input, 'content'));
      setIsGenerating(false);
    }, 800 + Math.random() * 600);
  };

  return (
    <div className="strategy-page">
      <header className="page-header-simple">
        <h1 className="page-title">{t('sidebar.estrategia')}</h1>
        <p className="page-subtitle">Crie produtos irresistíveis e conteúdo de alta conversão com IA</p>
      </header>

      <div className="tool-switcher">
        <button 
          className={activeTool === 'product' ? 'active' : ''} 
          onClick={() => { setActiveTool('product'); setResult(null); }}
        >
          <Package size={20} />
          Gerador de Produto
        </button>
        <button 
          className={activeTool === 'content' ? 'active' : ''} 
          onClick={() => { setActiveTool('content'); setResult(null); }}
        >
          <Zap size={20} />
          Gerador de Conteúdo Full
        </button>
      </div>

      <div className="strategy-grid">
        <div className="input-card-wrap">
          <div className="card strategy-input-card">
            <div className="card-header">
              <Sparkles size={24} className="text-pink" />
              <h3>{activeTool === 'product' ? 'Qual seu nicho ou ideia?' : 'Sobre o que é o seu post?'}</h3>
            </div>
            <div className="input-group">
              <textarea 
                placeholder={activeTool === 'product' ? 'Ex: Emagrecimento para mães, Marketing Digital para iniciantes...' : 'Ex: Como vender mais usando o Instagram...'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>
            {products.length > 0 && (
              <select className="input-field" onChange={e => e.target.value && setInput(e.target.value)} style={{ marginTop: '0.5rem' }}>
                <option value="">Usar produto existente...</option>
                {products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
            )}
            <button 
              className="btn-primary" 
              onClick={activeTool === 'product' ? generateProduct : generateContent}
              disabled={!input || isGenerating}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {isGenerating ? (
                <span className="loading-dots">Gerando<span>.</span><span>.</span><span>.</span></span>
              ) : (
                <>
                  <Zap size={20} />
                  Gerar Estratégia
                </>
              )}
            </button>
          </div>
        </div>

        <div className="result-container">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="result-card card"
              >
                {activeTool === 'product' ? (
                  <div className="product-result">
                    <div className="result-header">
                      <div className="badge-primary">Sugestão de Produto</div>
                      <h2>{result.name}</h2>
                    </div>
                    
                    <div className="product-details">
                      <div className="detail-item">
                        <Target size={18} />
                        <div>
                          <strong>Oferta Irresistível</strong>
                          <p>{result.offer}</p>
                        </div>
                      </div>
                      <div className="detail-item">
                        <Users size={18} />
                        <div>
                          <strong>Público Alvo</strong>
                          <p>{result.audience}</p>
                        </div>
                      </div>
                      <div className="detail-group">
                        <div className="detail-item">
                          <DollarSign size={18} />
                          <div>
                            <strong>Preço Sugerido</strong>
                            <p>{result.price}</p>
                          </div>
                        </div>
                        <div className="detail-item">
                          <BookOpen size={18} />
                          <div>
                            <strong>Tipo</strong>
                            <p>{result.type}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="product-structure">
                      <h3>Estrutura do Produto</h3>
                      <div className="structure-list">
                        {result.structure.map((item: string, i: number) => (
                          <div key={i} className="structure-item">
                            <span className="step-num">{i + 1}</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="content-result">
                    <div className="result-header">
                      <div className="badge-primary">Legenda Gerada</div>
                      <p className="text-secondary small">Hook + Texto + Legenda + CTA</p>
                    </div>

                    <div className="content-blocks">
                      <div className="content-block">
                        <label>🪝 Hook (Gancho)</label>
                        <div className="block-text">{result.hook}</div>
                      </div>
                      <div className="content-block">
                        <label>📝 Texto do Post</label>
                        <div className="block-text">{result.body}</div>
                      </div>
                      <div className="content-block">
                        <label>💬 Legenda</label>
                        <div className="block-text pre-wrap">{result.caption}</div>
                      </div>
                      <div className="content-block">
                        <label>🚀 CTA (Call to Action)</label>
                        <div className="block-text highlight">{result.cta}</div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="result-placeholder"
              >
                <TrendingUp size={60} opacity={0.1} />
                <h3>Sua estratégia aparecerá aqui</h3>
                <p>Preencha os dados ao lado para começar.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        .strategy-page {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .tool-switcher {
          display: flex;
          gap: 1rem;
          background: var(--card);
          padding: 0.5rem;
          border-radius: 12px;
          border: 1px solid var(--border);
          width: fit-content;
        }

        .tool-switcher button {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          color: var(--text-secondary);
          transition: var(--transition);
          background: none;
          border: none;
        }

        .tool-switcher button.active {
          background: var(--input);
          color: var(--primary);
        }

        .strategy-grid {
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: 2rem;
          align-items: start;
        }

        .strategy-input-card {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .text-pink { color: var(--primary); }

        .input-group textarea {
          width: 100%;
          min-height: 150px;
          background: var(--input);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 1rem;
          color: white;
          resize: none;
          outline: none;
          font-family: inherit;
        }

        .result-container {
          min-height: 600px;
        }

        .result-card {
          padding: 2.5rem;
        }

        .result-header h2 {
          font-size: 1.75rem;
          font-weight: 800;
          margin-top: 0.5rem;
        }

        .badge-primary {
          background: rgba(255, 45, 141, 0.1);
          color: var(--primary);
          padding: 0.4rem 1rem;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          width: fit-content;
        }

        .product-details {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin: 2rem 0;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 16px;
          border: 1px solid var(--border);
        }

        .detail-item {
          display: flex;
          gap: 1rem;
          color: var(--text-secondary);
        }

        .detail-item strong {
          display: block;
          color: white;
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
        }

        .detail-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .product-structure h3 {
          font-size: 1.1rem;
          margin-bottom: 1.5rem;
          font-weight: 700;
        }

        .structure-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .structure-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: var(--input);
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid var(--border);
        }

        .step-num {
          width: 24px;
          height: 24px;
          background: var(--primary);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .content-blocks {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .content-block label {
          display: block;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--primary);
          margin-bottom: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .block-text {
          background: var(--input);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 1.25rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .block-text.pre-wrap { white-space: pre-wrap; }
        .block-text.highlight { 
          color: white; 
          border-color: var(--primary); 
          background: rgba(255, 45, 141, 0.05);
          font-weight: 600;
        }

        .result-placeholder {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 1.5rem;
          color: var(--text-secondary);
          background: rgba(255, 255, 255, 0.01);
          border: 2px dashed var(--border);
          border-radius: 24px;
        }

        .loading-dots span {
          animation: blink 1s infinite;
        }
        .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .loading-dots span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes blink {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Estrategia;
