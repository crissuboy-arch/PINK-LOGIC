import { Bell, Search, User, Plus } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import AIStatusBadge from './AIStatusBadge';

const Header = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="header">
      <div className="header-search">
        <Search size={18} />
        <input type="text" placeholder={t('dashboard.search') || "Buscar..."} />
      </div>

      <div className="header-actions">
        <AIStatusBadge />
        <div className="language-switcher">
          <button 
            className={`lang-btn ${language === 'pt' ? 'active' : ''}`} 
            onClick={() => setLanguage('pt')}
            title="Português"
          >
            🇧🇷
          </button>
          <button 
            className={`lang-btn ${language === 'en' ? 'active' : ''}`} 
            onClick={() => setLanguage('en')}
            title="English"
          >
            🇺🇸
          </button>
          <button 
            className={`lang-btn ${language === 'es' ? 'active' : ''}`} 
            onClick={() => setLanguage('es')}
            title="Español"
          >
            🇪🇸
          </button>
        </div>

        <button className="btn-primary">
          <Plus size={18} />
          <span>{t('common.generate')}</span>
        </button>
        
        <button className="icon-btn">
          <Bell size={20} />
          <div className="notification-dot"></div>
        </button>

        <div className="user-profile">
          <div className="avatar">
            <User size={20} />
          </div>
          <div className="user-info">
            <span className="user-name">{t('common.user_name') || 'Usuário Pink'}</span>
            <span className="user-role">{t('common.user_role') || 'Premium'}</span>
          </div>
        </div>
      </div>

      <style>{`
        .header {
          height: var(--header-height);
          background: rgba(13, 13, 18, 0.8);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
          padding: 0 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 90;
        }

        .header-search {
          background: var(--input);
          border: 1px solid var(--border);
          border-radius: 100px;
          padding: 0.6rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 400px;
          color: var(--text-secondary);
        }

        .header-search input {
          background: none;
          border: none;
          outline: none;
          color: white;
          width: 100%;
          font-size: 0.9rem;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .icon-btn {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: var(--input);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: var(--transition);
        }

        .icon-btn:hover {
          color: white;
          background: var(--border);
        }

        .notification-dot {
          width: 8px;
          height: 8px;
          background: var(--primary);
          border-radius: 50%;
          position: absolute;
          top: 10px;
          right: 10px;
          border: 2px solid var(--input);
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding-left: 1.5rem;
          border-left: 1px solid var(--border);
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: var(--gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-size: 0.9rem;
          font-weight: 600;
        }

        .user-role {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .language-switcher {
          display: flex;
          gap: 0.5rem;
          background: var(--input);
          padding: 0.25rem;
          border-radius: 12px;
          border: 1px solid var(--border);
        }

        .lang-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          font-size: 1.2rem;
          transition: var(--transition);
          opacity: 0.5;
          background: none;
          border: none;
        }

        .lang-btn:hover {
          opacity: 1;
          background: rgba(255, 255, 255, 0.05);
        }

        .lang-btn.active {
          opacity: 1;
          background: rgba(255, 45, 141, 0.1);
          color: var(--primary);
        }
      `}</style>
    </header>
  );
};

export default Header;
