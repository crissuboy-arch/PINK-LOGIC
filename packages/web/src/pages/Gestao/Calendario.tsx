import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  CheckCircle2,
  Clock,
  Image as ImageIcon,
  Trash2,
  ListTodo,
  Calendar,
  Columns,
  List,
  Activity,
  Search,
  Filter,
  Copy,
  Edit3,
  Sliders,
  Sparkles,
  Briefcase,
  Tag,
  Link as LinkIcon,
  Target,
  Layers,
  FileText,
  X,
  Folder
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePublisher } from '../../contexts/PublisherContext';
import { useCentralStore } from '../../store/CentralStore';
import type { Post, Campaign, Product, Brand } from '../../store/types';

interface CalendarEvent {
  id: string;
  title: string;
  caption: string;
  hashtags: string;
  cta: string | null;
  mediaUrl: string;
  platform: string;
  status: 'rascunho' | 'editando' | 'agendado' | 'publicado' | 'falhou';
  type: 'Post' | 'Reels' | 'Stories' | 'Video' | 'Copy';
  date: string; // mapped from scheduled_at
  productId: string | null;
  campaignId: string | null;
}

const Calendario = () => {
  const centralStore = useCentralStore();
  const { activeProjectId, activeProject, activeBrand, projects, brands, campaigns, posts, products, checklist } = centralStore;
  const { deleteScheduledPost, publishPostNow, updateScheduledPostDate } = usePublisher();
  const { t, language } = useLanguage();

  // Navigation and view states
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'mensal' | 'semanal' | 'agenda' | 'timeline'>('mensal');
  const [selectedDayNum, setSelectedDayNum] = useState<number | null>(new Date().getDate());
  
  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCampaign, setFilterCampaign] = useState('All');
  const [filterProduct, setFilterProduct] = useState('All');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('09:00');
  const [detailEvent, setDetailEvent] = useState<CalendarEvent | null>(null);
  const [showBrandModal, setShowBrandModal] = useState(false);

  // Form states for Brand Kit Editor
  const [brandForm, setBrandForm] = useState<{
    name: string;
    logo: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    headingFont: string;
    bodyFont: string;
    tone: string;
    style: string;
    secondaryColors: string[];
    socialLinks: {
      instagram?: string;
      tiktok?: string;
      youtube?: string;
      facebook?: string;
    };
  } | null>(null);

  // Form states for Quick Add / Edit Post
  const [postForm, setPostForm] = useState({
    title: '',
    caption: '',
    hashtags: '',
    cta: '',
    mediaUrl: '',
    platform: 'Instagram',
    type: 'Post' as const,
    campaignId: '',
    productId: '',
    status: 'agendado' as const,
    time: '09:00'
  });

  const postingTimes = ['09:00', '15:00', '21:00'];

  // 1. Initial brand form loading
  useEffect(() => {
    if (activeBrand) {
      setBrandForm({
        name: activeBrand.name,
        logo: activeBrand.logo || '',
        primaryColor: activeBrand.colors.primary,
        secondaryColor: activeBrand.colors.secondary,
        accentColor: activeBrand.colors.accent,
        backgroundColor: activeBrand.colors.background,
        textColor: activeBrand.colors.text,
        headingFont: activeBrand.fonts.heading,
        bodyFont: activeBrand.fonts.body,
        tone: activeBrand.tone || 'Profissional',
        style: activeBrand.style || 'Moderno',
        secondaryColors: activeBrand.secondaryColors || [],
        socialLinks: {
          instagram: activeBrand.socialLinks?.instagram || '',
          tiktok: activeBrand.socialLinks?.tiktok || '',
          youtube: activeBrand.socialLinks?.youtube || '',
          facebook: activeBrand.socialLinks?.facebook || '',
        },
      });
    }
  }, [activeBrand]);

  // 2. Filter posts by active project and resolve list
  const projectPosts = useMemo(() => {
    return posts.filter(p => p.projectId === activeProjectId);
  }, [posts, activeProjectId]);

  // 3. Map store posts into single unified array of CalendarEvent
  const allEvents = useMemo((): CalendarEvent[] => {
    return projectPosts.map(p => ({
      id: p.id,
      title: p.title || 'Sem título',
      caption: p.caption || '',
      hashtags: p.hashtags || '',
      cta: p.cta || null,
      mediaUrl: p.mediaUrl || '',
      platform: p.platforms && p.platforms.length > 0 ? p.platforms[0] : 'Instagram',
      status: p.status,
      type: p.type,
      date: p.scheduled_at,
      productId: p.productId,
      campaignId: p.campaignId
    }));
  }, [projectPosts]);

  // 4. Filtering logic
  const filteredEvents = useMemo(() => {
    return allEvents.filter(e => {
      // 1. Search Query
      const matchesSearch = searchQuery === '' || 
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.hashtags.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Platform
      const matchesPlatform = filterPlatform === 'All' || e.platform === filterPlatform;

      // 3. Status
      const matchesStatus = filterStatus === 'All' || e.status === filterStatus;

      // 4. Campaign
      const matchesCampaign = filterCampaign === 'All' || e.campaignId === filterCampaign;

      // 5. Product
      const matchesProduct = filterProduct === 'All' || e.productId === filterProduct;

      return matchesSearch && matchesPlatform && matchesStatus && matchesCampaign && matchesProduct;
    });
  }, [allEvents, searchQuery, filterPlatform, filterStatus, filterCampaign, filterProduct]);

  // 5. Calendar mathematics (Month View)
  const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const firstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const monthName = currentMonth.toLocaleString(language === 'pt' ? 'pt-BR' : 'en-US', { month: 'long' });
  const year = currentMonth.getFullYear();

  const monthDays = Array.from({ length: daysInMonth(year, currentMonth.getMonth()) }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDayOfMonth(year, currentMonth.getMonth()) }, (_, i) => i);

  // 6. Calendar mathematics (Week View)
  const getStartOfWeek = (d: Date) => {
    const day = d.getDay(); // 0: Sun, 1: Mon, etc.
    const diff = d.getDate() - day;
    const start = new Date(d);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    return start;
  };

  const weekDays = useMemo(() => {
    const start = getStartOfWeek(currentMonth);
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      return day;
    });
  }, [currentMonth]);

  const weekRangeLabel = useMemo(() => {
    if (weekDays.length < 7) return '';
    const start = weekDays[0];
    const end = weekDays[6];
    const startOption = start.toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US', { day: 'numeric', month: 'short' });
    const endOption = end.toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${startOption} - ${endOption}`;
  }, [weekDays, language]);

  // 7. Navigation controls
  const handlePrev = () => {
    if (viewMode === 'semanal') {
      setCurrentMonth(prev => {
        const d = new Date(prev);
        d.setDate(prev.getDate() - 7);
        return d;
      });
    } else {
      setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'semanal') {
      setCurrentMonth(prev => {
        const d = new Date(prev);
        d.setDate(prev.getDate() + 7);
        return d;
      });
    } else {
      setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    }
  };

  const getEventsForDayAndTime = (day: Date | number, time: string) => {
    const [slotH] = time.split(':').map(Number);
    let targetDayNum: number;
    let targetMonth: number;
    let targetYear: number;

    if (day instanceof Date) {
      targetDayNum = day.getDate();
      targetMonth = day.getMonth();
      targetYear = day.getFullYear();
    } else {
      targetDayNum = day;
      targetMonth = currentMonth.getMonth();
      targetYear = currentMonth.getFullYear();
    }

    return filteredEvents.filter(e => {
      const d = new Date(e.date);
      if (
        d.getDate() !== targetDayNum ||
        d.getMonth() !== targetMonth ||
        d.getFullYear() !== targetYear
      ) {
        return false;
      }

      const h = d.getHours();
      if (slotH === 9) {
        return h < 12;
      } else if (slotH === 15) {
        return h >= 12 && h < 18;
      } else if (slotH === 21) {
        return h >= 18;
      }
      return false;
    });
  };

  // 8. CRUD Actions
  const handleCreatePost = async () => {
    if (!selectedDayNum) return;
    const date = new Date(year, currentMonth.getMonth(), selectedDayNum);
    const [h, m] = postForm.time.split(':').map(Number);
    date.setHours(h, m, 0, 0);

    try {
      await centralStore.createPost({
        projectId: activeProjectId || '',
        campaignId: postForm.campaignId || null,
        productId: postForm.productId || null,
        title: postForm.title,
        caption: postForm.caption,
        hashtags: postForm.hashtags,
        cta: postForm.cta || null,
        mediaUrl: postForm.mediaUrl,
        scheduled_at: date.toISOString(),
        platforms: [postForm.platform],
        status: postForm.status,
        type: postForm.type,
      });

      setShowAddModal(false);
      setPostForm({
        title: '',
        caption: '',
        hashtags: '',
        cta: '',
        mediaUrl: '',
        platform: 'Instagram',
        type: 'Post',
        campaignId: '',
        productId: '',
        status: 'agendado',
        time: '09:00'
      });
    } catch (err) {
      console.error('Failed to create post:', err);
    }
  };

  const handleDuplicatePost = async (evt: CalendarEvent) => {
    try {
      const origDate = new Date(evt.date);
      // Duplicate to next day
      origDate.setDate(origDate.getDate() + 1);

      await centralStore.createPost({
        projectId: activeProjectId || '',
        campaignId: evt.campaignId,
        productId: evt.productId,
        title: `${evt.title} (Cópia)`,
        caption: evt.caption,
        hashtags: evt.hashtags,
        cta: evt.cta,
        mediaUrl: evt.mediaUrl,
        scheduled_at: origDate.toISOString(),
        platforms: [evt.platform],
        status: evt.status === 'publicado' ? 'agendado' : evt.status,
        type: evt.type,
      });

      setDetailEvent(null);
    } catch (err) {
      console.error('Failed to duplicate post:', err);
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      await centralStore.deletePost(id);
      setDetailEvent(null);
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  const handleUpdateBrand = async () => {
    if (!activeBrand || !brandForm) return;
    try {
      await centralStore.updateBrand(activeBrand.id, {
        name: brandForm.name,
        logo: brandForm.logo,
        colors: {
          primary: brandForm.primaryColor,
          secondary: brandForm.secondaryColor,
          accent: brandForm.accentColor,
          background: brandForm.backgroundColor,
          text: brandForm.textColor,
          glow: brandForm.primaryColor,
        },
        fonts: {
          heading: brandForm.headingFont,
          body: brandForm.bodyFont,
        },
        glow: brandForm.primaryColor,
        tone: brandForm.tone,
        style: brandForm.style,
        secondaryColors: brandForm.secondaryColors,
        socialLinks: brandForm.socialLinks,
      });
      setShowBrandModal(false);
    } catch (err) {
      console.error('Failed to update brand:', err);
    }
  };

  // 9. Side panel widgets content resolver
  const dayScheduleEvents = useMemo(() => {
    if (!selectedDayNum) return [];
    return allEvents.filter(e => {
      const d = new Date(e.date);
      return d.getDate() === selectedDayNum &&
             d.getMonth() === currentMonth.getMonth() &&
             d.getFullYear() === currentMonth.getFullYear();
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [allEvents, selectedDayNum, currentMonth]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return allEvents
      .filter(e => new Date(e.date).getTime() >= now.getTime())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }, [allEvents]);

  const activeCampaignsList = useMemo(() => {
    return campaigns.filter(c => c.projectId === activeProjectId && c.status === 'active');
  }, [campaigns, activeProjectId]);

  const getCampaignProgress = (campId: string) => {
    const campPosts = allEvents.filter(e => e.campaignId === campId);
    if (campPosts.length === 0) return 0;
    const published = campPosts.filter(e => e.status === 'publicado').length;
    return Math.round((published / campPosts.length) * 100);
  };

  const projectTasks = useMemo(() => {
    return checklist.filter(t => t.projectId === activeProjectId);
  }, [checklist, activeProjectId]);

  const taskProgress = useMemo(() => {
    if (projectTasks.length === 0) return 0;
    const completed = projectTasks.filter(t => t.completed).length;
    return Math.round((completed / projectTasks.length) * 100);
  }, [projectTasks]);

  // 10. Platform helpers
  const getPlatformClass = (plat: string) => {
    switch (plat) {
      case 'Instagram': return 'instagram-theme';
      case 'TikTok': return 'tiktok-theme';
      case 'Youtube': return 'youtube-theme';
      case 'Facebook': return 'facebook-theme';
      default: return 'default-theme';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Instagram':
        return (
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
        );
      case 'Youtube':
        return (
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
            <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
          </svg>
        );
      case 'TikTok':
        return (
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
          </svg>
        );
      case 'Facebook':
        return (
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
          </svg>
        );
      default:
        return <FileText size={14} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'publicado': return 'Publicado';
      case 'falhou': return 'Falha';
      case 'agendado': return 'Agendado';
      case 'rascunho': return 'Rascunho';
      case 'editando': return 'Editando';
      default: return status;
    }
  };

  return (
    <div className="calendario-page" style={{ fontFamily: activeBrand?.fonts.body || 'Inter' }}>
      
      {/* Brand & Page Header */}
      <header className="page-header glass-premium">
        <div className="header-left">
          <div className="active-brand-banner">
            {activeBrand?.logo ? (
              <img src={activeBrand.logo} alt="Logo" className="brand-kit-logo" />
            ) : (
              <div className="brand-kit-avatar">
                {activeProject?.name.substring(0, 2).toUpperCase() || 'PL'}
              </div>
            )}
            <div>
              <h1 className="brand-font" style={{ fontFamily: activeBrand?.fonts.heading || 'Outfit' }}>
                {t('calendar.title')}
              </h1>
              <div className="brand-meta-badge">
                <Sparkles size={12} style={{ color: 'var(--primary)' }} />
                <span>{activeProject?.name}</span>
                {activeBrand?.tone && (
                  <>
                    <span className="divider-bullet">•</span>
                    <span className="tone-label">{activeBrand.tone}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation & Toolbar Controls */}
        <div className="header-right">
          <div className="brand-select-wrapper">
            <Tag size={14} style={{ color: 'var(--text-secondary)' }} />
            <select 
              value={activeProjectId || ''} 
              onChange={(e) => centralStore.setActiveProjectId(e.target.value)}
              className="brand-select-dropdown"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <button className="btn-secondary brand-kit-adjust-btn" onClick={() => setShowBrandModal(true)}>
            <Sliders size={14} />
            <span>Ajustar Marca</span>
          </button>
          
          <button className="btn-primary" onClick={() => { setSelectedDayNum(new Date().getDate()); setShowAddModal(true); }}>
            <Plus size={16} />
            <span>{t('calendar.new_post')}</span>
          </button>
        </div>
      </header>

      {/* Visão Tabs and Search/Filters Bar */}
      <section className="search-filters-bar glass-premium">
        {/* Switch View Tabs */}
        <div className="view-mode-tabs">
          <button className={viewMode === 'mensal' ? 'active' : ''} onClick={() => setViewMode('mensal')}>
            <Calendar size={15} />
            <span>Mensal</span>
          </button>
          <button className={viewMode === 'semanal' ? 'active' : ''} onClick={() => setViewMode('semanal')}>
            <Columns size={15} />
            <span>Semanal</span>
          </button>
          <button className={viewMode === 'agenda' ? 'active' : ''} onClick={() => setViewMode('agenda')}>
            <List size={15} />
            <span>Agenda</span>
          </button>
          <button className={viewMode === 'timeline' ? 'active' : ''} onClick={() => setViewMode('timeline')}>
            <Activity size={15} />
            <span>Linha do Tempo</span>
          </button>
        </div>

        {/* Dynamic Filters */}
        <div className="filters-control-group">
          {/* Calendar Picker Navigation */}
          <div className="month-picker">
            <button className="icon-btn-sm" onClick={handlePrev}>
              <ChevronLeft size={16} />
            </button>
            <span className="current-month-label">
              {viewMode === 'semanal' ? weekRangeLabel : `${monthName} ${year}`}
            </span>
            <button className="icon-btn-sm" onClick={handleNext}>
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="search-input-wrapper">
            <Search size={14} className="search-icon" />
            <input 
              type="text" 
              placeholder="Buscar posts..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="filter-search-field"
            />
          </div>

          {/* Quick Filters */}
          <div className="filter-dropdowns">
            <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)} className="filter-dropdown">
              <option value="All">Todas as Redes</option>
              <option value="Instagram">Instagram</option>
              <option value="TikTok">TikTok</option>
              <option value="Youtube">Youtube</option>
              <option value="Facebook">Facebook</option>
            </select>

            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="filter-dropdown">
              <option value="All">Todos os Status</option>
              <option value="agendado">Agendado</option>
              <option value="publicado">Publicado</option>
              <option value="falhou">Falhou</option>
              <option value="rascunho">Rascunho</option>
              <option value="editando">Editando</option>
            </select>

            <select value={filterCampaign} onChange={e => setFilterCampaign(e.target.value)} className="filter-dropdown">
              <option value="All">Todas as Campanhas</option>
              {campaigns.filter(c => c.projectId === activeProjectId).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="calendar-layout">
        
        {/* Active View Container */}
        <div className="calendar-main-pane">
          
          {/* 1. MONTH VIEW */}
          {viewMode === 'mensal' && (
            <div className="calendar-container card-glass">
              <div className="calendar-grid">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                  <div key={d} className="weekday-label">{d}</div>
                ))}
                
                {padding.map(i => <div key={`pad-${i}`} className="calendar-day empty"></div>)}
                
                {monthDays.map(day => {
                  const isSelected = selectedDayNum === day;
                  return (
                    <div key={day} className={`calendar-day ${isSelected ? 'selected-day-cell' : ''}`} onClick={() => setSelectedDayNum(day)}>
                      <div className="day-number-row">
                        <span className="day-number">{day}</span>
                        {day === new Date().getDate() && new Date().getMonth() === currentMonth.getMonth() && (
                          <span className="today-dot">Hoje</span>
                        )}
                      </div>
                      <div className="day-slots">
                        {postingTimes.map(time => {
                          const dayEvents = getEventsForDayAndTime(day, time);
                          return (
                            <div 
                              key={time} 
                              className={`time-slot ${dayEvents.length > 0 ? 'has-event' : ''}`}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.preventDefault();
                                const postId = e.dataTransfer.getData('text/plain');
                                const d = new Date(year, currentMonth.getMonth(), day);
                                const [h, m] = time.split(':').map(Number);
                                d.setHours(h, m);
                                updateScheduledPostDate(postId, d);
                              }}
                            >
                              {dayEvents.length > 0 ? (
                                <div className="events-stack">
                                  {dayEvents.map(event => (
                                    <div 
                                      key={event.id} 
                                      className={`event-tag ${getPlatformClass(event.platform)}`}
                                      onClick={(e) => { e.stopPropagation(); setDetailEvent(event); }}
                                      draggable
                                      onDragStart={(e) => { e.dataTransfer.setData('text/plain', event.id); e.stopPropagation(); }}
                                    >
                                      {getPlatformIcon(event.platform)}
                                      <span className="event-title-trim">{event.title}</span>
                                      <span className="event-time-tag">
                                        {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <button className="add-event-btn" onClick={(e) => { e.stopPropagation(); setSelectedDayNum(day); setSelectedTimeSlot(time); setShowAddModal(true); }}>
                                  <span className="slot-time-text">{time}</span>
                                  <Plus size={10} className="plus-ic" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. WEEK VIEW */}
          {viewMode === 'semanal' && (
            <div className="calendar-container card-glass">
              <div className="week-grid">
                {weekDays.map(day => {
                  const isSelected = selectedDayNum === day.getDate() && day.getMonth() === currentMonth.getMonth();
                  const isToday = day.toDateString() === new Date().toDateString();
                  return (
                    <div key={day.toISOString()} className={`week-column ${isSelected ? 'selected-column' : ''}`} onClick={() => setSelectedDayNum(day.getDate())}>
                      <div className={`week-column-header ${isToday ? 'today' : ''}`}>
                        <span className="week-day-name">
                          {day.toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US', { weekday: 'short' })}
                        </span>
                        <span className="week-day-num">{day.getDate()}</span>
                      </div>
                      
                      <div className="week-column-slots">
                        {postingTimes.map(time => {
                          const dayEvents = getEventsForDayAndTime(day, time);
                          return (
                            <div 
                              key={time} 
                              className={`week-time-slot ${dayEvents.length > 0 ? 'has-event' : ''}`}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.preventDefault();
                                const postId = e.dataTransfer.getData('text/plain');
                                const d = new Date(day);
                                const [h, m] = time.split(':').map(Number);
                                d.setHours(h, m);
                                updateScheduledPostDate(postId, d);
                              }}
                            >
                              <div className="week-slot-header">
                                <Clock size={10} />
                                <span>{time}</span>
                                <button className="week-add-inline-btn" onClick={(e) => { e.stopPropagation(); setSelectedDayNum(day.getDate()); setSelectedTimeSlot(time); setShowAddModal(true); }}>
                                  <Plus size={10} />
                                </button>
                              </div>
                              
                              {dayEvents.length > 0 ? (
                                <div className="week-events-stack">
                                  {dayEvents.map(event => (
                                    <div 
                                      key={event.id} 
                                      className={`event-card-premium ${getPlatformClass(event.platform)}`}
                                      onClick={(e) => { e.stopPropagation(); setDetailEvent(event); }}
                                      draggable
                                      onDragStart={(e) => { e.dataTransfer.setData('text/plain', event.id); e.stopPropagation(); }}
                                    >
                                      <div className="ec-header">
                                        <span className="ec-platform">
                                          {getPlatformIcon(event.platform)}
                                          <span>{event.platform}</span>
                                        </span>
                                        <span className={`ec-status-dot ${event.status}`}></span>
                                      </div>
                                      <h4 className="ec-title">{event.title}</h4>
                                      {event.caption && <p className="ec-desc">{event.caption}</p>}
                                      
                                      <div className="ec-meta-row">
                                        <span className="ec-type-badge">{event.type}</span>
                                        {event.campaignId && (
                                          <span className="ec-campaign-badge">
                                            <Briefcase size={8} />
                                            <span>{campaigns.find(c => c.id === event.campaignId)?.name.substring(0, 8)}...</span>
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="week-slot-empty">Nenhum post</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. AGENDA VIEW */}
          {viewMode === 'agenda' && (
            <div className="agenda-view-container">
              {filteredEvents.length === 0 ? (
                <div className="card-glass empty-state-container">
                  <FileText size={48} className="empty-state-icon" />
                  <h3>Nenhum post agendado</h3>
                  <p>Adicione novas publicações ou ajuste os filtros da busca.</p>
                </div>
              ) : (
                <div className="agenda-list">
                  {filteredEvents
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map(event => {
                      const eventDate = new Date(event.date);
                      return (
                        <div key={event.id} className={`agenda-item-card glass-premium ${getPlatformClass(event.platform)}`} onClick={() => setDetailEvent(event)}>
                          {event.mediaUrl && (
                            <div className="agenda-thumbnail">
                              <img src={event.mediaUrl} alt="Material Preview" />
                            </div>
                          )}
                          <div className="agenda-info-body">
                            <div className="agenda-top-meta">
                              <span className="agenda-platform-pill">
                                {getPlatformIcon(event.platform)}
                                <span>{event.platform}</span>
                              </span>
                              <span className="agenda-date-pill">
                                <Calendar size={12} />
                                <span>
                                  {eventDate.toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US', { dateStyle: 'medium' })} às {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </span>
                              <span className={`agenda-status-badge ${event.status}`}>
                                {getStatusText(event.status)}
                              </span>
                            </div>
                            
                            <h3 className="agenda-title">{event.title}</h3>
                            {event.caption && <p className="agenda-caption">{event.caption}</p>}
                            
                            <div className="agenda-attributes">
                              <div className="attr-pill" title="Formato">
                                <FileText size={12} />
                                <span>Formato: {event.type}</span>
                              </div>
                              {event.campaignId && (
                                <div className="attr-pill" title="Campanha">
                                  <Briefcase size={12} />
                                  <span>Campanha: {campaigns.find(c => c.id === event.campaignId)?.name}</span>
                                </div>
                              )}
                              {event.productId && (
                                <div className="attr-pill" title="Produto">
                                  <Tag size={12} />
                                  <span>Produto: {products.find(p => p.id === event.productId)?.name}</span>
                                </div>
                              )}
                              {event.cta && (
                                <div className="attr-pill" title="Chamada para Ação">
                                  <LinkIcon size={12} />
                                  <span>CTA: {event.cta}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* 4. TIMELINE VIEW */}
          {viewMode === 'timeline' && (
            <div className="timeline-view-container">
              {filteredEvents.length === 0 ? (
                <div className="card-glass empty-state-container">
                  <Activity size={48} className="empty-state-icon" />
                  <h3>Linha do tempo vazia</h3>
                  <p>Adicione publicações para visualizar o cronograma estratégico.</p>
                </div>
              ) : (
                <div className="timeline-trail">
                  {filteredEvents
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map((event, idx) => {
                      const eventDate = new Date(event.date);
                      return (
                        <div key={event.id} className="timeline-node" onClick={() => setDetailEvent(event)}>
                          <div className="timeline-axis">
                            <div className={`timeline-indicator-node ${event.status}`}>
                              {idx + 1}
                            </div>
                            {idx < filteredEvents.length - 1 && <div className="timeline-connect-line"></div>}
                          </div>
                          
                          <div className="timeline-content-card glass-premium">
                            <div className="t-node-header">
                              <span className="t-date-label">
                                {eventDate.toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US', { day: '2-digit', month: 'short' })} às {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className={`t-platform-tag ${getPlatformClass(event.platform)}`}>
                                {getPlatformIcon(event.platform)}
                                <span>{event.platform}</span>
                              </span>
                            </div>
                            
                            <h4 className="t-node-title">{event.title}</h4>
                            {event.caption && <p className="t-node-desc">{event.caption}</p>}
                            
                            <div className="t-node-footer">
                              <span className="t-badge">{event.type}</span>
                              {event.campaignId && (
                                <span className="t-badge brand">
                                  <Briefcase size={10} />
                                  <span>{campaigns.find(c => c.id === event.campaignId)?.name}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Sidebar Widgets Panel */}
        <aside className="calendar-sidebar-pane">
          
          {/* Widget 1: Agenda do Dia */}
          <div className="sidebar-widget card-glass">
            <div className="widget-header">
              <Calendar size={16} style={{ color: 'var(--primary)' }} />
              <h4>Agenda do Dia</h4>
              <span className="widget-badge-count">{dayScheduleEvents.length}</span>
            </div>
            <div className="widget-body">
              {dayScheduleEvents.length === 0 ? (
                <p className="widget-empty-text">Nenhum post agendado para este dia.</p>
              ) : (
                <div className="mini-events-list">
                  {dayScheduleEvents.map(e => (
                    <div key={e.id} className={`mini-event-row ${getPlatformClass(e.platform)}`} onClick={() => setDetailEvent(e)}>
                      {getPlatformIcon(e.platform)}
                      <div className="mini-event-info">
                        <span className="mini-event-title">{e.title}</span>
                        <span className="mini-event-time">
                          {new Date(e.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {e.type}
                        </span>
                      </div>
                      <span className={`status-dot-mini ${e.status}`}></span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Widget 2: Próximos Posts */}
          <div className="sidebar-widget card-glass">
            <div className="widget-header">
              <Clock size={16} style={{ color: 'var(--secondary)' }} />
              <h4>Próximos Posts</h4>
            </div>
            <div className="widget-body">
              {upcomingEvents.length === 0 ? (
                <p className="widget-empty-text">Nenhum post programado.</p>
              ) : (
                <div className="mini-events-list">
                  {upcomingEvents.map(e => {
                    const d = new Date(e.date);
                    return (
                      <div key={e.id} className={`mini-event-row ${getPlatformClass(e.platform)}`} onClick={() => setDetailEvent(e)}>
                        {getPlatformIcon(e.platform)}
                        <div className="mini-event-info">
                          <span className="mini-event-title">{e.title}</span>
                          <span className="mini-event-time">
                            {d.toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US', { day: 'numeric', month: 'short' })} às {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Widget 3: Campanhas Ativas */}
          <div className="sidebar-widget card-glass">
            <div className="widget-header">
              <Briefcase size={16} style={{ color: 'var(--glow)' }} />
              <h4>Campanhas Ativas</h4>
            </div>
            <div className="widget-body">
              {activeCampaignsList.length === 0 ? (
                <p className="widget-empty-text">Nenhuma campanha ativa cadastrada.</p>
              ) : (
                <div className="widget-campaigns-list">
                  {activeCampaignsList.map(camp => {
                    const progress = getCampaignProgress(camp.id);
                    return (
                      <div key={camp.id} className="campaign-widget-card">
                        <div className="camp-card-meta">
                          <span className="camp-card-title">{camp.name}</span>
                          <span className="camp-card-percent">{progress}%</span>
                        </div>
                        <div className="campaign-progress-track">
                          <div className="campaign-progress-bar" style={{ width: `${progress}%` }}></div>
                        </div>
                        <span className="camp-card-product">Produto: {camp.mainProduct}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Widget 4: Checklist */}
          <div className="sidebar-widget card-glass">
            <div className="widget-header">
              <ListTodo size={16} style={{ color: 'var(--primary)' }} />
              <h4>Checklist Operacional</h4>
              <span className="widget-badge-count">{projectTasks.filter(t => !t.completed).length}</span>
            </div>
            <div className="widget-body">
              <div className="checklist-progress-container">
                <div className="checklist-progress-bar" style={{ width: `${taskProgress}%` }}></div>
              </div>
              
              <div className="task-input-row" style={{ marginTop: '0.75rem' }}>
                <input 
                  type="text" 
                  className="input-field" 
                  id="calendarTaskInput" 
                  placeholder="Nova tarefa..." 
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value;
                      if (val.trim()) {
                        await centralStore.addChecklistItem(val.trim());
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
              </div>
              <div className="task-list" style={{ marginTop: '0.75rem' }}>
                {projectTasks.map(task => (
                  <div key={task.id} className={`task-row ${task.completed ? 'done' : ''}`}>
                    <button className="task-check" onClick={() => centralStore.toggleChecklistItem(task.id)}>
                      <CheckCircle2 size={16} className={task.completed ? 'checked' : ''} />
                    </button>
                    <span className="task-text">{task.text}</span>
                    <button className="task-delete" onClick={() => centralStore.deleteChecklistItem(task.id)}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </aside>
      </div>

      {/* QUICK ADD POST MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card modal-content"
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: '600px', width: '100%' }}
            >
              <div className="modal-header">
                <h2 className="brand-font" style={{ fontFamily: activeBrand?.fonts.heading || 'Outfit' }}>
                  Nova Publicação Estratégica
                </h2>
                <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                  <X size={18} />
                </button>
              </div>
              
              <div className="modal-body-scroll">
                <div className="form-group">
                  <label>Título da Publicação</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="E.g. Lançamento da Nova Linha de Produtos"
                    value={postForm.title}
                    onChange={e => setPostForm({ ...postForm, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Legenda / Copy do Post</label>
                  <textarea 
                    rows={3}
                    className="input-field" 
                    placeholder="Escreva a legenda atrativa aqui..."
                    value={postForm.caption}
                    onChange={e => setPostForm({ ...postForm, caption: e.target.value })}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Hashtags</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="#marketing #pinklogic"
                      value={postForm.hashtags}
                      onChange={e => setPostForm({ ...postForm, hashtags: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Chamada para Ação (CTA)</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="E.g. Clique no link da bio!"
                      value={postForm.cta}
                      onChange={e => setPostForm({ ...postForm, cta: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row-3">
                  <div className="form-group">
                    <label>Rede Social</label>
                    <select 
                      className="input-field"
                      value={postForm.platform}
                      onChange={e => setPostForm({ ...postForm, platform: e.target.value })}
                    >
                      <option value="Instagram">Instagram</option>
                      <option value="TikTok">TikTok</option>
                      <option value="Youtube">Youtube</option>
                      <option value="Facebook">Facebook</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Formato</label>
                    <select 
                      className="input-field"
                      value={postForm.type}
                      onChange={e => setPostForm({ ...postForm, type: e.target.value as any })}
                    >
                      <option value="Post">Post Estático</option>
                      <option value="Reels">Reels / Shorts</option>
                      <option value="Stories">Stories</option>
                      <option value="Video">Vídeo Longo</option>
                      <option value="Copy">Apenas Texto</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Horário</label>
                    <select 
                      className="input-field"
                      value={postForm.time}
                      onChange={e => setPostForm({ ...postForm, time: e.target.value })}
                    >
                      {postingTimes.map(t => <option key={t} value={t}>{t}</option>)}
                      <option value="08:00">08:00</option>
                      <option value="12:00">12:00</option>
                      <option value="18:00">18:00</option>
                      <option value="20:00">20:00</option>
                    </select>
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Campanha</label>
                    <select 
                      className="input-field"
                      value={postForm.campaignId}
                      onChange={e => setPostForm({ ...postForm, campaignId: e.target.value })}
                    >
                      <option value="">Nenhuma Campanha</option>
                      {campaigns.filter(c => c.projectId === activeProjectId).map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Produto Vinculado</label>
                    <select 
                      className="input-field"
                      value={postForm.productId}
                      onChange={e => setPostForm({ ...postForm, productId: e.target.value })}
                    >
                      <option value="">Nenhum Produto</option>
                      {products.filter(p => p.projectId === activeProjectId).map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Material de Mídia (URL da Imagem / Vídeo)</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="E.g. https://images.unsplash.com/... ou link do Canva"
                    value={postForm.mediaUrl}
                    onChange={e => setPostForm({ ...postForm, mediaUrl: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>Cancelar</button>
                <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleCreatePost}>Agendar Postagem</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POST DETAILS & EDIT MODAL (NOTION-STYLE DIALOG) */}
      <AnimatePresence>
        {detailEvent && (
          <div className="modal-overlay" onClick={() => setDetailEvent(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card modal-content notion-style-modal"
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: '850px', width: '100%', padding: 0 }}
            >
              {/* Top Control Header */}
              <div className="notion-modal-header">
                <div className="notion-modal-breadcrumbs">
                  <Folder size={14} />
                  <span>Editor Operacional</span>
                  <span>/</span>
                  <span className={`ec-status-dot ${detailEvent.status}`}></span>
                  <span>{getStatusText(detailEvent.status)}</span>
                </div>
                <div className="notion-header-actions">
                  <button className="icon-btn-sm" title="Duplicar Postagem" onClick={() => handleDuplicatePost(detailEvent)}>
                    <Copy size={16} />
                  </button>
                  <button className="icon-btn-sm btn-delete-accent" title="Excluir Postagem" onClick={() => handleDeletePost(detailEvent.id)}>
                    <Trash2 size={16} />
                  </button>
                  <button className="modal-close-btn" onClick={() => setDetailEvent(null)}>
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="notion-modal-columns">
                {/* Left Side: Title, Caption & Materials */}
                <div className="notion-modal-main">
                  <input 
                    type="text" 
                    className="notion-title-input" 
                    value={detailEvent.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setDetailEvent({ ...detailEvent, title: newTitle });
                      centralStore.updatePost(detailEvent.id, { title: newTitle });
                    }}
                    placeholder="Título da Publicação"
                  />

                  {/* Document Fields */}
                  <div className="notion-document-section">
                    <label className="section-label">Material / Mídia</label>
                    {detailEvent.mediaUrl ? (
                      <div className="material-preview-card">
                        <img src={detailEvent.mediaUrl} alt="Visual Attachment" />
                        <div className="material-link-row">
                          <LinkIcon size={12} />
                          <span className="material-url-text">{detailEvent.mediaUrl}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="material-empty-placeholder">
                        <ImageIcon size={24} />
                        <span>Nenhum material visual anexado. Insira um link para renderizar a mídia.</span>
                      </div>
                    )}
                    <input 
                      type="text"
                      className="input-field"
                      style={{ marginTop: '0.5rem' }}
                      value={detailEvent.mediaUrl}
                      onChange={(e) => {
                        const newUrl = e.target.value;
                        setDetailEvent({ ...detailEvent, mediaUrl: newUrl });
                        centralStore.updatePost(detailEvent.id, { mediaUrl: newUrl });
                      }}
                      placeholder="Coloque a URL da Imagem/Vídeo para o material..."
                    />
                  </div>

                  <div className="notion-document-section">
                    <label className="section-label">Legenda (Copywriting)</label>
                    <textarea 
                      rows={6}
                      className="input-field notion-textarea" 
                      value={detailEvent.caption}
                      onChange={(e) => {
                        const newCaption = e.target.value;
                        setDetailEvent({ ...detailEvent, caption: newCaption });
                        centralStore.updatePost(detailEvent.id, { caption: newCaption });
                      }}
                      placeholder="Digite a copy que será publicada..."
                    />
                  </div>

                  <div className="notion-document-section">
                    <label className="section-label">Hashtags Estratégicas</label>
                    <input 
                      type="text"
                      className="input-field"
                      value={detailEvent.hashtags}
                      onChange={(e) => {
                        const newHashtags = e.target.value;
                        setDetailEvent({ ...detailEvent, hashtags: newHashtags });
                        centralStore.updatePost(detailEvent.id, { hashtags: newHashtags });
                      }}
                      placeholder="#exemplo #copy"
                    />
                  </div>
                </div>

                {/* Right Side: Structural Metadata Panels */}
                <div className="notion-modal-sidebar">
                  <h4 className="sidebar-section-title">Parâmetros</h4>
                  
                  <div className="notion-meta-grid">
                    {/* Platform Selector */}
                    <div className="meta-label-col">Rede Social</div>
                    <div className="meta-value-col">
                      <select 
                        value={detailEvent.platform} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setDetailEvent({ ...detailEvent, platform: val });
                          centralStore.updatePost(detailEvent.id, { platforms: [val] });
                        }}
                        className="notion-meta-dropdown"
                      >
                        <option value="Instagram">Instagram</option>
                        <option value="TikTok">TikTok</option>
                        <option value="Youtube">Youtube</option>
                        <option value="Facebook">Facebook</option>
                      </select>
                    </div>

                    {/* Format Selector */}
                    <div className="meta-label-col">Formato</div>
                    <div className="meta-value-col">
                      <select 
                        value={detailEvent.type} 
                        onChange={(e) => {
                          const val = e.target.value as any;
                          setDetailEvent({ ...detailEvent, type: val });
                          centralStore.updatePost(detailEvent.id, { type: val });
                        }}
                        className="notion-meta-dropdown"
                      >
                        <option value="Post">Post Estático</option>
                        <option value="Reels">Reels / Shorts</option>
                        <option value="Stories">Stories</option>
                        <option value="Video">Vídeo Longo</option>
                        <option value="Copy">Apenas Texto</option>
                      </select>
                    </div>

                    {/* Status Selector */}
                    <div className="meta-label-col">Status</div>
                    <div className="meta-value-col">
                      <select 
                        value={detailEvent.status} 
                        onChange={(e) => {
                          const val = e.target.value as any;
                          setDetailEvent({ ...detailEvent, status: val });
                          centralStore.updatePost(detailEvent.id, { status: val });
                        }}
                        className="notion-meta-dropdown"
                      >
                        <option value="agendado">Agendado</option>
                        <option value="publicado">Publicado</option>
                        <option value="falhou">Falhou</option>
                        <option value="rascunho">Rascunho</option>
                        <option value="editando">Editando</option>
                      </select>
                    </div>

                    {/* Campaign Selector */}
                    <div className="meta-label-col">Campanha</div>
                    <div className="meta-value-col">
                      <select 
                        value={detailEvent.campaignId || ''} 
                        onChange={(e) => {
                          const val = e.target.value || null;
                          setDetailEvent({ ...detailEvent, campaignId: val });
                          centralStore.updatePost(detailEvent.id, { campaignId: val });
                        }}
                        className="notion-meta-dropdown"
                      >
                        <option value="">Nenhuma</option>
                        {campaigns.filter(c => c.projectId === activeProjectId).map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Product Selector */}
                    <div className="meta-label-col">Produto</div>
                    <div className="meta-value-col">
                      <select 
                        value={detailEvent.productId || ''} 
                        onChange={(e) => {
                          const val = e.target.value || null;
                          setDetailEvent({ ...detailEvent, productId: val });
                          centralStore.updatePost(detailEvent.id, { productId: val });
                        }}
                        className="notion-meta-dropdown"
                      >
                        <option value="">Nenhum</option>
                        {products.filter(p => p.projectId === activeProjectId).map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* CTA Input */}
                    <div className="meta-label-col">CTA</div>
                    <div className="meta-value-col">
                      <input 
                        type="text" 
                        value={detailEvent.cta || ''} 
                        onChange={(e) => {
                          const val = e.target.value || null;
                          setDetailEvent({ ...detailEvent, cta: val });
                          centralStore.updatePost(detailEvent.id, { cta: val });
                        }}
                        className="notion-meta-input-field"
                        placeholder="Sem chamada"
                      />
                    </div>

                    {/* Date / Time */}
                    <div className="meta-label-col">Data</div>
                    <div className="meta-value-col">
                      <input 
                        type="datetime-local" 
                        value={new Date(detailEvent.date).toISOString().slice(0, 16)} 
                        onChange={(e) => {
                          const nextD = new Date(e.target.value);
                          setDetailEvent({ ...detailEvent, date: nextD.toISOString() });
                          centralStore.updatePost(detailEvent.id, { scheduled_at: nextD.toISOString() });
                        }}
                        className="notion-meta-input-field"
                      />
                    </div>
                  </div>

                  {/* Objective Summary Section */}
                  <div className="notion-sidebar-summary-card">
                    <h5 className="summary-title-row">
                      <Target size={12} />
                      <span>Objetivo Estratégico</span>
                    </h5>
                    <p className="summary-body-text">
                      {detailEvent.campaignId 
                        ? campaigns.find(c => c.id === detailEvent.campaignId)?.goal || 'Alcançar e engajar a audiência do projeto.'
                        : 'Essa publicação avulsa visa aumentar a visibilidade e autoridade da marca.'}
                    </p>
                  </div>

                  {/* Brand Display kit */}
                  <div className="notion-sidebar-summary-card" style={{ marginTop: '0.75rem', background: 'rgba(255,255,255,0.01)' }}>
                    <h5 className="summary-title-row">
                      <Sparkles size={12} />
                      <span>Identidade Visual Ativa</span>
                    </h5>
                    <p className="summary-body-text" style={{ fontSize: '0.75rem' }}>
                      Marca: <strong>{activeBrand?.name}</strong><br />
                      Tipografia: {activeBrand?.fonts.heading} / {activeBrand?.fonts.body}
                    </p>
                    <div style={{ display: 'flex', gap: '3px', marginTop: '6px' }}>
                      {activeBrand && Object.values(activeBrand.colors).slice(0, 5).map(c => (
                        <div key={c} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }}></div>
                      ))}
                    </div>
                  </div>

                  {/* Trigger Direct Publish */}
                  {detailEvent.status !== 'publicado' && (
                    <button 
                      className="btn-primary w-full" 
                      style={{ marginTop: '1.5rem', background: 'var(--gradient)', justifyContent: 'center' }}
                      onClick={async () => {
                        try {
                          await publishPostNow(detailEvent.id);
                          setDetailEvent(null);
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                    >
                      Publicar Agora
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADJUST BRAND MODAL */}
      <AnimatePresence>
        {showBrandModal && brandForm && (
          <div className="modal-overlay" onClick={() => setShowBrandModal(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card modal-content"
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: '650px', width: '100%' }}
            >
              <div className="modal-header">
                <h2 className="brand-font" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={20} style={{ color: 'var(--primary)' }} />
                  <span>Ajustar Identidade Visual da Marca</span>
                </h2>
                <button className="modal-close-btn" onClick={() => setShowBrandModal(false)}>
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body-scroll">
                <div className="form-group">
                  <label>Nome da Identidade / Marca</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={brandForm.name}
                    onChange={e => setBrandForm({ ...brandForm, name: e.target.value })}
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>URL do Logo</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={brandForm.logo}
                      onChange={e => setBrandForm({ ...brandForm, logo: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="form-group">
                    <label>Tom da Comunicação (Tone)</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={brandForm.tone}
                      onChange={e => setBrandForm({ ...brandForm, tone: e.target.value })}
                      placeholder="E.g. Descontraído, Sério"
                    />
                  </div>
                </div>

                {/* Color Palette customization */}
                <h4 style={{ fontSize: '0.85rem', color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '1.25rem 0 0.5rem' }}>
                  Paleta de Cores do Brand Kit
                </h4>
                <div className="brand-color-custom-row">
                  <div className="brand-color-input-col">
                    <span className="b-color-label">Principal</span>
                    <input 
                      type="color" 
                      value={brandForm.primaryColor}
                      onChange={e => setBrandForm({ ...brandForm, primaryColor: e.target.value })}
                      className="b-color-input-picker"
                    />
                  </div>
                  <div className="brand-color-input-col">
                    <span className="b-color-label">Secundário</span>
                    <input 
                      type="color" 
                      value={brandForm.secondaryColor}
                      onChange={e => setBrandForm({ ...brandForm, secondaryColor: e.target.value })}
                      className="b-color-input-picker"
                    />
                  </div>
                  <div className="brand-color-input-col">
                    <span className="b-color-label">Acento</span>
                    <input 
                      type="color" 
                      value={brandForm.accentColor}
                      onChange={e => setBrandForm({ ...brandForm, accentColor: e.target.value })}
                      className="b-color-input-picker"
                    />
                  </div>
                  <div className="brand-color-input-col">
                    <span className="b-color-label">Fundo</span>
                    <input 
                      type="color" 
                      value={brandForm.backgroundColor}
                      onChange={e => setBrandForm({ ...brandForm, backgroundColor: e.target.value })}
                      className="b-color-input-picker"
                    />
                  </div>
                  <div className="brand-color-input-col">
                    <span className="b-color-label">Texto</span>
                    <input 
                      type="color" 
                      value={brandForm.textColor}
                      onChange={e => setBrandForm({ ...brandForm, textColor: e.target.value })}
                      className="b-color-input-picker"
                    />
                  </div>
                </div>

                {/* Fonts */}
                <h4 style={{ fontSize: '0.85rem', color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '1.25rem 0 0.5rem' }}>
                  Tipografia
                </h4>
                <div className="form-row-2">
                  <div className="form-group">
                    <label>Fonte de Título (Heading Font)</label>
                    <select 
                      value={brandForm.headingFont}
                      onChange={e => setBrandForm({ ...brandForm, headingFont: e.target.value })}
                      className="input-field"
                    >
                      <option value="Outfit">Outfit</option>
                      <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Fonte de Texto (Body Font)</label>
                    <select 
                      value={brandForm.bodyFont}
                      onChange={e => setBrandForm({ ...brandForm, bodyFont: e.target.value })}
                      className="input-field"
                    >
                      <option value="Inter">Inter</option>
                      <option value="Outfit">Outfit</option>
                      <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                      <option value="Roboto">Roboto</option>
                    </select>
                  </div>
                </div>

                {/* Secondary Colors */}
                <h4 style={{ fontSize: '0.85rem', color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '1.25rem 0 0.5rem' }}>
                  Cores Secundárias da Marca
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '1.25rem' }}>
                  {brandForm.secondaryColors.map((color, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <input 
                        type="color" 
                        value={color} 
                        onChange={e => {
                          const updated = [...brandForm.secondaryColors];
                          updated[idx] = e.target.value;
                          setBrandForm({ ...brandForm, secondaryColors: updated });
                        }}
                        style={{ width: '28px', height: '28px', border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'none', padding: 0 }}
                      />
                      <span style={{ fontSize: '0.8rem', color: '#A1A1B5', fontFamily: 'monospace' }}>{color.toUpperCase()}</span>
                      <button 
                        type="button" 
                        onClick={() => {
                          const updated = brandForm.secondaryColors.filter((_, i) => i !== idx);
                          setBrandForm({ ...brandForm, secondaryColors: updated });
                        }}
                        style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button 
                    type="button"
                    onClick={() => {
                      setBrandForm({ ...brandForm, secondaryColors: [...brandForm.secondaryColors, '#7B4DFF'] });
                    }}
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem', height: '32px', borderRadius: '8px' }}
                  >
                    + Adicionar Cor
                  </button>
                </div>

                {/* Social Links */}
                <h4 style={{ fontSize: '0.85rem', color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '1.25rem 0 0.5rem' }}>
                  Links de Redes Sociais
                </h4>
                <div className="form-row-2">
                  <div className="form-group">
                    <label>Instagram URL</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={brandForm.socialLinks.instagram || ''} 
                      onChange={e => setBrandForm({ 
                        ...brandForm, 
                        socialLinks: { ...brandForm.socialLinks, instagram: e.target.value } 
                      })}
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                  <div className="form-group">
                    <label>TikTok URL</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={brandForm.socialLinks.tiktok || ''} 
                      onChange={e => setBrandForm({ 
                        ...brandForm, 
                        socialLinks: { ...brandForm.socialLinks, tiktok: e.target.value } 
                      })}
                      placeholder="https://tiktok.com/@..."
                    />
                  </div>
                </div>
                <div className="form-row-2" style={{ marginTop: '10px' }}>
                  <div className="form-group">
                    <label>YouTube URL</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={brandForm.socialLinks.youtube || ''} 
                      onChange={e => setBrandForm({ 
                        ...brandForm, 
                        socialLinks: { ...brandForm.socialLinks, youtube: e.target.value } 
                      })}
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                  <div className="form-group">
                    <label>Facebook URL</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={brandForm.socialLinks.facebook || ''} 
                      onChange={e => setBrandForm({ 
                        ...brandForm, 
                        socialLinks: { ...brandForm.socialLinks, facebook: e.target.value } 
                      })}
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowBrandModal(false)}>Cancelar</button>
                <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleUpdateBrand}>Salvar Identidade</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LOCAL STYLES FOR PREMIUM CALENDAR COMPONENT */}
      <style>{`
        .calendario-page {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
          color: var(--text-primary);
        }

        /* 1. Header Styles */
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 1.5rem;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.4);
          background: rgba(17, 17, 24, 0.7);
        }

        .active-brand-banner {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .brand-kit-logo {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
          object-fit: cover;
          border: 1px solid var(--border);
        }

        .brand-kit-avatar {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.95rem;
          color: white;
          background: var(--gradient);
          box-shadow: 0 0 15px rgba(255, 47, 191, 0.2);
        }

        .brand-meta-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-top: 2px;
        }

        .divider-bullet {
          color: rgba(255, 255, 255, 0.15);
        }

        .tone-label {
          background: rgba(255, 255, 255, 0.04);
          padding: 1px 6px;
          border-radius: 4px;
          font-size: 0.7rem;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .brand-select-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0.4rem 0.85rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          border-radius: var(--radius-pill);
        }

        .brand-select-dropdown {
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: 0.8rem;
          font-weight: 600;
          outline: none;
          cursor: pointer;
        }

        .brand-kit-adjust-btn {
          border-radius: var(--radius-pill);
          font-size: 0.8rem;
        }

        /* 2. Filters & Switch Tabs Section */
        .search-filters-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.85rem 1.25rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          background: rgba(17, 17, 24, 0.4);
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .view-mode-tabs {
          display: flex;
          gap: 4px;
          background: rgba(0, 0, 0, 0.25);
          padding: 4px;
          border-radius: var(--radius-pill);
          border: 1px solid var(--border);
        }

        .view-mode-tabs button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0.4rem 0.95rem;
          border-radius: var(--radius-pill);
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
          background: transparent;
          border: none;
          cursor: pointer;
          transition: var(--transition);
        }

        .view-mode-tabs button:hover {
          color: white;
          background: rgba(255, 255, 255, 0.02);
        }

        .view-mode-tabs button.active {
          color: white;
          background: var(--gradient);
          box-shadow: 0 2px 10px rgba(255, 47, 191, 0.15);
        }

        .filters-control-group {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          flex-grow: 1;
          justify-content: flex-end;
          flex-wrap: wrap;
        }

        .month-picker {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--border);
          padding: 3px 6px;
          border-radius: var(--radius-pill);
        }

        .icon-btn-sm {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          transition: var(--transition);
        }

        .icon-btn-sm:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }

        .current-month-label {
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: capitalize;
          min-width: 130px;
          text-align: center;
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 10px;
          color: var(--text-muted);
        }

        .filter-search-field {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--border);
          border-radius: var(--radius-pill);
          padding: 0.35rem 0.85rem 0.35rem 2.25rem;
          font-size: 0.75rem;
          color: white;
          outline: none;
          min-width: 160px;
          transition: var(--transition);
        }

        .filter-search-field:focus {
          border-color: var(--primary);
          box-shadow: 0 0 10px rgba(255, 47, 191, 0.15);
        }

        .filter-dropdowns {
          display: flex;
          gap: 6px;
        }

        .filter-dropdown {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--border);
          border-radius: var(--radius-pill);
          color: var(--text-secondary);
          font-size: 0.75rem;
          padding: 0.35rem 0.85rem;
          outline: none;
          cursor: pointer;
        }

        .filter-dropdown:focus {
          border-color: var(--primary);
        }

        /* 3. Grid Structure & Layouts */
        .calendar-layout {
          display: grid;
          grid-template-columns: 1fr 310px;
          gap: var(--space-md);
          align-items: start;
        }

        .calendar-main-pane {
          display: flex;
          flex-direction: column;
        }

        .calendar-container {
          overflow: hidden;
          box-shadow: var(--shadow-md);
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
        }

        .weekday-label {
          padding: 0.75rem 0;
          text-align: center;
          font-weight: 700;
          font-size: 0.7rem;
          color: var(--text-secondary);
          border-bottom: 1px solid var(--border);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background: rgba(0, 0, 0, 0.15);
        }

        .calendar-day {
          min-height: 150px;
          border-right: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: var(--space-xs);
          display: flex;
          flex-direction: column;
          gap: 6px;
          background: rgba(255, 255, 255, 0.003);
          transition: var(--transition);
          cursor: pointer;
        }

        .calendar-day:nth-child(7n) {
          border-right: none;
        }

        .calendar-day:hover {
          background: rgba(255, 255, 255, 0.012);
        }

        .calendar-day.empty {
          background: rgba(0, 0, 0, 0.15);
          opacity: 0.3;
          cursor: default;
        }

        .selected-day-cell {
          background: rgba(255, 47, 191, 0.015) !important;
          border-color: rgba(255, 47, 191, 0.2) !important;
        }

        .day-number-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2px;
          padding: 2px;
        }

        .day-number {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .today-dot {
          background: var(--primary);
          color: white;
          font-size: 0.6rem;
          padding: 1px 5px;
          border-radius: 4px;
          font-weight: 700;
          box-shadow: 0 0 8px var(--primary);
        }

        .day-slots {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }

        .time-slot {
          border-radius: 4px;
          min-height: 32px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          padding: 1px;
        }

        .slot-time-text {
          font-size: 0.6rem;
          font-weight: 700;
          color: var(--text-muted);
          position: absolute;
          left: 4px;
          opacity: 0.5;
        }

        .add-event-btn {
          opacity: 0;
          align-self: flex-end;
          width: 16px;
          height: 16px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          cursor: pointer;
          transition: var(--transition);
        }

        .time-slot:hover .add-event-btn {
          opacity: 1;
        }

        .add-event-btn:hover {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }

        .events-stack {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .event-tag {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 6px;
          border-radius: 4px;
          font-size: 0.65rem;
          font-weight: 600;
          text-align: left;
          transition: var(--transition);
          box-sizing: border-box;
          text-shadow: 0 1px 2px rgba(0,0,0,0.6);
        }

        .event-tag:hover {
          transform: translateY(-1px);
        }

        .event-title-trim {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #f5f5f5;
        }

        .event-time-tag {
          font-size: 0.55rem;
          opacity: 0.7;
          font-weight: 500;
          flex-shrink: 0;
        }

        /* Platform specific styling codes */
        .instagram-theme {
          background: rgba(225, 48, 108, 0.08) !important;
          border-left: 2.5px solid #E1306C !important;
          color: #E1306C !important;
          border-top: 1px solid rgba(225, 48, 108, 0.05);
          border-bottom: 1px solid rgba(225, 48, 108, 0.05);
          border-right: 1px solid rgba(225, 48, 108, 0.05);
        }
        .instagram-theme:hover {
          box-shadow: 0 0 12px rgba(225, 48, 108, 0.25);
          border-color: rgba(225, 48, 108, 0.3) !important;
        }

        .tiktok-theme {
          background: rgba(1, 241, 232, 0.08) !important;
          border-left: 2.5px solid #01F1E8 !important;
          color: #01F1E8 !important;
          border-top: 1px solid rgba(1, 241, 232, 0.05);
          border-bottom: 1px solid rgba(1, 241, 232, 0.05);
          border-right: 1px solid rgba(1, 241, 232, 0.05);
        }
        .tiktok-theme:hover {
          box-shadow: 0 0 12px rgba(1, 241, 232, 0.25);
          border-color: rgba(1, 241, 232, 0.3) !important;
        }

        .youtube-theme {
          background: rgba(255, 0, 0, 0.08) !important;
          border-left: 2.5px solid #FF0000 !important;
          color: #FF0000 !important;
          border-top: 1px solid rgba(255, 0, 0, 0.05);
          border-bottom: 1px solid rgba(255, 0, 0, 0.05);
          border-right: 1px solid rgba(255, 0, 0, 0.05);
        }
        .youtube-theme:hover {
          box-shadow: 0 0 12px rgba(255, 0, 0, 0.25);
          border-color: rgba(255, 0, 0, 0.3) !important;
        }

        .facebook-theme {
          background: rgba(24, 119, 242, 0.08) !important;
          border-left: 2.5px solid #1877F2 !important;
          color: #1877F2 !important;
          border-top: 1px solid rgba(24, 119, 242, 0.05);
          border-bottom: 1px solid rgba(24, 119, 242, 0.05);
          border-right: 1px solid rgba(24, 119, 242, 0.05);
        }
        .facebook-theme:hover {
          box-shadow: 0 0 12px rgba(24, 119, 242, 0.25);
          border-color: rgba(24, 119, 242, 0.3) !important;
        }

        .default-theme {
          background: rgba(255, 47, 191, 0.08) !important;
          border-left: 2.5px solid var(--primary) !important;
          color: var(--primary) !important;
        }
        .default-theme:hover {
          box-shadow: 0 0 12px rgba(255, 47, 191, 0.25);
        }

        /* 4. Week Grid Styles */
        .week-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          background: rgba(255, 255, 255, 0.005);
        }

        .week-column {
          border-right: 1px solid var(--border);
          min-height: 600px;
          display: flex;
          flex-direction: column;
          cursor: pointer;
        }

        .week-column:nth-child(7n) {
          border-right: none;
        }

        .selected-column {
          background: rgba(255, 47, 191, 0.008) !important;
        }

        .week-column-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1rem 0.5rem;
          border-bottom: 1px solid var(--border);
          background: rgba(0, 0, 0, 0.2);
        }

        .week-column-header.today {
          background: rgba(255, 47, 191, 0.05);
          border-bottom: 2px solid var(--primary);
        }

        .week-day-name {
          font-size: 0.65rem;
          text-transform: uppercase;
          color: var(--text-secondary);
          font-weight: 700;
        }

        .week-day-num {
          font-size: 1.25rem;
          font-weight: 800;
          color: white;
          margin-top: 4px;
        }

        .week-column-header.today .week-day-num {
          color: var(--primary);
          text-shadow: 0 0 8px var(--primary);
        }

        .week-column-slots {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: var(--space-sm);
          flex: 1;
        }

        .week-time-slot {
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          min-height: 120px;
          padding: var(--space-xs);
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
          transition: var(--transition);
        }

        .week-time-slot:hover {
          background: rgba(255, 255, 255, 0.02);
          border-color: var(--border-hover);
        }

        .week-slot-header {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.65rem;
          color: var(--text-muted);
          font-weight: 700;
          padding-bottom: 4px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        }

        .week-add-inline-btn {
          margin-left: auto;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 14px;
          height: 14px;
          border-radius: 3px;
        }

        .week-add-inline-btn:hover {
          background: rgba(255,255,255,0.05);
          color: white;
        }

        .week-slot-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
          font-size: 0.65rem;
          color: var(--text-muted);
          opacity: 0.4;
          font-style: italic;
        }

        .week-events-stack {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        /* 5. Premium Card visual details */
        .event-card-premium {
          padding: 8px;
          border-radius: var(--radius-sm);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
          transition: var(--transition);
          text-align: left;
        }

        .event-card-premium:hover {
          transform: translateY(-2px);
        }

        .ec-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .ec-platform {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.6rem;
          font-weight: 700;
        }

        .ec-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          box-shadow: 0 0 6px currentColor;
        }

        .ec-status-dot.publicado { background-color: #10b981; color: #10b981; }
        .ec-status-dot.falhou { background-color: #ef4444; color: #ef4444; }
        .ec-status-dot.agendado { background-color: #7b4dff; color: #7b4dff; animation: pulse-glow 2s infinite; }
        .ec-status-dot.rascunho { background-color: #a1a1b5; color: #a1a1b5; }
        .ec-status-dot.editando { background-color: #ff9f43; color: #ff9f43; }

        .ec-title {
          font-size: 0.75rem;
          font-weight: 700;
          color: white;
          line-height: 1.25;
          margin: 4px 0 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ec-desc {
          font-size: 0.65rem;
          color: var(--text-secondary);
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: 6px;
        }

        .ec-meta-row {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }

        .ec-type-badge, .ec-campaign-badge {
          font-size: 0.55rem;
          padding: 1px 4px;
          border-radius: 3px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 2px;
        }

        /* 6. Agenda View List */
        .agenda-view-container {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .agenda-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .agenda-item-card {
          display: flex;
          gap: 1.25rem;
          padding: 1.25rem;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          transition: var(--transition);
          cursor: pointer;
        }

        .agenda-item-card:hover {
          transform: translateY(-2px);
        }

        .agenda-thumbnail {
          width: 90px;
          height: 90px;
          border-radius: var(--radius-md);
          overflow: hidden;
          border: 1px solid var(--border);
          flex-shrink: 0;
        }

        .agenda-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .agenda-info-body {
          display: flex;
          flex-direction: column;
          gap: 6px;
          text-align: left;
          flex: 1;
        }

        .agenda-top-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .agenda-platform-pill {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.7rem;
          font-weight: 700;
        }

        .agenda-date-pill {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.7rem;
          color: var(--text-secondary);
        }

        .agenda-status-badge {
          font-size: 0.65rem;
          padding: 2px 8px;
          border-radius: var(--radius-pill);
          font-weight: 700;
          text-transform: uppercase;
          border: 1px solid currentColor;
          background: rgba(255, 255, 255, 0.02);
        }

        .agenda-status-badge.publicado { color: #10b981; }
        .agenda-status-badge.falhou { color: #ef4444; }
        .agenda-status-badge.agendado { color: #7b4dff; }
        .agenda-status-badge.rascunho { color: #a1a1b5; }
        .agenda-status-badge.editando { color: #ff9f43; }

        .agenda-title {
          font-size: 1rem;
          font-weight: 800;
          color: white;
          margin: 0;
        }

        .agenda-caption {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.4;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .agenda-attributes {
          display: flex;
          gap: var(--space-sm);
          flex-wrap: wrap;
          margin-top: 4px;
        }

        .attr-pill {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.7rem;
          padding: 2px 8px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          color: var(--text-secondary);
        }

        /* 7. Timeline trail view */
        .timeline-view-container {
          padding: 1rem;
        }

        .timeline-trail {
          display: flex;
          flex-direction: column;
          position: relative;
          text-align: left;
        }

        .timeline-node {
          display: flex;
          gap: 1.5rem;
          cursor: pointer;
        }

        .timeline-axis {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }

        .timeline-indicator-node {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 800;
          z-index: 2;
          color: white;
          background: #1e1e2f;
          border: 2px solid var(--border);
        }

        .timeline-indicator-node.publicado {
          border-color: #10b981;
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
        }

        .timeline-indicator-node.falhou {
          border-color: #ef4444;
          box-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
        }

        .timeline-indicator-node.agendado {
          border-color: #7b4dff;
          box-shadow: 0 0 10px rgba(123, 77, 255, 0.3);
        }

        .timeline-connect-line {
          width: 2px;
          background: var(--border);
          flex: 1;
          margin: 4px 0;
        }

        .timeline-content-card {
          flex: 1;
          padding: 1.25rem;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          margin-bottom: 1.5rem;
          transition: var(--transition);
        }

        .timeline-node:hover .timeline-content-card {
          transform: translateX(4px);
          border-color: var(--border-hover);
        }

        .t-node-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .t-date-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .t-platform-tag {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.65rem;
          font-weight: 700;
        }

        .t-node-title {
          font-size: 0.95rem;
          font-weight: 800;
          color: white;
          margin: 4px 0 2px;
        }

        .t-node-desc {
          font-size: 0.75rem;
          color: var(--text-secondary);
          line-height: 1.4;
          margin-bottom: 8px;
        }

        .t-node-footer {
          display: flex;
          gap: 4px;
        }

        .t-badge {
          font-size: 0.6rem;
          padding: 1px 6px;
          border-radius: 4px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border);
          color: var(--text-secondary);
        }

        .t-badge.brand {
          display: flex;
          align-items: center;
          gap: 3px;
        }

        /* 8. Empty States */
        .empty-state-container {
          padding: 3rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .empty-state-icon {
          color: var(--text-muted);
          opacity: 0.4;
          margin-bottom: 1rem;
        }

        .empty-state-container h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: white;
          margin-bottom: 4px;
        }

        .empty-state-container p {
          font-size: 0.8rem;
          color: var(--text-secondary);
          max-width: 300px;
        }

        /* 9. Sidebar panel widgets */
        .calendar-sidebar-pane {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .sidebar-widget {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          text-align: left;
        }

        .widget-header {
          display: flex;
          align-items: center;
          gap: 6px;
          border-bottom: 1px solid var(--border);
          padding-bottom: 6px;
        }

        .widget-header h4 {
          font-size: 0.8rem;
          font-weight: 700;
          color: white;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .widget-badge-count {
          margin-left: auto;
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-secondary);
          font-size: 0.65rem;
          padding: 1px 6px;
          border-radius: 4px;
          font-weight: 700;
        }

        .widget-empty-text {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-style: italic;
          margin: 0.5rem 0;
        }

        .mini-events-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .mini-event-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 8px;
          background: rgba(0, 0, 0, 0.15);
          border: 1px solid var(--border);
          border-radius: 6px;
          transition: var(--transition);
          cursor: pointer;
        }

        .mini-event-row:hover {
          background: rgba(255, 255, 255, 0.02);
          transform: translateX(2px);
        }

        .mini-event-info {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 0;
        }

        .mini-event-title {
          font-size: 0.7rem;
          font-weight: 700;
          color: white;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .mini-event-time {
          font-size: 0.6rem;
          color: var(--text-secondary);
        }

        .status-dot-mini {
          width: 5px;
          height: 5px;
          border-radius: 50%;
        }
        .status-dot-mini.publicado { background: #10b981; }
        .status-dot-mini.falhou { background: #ef4444; }
        .status-dot-mini.agendado { background: #7b4dff; }
        .status-dot-mini.rascunho { background: #a1a1b5; }
        .status-dot-mini.editando { background: #ff9f43; }

        .widget-campaigns-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .campaign-widget-card {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .camp-card-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.7rem;
        }

        .camp-card-title {
          font-weight: 700;
          color: white;
        }

        .camp-card-percent {
          font-weight: 700;
          color: var(--primary);
        }

        .campaign-progress-track {
          height: 4px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 2px;
          overflow: hidden;
        }

        .campaign-progress-bar {
          height: 100%;
          background: var(--gradient);
          border-radius: 2px;
        }

        .camp-card-product {
          font-size: 0.6rem;
          color: var(--text-muted);
        }

        /* 10. Checklist progress widget style */
        .checklist-progress-container {
          height: 3px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 2px;
          overflow: hidden;
        }

        .checklist-progress-bar {
          height: 100%;
          background: var(--gradient);
        }

        .task-input-row .input-field {
          padding: 0.35rem 0.75rem;
          font-size: 0.75rem;
        }

        .task-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
          max-height: 250px;
          overflow-y: auto;
        }

        .task-row {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          padding: var(--space-xs);
          background: rgba(0, 0, 0, 0.1);
          border: 1px solid var(--border);
          border-radius: 4px;
        }

        .task-row.done .task-text {
          text-decoration: line-through;
          opacity: 0.5;
        }

        .task-check {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .task-check .checked {
          color: #10b981;
          text-shadow: 0 0 6px #10b981;
        }

        .task-text {
          font-size: 0.7rem;
          color: var(--text-primary);
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .task-delete {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          opacity: 0;
          transition: var(--transition);
          display: flex;
          align-items: center;
        }

        .task-row:hover .task-delete {
          opacity: 1;
        }

        .task-delete:hover {
          color: #ef4444;
        }

        /* 11. Modal Detail Columns (Notion style) */
        .notion-style-modal {
          background: #0f0f15;
          border: 1px solid var(--border);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8);
        }

        .notion-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1.25rem;
          border-bottom: 1px solid var(--border);
          background: rgba(0,0,0,0.25);
        }

        .notion-modal-breadcrumbs {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .notion-header-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .notion-header-actions button.btn-delete-accent:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.05);
        }

        .notion-modal-columns {
          display: grid;
          grid-template-columns: 1fr 270px;
        }

        .notion-modal-main {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          border-right: 1px solid var(--border);
          overflow-y: auto;
          max-height: 520px;
        }

        .notion-title-input {
          font-size: 1.5rem;
          font-weight: 800;
          color: white;
          background: transparent;
          border: none;
          outline: none;
          padding-bottom: 6px;
          border-bottom: 1px solid rgba(255,255,255,0.03);
        }

        .notion-title-input:focus {
          border-bottom-color: var(--primary);
        }

        .notion-document-section {
          display: flex;
          flex-direction: column;
          gap: 6px;
          text-align: left;
        }

        .section-label {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .notion-textarea {
          font-family: inherit;
          resize: vertical;
          font-size: 0.85rem;
          line-height: 1.5;
        }

        .material-preview-card {
          background: rgba(0,0,0,0.25);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .material-preview-card img {
          max-height: 180px;
          width: 100%;
          object-fit: cover;
        }

        .material-link-row {
          padding: 6px 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(0,0,0,0.15);
          border-top: 1px solid var(--border);
          font-size: 0.7rem;
          color: var(--text-secondary);
        }

        .material-url-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .material-empty-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.005);
          border: 1px dashed var(--border);
          border-radius: var(--radius-md);
          color: var(--text-muted);
          font-size: 0.75rem;
          text-align: center;
        }

        .notion-modal-sidebar {
          padding: 1.5rem;
          background: rgba(0,0,0,0.08);
          display: flex;
          flex-direction: column;
          gap: 1rem;
          overflow-y: auto;
          max-height: 520px;
          text-align: left;
        }

        .sidebar-section-title {
          font-size: 0.75rem;
          font-weight: 700;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin: 0 0 0.25rem;
          border-bottom: 1px solid var(--border);
          padding-bottom: 4px;
        }

        .notion-meta-grid {
          display: grid;
          grid-template-columns: 80px 1fr;
          row-gap: 12px;
          column-gap: 8px;
          align-items: center;
        }

        .meta-label-col {
          font-size: 0.7rem;
          color: var(--text-secondary);
          font-weight: 600;
        }

        .meta-value-col {
          display: flex;
          align-items: center;
        }

        .notion-meta-dropdown {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          border-radius: 4px;
          color: white;
          font-size: 0.75rem;
          padding: 2px 6px;
          outline: none;
          cursor: pointer;
          width: 100%;
        }

        .notion-meta-dropdown:focus {
          border-color: var(--primary);
        }

        .notion-meta-input-field {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          border-radius: 4px;
          color: white;
          font-size: 0.75rem;
          padding: 2px 6px;
          outline: none;
          width: 100%;
        }

        .notion-meta-input-field:focus {
          border-color: var(--primary);
        }

        .notion-sidebar-summary-card {
          background: rgba(255, 47, 191, 0.02);
          border: 1px solid rgba(255, 47, 191, 0.08);
          border-radius: var(--radius-md);
          padding: 8px 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .summary-title-row {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.65rem;
          font-weight: 700;
          color: white;
          margin: 0;
          text-transform: uppercase;
        }

        .summary-body-text {
          font-size: 0.7rem;
          color: var(--text-secondary);
          line-height: 1.35;
          margin: 0;
        }

        /* Adjust brand kit customization visual block */
        .brand-color-custom-row {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
          margin-top: 6px;
        }

        .brand-color-input-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .b-color-label {
          font-size: 0.6rem;
          color: var(--text-secondary);
          font-weight: 700;
          text-transform: uppercase;
        }

        .b-color-input-picker {
          width: 100%;
          height: 32px;
          border-radius: 6px;
          border: 1px solid var(--border);
          background: transparent;
          cursor: pointer;
          padding: 0;
        }

        @keyframes pulse-glow {
          0% { box-shadow: 0 0 4px var(--primary); opacity: 0.8; }
          50% { box-shadow: 0 0 10px var(--primary); opacity: 1; }
          100% { box-shadow: 0 0 4px var(--primary); opacity: 0.8; }
        }
      `}</style>

    </div>
  );
};

export default Calendario;
