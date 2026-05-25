import { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  CheckCircle2,
  Clock,
  Image as ImageIcon,
  Video,
  Trash2,
  ListTodo
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGestao, type Post } from '../../contexts/GestaoContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useProducts } from '../../contexts/ProductContext';

const Calendario = () => {
  const { posts, addPost, updatePostStatus, updatePostDate, deletePost, tasks, addTask, toggleTask, deleteTask } = useGestao();
  const { t, language } = useLanguage();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('09:00');
  const [editPost, setEditPost] = useState<Post | null>(null);
  
  const { products: productList } = useProducts();

  const [newPostData, setNewPostData] = useState({
    title: '',
    type: 'Post' as const,
    product: productList.length > 0 ? productList[0].name : 'Produto',
    platform: 'Instagram' as const,
    status: 'pending' as const
  });

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const monthName = currentMonth.toLocaleString(language === 'pt' ? 'pt-BR' : language === 'en' ? 'en-US' : 'es-ES', { month: 'long' });
  const year = currentMonth.getFullYear();

  const days = Array.from({ length: daysInMonth(year, currentMonth.getMonth()) }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDayOfMonth(year, currentMonth.getMonth()) }, (_, i) => i);

  const postingTimes = ['09:00', '15:00', '21:00'];

  const getEventsForDayAndTime = (day: number, time: string) => {
    const [h, m] = time.split(':').map(Number);
    return posts.filter(p => {
      const d = new Date(p.date);
      return d.getDate() === day && 
             d.getMonth() === currentMonth.getMonth() && 
             d.getFullYear() === currentMonth.getFullYear() &&
             d.getHours() === h &&
             d.getMinutes() === m;
    });
  };

  const handleCreatePost = () => {
    if (!selectedDay) return;
    const date = new Date(year, currentMonth.getMonth(), selectedDay);
    const timeParts = selectedTime.split(':');
    date.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]));
    
    addPost({
      ...newPostData,
      date: date.toISOString()
    });
    setShowAddModal(false);
    setNewPostData({ ...newPostData, title: '' });
  };

  const handleEditStatus = (postId: string, status: Post['status']) => {
    updatePostStatus(postId, status);
  };

  const handleDeletePost = (postId: string) => {
    deletePost(postId);
    setEditPost(null);
  };

  return (
    <div className="calendario-page">
      <header className="page-header">
        <div>
          <h1 className="brand-font">{t('calendar.title')}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{t('calendar.subtitle')}</p>
        </div>
        
        <div className="calendar-controls">
          <div className="month-picker">
            <button className="icon-btn-sm" onClick={() => setCurrentMonth(new Date(year, currentMonth.getMonth() - 1))}>
              <ChevronLeft size={18} />
            </button>
            <span className="current-month-label">{monthName} {year}</span>
            <button className="icon-btn-sm" onClick={() => setCurrentMonth(new Date(year, currentMonth.getMonth() + 1))}>
              <ChevronRight size={18} />
            </button>
          </div>
          <button className="btn-primary" onClick={() => { setSelectedDay(new Date().getDate()); setShowAddModal(true); }}>
            <Plus size={18} />
            <span>{t('calendar.new_post')}</span>
          </button>
        </div>
      </header>

      <div className="calendar-layout">
      <div className="calendar-container">
        <div className="calendar-grid">
          {(t('calendar.weekdays') as unknown as string[]).map(day => (
            <div key={day} className="weekday-label">{day}</div>
          ))}
          
          {padding.map(i => <div key={`pad-${i}`} className="calendar-day empty"></div>)}
          
          {days.map(day => (
            <div key={day} className="calendar-day">
              <div className="day-number">{day}</div>
              <div className="day-slots">
                {postingTimes.map(time => {
                  const dayEvents = getEventsForDayAndTime(day, time);
                  return (
                    <div key={time} className={`time-slot ${dayEvents.length > 0 ? 'has-event' : ''}`}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const postId = e.dataTransfer.getData('text/plain');
                        const date = new Date(year, currentMonth.getMonth(), day);
                        const [h, m] = time.split(':').map(Number);
                        date.setHours(h, m);
                        updatePostDate(postId, date);
                      }}>
                      <span className="slot-time">{time}</span>
                      {dayEvents.length > 0 ? (
                        <div className="events-stack">
                          {dayEvents.map(event => (
                            <div key={event.id} className={`event-tag ${event.status}`}
                              onClick={(e) => { e.stopPropagation(); setEditPost(event); }}
                              draggable
                              onDragStart={(e) => { e.dataTransfer.setData('text/plain', event.id); e.stopPropagation(); }}
                              style={{ cursor: 'pointer' }}>
                              {event.platform === 'Instagram' ? <ImageIcon size={10} /> : <Video size={10} />}
                              <span className="event-type">{event.type}</span>
                              {event.status === 'posted' ? <CheckCircle2 size={10} className="status-icon" /> : <Clock size={10} className="status-icon" />}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <button className="add-event-btn" onClick={() => { setSelectedDay(day); setSelectedTime(time); setShowAddModal(true); }}>
                          <Plus size={12} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card task-panel">
        <div className="task-panel-header">
          <ListTodo size={18} />
          <h3>Tarefas</h3>
          <span className="task-count">{tasks.filter(t => !t.completed).length} pendentes</span>
        </div>
        <div className="task-input-row">
          <input type="text" className="input-field" id="newTaskInput" placeholder="Adicionar tarefa..." style={{ flex: 1 }} />
          <button className="btn-primary" style={{ padding: '0.5rem 1rem' }} onClick={() => {
            const input = document.getElementById('newTaskInput') as HTMLInputElement;
            if (input.value.trim()) { addTask(input.value.trim()); input.value = ''; }
          }}><Plus size={16} /></button>
        </div>
        <div className="task-list">
          {tasks.map(task => (
            <div key={task.id} className={`task-row ${task.completed ? 'done' : ''}`}>
              <button className="task-check" onClick={() => toggleTask(task.id)}>
                <CheckCircle2 size={18} className={task.completed ? 'checked' : ''} />
              </button>
              <span className="task-text">{task.text}</span>
              <button className="task-delete" onClick={() => deleteTask(task.id)}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="card modal-content"
            >
              <h2 className="brand-font">{t('calendar.modal.title')}</h2>
              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label>{t('calendar.modal.post_title')}</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={newPostData.title}
                  onChange={e => setNewPostData({ ...newPostData, title: e.target.value })}
                  placeholder={t('calendar.modal.placeholder')}
                />
              </div>
              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div className="form-group">
                  <label>{t('calendar.modal.type')}</label>
                  <select 
                    className="input-field"
                    value={newPostData.type}
                    onChange={e => setNewPostData({ ...newPostData, type: e.target.value as any })}
                  >
                    <option value="Post">Post</option>
                    <option value="Reels">Reels</option>
                    <option value="Stories">Stories</option>
                    <option value="Video">Video</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>{t('calendar.modal.platform')}</label>
                  <select 
                    className="input-field"
                    value={newPostData.platform}
                    onChange={e => setNewPostData({ ...newPostData, platform: e.target.value as any })}
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Youtube">Youtube</option>
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Produto</label>
                <select className="input-field" value={newPostData.product}
                  onChange={e => setNewPostData({ ...newPostData, product: e.target.value })}>
                  {productList.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-actions" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>{t('calendar.modal.cancel')}</button>
                <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleCreatePost}>{t('calendar.modal.schedule')}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editPost && (
          <div className="modal-overlay">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="card modal-content" style={{ maxWidth: 420 }}>
              <h2 className="brand-font" style={{ marginBottom: '1.5rem' }}>{editPost.title}</h2>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Status</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className={`btn-sm ${editPost.status === 'pending' ? 'btn-active' : 'btn-inactive'}`}
                    onClick={() => handleEditStatus(editPost.id, 'pending')}>
                    <Clock size={14} /> Pendente
                  </button>
                  <button className={`btn-sm ${editPost.status === 'posted' ? 'btn-active' : 'btn-inactive'}`}
                    onClick={() => handleEditStatus(editPost.id, 'posted')}>
                    <CheckCircle2 size={14} /> Publicado
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setEditPost(null)}>Fechar</button>
                <button className="btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => handleDeletePost(editPost.id)}>
                  <Trash2 size={16} /> Excluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .calendario-page {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .calendar-controls {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .month-picker {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: var(--card);
          border: 1px solid var(--border);
          padding: 0.5rem;
          border-radius: 100px;
        }

        .icon-btn-sm {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          transition: var(--transition);
        }

        .icon-btn-sm:hover {
          background: var(--border);
          color: white;
        }

        .current-month-label {
          font-weight: 600;
          text-transform: capitalize;
          min-width: 120px;
          text-align: center;
        }

        .calendar-container {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
        }

        .weekday-label {
          padding: 1rem;
          text-align: center;
          font-weight: 600;
          color: var(--text-secondary);
          border-bottom: 1px solid var(--border);
          font-size: 0.85rem;
        }

        .calendar-day {
          min-height: 160px;
          border-right: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          transition: var(--transition);
        }

        .calendar-day:nth-child(7n) {
          border-right: none;
        }

        .calendar-day:hover {
          background: rgba(255, 255, 255, 0.01);
        }

        .calendar-day.empty {
          background: rgba(0, 0, 0, 0.1);
        }

        .day-number {
          font-family: 'Outfit', sans-serif;
          font-weight: 600;
          font-size: 1.1rem;
          color: var(--text-secondary);
        }

        .events-stack {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
        }

        .status-icon {
          margin-left: 2px;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 2rem;
        }

        .modal-content {
          background: var(--card);
          padding: 2.5rem;
          border-radius: 24px;
          border: 1px solid var(--border);
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .calendar-layout { display: grid; grid-template-columns: 1fr 280px; gap: 1.5rem; align-items: start; }
        .task-panel { padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; position: sticky; top: 100px; }
        .task-panel-header { display: flex; align-items: center; gap: 0.5rem; color: white; font-weight: 700; }
        .task-panel-header h3 { font-size: 1rem; margin: 0; }
        .task-count { margin-left: auto; font-size: 0.75rem; color: var(--text-secondary); font-weight: 400; }
        .task-input-row { display: flex; gap: 0.5rem; }
        .task-list { display: flex; flex-direction: column; gap: 0.4rem; max-height: 400px; overflow-y: auto; }
        .task-row { display: flex; align-items: center; gap: 0.6rem; padding: 0.5rem; border-radius: 8px; transition: var(--transition); }
        .task-row:hover { background: rgba(255,255,255,0.02); }
        .task-row.done .task-text { text-decoration: line-through; color: var(--text-secondary); opacity: 0.6; }
        .task-check { background: none; border: none; cursor: pointer; color: var(--text-secondary); padding: 0; }
        .task-check .checked { color: #10b981; }
        .task-text { flex: 1; font-size: 0.85rem; color: white; }
        .task-delete { background: none; border: none; cursor: pointer; color: var(--text-secondary); opacity: 0; transition: var(--transition); padding: 0; }
        .task-row:hover .task-delete { opacity: 1; }
        .event-tag.pending {
          color: var(--text-secondary);
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .event-tag.posted {
          color: #10b981;
          background: rgba(16, 185, 129, 0.05);
          border: 1px solid rgba(16, 185, 129, 0.1);
        }
        .btn-sm { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; border-radius: 100px; font-size: 0.8rem; font-weight: 600; border: 1px solid var(--border); cursor: pointer; transition: var(--transition); }
        .btn-active { background: var(--primary); color: white; border-color: var(--primary); }
        .btn-inactive { background: var(--input); color: var(--text-secondary); }
        .btn-danger { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1rem; border-radius: 8px; background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.2); font-weight: 600; cursor: pointer; transition: var(--transition); }
        .btn-danger:hover { background: rgba(239,68,68,0.2); }
      `}</style>
    </div>
  );
};

export default Calendario;
