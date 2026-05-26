import { useState, useMemo } from 'react';
import { 
  CheckSquare, 
  Square, 
  Plus, 
  Layout, 
  Type, 
  Clock,
  Trash2,
  User
} from 'lucide-react';

import { useCentralStore } from '../../store/CentralStore';
import { useLanguage } from '../../contexts/LanguageContext';

const Checklist = () => {
  const { t } = useLanguage();
  const {
    checklist: centralChecklist,
    activeProjectId,
    addChecklistItem,
    toggleChecklistItem,
    deleteChecklistItem,
  } = useCentralStore();

  const [newTaskText, setNewTaskText] = useState('');
  const [taskResponsible, setTaskResponsible] = useState('Social Media');

  const tasks = useMemo(() => {
    return centralChecklist.filter(item => item.projectId === activeProjectId);
  }, [centralChecklist, activeProjectId]);

  const progress = tasks.length > 0 
    ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) 
    : 0;

  const handleAddTask = async () => {
    if (!newTaskText.trim()) return;
    await addChecklistItem(newTaskText.trim(), taskResponsible);
    setNewTaskText('');
  };

  const handleAddSuggestion = async (text: string, resp: string) => {
    await addChecklistItem(text, resp);
  };

  return (
    <div className="checklist-page">
      <header className="page-header">
        <div>
          <h1 className="brand-font">{t('checklist.title')}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{t('checklist.subtitle')}</p>
        </div>
      </header>

      <div className="checklist-content">
        <div className="card checklist-main">
          <div className="checklist-header">
            <div className="progress-container">
              <div className="progress-info">
                <span className="progress-label">{t('checklist.progress_label')}</span>
                <span className="progress-value">{progress}%</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          </div>

          <div className="tasks-list">
            {tasks.map(task => (
              <div key={task.id} className={`task-item-row ${task.completed ? 'completed' : ''}`} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid transparent',
                transition: 'all 0.2s',
                marginBottom: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, cursor: 'pointer' }} onClick={() => toggleChecklistItem(task.id)}>
                  <div className="task-checkbox" style={{ color: task.completed ? 'var(--primary)' : 'var(--text-secondary)' }}>
                    {task.completed ? <CheckSquare size={20} /> : <Square size={20} />}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="task-text" style={{
                      fontWeight: 500,
                      color: 'white',
                      textDecoration: task.completed ? 'line-through' : 'none',
                      opacity: task.completed ? 0.6 : 1
                    }}>{task.text}</span>
                    {task.responsible && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <User size={10} /> Responsável: <strong style={{ color: 'var(--primary)' }}>{task.responsible}</strong>
                      </span>
                    )}
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="task-icons" style={{ display: 'flex', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                    {task.text.toLowerCase().includes('arte') && <Layout size={14} />}
                    {task.text.toLowerCase().includes('legenda') && <Type size={14} />}
                    {task.text.toLowerCase().includes('horário') && <Clock size={14} />}
                  </div>
                  <button onClick={() => deleteChecklistItem(task.id)} style={{ color: 'var(--text-secondary)', cursor: 'pointer', opacity: 0.5, transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {tasks.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--border)', borderRadius: '12px' }}>
                Nenhuma tarefa pendente neste projeto.
              </div>
            )}
          </div>

          <div className="add-task-form" style={{ display: 'flex', gap: '1rem', marginTop: '2rem', background: 'var(--input)', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border)', alignItems: 'center' }}>
            <Plus size={20} className="add-icon" style={{ color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder={t('checklist.add_placeholder')} 
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTask();
              }}
              style={{ background: 'none', border: 'none', outline: 'none', color: 'white', width: '100%', fontSize: '0.95rem' }}
            />
            <select 
              value={taskResponsible} 
              onChange={e => setTaskResponsible(e.target.value)}
              className="input-field" 
              style={{ width: '150px', padding: '0.25rem 0.5rem', height: '32px', fontSize: '0.8rem', borderRadius: '6px' }}
            >
              <option value="Social Media">Social Media</option>
              <option value="Design">Design</option>
              <option value="Copywriter">Copywriter</option>
              <option value="Gestor">Gestor</option>
            </select>
            <button className="btn-primary" onClick={handleAddTask} style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem' }}>
              Adicionar
            </button>
          </div>
        </div>

        <aside className="checklist-sidebar">
          <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 className="section-title-sm" style={{ margin: 0 }}>{t('checklist.ai_suggestions')}</h3>
            <p className="sidebar-text" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{t('checklist.ai_desc')}</p>
            
            <div className="suggestion-item" onClick={() => handleAddSuggestion('Criar criativo no Editor Visual', 'Design')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '8px', background: 'var(--input)', cursor: 'pointer', fontSize: '0.85rem' }}>
              <Plus size={14} />
              <span>Criar criativo no Editor</span>
            </div>
            <div className="suggestion-item" onClick={() => handleAddSuggestion('Revisar fuso horário do agendamento', 'Social Media')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '8px', background: 'var(--input)', cursor: 'pointer', fontSize: '0.85rem' }}>
              <Plus size={14} />
              <span>Revisar fuso horário</span>
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        .checklist-page {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .checklist-content {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 2rem;
        }

        .checklist-main {
          padding: 2rem;
        }

        .checklist-header {
          margin-bottom: 2.5rem;
        }

        .progress-container {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .progress-info {
          display: flex;
          justify-content: space-between;
          font-weight: 600;
        }

        .progress-value {
          color: var(--primary);
        }

        .progress-bar-bg {
          height: 8px;
          background: var(--input);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: var(--gradient);
          border-radius: 4px;
          transition: width 0.5s ease-out;
        }

        .tasks-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default Checklist;
