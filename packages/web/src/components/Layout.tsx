import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { authService } from '../services/authService';

const Layout = () => {
  const navigate = useNavigate();
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
      <Sidebar isCollapsed={isCollapsed} onToggleCollapse={toggleCollapse} />
      <main className="main-content" style={{ transition: 'margin-left 0.2s cubic-bezier(0.16, 1, 0.3, 1)', marginLeft: 'var(--sidebar-width)' }}>
        <Header />
        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
