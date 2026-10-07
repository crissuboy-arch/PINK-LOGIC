import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Command, Sparkles, Send, X, ArrowRight, Terminal, History } from 'lucide-react'
import { useAgentic } from '../agentic/AgenticContext'

const overlayVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
}

const panelVariants = {
  hidden: { opacity: 0, scale: 0.96, y: -12 },
  show: { opacity: 1, scale: 1, y: 0 },
}

export default function FloatingCommandBar() {
  const { execute, history, suggestions, mode, isCommandBarOpen, setCommandBarOpen } = useAgentic()
  const [input, setInput] = useState('')
  const [filteredHints, setFilteredHints] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const isExecuting = mode === 'thinking' || mode === 'executing' || mode === 'streaming'

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandBarOpen(!isCommandBarOpen)
      }
      if (e.key === 'Escape' && isCommandBarOpen) {
        setCommandBarOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isCommandBarOpen, setCommandBarOpen])

  useEffect(() => {
    if (isCommandBarOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setInput('')
    }
  }, [isCommandBarOpen])

  useEffect(() => {
    if (input.trim()) {
      const q = input.toLowerCase()
      const all = [...suggestions, ...history.filter((h) => !suggestions.includes(h))]
      setFilteredHints(all.filter((h) => h.toLowerCase().includes(q)).slice(0, 6))
    } else {
      setFilteredHints([])
    }
  }, [input, suggestions, history])

  const handleExecute = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed || isExecuting) return
    execute(trimmed)
    setCommandBarOpen(false)
    setInput('')
  }, [input, execute, isExecuting, setCommandBarOpen])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleExecute()
    }
    if (e.key === 'Escape') {
      setCommandBarOpen(false)
    }
  }, [handleExecute, setCommandBarOpen])

  return (
    <>
      <button
        onClick={() => setCommandBarOpen(true)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 48,
          height: 48,
          borderRadius: 14,
          border: '1px solid var(--border)',
          background: 'var(--card)',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          transition: 'var(--transition)',
        }}
        title="Comando rápido (Ctrl+K)"
      >
        <Command size={20} />
      </button>

      <AnimatePresence>
        {isCommandBarOpen && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="show"
            exit="hidden"
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)',
              zIndex: 9998,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              paddingTop: '12vh',
            }}
            onClick={() => setCommandBarOpen(false)}
          >
            <motion.div
              variants={panelVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '90%',
                maxWidth: 600,
                background: 'var(--card)',
                borderRadius: 'var(--radius-xl, 16px)',
                border: '1px solid var(--border)',
                overflow: 'hidden',
                boxShadow: '0 16px 64px rgba(0,0,0,0.4)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.9rem', borderBottom: '1px solid var(--border)' }}>
                <Command size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Comando rápido..."
                  disabled={isExecuting}
                  style={{
                    flex: 1,
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    color: 'white',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit',
                  }}
                />
                <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', padding: '0.15rem 0.35rem', borderRadius: 4, background: 'rgba(255,255,255,0.04)', fontFamily: 'monospace' }}>ESC</span>
                <button
                  onClick={handleExecute}
                  disabled={!input.trim() || isExecuting}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: !input.trim() || isExecuting ? 'transparent' : 'var(--gradient)',
                    color: !input.trim() || isExecuting ? 'var(--text-secondary)' : 'white',
                    cursor: !input.trim() || isExecuting ? 'default' : 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <ArrowRight size={16} />
                </button>
              </div>

              {filteredHints.length > 0 && (
                <div style={{ padding: '0.3rem 0' }}>
                  {filteredHints.map((hint) => (
                    <button
                      key={hint}
                      onMouseDown={() => { setInput(hint) }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        width: '100%',
                        padding: '0.45rem 0.9rem',
                        border: 'none',
                        background: 'none',
                        color: 'white',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    >
                      <Sparkles size={12} style={{ color: 'var(--primary)' }} />
                      <span>{hint}</span>
                    </button>
                  ))}
                </div>
              )}

              {history.length > 0 && !input.trim() && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '0.3rem 0' }}>
                  <div style={{ padding: '0.3rem 0.9rem', fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <History size={10} /> Histórico
                  </div>
                  {history.slice(0, 5).map((h) => (
                    <button
                      key={h}
                      onMouseDown={() => { setInput(h) }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        width: '100%',
                        padding: '0.35rem 0.9rem',
                        border: 'none',
                        background: 'none',
                        color: 'var(--text-secondary)',
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <Terminal size={10} style={{ flexShrink: 0 }} />
                      {h}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
