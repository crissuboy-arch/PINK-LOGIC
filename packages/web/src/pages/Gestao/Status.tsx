import { useState, useMemo } from 'react';
import { 
  Image as ImageIcon, 
  Video, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ExternalLink,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';

import { useCentralStore } from '../../store/CentralStore';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Post } from '../../store/types';

const Status = () => {
  const { posts: centralPosts, activeProjectId } = useCentralStore();
  const { t, language } = useLanguage();

  // local states for table features
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  
  const [sortField, setSortField] = useState<string>('scheduled_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Filter posts by active project
  const posts = useMemo(() => {
    return centralPosts.filter(p => p.projectId === activeProjectId);
  }, [centralPosts, activeProjectId]);

  const getStatusIcon = (status: Post['status']) => {
    switch (status) {
      case 'publicado': return <CheckCircle2 size={16} className="text-success" />;
      case 'agendado': return <Clock size={16} style={{ color: '#ff2d8d' }} />;
      case 'falhou': return <AlertCircle size={16} className="text-danger" />;
      case 'rascunho': return <Clock size={16} className="text-muted" />;
      case 'editando': return <Clock size={16} style={{ color: '#00E0FF' }} />;
      default: return null;
    }
  };

  const getStatusLabel = (status: Post['status']) => {
    switch (status) {
      case 'publicado': return 'Publicado';
      case 'agendado': return 'Agendado';
      case 'falhou': return 'Falhou';
      case 'rascunho': return 'Rascunho';
      case 'editando': return 'Editando';
      default: return status;
    }
  };

  const getTypeIcon = (type: Post['type']) => {
    switch (type) {
      case 'Post': return <ImageIcon size={16} />;
      case 'Stories': return <ImageIcon size={16} />;
      case 'Video': return <Video size={16} />;
      case 'Reels': return <Video size={16} />;
      case 'Copy': return <FileText size={16} />;
      default: return null;
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleString(language === 'pt' ? 'pt-BR' : language === 'en' ? 'en-US' : 'es-ES', { 
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  // 1. Filtering and Sorting logic
  const filteredAndSortedPosts = useMemo(() => {
    let result = posts.filter(p => {
      // Search
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        p.title.toLowerCase().includes(query) ||
        p.caption.toLowerCase().includes(query) ||
        (p.productId && p.productId.toLowerCase().includes(query)) ||
        p.platforms.some(plat => plat.toLowerCase().includes(query));

      // Status Filter
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

      // Platform Filter
      const matchesPlatform = platformFilter === 'all' || p.platforms.includes(platformFilter);

      return matchesSearch && matchesStatus && matchesPlatform;
    });

    // Sorting
    result.sort((a, b) => {
      let aVal: any = a[sortField as keyof Post];
      let bVal: any = b[sortField as keyof Post];

      if (aVal === undefined || aVal === null) aVal = '';
      if (bVal === undefined || bVal === null) bVal = '';

      if (sortField === 'reach' || sortField === 'engagement') {
        const parseMetric = (val: string) => {
          if (val === '-') return 0;
          if (val.endsWith('k')) return parseFloat(val) * 1000;
          return parseFloat(val) || 0;
        };
        aVal = parseMetric(String(aVal));
        bVal = parseMetric(String(bVal));
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [posts, searchQuery, statusFilter, platformFilter, sortField, sortDirection]);

  // 2. Pagination calculation
  const totalPages = Math.ceil(filteredAndSortedPosts.length / pageSize);
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedPosts.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedPosts, currentPage]);

  return (
    <div className="status-page">
      <header className="page-header">
        <div>
          <h1 className="brand-font">{t('status.title')}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{t('status.subtitle')}</p>
        </div>
      </header>

      <div className="status-toolbar" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '300px' }}>
          <div className="search-bar" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--input)', border: '1px solid var(--border)', borderRadius: '100px', padding: '0.5rem 1.25rem', flex: 1 }}>
            <Search size={16} style={{ color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Buscar posts por título, legenda ou produto..." 
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              style={{ background: 'none', border: 'none', outline: 'none', color: 'white', width: '100%', fontSize: '0.9rem' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {/* Status Filter */}
          <select 
            className="input-field" 
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            style={{ width: '160px', padding: '0.5rem 1rem', borderRadius: '100px', fontSize: '0.85rem' }}
          >
            <option value="all">Todos os Status</option>
            <option value="rascunho">Rascunho</option>
            <option value="editando">Editando</option>
            <option value="agendado">Agendado</option>
            <option value="publicado">Publicado</option>
            <option value="falhou">Falhou</option>
          </select>

          {/* Platform Filter */}
          <select 
            className="input-field" 
            value={platformFilter}
            onChange={e => { setPlatformFilter(e.target.value); setCurrentPage(1); }}
            style={{ width: '160px', padding: '0.5rem 1rem', borderRadius: '100px', fontSize: '0.85rem' }}
          >
            <option value="all">Todas as Redes</option>
            <option value="Instagram">Instagram</option>
            <option value="Facebook">Facebook</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="X/Twitter">X/Twitter</option>
            <option value="WordPress">WordPress</option>
            <option value="Blog">Blog Próprio</option>
          </select>
        </div>
      </div>

      <div className="card status-table-card">
        <table className="status-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('scheduled_at')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  Data {sortField === 'scheduled_at' && <ArrowUpDown size={12} />}
                </div>
              </th>
              <th>Título</th>
              <th>Formato</th>
              <th>Rede Social</th>
              <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  Status {sortField === 'status' && <ArrowUpDown size={12} />}
                </div>
              </th>
              <th onClick={() => handleSort('reach')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  Alcance {sortField === 'reach' && <ArrowUpDown size={12} />}
                </div>
              </th>
              <th onClick={() => handleSort('engagement')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  Engajamento {sortField === 'engagement' && <ArrowUpDown size={12} />}
                </div>
              </th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPosts.map((row) => (
              <tr key={row.id}>
                <td className="date-cell">{formatDate(row.scheduled_at)}</td>
                <td className="product-name-cell" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {row.title}
                </td>
                <td>
                  <div className="type-cell">
                    {getTypeIcon(row.type)}
                    <span>{row.type}</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {row.platforms.map(plat => (
                      <span key={plat} style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                        {plat}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <div className={`status-pill ${row.status}`} style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.4rem 0.75rem',
                    borderRadius: '100px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    background: row.status === 'publicado' ? 'rgba(16, 185, 129, 0.1)' : row.status === 'falhou' ? 'rgba(239, 68, 68, 0.1)' : row.status === 'editando' ? 'rgba(0,224,255,0.1)' : 'rgba(255, 255, 255, 0.05)',
                    color: row.status === 'publicado' ? '#10b981' : row.status === 'falhou' ? '#ef4444' : row.status === 'editando' ? '#00E0FF' : 'var(--text-secondary)'
                  }}>
                    {getStatusIcon(row.status)}
                    <span>{getStatusLabel(row.status)}</span>
                  </div>
                </td>
                <td className="number-cell">{row.reach}</td>
                <td className="number-cell">{row.engagement}</td>
                <td>
                  <button className="icon-btn-sm">
                    <ExternalLink size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {paginatedPosts.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                  Nenhum post encontrado para os filtros selecionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="pagination-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong> ({filteredAndSortedPosts.length} posts filtrados)
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className="btn-secondary" 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={{ padding: '0.4rem 0.8rem', opacity: currentPage === 1 ? 0.4 : 1, pointerEvents: currentPage === 1 ? 'none' : 'auto' }}
            >
              <ChevronLeft size={16} /> Anterior
            </button>
            <button 
              className="btn-secondary" 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              style={{ padding: '0.4rem 0.8rem', opacity: currentPage === totalPages ? 0.4 : 1, pointerEvents: currentPage === totalPages ? 'none' : 'auto' }}
            >
              Próxima <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        .status-page {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .status-table-card {
          padding: 0;
          overflow: hidden;
        }

        .status-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .status-table th {
          padding: 1.25rem 1.5rem;
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid var(--border);
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .status-table td {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border);
          font-size: 0.9rem;
        }

        .status-table tr:last-child td {
          border-bottom: none;
        }

        .status-table tr:hover td {
          background: rgba(255, 255, 255, 0.01);
        }

        .date-cell {
          color: var(--text-secondary);
          font-family: monospace;
          font-size: 0.85rem;
        }

        .type-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: white;
        }

        .product-name-cell {
          font-weight: 600;
          color: white;
        }

        .number-cell {
          font-weight: 600;
          font-family: 'Outfit', sans-serif;
        }

        .text-success { color: #10b981; }
        .text-warning { color: #f59e0b; }
        .text-danger { color: #ef4444; }
      `}</style>
    </div>
  );
};

export default Status;
