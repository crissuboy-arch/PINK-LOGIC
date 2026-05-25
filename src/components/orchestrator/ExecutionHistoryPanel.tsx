import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, CheckCircle, XCircle, Loader2, Hash, User, Wrench, ChevronRight } from 'lucide-react'
import { getHistory, getSummary } from '../../core/history/executionHistory'
import type { ExecutionRecord } from '../../core/execution/executionStore'

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

function MiniStatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string }> = {
    success: { color: '#10b981' },
    failed: { color: '#ef4444' },
    running: { color: '#3b82f6' },
    pending: { color: '#f59e0b' },
  }
  const c = config[status] ?? { color: '#6b7280' }
  return <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.color, display: 'inline-block', flexShrink: 0 }} />
}

export default function ExecutionHistoryPanel() {
  const [executions, setExecutions] = useState<ExecutionRecord[]>([])
  const [summary, setSummary] = useState({ total: 0, success: 0, failed: 0, running: 0, averageDuration: 0 })
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    setExecutions(getHistory(8))
    setSummary(getSummary())
  }, [])

  useEffect(() => {
    if (executions.length === 0) return
    const interval = setInterval(() => {
      setExecutions(getHistory(8))
      setSummary(getSummary())
    }, 3000)
    return () => clearInterval(interval)
  }, [executions.length])

  const toggleExpand = (id: string) => {
    setExpanded(expanded === id ? null : id)
  }

  return (
    <motion.div variants={itemVariants} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 className="section-title" style={{ fontSize: '1.5rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <Clock size={22} style={{ color: 'var(--primary)' }} />
          Execuções
        </h2>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          <span><span style={{ color: '#10b981', fontWeight: 700 }}>{summary.success}</span> sucesso</span>
          <span><span style={{ color: '#ef4444', fontWeight: 700 }}>{summary.failed}</span> falha</span>
          {summary.running > 0 && <span><span style={{ color: '#3b82f6', fontWeight: 700 }}>{summary.running}</span> ativas</span>}
          <span>média <strong>{summary.averageDuration}ms</strong></span>
        </div>
      </div>

      {executions.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', fontSize: '0.85rem' }}>
          Nenhuma execução encontrada. Use o painel "Comando Agentic" para iniciar.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {executions.map((exec) => {
            const isExpanded = expanded === exec.id
            return (
              <motion.div key={exec.id} variants={itemVariants} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', transition: 'var(--transition)' }}>
                <button
                  onClick={() => toggleExpand(exec.id)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
                >
                  <MiniStatusBadge status={exec.status} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{exec.intent}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                      <Hash size={10} />{exec.id.slice(0, 8)}
                      <span>{exec.workflowName}</span>
                      <span>{new Date(exec.startedAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'right', flexShrink: 0 }}>
                    {exec.totalDuration != null ? `${exec.totalDuration}ms` : '-'}
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0, transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>

                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {exec.steps.map((step) => (
                      <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 0.6rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', fontSize: '0.78rem' }}>
                        <MiniStatusBadge status={step.status} />
                        <span style={{ color: 'white', fontWeight: 500, flex: 1 }}>{step.name}</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-secondary)' }}><User size={10} />{step.agentName}</span>
                        {step.skillId && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-secondary)' }}><Wrench size={10} />{step.skillName}</span>}
                        <span style={{ color: 'var(--text-secondary)' }}>{step.duration}ms</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
