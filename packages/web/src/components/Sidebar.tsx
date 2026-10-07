import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Settings, 
  Calendar, 
  Lightbulb, 
  CheckSquare, 
  Megaphone, 
  Package, 
  BarChart3, 
  PenTool, 
  Smartphone, 
  FileText, 
  Palette, 
  Eye, 
  Sticker, 
  Target, 
  Library,
  Layers,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Server,
  Bot,
  Send,
  Plus,
  Award,
  Sparkles,
  QrCode,
  BookOpen,
  Box,
  Users
} from 'lucide-react';
import PremiumLogo from './PremiumLogo';
import { useLanguage } from '../contexts/LanguageContext';
import { useCentralStore } from '../store/CentralStore';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const { t } = useLanguage();
  const [openMenus, setOpenMenus] = useState<string[]>(['criacao', 'assets', 'automacao', 'inteligencia']);
  
  const { projects, activeProjectId, activeProject, setActiveProjectId, createProject } = useCentralStore();
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showNewProjModal, setShowNewProjModal] = useState(false);
  const [newProjName, setNewProjName] = useState('');

  const toggleMenu = (menu: string) => {
    if (isCollapsed) {
      onToggleCollapse(); // Auto expand when trying to open a menu if collapsed
      if (!openMenus.includes(menu)) {
        setOpenMenus(prev => [...prev, menu]);
      }
      return;
    }
    setOpenMenus(prev => 
      prev.includes(menu) ? prev.filter(m => m !== menu) : [...prev, menu]
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(Boolean)
      .map(w => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'P';
  };

  const menuItems = [
    { id: 'dashboard', label: t('sidebar.dashboard') || 'Painel', icon: LayoutDashboard, path: '/' },
    {
      id: 'criacao',
      label: 'Criação',
      icon: PenTool,
      children: [
        { label: 'Designer Social Profissional', icon: Palette, path: '/criacao/editor' },
        { label: 'Gerador de Carrossel', icon: Layers, path: '/criacao/carrossel' },
        { label: 'Modelos Premium', icon: Library, path: '/criacao/templates' },
        { label: 'Criador de Histórias', icon: Smartphone, path: '/criacao/story' },
        { label: 'Estúdio de Logótipos IA', icon: Sparkles, path: '/criacao/logo' },
        { label: 'Estúdio de Maquetes', icon: Box, path: '/criacao/mockups' },
        { label: 'Estúdio de Código QR', icon: QrCode, path: '/criacao/qrcode' },
        { label: 'Estúdio de Stickers IA', icon: Sticker, path: '/criacao/stickers' },
        { label: 'Gerador de Copy', icon: FileText, path: '/criacao/copy' },
      ]
    },
    {
      id: 'assets',
      label: 'Ativos',
      icon: Library,
      children: [
        { label: 'Central de Ativos', icon: BookOpen, path: '/criacao/manual' },
        { label: 'Kit de Marca Pro', icon: Award, path: '/criacao/brandkit' },
        { label: 'Modelos de Hub / Mascotes', icon: Users, path: '/criacao/models' },
        { label: 'Biblioteca', icon: Package, path: '/biblioteca' },
      ]
    },
    {
      id: 'automacao',
      label: 'Automação',
      icon: Megaphone,
      children: [
        { label: 'Calendário de Conteúdo', icon: Calendar, path: '/gestao/calendario' },
        { label: 'Fluxos de Trabalho', icon: CheckSquare, path: '/gestao/checklists' },
        { label: 'Orquestrador IA', icon: Server, path: '/sistema/execucao' },
        { label: 'Agentes IA', icon: Bot, path: '/sistema/agentes' },
        { label: 'Campanhas', icon: Target, path: '/gestao/campanhas' },
        { label: 'Publicador Automático', icon: Send, path: '/publicador-automatico' },
      ]
    },
    {
      id: 'inteligencia',
      label: 'Inteligência',
      icon: BarChart3,
      children: [
        { label: 'Radar de Tendências', icon: Lightbulb, path: '/gestao/ideias' },
        { label: 'Visão Estratégica', icon: Eye, path: '/criacao/vision' },
        { label: 'Análise IA e Status', icon: BarChart3, path: '/gestao/status' },
        { label: 'Análises e Estratégia', icon: Target, path: '/estrategia' },
      ]
    }
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-logo" style={{ padding: isCollapsed ? '1rem 0' : '1.5rem', display: 'flex', justifyContent: 'center', transition: 'var(--transition)' }}>
        <PremiumLogo compact={isCollapsed} sizeMultiplier={isCollapsed ? 0.95 : 1.15} />
      </div>

      {/* Project Switcher Selector */}
      <div className="project-switcher-wrap">
        <button 
          onClick={() => setShowProjectDropdown(!showProjectDropdown)}
          className="project-trigger-btn"
          data-tooltip={isCollapsed ? (activeProject ? activeProject.name : 'Projetos') : undefined}
        >
          <div className="project-btn-content">
            {isCollapsed ? (
              <span className="project-initials-badge">
                {activeProject ? getInitials(activeProject.name) : 'P'}
              </span>
            ) : (
              <>
                <span className="project-dot" />
                <span className="project-name-text">
                  {activeProject ? activeProject.name : 'Selecionar Projeto...'}
                </span>
              </>
            )}
          </div>
          {!isCollapsed && <ChevronDown size={14} className="dropdown-arrow" />}
        </button>

        {showProjectDropdown && (
          <div className="project-dropdown-menu">
            <div className="project-list-container">
              {projects.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    setActiveProjectId(p.id);
                    setShowProjectDropdown(false);
                  }}
                  className={`project-dropdown-item ${p.id === activeProjectId ? 'active' : ''}`}
                >
                  <span className={`project-indicator-dot ${p.id === activeProjectId ? 'active' : ''}`} />
                  <span className="project-item-name">{p.name}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setShowNewProjModal(true);
                setShowProjectDropdown(false);
              }}
              className="create-project-trigger-btn"
            >
              <Plus size={14} />
              <span>Criar Novo Projeto</span>
            </button>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showNewProjModal && (
        <div className="modal-overlay" style={{ position: 'fixed' }}>
          <div className="modal-content" style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 className="brand-font" style={{ fontSize: '1.25rem', color: 'white', margin: 0 }}>Novo Projeto</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Nome do Projeto</label>
              <input 
                type="text" 
                className="input-field" 
                value={newProjName}
                onChange={e => setNewProjName(e.target.value)}
                placeholder="Ex: Ofensiva Criativa"
              />
            </div>
            <div className="modal-footer" style={{ marginTop: '0.5rem' }}>
              <button 
                className="btn-secondary" 
                onClick={() => {
                  setShowNewProjModal(false);
                  setNewProjName('');
                }}
              >
                Cancelar
              </button>
              <button 
                className="btn-primary" 
                onClick={async () => {
                  if (newProjName.trim()) {
                    await createProject({
                      name: newProjName.trim(),
                      description: '',
                      brandId: '',
                      socialAccounts: ['Instagram'],
                      email: '',
                      timezone: 'America/Sao_Paulo',
                      status: 'active'
                    });
                    setShowNewProjModal(false);
                    setNewProjName('');
                  }
                }}
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const hasChildren = !!item.children;
          const isMenuOpen = openMenus.includes(item.id);

          if (isCollapsed) {
            // Render a flat list of icons with tooltips when collapsed
            if (hasChildren) {
              return (
                <div key={item.id} className="nav-groupcollapsed">
                  {item.children?.map((child) => (
                    <NavLink 
                      key={child.path} 
                      to={child.path} 
                      className={({ isActive }) => `nav-link collapsed-item ${isActive ? 'active' : ''}`}
                      data-tooltip={child.label}
                    >
                      <child.icon size={20} />
                    </NavLink>
                  ))}
                  <div className="nav-divider" />
                </div>
              );
            }
            return (
              <NavLink 
                key={item.id}
                to={item.path || '/'} 
                className={({ isActive }) => `nav-link collapsed-item ${isActive ? 'active' : ''}`}
                data-tooltip={item.label}
              >
                <item.icon size={20} />
              </NavLink>
            );
          }

          // Normal expanded navigation
          return (
            <div key={item.id} className="nav-group">
              {hasChildren ? (
                <>
                  <button 
                    className={`nav-link parent-link ${isMenuOpen ? 'expanded' : ''}`}
                    onClick={() => toggleMenu(item.id)}
                  >
                    <item.icon size={20} className="nav-icon" />
                    <span className="nav-text">{item.label}</span>
                    <div className="chevron-icon">
                      {isMenuOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </div>
                  </button>
                  {isMenuOpen && (
                    <div className="nav-sub-menu">
                      {item.children?.map((child) => (
                        <NavLink 
                          key={child.path} 
                          to={child.path} 
                          className={({ isActive }) => `nav-sub-link ${isActive ? 'active' : ''}`}
                        >
                          <child.icon size={16} className="nav-icon-sub" />
                          <span className="nav-text-sub">{child.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <NavLink 
                  to={item.path || '/'} 
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <item.icon size={20} className="nav-icon" />
                  <span className="nav-text">{item.label}</span>
                </NavLink>
              )}
            </div>
          );
        })}
      </nav>

      {/* Collapse Toggle Button */}
      <button 
        onClick={onToggleCollapse} 
        className="collapse-toggle-btn"
        data-tooltip={isCollapsed ? 'Expandir Menu' : 'Recolher Menu'}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        {!isCollapsed && <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Recolher Sidebar</span>}
      </button>

      <style>{`
        .sidebar {
          width: var(--sidebar-width);
          background: linear-gradient(180deg, rgba(8, 8, 12, 0.85) 0%, rgba(5, 5, 8, 0.95) 100%);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 0 40px rgba(0, 0, 0, 0.5);
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          display: flex;
          flex-direction: column;
          z-index: 100;
          transition: width 0.2s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s;
        }

        .sidebar.collapsed {
          align-items: center;
        }

        .sidebar-logo {
          height: var(--header-height);
          display: flex;
          align-items: center;
          padding: 0 1.25rem;
          gap: 0.75rem;
          font-weight: 700;
          font-size: 1.15rem;
          color: white;
          border-bottom: 1px solid var(--border);
          width: 100%;
          transition: padding 0.2s;
        }

        .sidebar.collapsed .sidebar-logo {
          padding: 0;
          justify-content: center;
        }

        .logo-icon-wrap {
          width: 32px;
          height: 32px;
          background: #000;
          border-radius: 8px;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 15px rgba(255, 47, 191, 0.25);
          border: 1px solid rgba(255, 47, 191, 0.15);
          flex-shrink: 0;
        }

        .sidebar-logo-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .neon-text {
          text-shadow: 0 0 10px rgba(255, 47, 191, 0.3);
          background: linear-gradient(135deg, #FFFFFF 0%, #FFB6E5 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .project-switcher-wrap {
          padding: 0.75rem 0.75rem;
          border-bottom: 1px solid var(--border);
          position: relative;
          width: 100%;
          transition: padding 0.2s;
        }

        .sidebar.collapsed .project-switcher-wrap {
          padding: 0.75rem 0;
          display: flex;
          justify-content: center;
        }

        .project-trigger-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.55rem 0.75rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          color: white;
          justify-content: space-between;
          font-size: 0.85rem;
          font-weight: 600;
          text-align: left;
          transition: var(--transition);
          cursor: pointer;
        }

        .project-trigger-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.12);
        }

        .sidebar.collapsed .project-trigger-btn {
          width: 40px;
          height: 40px;
          padding: 0;
          justify-content: center;
          align-items: center;
        }

        .project-btn-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          overflow: hidden;
          width: 100%;
          justify-content: inherit;
        }

        .project-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--primary);
          box-shadow: 0 0 8px var(--primary);
          flex-shrink: 0;
        }

        .project-name-text {
          text-overflow: text-overflow;
          overflow: hidden;
          white-space: nowrap;
          flex: 1;
        }

        .project-initials-badge {
          display: flex;
          width: 24px;
          height: 24px;
          background: var(--gradient);
          border-radius: var(--radius-sm);
          font-size: 0.7rem;
          font-weight: 800;
          color: white;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-sm);
        }

        .dropdown-arrow {
          color: var(--text-secondary);
          flex-shrink: 0;
          transition: var(--transition);
        }

        .project-dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0.75rem;
          right: 0.75rem;
          background: rgba(17, 17, 24, 0.95);
          backdrop-filter: blur(16px);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg), var(--shadow-glow-purple);
          zIndex: 110;
          margin-top: 4px;
          overflow: hidden;
          animation: slideUp 0.15s ease-out;
        }

        .sidebar.collapsed .project-dropdown-menu {
          left: 50%;
          transform: translateX(-50%);
          width: 200px;
        }

        .project-list-container {
          max-height: 160px;
          overflow-y: auto;
        }

        .project-dropdown-item {
          width: 100%;
          text-align: left;
          padding: 0.6rem 0.85rem;
          color: white;
          background: none;
          font-size: 0.8rem;
          font-weight: 500;
          border: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.02);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: var(--transition);
        }

        .project-dropdown-item:hover {
          background: rgba(255, 255, 255, 0.03);
          color: var(--primary);
        }

        .project-dropdown-item.active {
          color: var(--primary);
          background: rgba(255, 47, 191, 0.04);
          font-weight: 700;
        }

        .project-indicator-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          transition: var(--transition);
        }

        .project-indicator-dot.active {
          background: var(--primary);
          box-shadow: 0 0 6px var(--primary);
        }

        .project-item-name {
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }

        .create-project-trigger-btn {
          width: 100%;
          text-align: left;
          padding: 0.6rem 0.85rem;
          color: var(--primary);
          font-size: 0.8rem;
          font-weight: 600;
          background: rgba(255, 47, 191, 0.02);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border: none;
          border-top: 1px solid var(--border);
          cursor: pointer;
          transition: var(--transition);
        }

        .create-project-trigger-btn:hover {
          background: rgba(255, 47, 191, 0.06);
          color: #ff5ccf;
        }

        .sidebar-nav {
          flex: 1;
          padding: 0.75rem 0.5rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          width: 100%;
        }

        .sidebar.collapsed .sidebar-nav {
          padding: 0.75rem 0;
          align-items: center;
        }

        .nav-group {
          width: 100%;
          display: flex;
          flex-direction: column;
        }

        .nav-groupcollapsed {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.15rem;
          width: 100%;
        }

        .nav-divider {
          width: 24px;
          height: 1px;
          background: var(--border);
          margin: 0.4rem 0;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.6rem 0.85rem;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          transition: var(--transition);
          width: 100%;
          font-weight: 500;
          font-size: 0.9rem;
          position: relative;
          cursor: pointer;
        }

        .nav-link::before {
          content: '';
          position: absolute;
          left: 0;
          top: 25%;
          height: 50%;
          width: 2px;
          background: transparent;
          border-radius: 0 4px 4px 0;
          transition: var(--transition);
        }

        .nav-link:hover {
          color: white;
          background: rgba(255, 255, 255, 0.03);
        }

        .nav-link.active {
          color: white;
          background: rgba(255, 255, 255, 0.04);
          font-weight: 600;
        }

        .nav-link.active::before {
          background: var(--primary);
          box-shadow: 0 0 10px var(--primary);
        }

        .nav-icon {
          flex-shrink: 0;
          transition: var(--transition);
        }

        .nav-link.active .nav-icon {
          color: var(--primary);
        }

        .chevron-icon {
          margin-left: auto;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
        }

        .nav-sub-menu {
          padding-left: 1.25rem;
          margin-top: 0.15rem;
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
          border-left: 1px solid rgba(255, 255, 255, 0.03);
          margin-left: 1.4rem;
        }

        .nav-sub-link {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.45rem 0.75rem;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          transition: var(--transition);
          font-size: 0.825rem;
          font-weight: 500;
        }

        .nav-sub-link:hover {
          color: white;
          background: rgba(255, 255, 255, 0.03);
        }

        .nav-sub-link.active {
          color: white;
          background: linear-gradient(90deg, rgba(255, 47, 191, 0.08) 0%, rgba(123, 77, 255, 0.02) 100%) !important;
          font-weight: 600;
          box-shadow: inset 2px 0 0 var(--primary);
        }

        .nav-icon-sub {
          flex-shrink: 0;
          color: var(--text-muted);
          transition: var(--transition);
        }

        .nav-sub-link.active .nav-icon-sub {
          color: var(--primary);
        }

        .collapsed-item {
          width: 40px;
          height: 40px;
          padding: 0;
          justify-content: center;
          border-radius: var(--radius-md);
          margin-bottom: 0.15rem;
        }

        .collapsed-item::before {
          display: none;
        }

        /* Bottom collapse toggle button */
        .collapse-toggle-btn {
          width: 100%;
          height: 48px;
          border-top: 1px solid var(--border);
          background: rgba(0, 0, 0, 0.2);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding: 0 1.25rem;
          gap: 0.75rem;
          cursor: pointer;
          transition: var(--transition);
          border-radius: 0;
        }

        .sidebar.collapsed .collapse-toggle-btn {
          padding: 0;
          justify-content: center;
          border-radius: 0;
        }

        .collapse-toggle-btn:hover {
          color: white;
          background: rgba(255, 255, 255, 0.04);
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
