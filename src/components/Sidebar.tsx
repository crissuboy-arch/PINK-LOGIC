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
  ChevronDown,
  ChevronRight,
  Server,
  Bot,
  Send
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCentralStore } from '../store/CentralStore';

const Sidebar = () => {
  const { t } = useLanguage();
  const [openMenus, setOpenMenus] = useState<string[]>(['gestao', 'criacao']);
  
  const { projects, activeProjectId, activeProject, setActiveProjectId, createProject } = useCentralStore();
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showNewProjModal, setShowNewProjModal] = useState(false);
  const [newProjName, setNewProjName] = useState('');

  const toggleMenu = (menu: string) => {
    setOpenMenus(prev => 
      prev.includes(menu) ? prev.filter(m => m !== menu) : [...prev, menu]
    );
  };

  const menuItems = [
    { id: 'dashboard', label: t('sidebar.dashboard'), icon: LayoutDashboard, path: '/' },
    {
      id: 'gestao',
      label: t('sidebar.gestao'),
      icon: Settings,
      children: [
        { label: t('sidebar.calendario'), icon: Calendar, path: '/gestao/calendario' },
        { label: t('sidebar.ideias'), icon: Lightbulb, path: '/gestao/ideias' },
        { label: t('sidebar.checklists'), icon: CheckSquare, path: '/gestao/checklists' },
        { label: t('sidebar.campanhas'), icon: Megaphone, path: '/gestao/campanhas' },
        { label: t('sidebar.produtos'), icon: Package, path: '/gestao/produtos' },
        { label: t('sidebar.status'), icon: BarChart3, path: '/gestao/status' },
        { label: t('sidebar.publicador') || 'Publicador Automático', icon: Send, path: '/publicador-automatico' },
      ]
    },
    {
      id: 'criacao',
      label: t('sidebar.criacao'),
      icon: PenTool,
      children: [
        { label: t('sidebar.editor'), icon: Palette, path: '/criacao/editor' },
        { label: t('sidebar.story'), icon: Smartphone, path: '/criacao/story' },
        { label: t('sidebar.copy'), icon: FileText, path: '/criacao/copy' },
        { label: t('sidebar.logo'), icon: PenTool, path: '/criacao/logo' },
        { label: t('sidebar.vision'), icon: Eye, path: '/criacao/vision' },
        { label: t('sidebar.stickers'), icon: Sticker, path: '/criacao/stickers' },
      ]
    },
    { id: 'estrategia', label: t('sidebar.estrategia'), icon: Target, path: '/estrategia' },
    { id: 'biblioteca', label: t('sidebar.biblioteca'), icon: Library, path: '/biblioteca' },
    {
      id: 'sistema',
      label: 'Sistema',
      icon: Server,
      children: [
        { label: 'Agentes', icon: Bot, path: '/sistema/agentes' },
      ]
    },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon-wrap">
          <img src="/icon.png" alt="P" className="sidebar-logo-img" />
        </div>
        <span className="brand-font neon-text">Pink Logic</span>
      </div>

      {/* Project Switcher Selector */}
      <div className="project-switcher-wrap" style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.03)', position: 'relative' }}>
        <button 
          onClick={() => setShowProjectDropdown(!showProjectDropdown)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 0.85rem',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'white',
            justifyContent: 'space-between',
            fontSize: '0.85rem',
            fontWeight: 600,
            textAlign: 'left'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />
            <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {activeProject ? activeProject.name : 'Selecionar Projeto...'}
            </span>
          </div>
          <ChevronDown size={14} style={{ color: 'var(--text-secondary)' }} />
        </button>

        {showProjectDropdown && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '1rem',
            right: '1rem',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            zIndex: 110,
            marginTop: '4px',
            overflow: 'hidden'
          }}>
            <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
              {projects.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    setActiveProjectId(p.id);
                    setShowProjectDropdown(false);
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.6rem 1rem',
                    color: p.id === activeProjectId ? 'var(--primary)' : 'white',
                    background: p.id === activeProjectId ? 'rgba(255,45,141,0.05)' : 'none',
                    fontSize: '0.8rem',
                    fontWeight: p.id === activeProjectId ? 700 : 500,
                    borderBottom: '1px solid rgba(255,255,255,0.01)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: p.id === activeProjectId ? 'var(--primary)' : 'rgba(255,255,255,0.2)' }} />
                  {p.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setShowNewProjModal(true);
                setShowProjectDropdown(false);
              }}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '0.6rem 1rem',
                color: 'var(--primary)',
                fontSize: '0.8rem',
                fontWeight: 600,
                background: 'rgba(255,45,141,0.02)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                borderTop: '1px solid var(--border)'
              }}
            >
              <Plus size={14} />
              Criar Novo Projeto
            </button>
          </div>
        )}
      </div>

      {showNewProjModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}>
          <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 className="brand-font" style={{ fontSize: '1.25rem', color: 'white', margin: 0 }}>Novo Projeto</h3>
            <div className="form-group">
              <label>Nome do Projeto</label>
              <input 
                type="text" 
                className="input-field" 
                value={newProjName}
                onChange={e => setNewProjName(e.target.value)}
                placeholder="Ex: Ofensiva Criativa"
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button 
                className="btn-secondary" 
                style={{ flex: 1, justifyContent: 'center' }} 
                onClick={() => {
                  setShowNewProjModal(false);
                  setNewProjName('');
                }}
              >
                Cancelar
              </button>
              <button 
                className="btn-primary" 
                style={{ flex: 1.5, justifyContent: 'center' }}
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

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <div key={item.id} className="nav-group">
            {item.children ? (
              <>
                <button 
                  className={`nav-link ${openMenus.includes(item.id) ? 'active' : ''}`}
                  onClick={() => toggleMenu(item.id)}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                  <div className="chevron">
                    {openMenus.includes(item.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                </button>
                {openMenus.includes(item.id) && (
                  <div className="nav-sub-menu">
                    {item.children.map((child) => (
                      <NavLink 
                        key={child.path} 
                        to={child.path} 
                        className={({ isActive }) => `nav-sub-link ${isActive ? 'active' : ''}`}
                      >
                        <child.icon size={18} />
                        <span>{child.label}</span>
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
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            )}
          </div>
        ))}
      </nav>

      <style>{`
        .sidebar {
          width: var(--sidebar-width);
          background: var(--card);
          border-right: 1px solid var(--border);
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          display: flex;
          flex-direction: column;
          z-index: 100;
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
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        }

        .logo-icon-wrap {
          width: 34px;
          height: 34px;
          background: #000;
          border-radius: 10px;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 15px rgba(255, 45, 141, 0.2);
          border: 1px solid rgba(255, 45, 141, 0.1);
        }

        .sidebar-logo-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .neon-text {
          text-shadow: 0 0 10px rgba(255, 45, 141, 0.3);
        }

        .sidebar-nav {
          flex: 1;
          padding: 1rem 0.75rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          transition: var(--transition);
          width: 100%;
          font-weight: 500;
          font-size: 0.95rem;
        }

        .nav-link:hover {
          color: white;
          background: rgba(255, 255, 255, 0.03);
        }

        .nav-link.active {
          color: var(--primary);
          background: rgba(255, 45, 141, 0.05);
        }

        .chevron {
          margin-left: auto;
        }

        .nav-sub-menu {
          padding-left: 1.25rem;
          margin-top: 0.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }

        .nav-sub-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.6rem 1rem;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          transition: var(--transition);
          font-size: 0.9rem;
        }

        .nav-sub-link:hover {
          color: white;
          background: rgba(255, 255, 255, 0.03);
        }

        .nav-sub-link.active {
          color: var(--primary);
          background: rgba(255, 45, 141, 0.05);
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
