import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { authService } from '../services/authService';
import { useIsMobile } from '../hooks/useIsMobile';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  // Mobile: a sidebar vira gaveta (off-canvas) aberta pelo botão de menu do header.
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname, isMobile]);
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login', { replace: true });
    }

    const checkAuth = () => {
      const auth = authService.isAuthenticated();
      setIsAuthenticated(auth);
      if (!auth) {
        navigate('/login', { replace: true });
      }
    };

    window.addEventListener('pinklogic:auth-changed', checkAuth);

    // Confirma a sessão real no Supabase (o cache local sozinho não basta)
    authService.syncSession().then(valid => {
      if (!valid) {
        setIsAuthenticated(false);
        navigate('/login', { replace: true });
      }
    });

    return () => {
      window.removeEventListener('pinklogic:auth-changed', checkAuth);
    };
  }, [navigate]);

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar-collapsed', String(next));
      return next;
    });
  };

  const sidebarWidth = isCollapsed ? '72px' : '260px';

  if (!isAuthenticated) return null;

  return (
    <div className="app-container" style={{ '--sidebar-width': sidebarWidth } as any}>
      <Sidebar
        isCollapsed={isMobile ? false : isCollapsed}
        onToggleCollapse={toggleCollapse}
        mobileOpen={mobileNavOpen}
      />
      {isMobile && mobileNavOpen && (
        <div className="mobile-nav-backdrop" onClick={() => setMobileNavOpen(false)} />
      )}
      <main className="main-content" style={{ transition: 'margin-left 0.2s cubic-bezier(0.16, 1, 0.3, 1)', marginLeft: 'var(--sidebar-width)' }}>
        <Header onOpenMenu={() => setMobileNavOpen(true)} />
        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
