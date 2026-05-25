import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Bot, Clock, FileText, DollarSign, Activity, CheckCircle, XCircle, Loader2, Zap } from 'lucide-react'
import type { ActiveAgentInfo } from './AgenticContext'

const glowVariants = {
  active: {
    boxShadow: [
      '0 0 12px rgba(59,130,246,0.1)',
      '0 0 24px rgba(59,130,246,0.2)',
      '0 0 12px rgba(59,130,246,0.1)',
    ],
    transition: { duration: 1.5, repeat: Infinity },
  },
  thinking: {
    boxShadow: [
      '0 0 12px rgba(255,45,141,0.1)',
      '0 0 24px rgba(255,45,141,0.25)',
      '0 0 12px rgba(255,45,141,0.1)',
    ],
    transition: { duration: 1.5, repeat: Infinity },
  },
  done: {},
  failed: {},
}

const STATUS_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  thinking: { icon: Loader2, color: '#f59e0b', label: 'Pensando' },
  executing: { icon: Loader2, color: '#3b82f6', label: 'Executando' },
  done: { icon: CheckCircle, color: '#10b981', label: 'Concluído' },
  failed: { icon: XCircle, color: '#ef4444', label: 'Falhou' },
}

function LiveTimer({ startTime }: { startTime: number }) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => setElapsed(Date.now() - startTime), 100)
    return () => clearInterval(interval)
  }, [startTime])
  return <>{elapsed}ms</>
}

export default function AgentStatusCard({ agent }: { agent: ActiveAgentInfo }) {
  const cfg = STATUS_CONFIG[agent.status] ?? STATUS_CONFIG.thinking
  const Icon = cfg.icon

  return (
    <motion.div
      variants={glowVariants}
      animate={agent.status === 'executing' ? 'active' : agent.status === 'thinking' ? 'thinking' : 'done'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.85rem 1rem',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--card)',
        border: `1px solid ${agent.status === 'failed' ? 'rgba(239,68,68,0.2)' : 'var(--border)'}`,
        position: 'relative',
        overflow: 'hidden',
        opacity: agent.status === 'done' ? 1 : 1,
        transition: 'var(--transition)',
      }}
    >
      <motion.div
        animate={agent.status === 'executing' || agent.status === 'thinking' ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{ width: 40, height: 40, borderRadius: 12, background: `${cfg.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
      >
        <Icon size={20} style={{ color: cfg.color, animation: agent.status === 'thinking' || agent.status === 'executing' ? 'spin 1.5s linear infinite' : 'none' }} />
      </motion.div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'white' }}>{agent.name}</span>
          <span style={{ padding: '0.1rem 0.4rem', borderRadius: 4, background: `${cfg.color}12`, color: cfg.color, fontSize: '0.62rem', fontWeight: 600, textTransform: 'uppercase' }}>{cfg.label}</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
            <Zap size={11} /> {agent.action}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
            <Activity size={11} /> {agent.confidence}%
          </span>
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: '0.78rem', color: agent.status === 'executing' || agent.status === 'thinking' ? 'white' : 'var(--text-secondary)', fontWeight: 600, fontFamily: 'monospace' }}>
          {agent.status === 'executing' || agent.status === 'thinking' ? (
            <LiveTimer startTime={Date.now() - agent.duration} />
          ) : (
            `${agent.duration}ms`
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.1rem', justifyContent: 'flex-end' }}>
          {agent.tokens > 0 && (
            <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.15rem' }}>
              <FileText size={9} />{agent.tokens}
            </span>
          )}
          {agent.cost > 0 && (
            <span style={{ fontSize: '0.62rem', color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '0.15rem' }}>
              <DollarSign size={9} />${agent.cost.toFixed(4)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
