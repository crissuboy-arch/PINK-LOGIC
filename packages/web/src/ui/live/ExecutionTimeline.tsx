import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Circle, Loader2, XCircle } from 'lucide-react'
import type { TimelineStep } from '../agentic/AgenticContext'

const STEP_ICONS: Record<string, React.ReactNode> = {
  '🎯': <span>🎯</span>,
  '🔄': <span>🔄</span>,
  '⚡': <span>⚡</span>,
  '🧠': <span>🧠</span>,
  '✨': <span>✨</span>,
  '📦': <span>📦</span>,
}

function TimelineNode({ step, index }: { step: TimelineStep; index: number }) {
  const isLast = index === 5
  const isActive = step.status === 'active'
  const isDone = step.status === 'done'
  const isFailed = step.status === 'failed'

  const nodeColor = isDone ? '#10b981' : isFailed ? '#ef4444' : isActive ? 'var(--primary)' : 'var(--border)'
  const nodeBg = isDone ? 'rgba(16,185,129,0.15)' : isFailed ? 'rgba(239,68,68,0.15)' : isActive ? 'rgba(255,45,141,0.12)' : 'rgba(255,255,255,0.03)'

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      style={{ display: 'flex', alignItems: 'stretch', gap: 0, position: 'relative' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 36, flexShrink: 0 }}>
        <motion.div
          animate={isActive ? { scale: [1, 1.15, 1] } : {}}
          transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: nodeBg,
            border: `2px solid ${nodeColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            position: 'relative',
            zIndex: 1,
            transition: 'var(--transition)',
          }}
        >
          {isDone ? (
            <CheckCircle size={14} style={{ color: '#10b981' }} />
          ) : isFailed ? (
            <XCircle size={14} style={{ color: '#ef4444' }} />
          ) : isActive ? (
            <Loader2 size={13} style={{ color: 'var(--primary)', animation: 'spin 1.2s linear infinite' }} />
          ) : (
            <Circle size={13} style={{ color: 'var(--border)' }} />
          )}
        </motion.div>
        {!isLast && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: isDone || isActive ? 32 : 32 }}
            style={{ width: 2, flex: 1, minHeight: 24, background: isDone ? '#10b981' : isActive ? 'var(--primary)' : 'var(--border)', opacity: isDone ? 0.5 : 0.2, transition: 'var(--transition)' }}
          />
        )}
      </div>
      <div style={{ flex: 1, paddingLeft: '0.75rem', paddingBottom: isLast ? 0 : '0.75rem', paddingTop: '0.15rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          {STEP_ICONS[step.icon] || <span>{step.icon}</span>}
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: isDone ? '#10b981' : isFailed ? '#ef4444' : isActive ? 'white' : 'var(--text-secondary)' }}>
            {step.label}
          </span>
          {step.detail && (
            <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginLeft: '0.25rem' }}>
              — {step.detail}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function ExecutionTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <div style={{ padding: '0.5rem 0.75rem' }}>
      <AnimatePresence>
        {steps.map((step, i) => (
          <TimelineNode key={step.id} step={step} index={i} />
        ))}
      </AnimatePresence>
    </div>
  )
}
