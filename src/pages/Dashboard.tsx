import { motion } from 'framer-motion';
import { 
  FilePlus, 
  Package, 
  Calendar, 
  Megaphone, 
  ArrowUpRight,
  TrendingUp,
  Layout
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useGestao } from '../contexts/GestaoContext';
import { useLanguage } from '../contexts/LanguageContext';
import OrchestratorCommandPanel from '../components/orchestrator/OrchestratorCommandPanel';
import ExecutionHistoryPanel from '../components/orchestrator/ExecutionHistoryPanel';
import AgentManagementPanel from '../components/orchestrator/AgentManagementPanel';

const Dashboard = () => {
  const { metrics } = useGestao();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const stats = [
    { label: t('dashboard.posts_today'), value: metrics.pendingPosts.toString().padStart(2, '0'), icon: Layout, color: '#FF2D8D' },
    { label: t('dashboard.active_campaigns'), value: `${metrics.completedTasks}/${metrics.totalTasks}`, icon: Megaphone, color: '#B026FF' },
    { label: t('dashboard.registered_products'), value: metrics.totalProducts.toString().padStart(2, '0'), icon: Package, color: '#00D1FF' },
  ];

  const quickActions = [
    { label: t('dashboard.create_content'), icon: FilePlus, path: '/criacao/editor', description: t('dashboard.create_content_desc') },
    { label: t('dashboard.manage_products'), icon: Package, path: '/gestao/produtos', description: t('dashboard.manage_products_desc') },
    { label: t('dashboard.view_calendar'), icon: Calendar, path: '/gestao/calendario', description: t('dashboard.view_calendar_desc') },
    { label: t('dashboard.create_campaign'), icon: Megaphone, path: '/gestao/campanhas', description: t('dashboard.create_campaign_desc') },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="dashboard-page"
    >
      <header className="dashboard-header">
        <div className="header-branding">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="dashboard-logo-wrap"
          >
            <img src="/logo.png" alt="Pink Logic" />
          </motion.div>
        </div>
        <div className="welcome">
          <motion.h1 variants={item} className="brand-font">
            {t('dashboard.welcome', { name: 'Usuário Pink' })}
          </motion.h1>
          <motion.p variants={item} style={{ color: 'var(--text-secondary)' }}>
            {t('dashboard.welcome_subtitle')}
          </motion.p>
        </div>
      </header>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <motion.div key={index} variants={item} className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
              <stat.icon size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value">{stat.value}</span>
            </div>
            <div className="stat-badge">
              <TrendingUp size={14} />
              <span>+12%</span>
            </div>
          </motion.div>
        ))}
      </div>

      <OrchestratorCommandPanel />

      <ExecutionHistoryPanel />

      <AgentManagementPanel />

      <div className="actions-section">
        <motion.h2 variants={item} className="section-title">{t('dashboard.quick_actions')}</motion.h2>
        <div className="actions-grid">
          {quickActions.map((action, index) => (
            <motion.div 
              key={index} 
              variants={item} 
              className="action-card"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(action.path)}
            >
              <div className="action-icon">
                <action.icon size={24} />
              </div>
              <div className="action-content">
                <h3>{action.label}</h3>
                <p>{action.description}</p>
              </div>
              <div className="action-arrow">
                <ArrowUpRight size={20} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        .dashboard-page {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }

        .dashboard-header .brand-font {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          text-align: center;
        }

        .header-branding {
          display: flex;
          justify-content: center;
          margin-bottom: 2rem;
        }

        .dashboard-logo-wrap {
          width: 180px;
          height: 180px;
          background: #000;
          border-radius: 30px;
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 50px rgba(255, 45, 141, 0.2);
          border: 1px solid rgba(255, 45, 141, 0.1);
        }

        .dashboard-logo-wrap img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .welcome {
          text-align: center;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .stat-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1.25rem;
          position: relative;
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-label {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          font-family: 'Outfit', sans-serif;
        }

        .stat-badge {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          padding: 0.25rem 0.5rem;
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .section-title {
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
          color: white;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .action-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          cursor: pointer;
          transition: var(--transition);
        }

        .action-card:hover {
          background: rgba(255, 255, 255, 0.02);
          border-color: rgba(255, 45, 141, 0.3);
        }

        .action-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: var(--input);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
        }

        .action-content h3 {
          font-size: 1.1rem;
          margin-bottom: 0.25rem;
        }

        .action-content p {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .action-arrow {
          margin-left: auto;
          color: var(--text-secondary);
          opacity: 0;
          transition: var(--transition);
        }

        .action-card:hover .action-arrow {
          opacity: 1;
          color: var(--primary);
        }
      `}</style>
    </motion.div>
  );
};

export default Dashboard;
