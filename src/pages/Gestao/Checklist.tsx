import { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  Plus, 
  Layout, 
  Type, 
  Clock
} from 'lucide-react';

import { useGestao } from '../../contexts/GestaoContext';
import { useLanguage } from '../../contexts/LanguageContext';

const Checklist = () => {
  const { tasks, addTask, toggleTask } = useGestao();
  const { t } = useLanguage();
  const [newTaskText, setNewTaskText] = useState('');

  const progress = tasks.length > 0 
    ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) 
    : 0;

  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    addTask(newTaskText);
    setNewTaskText('');
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
            {(tasks || []).map(task => (
              <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`} onClick={() => toggleTask(task.id)}>
                <div className="task-checkbox">
                  {task.completed ? <CheckSquare size={20} className="checked" /> : <Square size={20} />}
                </div>
                <span className="task-text">{task.text}</span>
                <div className="task-icons">
                  {task.text.toLowerCase().includes('arte') && <Layout size={14} />}
                  {task.text.toLowerCase().includes('legenda') && <Type size={14} />}
                  {task.text.toLowerCase().includes('horário') && <Clock size={14} />}
                </div>
              </div>
            ))}
          </div>

          <div className="add-task-form">
            <Plus size={20} className="add-icon" />
            <input 
              type="text" 
              placeholder={t('checklist.add_placeholder')} 
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTask();
              }}
            />
          </div>
        </div>

        <aside className="checklist-sidebar">
          <div className="card">
            <h3 className="section-title-sm">{t('checklist.ai_suggestions')}</h3>
            <p className="sidebar-text">{t('checklist.ai_desc')}</p>
            <div className="suggestion-item">
              <Plus size={14} />
              <span>{t('checklist.suggestion_1')}</span>
            </div>
            <div className="suggestion-item">
              <Plus size={14} />
              <span>{t('checklist.suggestion_2')}</span>
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

        .task-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-radius: var(--radius-md);
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid transparent;
          cursor: pointer;
          transition: var(--transition);
        }

        .task-item:hover {
          background: var(--input);
          border-color: var(--border);
        }

        .task-item.completed {
          opacity: 0.6;
        }

        .task-item.completed .task-text {
          text-decoration: line-through;
        }

        .task-checkbox {
          color: var(--text-secondary);
        }

        .task-checkbox .checked {
          color: var(--primary);
        }

        .task-text {
          flex: 1;
          font-weight: 500;
        }

        .task-icons {
          display: flex;
          gap: 0.75rem;
          color: var(--text-secondary);
        }

        .add-task-form {
          margin-top: 2rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--input);
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
        }

        .add-task-form input {
          background: none;
          border: none;
          outline: none;
          color: white;
          width: 100%;
          font-size: 0.95rem;
        }

        .add-icon {
          color: var(--text-secondary);
        }

        .sidebar-text {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        .suggestion-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          border-radius: 8px;
          background: var(--input);
          color: var(--text-secondary);
          font-size: 0.85rem;
          cursor: pointer;
          transition: var(--transition);
          margin-bottom: 0.5rem;
        }

        .suggestion-item:hover {
          color: white;
          background: var(--border);
        }
      `}</style>
    </div>
  );
};

export default Checklist;
