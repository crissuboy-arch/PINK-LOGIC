import { motion, AnimatePresence } from 'framer-motion'
import { Maximize2, Minimize2, X, Sparkles, Loader2, History, Bot, Eye, Terminal } from 'lucide-react'
import { useAgentic } from './AgenticContext'
import AgentThinkingIndicator from './AgentThinkingIndicator'
import AgentStatusCard from './AgentStatusCard'
import ExecutionTimeline from '../live/ExecutionTimeline'
import LivePreviewPanel from '../live/LivePreviewPanel'
import StreamingOutput from '../live/StreamingOutput'
import GlobalQuickCommand from '../command/GlobalQuickCommand'

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

export default function LiveExecutionPanel() {
  const {
    mode,
    activeAgent,
    timeline,
    streamingContent,
    streamingFullContent,
    executionLogs,
    executionResult,
    errorMessage,
    isAgentMode,
    toggleAgentMode,
    reset,
  } = useAgentic()

  const isLive = mode === 'thinking' || mode === 'executing' || mode === 'streaming'

  if (isAgentMode) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: '#0D0D12',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} style={{ color: 'var(--primary)' }} />
            <span style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>Agent Mode</span>
            {isLive && (
              <span style={{ fontSize: '0.65rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <motion.span animate={{ opacity: [1, 0.3] }} transition={{ duration: 0.8, repeat: Infinity }}>●</motion.span>
                Live
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button onClick={reset} style={buttonStyle} title="Reset">
              <X size={16} />
            </button>
            <button onClick={toggleAgentMode} style={buttonStyle} title="Minimizar">
              <Minimize2 size={16} />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 380px', gap: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', flexDirection: 'column', padding: '1.25rem', gap: '1rem', overflow: 'auto' }}>
            <GlobalQuickCommand />

            <AnimatePresence mode="wait">
              {mode === 'idle' && !executionResult && (
                <motion.div key="idle" variants={itemVariants} initial="hidden" animate="show" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
                  <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity }} style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(255,45,141,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={32} style={{ color: 'var(--primary)', opacity: 0.5 }} />
                  </motion.div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: 'white' }}>Pronto para criar</div>
                  <div style={{ fontSize: '0.82rem', textAlign: 'center', maxWidth: 400 }}>Digite um comando acima ou pressione Ctrl+K para iniciar</div>
                </motion.div>
              )}

              {(mode === 'thinking') && (
                <motion.div key="thinking" variants={itemVariants} initial="hidden" animate="show" exit="hidden">
                  <AgentThinkingIndicator action={activeAgent?.action} />
                </motion.div>
              )}

              {activeAgent && (mode === 'executing' || mode === 'streaming') && (
                <motion.div key="executing" variants={itemVariants} initial="hidden" animate="show" exit="hidden">
                  <AgentStatusCard agent={activeAgent} />
                </motion.div>
              )}

              {mode === 'done' && !errorMessage && executionResult && (
                <motion.div key="done" variants={itemVariants} initial="hidden" animate="show" exit="hidden" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Loader2 size={14} style={{ color: '#10b981' }} />
                  </div>
                  <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.85rem' }}>Execução concluída com sucesso</span>
                </motion.div>
              )}

              {mode === 'error' && errorMessage && (
                <motion.div key="error" variants={itemVariants} initial="hidden" animate="show" exit="hidden" style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#ef4444', fontSize: '0.82rem' }}>
                  {errorMessage}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {(mode === 'streaming' || mode === 'done') && streamingFullContent && (
                <motion.div key="streaming" variants={itemVariants} initial="hidden" animate="show" exit="hidden">
                  <StreamingOutput
                    content={streamingContent}
                    fullContent={streamingFullContent}
                    logs={executionLogs}
                    isStreaming={mode === 'streaming'}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {mode === 'done' && executionResult && Object.keys(executionResult).length > 0 && (
                <motion.div key="preview" variants={itemVariants} initial="hidden" animate="show" exit="hidden">
                  <LivePreviewPanel output={executionResult} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div style={{ borderLeft: '1px solid var(--border)', overflow: 'auto', padding: '1rem' }}>
            <ExecutionTimeline steps={timeline} />
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '1.15rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontWeight: 700 }}>
          <Bot size={20} style={{ color: 'var(--primary)' }} />
          Agente Vivo
          {isLive && (
            <span style={{ fontSize: '0.65rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 500 }}>
              <motion.span animate={{ opacity: [1, 0.3] }} transition={{ duration: 0.8, repeat: Infinity }}>●</motion.span>
              {mode === 'thinking' ? 'Pensando' : mode === 'executing' ? 'Executando' : mode === 'streaming' ? 'Transmitindo' : ''}
            </span>
          )}
        </h2>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button onClick={toggleAgentMode} style={{ width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', background: 'var(--input)', color: 'var(--text-secondary)', cursor: 'pointer' }} title="Modo Agente">
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      <GlobalQuickCommand />

      <AnimatePresence mode="wait">
        {mode === 'idle' && !executionResult && (
          <motion.div key="idle" variants={itemVariants} initial="hidden" animate="show" exit="hidden" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
            <Terminal size={16} />
            Digite um comando para começar
          </motion.div>
        )}

        {(mode === 'thinking') && (
          <motion.div key="thinking" variants={itemVariants} initial="hidden" animate="show" exit="hidden">
            <AgentThinkingIndicator action={activeAgent?.action} />
          </motion.div>
        )}

        {activeAgent && (mode === 'executing' || mode === 'streaming') && (
          <motion.div key="executing" variants={itemVariants} initial="hidden" animate="show" exit="hidden">
            <AgentStatusCard agent={activeAgent} />
          </motion.div>
        )}

        {mode === 'done' && !errorMessage && (
          <motion.div key="done" variants={itemVariants} initial="hidden" animate="show" exit="hidden" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)' }}>
            <Eye size={14} style={{ color: '#10b981' }} />
            <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.82rem' }}>Execução concluída — resultado abaixo</span>
            <button onClick={reset} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.72rem', padding: '0.2rem 0.4rem', borderRadius: 4 }}>Limpar</button>
          </motion.div>
        )}

        {mode === 'error' && errorMessage && (
          <motion.div key="error" variants={itemVariants} initial="hidden" animate="show" exit="hidden" style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#ef4444', fontSize: '0.82rem' }}>
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(mode === 'executing' || mode === 'streaming' || mode === 'done') && (
          <motion.div key="content" variants={itemVariants} initial="hidden" animate="show" exit="hidden" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '0.75rem' }}>
            <div style={{ background: 'var(--card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
              <ExecutionTimeline steps={timeline} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(mode === 'streaming' || mode === 'done') && streamingFullContent && (
                <StreamingOutput
                  content={streamingContent}
                  fullContent={streamingFullContent}
                  logs={executionLogs}
                  isStreaming={mode === 'streaming'}
                />
              )}
              {mode === 'done' && executionResult && Object.keys(executionResult).length > 0 && (
                <LivePreviewPanel output={executionResult} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{GLOBAL_STYLES}</style>
    </motion.div>
  )
}

const buttonStyle: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 8,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid var(--border)',
  background: 'rgba(255,255,255,0.03)',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
}

const GLOBAL_STYLES = `
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`
