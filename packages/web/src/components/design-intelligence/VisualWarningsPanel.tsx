import { motion } from 'framer-motion'
import { AlertTriangle, AlertCircle, Info, XCircle } from 'lucide-react'
import type { DesignIssue } from '../../design/intelligence/types'

const severityConfig: Record<string, { icon: any; color: string; bg: string }> = {
  critical: { icon: XCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
  major: { icon: AlertCircle, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  minor: { icon: AlertTriangle, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
  info: { icon: Info, color: '#6b7280', bg: 'rgba(107,114,128,0.06)' },
}

const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0 },
}

export default function VisualWarningsPanel({ issues, title = 'Problemas de Design' }: { issues: DesignIssue[]; title?: string }) {
  if (issues.length === 0) {
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center', color: '#10b981', fontSize: '0.85rem', background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.1)', borderRadius: 'var(--radius-lg)' }}>
        Nenhum problema de design detectado ✓
      </div>
    )
  }

  const bySeverity = (s: string) => issues.filter((i) => i.severity === s)
  const critical = bySeverity('critical')
  const major = bySeverity('major')
  const minor = bySeverity('minor')
  const info = bySeverity('info')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'white' }}>{title}</span>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{issues.length} item(ns)</span>
        {critical.length > 0 && <span style={{ marginLeft: 'auto', padding: '0.15rem 0.45rem', borderRadius: 6, background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '0.68rem', fontWeight: 600 }}>{critical.length} crítica(s)</span>}
      </div>

      {[...critical, ...major, ...minor, ...info].map((issue, i) => {
        const cfg = severityConfig[issue.severity] ?? severityConfig.info
        const Icon = cfg.icon
        return (
          <motion.div key={issue.id} variants={itemVariants} initial="hidden" animate="show" transition={{ delay: i * 0.03 }}
            style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', background: cfg.bg, border: `1px solid ${cfg.color}15`, fontSize: '0.78rem' }}
          >
            <Icon size={14} style={{ color: cfg.color, marginTop: '0.1rem', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ color: 'white', fontWeight: 600 }}>{issue.title}</div>
              <div style={{ color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{issue.description}</div>
              {issue.fix && <div style={{ color: cfg.color, marginTop: '0.2rem', fontSize: '0.72rem' }}>→ {issue.fix}</div>}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
