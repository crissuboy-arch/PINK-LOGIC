import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, Send, CheckCircle, XCircle, Loader2, Brain, Route, Layers, User, Wrench, Hash } from 'lucide-react'
import { orchestrator } from '../../core/orchestrator/orchestrator'
import type { OrchestrationResult } from '../../core/orchestrator/orchestrator'
import type { ExecutionStepRecord } from '../../core/execution/executionStore'

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
    success: { icon: CheckCircle, color: '#10b981', label: 'Sucesso' },
    completed: { icon: CheckCircle, color: '#10b981', label: 'Concluído' },
    failed: { icon: XCircle, color: '#ef4444', label: 'Falhou' },
    running: { icon: Loader2, color: '#3b82f6', label: 'Executando' },
    pending: { icon: Loader2, color: '#f59e0b', label: 'Pendente' },
  }
  const c = config[status] ?? config.failed
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.6rem', borderRadius: '100px', fontSize: '0.72rem', fontWeight: 600, background: `${c.color}15`, color: c.color }}>
      <c.icon size={12} />
      {c.label}
    </span>
  )
}

function StepRow({ step, index }: { step: ExecutionStepRecord; index: number }) {
  const statusMap: Record<string, string> = { pending: 'pending', running: 'running', success: 'success', failed: 'failed' }
  return (
    <motion.div variants={itemVariants} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 0.9rem', background: 'var(--input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
      <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--gradient)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>{step.order}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'white' }}>{step.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><User size={11} />{step.agentName}</span>
          {step.skillId && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><Wrench size={11} />{step.skillName}</span>}
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <StatusBadge status={statusMap[step.status] ?? 'pending'} />
        {step.duration > 0 && <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{step.duration}ms</div>}
      </div>
    </motion.div>
  )
}

export default function OrchestratorCommandPanel() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<OrchestrationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleExecute = useCallback(async () => {
    const trimmed = input.trim()
    if (!trimmed) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await orchestrator(trimmed)
      setResult(res)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao executar comando')
    } finally {
      setLoading(false)
    }
  }, [input])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleExecute()
    }
  }, [handleExecute])

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '0.5rem' }}>
      <motion.h2 variants={itemVariants} className="section-title" style={{ fontSize: '1.5rem', marginBottom: '0', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Terminal size={22} style={{ color: 'var(--primary)' }} />
        Comando Agentic
      </motion.h2>

      <motion.div variants={itemVariants} style={{ display: 'flex', gap: '0.75rem' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0 1rem', height: '52px', transition: 'var(--transition)' }}>
          <Terminal size={18} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="O que deseja fazer?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'white', fontSize: '0.95rem', fontFamily: 'inherit' }}
          />
        </div>
        <button
          onClick={handleExecute}
          disabled={!input.trim() || loading}
          className="btn-primary"
          style={{ height: '52px', padding: '0 1.5rem', justifyContent: 'center', opacity: !input.trim() || loading ? 0.5 : 1 }}
        >
          {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={18} />}
          Executar
        </button>
      </motion.div>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div key="loading" variants={itemVariants} initial="hidden" animate="show" exit="hidden" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '2rem', color: 'var(--text-secondary)' }}>
            <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
            <span>Orquestrando agentes...</span>
          </motion.div>
        )}

        {error && (
          <motion.div key="error" variants={itemVariants} initial="hidden" animate="show" exit="hidden" style={{ padding: '1rem 1.25rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-lg)', color: '#ef4444', fontSize: '0.9rem' }}>
            {error}
          </motion.div>
        )}

        {result && !loading && (
          <motion.div key="result" variants={containerVariants} initial="hidden" animate="show" exit="hidden" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <motion.div variants={itemVariants} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Brain size={16} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Intent</span>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>{result.intent.type}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  {result.intent.action} / {result.intent.target}{result.intent.platform ? ` / ${result.intent.platform}` : ''}
                  <span style={{ marginLeft: '0.5rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(255,45,141,0.1)', color: 'var(--primary)', fontSize: '0.7rem', fontWeight: 600 }}>{(result.intent.confidence * 100).toFixed(0)}%</span>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Route size={16} style={{ color: result.route.workflow ? '#10b981' : 'var(--text-secondary)' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Workflow</span>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>{result.route.workflow?.name ?? 'Rota dinâmica'}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  <Hash size={11} style={{ display: 'inline', marginRight: '0.2rem', verticalAlign: 'middle' }} />
                  <span style={{ verticalAlign: 'middle' }}>{result.execution.id.slice(0, 8)}</span>
                  <span style={{ marginLeft: '0.5rem' }}>{result.execution.steps.length} passo(s)</span>
                </div>
              </motion.div>
            </div>

            <motion.div variants={itemVariants} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Layers size={16} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Steps executados</span>
                <span style={{ marginLeft: 'auto' }}>
                  <StatusBadge status={result.execution.status} />
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {result.execution.steps.map((step, i) => (
                  <StepRow key={step.id} step={step} index={i} />
                ))}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} style={{ textAlign: 'center', padding: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border)' }}>
              Execução {result.execution.id.slice(0, 8)} concluída em {result.execution.totalDuration}ms · {result.execution.steps.filter(s => s.status === 'success').length}/{result.execution.steps.length} steps com sucesso
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  )
}
