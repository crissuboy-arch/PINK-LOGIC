import { useState } from 'react';
import { Bell, Search, User, Plus, Menu } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import AIStatusBadge from './AIStatusBadge';
import PremiumLogo from './PremiumLogo';
import { authService } from '../services/authService';

const Header = ({ onOpenMenu }: { onOpenMenu?: () => void }) => {
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  
  const currentUser = authService.getCurrentUser();
  const userName = currentUser ? currentUser.name : 'Usuário Pink';
  const userRole = currentUser ? currentUser.role : 'Premium Plan';

  const handleLogout = () => {
    if (window.confirm('Deseja realmente sair da plataforma PinkLogic?')) {
      authService.logout();
      navigate('/login');
    }
  };

  const handleNotificationsClick = () => {
    alert('Central de Notificações: Você não possui novas notificações no momento.');
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      alert(`Pesquisa global: A busca por "${searchValue}" estará disponível na versão final integrada ao banco de dados.`);
      setSearchValue('');
    }
  };

  return (
    <header className="header glass-navbar">
      {/* Mobile: abre a sidebar como gaveta */}
      <button className="icon-btn-sm header-menu-btn" onClick={onOpenMenu} aria-label="Abrir menu">
        <Menu size={20} />
      </button>
      <div className="header-logo" onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', marginRight: '2.5rem', padding: '0 0.5rem', transform: 'scale(1.25)', transformOrigin: 'left center' }}>
        <PremiumLogo />
      </div>

      {/* Search Input Container */}
      <div className="header-search">
        <Search size={16} className="search-icon" />
        <input 
          type="text" 
          placeholder={t('dashboard.search') || "Buscar na plataforma..."} 
          className="search-input"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleSearchKeyDown}
        />
      </div>

      {/* Right side actions */}
      <div className="header-actions">
        {/* Status IA */}
        <div className="status-badge-container" data-tooltip="Status da Inteligência Artificial">
          <AIStatusBadge />
        </div>

        {/* Language Switcher */}
        <div className="language-switcher">
          <button 
            className={`lang-btn ${language === 'pt' ? 'active' : ''}`} 
            onClick={() => setLanguage('pt')}
            data-tooltip="Português (BR)"
          >
            🇧🇷
          </button>
          <button 
            className={`lang-btn ${language === 'en' ? 'active' : ''}`} 
            onClick={() => setLanguage('en')}
            data-tooltip="English (US)"
          >
            🇺🇸
          </button>
          <button 
            className={`lang-btn ${language === 'es' ? 'active' : ''}`} 
            onClick={() => setLanguage('es')}
            data-tooltip="Español"
          >
            🇪🇸
          </button>
        </div>

        {/* Quick Action Button */}
        <button className="btn-primary header-gen-btn" onClick={() => navigate('/criacao/editor')}>
          <Plus size={16} />
          <span>{t('common.generate') || 'Gerar Arte'}</span>
        </button>
        
        {/* Notifications Icon with Ping Animation */}
        <button 
          className="icon-btn-sm notification-trigger" 
          data-tooltip="Central de Notificações"
          onClick={handleNotificationsClick}
        >
          <Bell size={18} />
          <div className="notification-dot-ping"></div>
          <div className="notification-dot-solid"></div>
        </button>

        {/* User Profile info */}
        <div 
          className="user-profile" 
          onClick={handleLogout} 
          style={{ cursor: 'pointer' }}
          title="Clique para sair da plataforma"
        >
          <div className="avatar-wrapper">
            <User size={18} />
          </div>
          <div className="user-info">
            <span className="user-name">{userName}</span>
            <span className="user-role">{userRole}</span>
          </div>
        </div>
      </div>

      <style>{`
        .header {
          height: var(--header-height);
          padding: 0 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 90;
          transition: background-color 0.2s, border-color 0.2s;
        }

        .header-search {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          border-radius: var(--radius-pill);
          padding: 0.5rem 1rem;
          display: flex;
          align-items: center;
          gap: 0.65rem;
          width: 320px;
          transition: var(--transition);
        }

        .header-search:hover {
          border-color: var(--border-hover);
          background: rgba(255, 255, 255, 0.04);
        }

        .header-search:focus-within {
          border-color: var(--primary);
          background: var(--input-focus);
          box-shadow: 0 0 12px rgba(255, 47, 191, 0.08);
        }

        .search-icon {
          color: var(--text-secondary);
          flex-shrink: 0;
          transition: var(--transition);
        }

        .header-search:focus-within .search-icon {
          color: var(--primary);
        }

        .search-input {
          background: none;
          border: none;
          outline: none;
          color: var(--text-primary);
          width: 100%;
          font-size: 0.85rem;
          font-family: inherit;
        }

        .search-input::placeholder {
          color: var(--text-muted);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .status-badge-container {
          display: flex;
          align-items: center;
        }

        .notification-trigger {
          position: relative;
          cursor: pointer;
        }

        .notification-dot-solid {
          width: 6px;
          height: 6px;
          background: var(--primary);
          border-radius: 50%;
          position: absolute;
          top: 6px;
          right: 6px;
          box-shadow: 0 0 6px var(--primary);
        }

        .notification-dot-ping {
          width: 6px;
          height: 6px;
          background: var(--primary);
          border-radius: 50%;
          position: absolute;
          top: 6px;
          right: 6px;
          animation: ping-scale 1.8s infinite cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes ping-scale {
          0% { transform: scale(1); opacity: 0.8; }
          60% { transform: scale(2.8); opacity: 0; }
          100% { transform: scale(2.8); opacity: 0; }
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding-left: 1rem;
          border-left: 1px solid var(--border);
          height: 32px;
        }

        .avatar-wrapper {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-md);
          background: var(--gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: var(--shadow-sm);
          border: 1px solid rgba(255, 255, 255, 0.1);
          flex-shrink: 0;
          transition: var(--transition);
        }

        .user-profile:hover .avatar-wrapper {
          transform: scale(1.05);
          box-shadow: 0 0 10px rgba(255, 47, 191, 0.2);
        }

        .user-info {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }

        .user-name {
          font-size: 0.825rem;
          font-weight: var(--font-weight-semibold);
          color: var(--text-primary);
        }

        .user-role {
          font-size: 0.7rem;
          color: var(--text-secondary);
        }

        .language-switcher {
          display: flex;
          gap: 0.25rem;
          background: rgba(255, 255, 255, 0.02);
          padding: 0.2rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
        }

        .lang-btn {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-sm);
          font-size: 1rem;
          transition: var(--transition);
          opacity: 0.65;
          background: none;
          border: none;
          cursor: pointer;
        }

        .lang-btn:hover {
          opacity: 1;
          background: rgba(255, 255, 255, 0.08);
        }

        .lang-btn.active {
          opacity: 1;
          background: rgba(255, 47, 191, 0.2);
          box-shadow: 0 0 10px rgba(255, 47, 191, 0.2);
          border: 1px solid var(--primary);
        }

        .header-gen-btn {
          padding: 0.5rem 1rem !important;
          border-radius: var(--radius-md) !important;
          font-size: 0.8rem !important;
          height: 32px;
        }

        .header-menu-btn {
          display: none;
        }

        /* Mobile: header compacto, sem overflow horizontal */
        @media (max-width: 768px) {
          .header {
            padding: 0 0.75rem;
            gap: 0.5rem;
          }
          .header-menu-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 44px;
            height: 44px;
            flex-shrink: 0;
          }
          .header-logo {
            transform: none !important;
            margin-right: 0 !important;
            padding: 0 !important;
            min-width: 0;
            overflow: hidden;
            flex: 1;
          }
          .header-search,
          .status-badge-container,
          .language-switcher,
          .user-info,
          .header-gen-btn span {
            display: none !important;
          }
          .header-actions {
            gap: 0.5rem;
            flex-shrink: 0;
          }
          .header-gen-btn {
            width: 44px;
            height: 44px !important;
            padding: 0 !important;
            justify-content: center;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
