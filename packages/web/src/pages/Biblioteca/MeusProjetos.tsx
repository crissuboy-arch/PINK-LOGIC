import { useState } from 'react';
import { 
  Folder, 
  Plus, 
  MoreVertical, 
  Edit2, 
  Copy, 
  Trash2, 
  Search,
  Layout,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { mapToProjectSchema } from '../../providers/ProjectProvider';
import { useCentralStore } from '../../store/CentralStore';
import type { ProjectSchema } from '../../types/ProjectSchema';
import { loadEditorData, saveEditorData } from '../../services/editorDocuments';

const MeusProjetos = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { projects: storedProjects, brands, createProject, deleteProject: removeProject, isLoading, error: loadError } = useCentralStore();
  const projects = storedProjects.map(project => mapToProjectSchema(project, brands.find(b => b.projectId === project.id)));
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const deleteProject = async (id: string) => {
    if (!window.confirm('Excluir este projeto e seus designs salvos?')) return;
    setBusy(true); setError(null);
    try { await removeProject(id); }
    catch (error) { setError(error instanceof Error ? error.message : 'Falha ao excluir.'); }
    finally { setBusy(false); }
  };

  const duplicateProject = async (project: ProjectSchema) => {
    setBusy(true); setError(null);
    try {
      const original = storedProjects.find(p => p.id === project.id)!;
      const editorData = await loadEditorData(project.id);
      const copy = await createProject({ ...original, name: `${project.name} (Cópia)` });
      if (editorData) {
        try { await saveEditorData(copy.id, editorData.document, 0); }
        catch (error) { await removeProject(copy.id); throw error; }
      }
    } catch (error) { setError(error instanceof Error ? error.message : 'Falha ao duplicar.'); }
    finally { setBusy(false); }
  };

  const getPreviewBg = (project: any): string => {
    return project.branding?.palette?.background || project.background?.value || '#1a1a24';
  };

  const [activeTab, setActiveTab] = useState<'all' | 'designs' | 'campaigns'>('all');

  const filteredProjects = projects.filter(p => {
    const objective = p.settings?.objective || '';
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          objective.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (activeTab === 'designs') {
      return !p.name.toLowerCase().includes('campanha') && !objective.toLowerCase().includes('campanha');
    }
    if (activeTab === 'campaigns') {
      return p.name.toLowerCase().includes('campanha') || objective.toLowerCase().includes('campanha') || p.name.toLowerCase().includes('ofensiva');
    }
    return true;
  });

  return (
    <div className="projects-page">
      <header className="projects-header">
        <div className="header-info">
          <h1 className="page-title">{t('sidebar.biblioteca')}</h1>
          <p className="page-subtitle">{t('projects.subtitle')}</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/criacao/editor')}>
          <Plus size={20} />
          <span>{t('projects.new_project')}</span>
        </button>
      </header>

      {(error || loadError) && <p role="alert">{error || loadError}</p>}
      {isLoading && <p role="status">Carregando seus projetos…</p>}
      <div className="projects-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder={t('projects.search_placeholder')} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          <button 
            className={activeTab === 'all' ? 'active' : ''} 
            onClick={() => setActiveTab('all')}
          >
            {t('projects.filter_all')}
          </button>
          <button 
            className={activeTab === 'designs' ? 'active' : ''} 
            onClick={() => setActiveTab('designs')}
          >
            {t('projects.filter_designs')}
          </button>
          <button 
            className={activeTab === 'campaigns' ? 'active' : ''} 
            onClick={() => setActiveTab('campaigns')}
          >
            {t('projects.filter_campaigns')}
          </button>
        </div>
      </div>

      <div className="projects-grid">
        <AnimatePresence>
          {filteredProjects.map((project, index) => (
            <motion.div 
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              className="project-card"
            >
              <div 
                className="project-preview"
                style={{ background: getPreviewBg(project) }}
              >
                <div className="preview-overlay">
                  <button className="btn-edit" onClick={() => navigate(`/criacao/editor?id=${project.id}`)}>
                    <Edit2 size={18} />
                    {t('projects.edit')}
                  </button>
                </div>
                <Layout size={40} opacity={0.2} />
              </div>
              
              <div className="project-info">
                <div className="info-main">
                  <h3 className="project-name">{project.name}</h3>
                  <div className="project-meta">
                    <Clock size={12} />
                    <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="project-actions">
                  <div className="dropdown">
                    <button className="icon-btn-sm"><MoreVertical size={16} /></button>
                    <div className="dropdown-content">
                      <button disabled={busy} onClick={() => duplicateProject(project)}><Copy size={14} /> {t('projects.duplicate')}</button>
                      <button disabled={busy} onClick={() => deleteProject(project.id)} className="danger"><Trash2 size={14} /> {t('projects.delete')}</button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {!isLoading && !loadError && filteredProjects.length === 0 && (
          <div className="empty-state">
            <Folder size={60} opacity={0.1} />
            <h3>{t('projects.empty_title')}</h3>
            <p>{t('projects.empty_subtitle')}</p>
            <button className="btn-secondary" onClick={() => navigate('/criacao/editor')}>
              {t('projects.empty_button')}
            </button>
          </div>
        )}
      </div>

      <style>{`
        .projects-page {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .projects-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .projects-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
        }

        .search-box {
          flex: 1;
          max-width: 400px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 0 1rem;
          height: 48px;
          color: var(--text-secondary);
        }

        .search-box input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          color: white;
          font-size: 0.9rem;
        }

        .filter-tabs {
          display: flex;
          gap: 0.5rem;
          background: var(--card);
          padding: 0.4rem;
          border-radius: 12px;
          border: 1px solid var(--border);
        }

        .filter-tabs button {
          padding: 0.5rem 1.25rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
          transition: var(--transition);
        }

        .filter-tabs button.active {
          background: var(--input);
          color: var(--primary);
        }

        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
          min-height: 400px;
        }

        .project-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: var(--transition);
        }

        .project-card:hover {
          transform: translateY(-4px);
          border-color: var(--primary);
          box-shadow: 0 10px 30px rgba(255, 45, 141, 0.1);
        }

        .project-preview {
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .preview-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: var(--transition);
          z-index: 2;
        }

        .project-card:hover .preview-overlay {
          opacity: 1;
        }

        .btn-edit {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: white;
          color: black;
          padding: 0.75rem 1.5rem;
          border-radius: 100px;
          font-weight: 700;
          font-size: 0.9rem;
          transform: translateY(10px);
          transition: var(--transition);
          border: none;
        }

        .project-card:hover .btn-edit {
          transform: translateY(0);
        }

        .project-info {
          padding: 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .project-name {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 0.4rem;
          color: white;
        }

        .project-meta {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .dropdown {
          position: relative;
        }

        .dropdown-content {
          position: absolute;
          right: 0;
          top: 100%;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 0.4rem;
          display: none;
          flex-direction: column;
          gap: 0.2rem;
          min-width: 140px;
          z-index: 10;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        }

        .dropdown:hover .dropdown-content {
          display: flex;
        }

        .dropdown-content button {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.6rem 0.75rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
          border-radius: 6px;
          text-align: left;
          transition: var(--transition);
          background: none;
          border: none;
          width: 100%;
        }

        .dropdown-content button:hover {
          background: var(--input);
          color: white;
        }

        .dropdown-content button.danger:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }

        .empty-state {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 1.5rem;
          padding: 5rem 0;
          color: var(--text-secondary);
        }

        .empty-state h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default MeusProjetos;
