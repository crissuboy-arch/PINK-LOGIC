import { 
  Image as ImageIcon, 
  Video, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ExternalLink,
  Filter
} from 'lucide-react';

import { useGestao } from '../../contexts/GestaoContext';
import { useLanguage } from '../../contexts/LanguageContext';

const Status = () => {
  const { posts } = useGestao();
  const { t, language } = useLanguage();
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'posted': return <CheckCircle2 size={16} className="text-success" />;
      case 'pending': return <Clock size={16} className="text-muted" />;
      case 'error': return <AlertCircle size={16} className="text-danger" />;
      default: return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'posted': return t('status.labels.posted');
      case 'pending': return t('status.labels.pending');
      case 'error': return t('status.labels.error');
      default: return status;
    }
  };

  const getTypeIcon = (type: string) => {
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
    const d = new Date(dateStr);
    return d.toLocaleString(language === 'pt' ? 'pt-BR' : language === 'en' ? 'en-US' : 'es-ES', { 
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <div className="status-page">
      <header className="page-header">
        <div>
          <h1 className="brand-font">{t('status.title')}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{t('status.subtitle')}</p>
        </div>
        
        <button className="btn-secondary">
          <Filter size={18} />
          <span>{t('status.filter')}</span>
        </button>
      </header>

      <div className="card status-table-card">
        <table className="status-table">
          <thead>
            <tr>
              <th>{t('status.table.date')}</th>
              <th>{t('status.table.type')}</th>
              <th>{t('status.table.product')}</th>
              <th>{t('status.table.platform')}</th>
              <th>{t('status.table.status')}</th>
              <th>{t('status.table.reach')}</th>
              <th>{t('status.table.engaj')}</th>
              <th>{t('status.table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {(posts || []).map((row, index) => (
              <tr key={index}>
                <td className="date-cell">{formatDate(row.date)}</td>
                <td>
                  <div className="type-cell">
                    {getTypeIcon(row.type)}
                    <span>{row.type}</span>
                  </div>
                </td>
                <td className="product-name-cell">{row.product}</td>
                <td>{row.platform}</td>
                <td>
                  <div className={`status-pill ${row.status}`}>
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
          </tbody>
        </table>
      </div>

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

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 0.75rem;
          border-radius: 100px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .status-pill.posted {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .status-pill.pending {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-secondary);
        }

        .status-pill.error {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
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
