import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, Send, Sparkles, History, X, ArrowRight } from 'lucide-react'
import { useAgentic } from '../agentic/AgenticContext'

const containerVariants = {
  hidden: { opacity: 0, y: -8 },
  show: { opacity: 1, y: 0 },
}

export default function GlobalQuickCommand() {
  const { execute, history, suggestions, mode } = useAgentic()
  const [input, setInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [filteredHints, setFilteredHints] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const isExecuting = mode === 'thinking' || mode === 'executing' || mode === 'streaming'

  useEffect(() => {
    if (input.trim()) {
      const q = input.toLowerCase()
      const all = [...suggestions, ...history.filter((h) => !suggestions.includes(h))]
      setFilteredHints(all.filter((h) => h.toLowerCase().includes(q)).slice(0, 6))
      setShowSuggestions(true)
    } else {
      setFilteredHints([])
      setShowSuggestions(false)
    }
  }, [input, suggestions, history])

  const handleExecute = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed || isExecuting) return
    execute(trimmed)
    setInput('')
    setShowSuggestions(false)
  }, [input, execute, isExecuting])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleExecute()
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false)
      setShowHistory(false)
      inputRef.current?.blur()
    }
    if (e.key === 'ArrowDown' && showSuggestions) {
      e.preventDefault()
    }
  }, [handleExecute, showSuggestions])

  return (
    <motion.div
      variants={containerVariants}
      initial="show"
      animate="show"
      style={{ position: 'relative', width: '100%' }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          background: 'var(--input)',
          border: `1px solid ${isExecuting ? 'rgba(255,45,141,0.3)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '0 0.9rem',
          height: 48,
          transition: 'var(--transition)',
          boxShadow: isExecuting ? '0 0 20px rgba(255,45,141,0.08)' : 'none',
        }}
      >
        {isExecuting ? (
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
            <Sparkles size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          </motion.div>
        ) : (
          <Terminal size={18} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
        )}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => input.trim() && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => { setShowSuggestions(false); setShowHistory(false) }, 200)}
          onKeyDown={handleKeyDown}
          placeholder="O que deseja criar hoje?"
          disabled={isExecuting}
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            outline: 'none',
            color: 'white',
            fontSize: '0.9rem',
            fontFamily: 'inherit',
          }}
        />
        {input.trim() && !isExecuting && (
          <button
            onClick={() => setInput('')}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem', display: 'flex' }}
          >
            <X size={16} />
          </button>
        )}
        <button
          onClick={handleExecute}
          disabled={!input.trim() || isExecuting}
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: !input.trim() || isExecuting ? 'transparent' : 'var(--gradient)',
            color: !input.trim() || isExecuting ? 'var(--text-secondary)' : 'white',
            cursor: !input.trim() || isExecuting ? 'default' : 'pointer',
            transition: 'var(--transition)',
            flexShrink: 0,
          }}
        >
          {isExecuting ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <Send size={15} />
            </motion.div>
          ) : (
            <ArrowRight size={18} />
          )}
        </button>
      </div>

      <AnimatePresence>
        {showSuggestions && filteredHints.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -4, scaleY: 0.95 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '0.3rem',
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              zIndex: 100,
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ padding: '0.3rem 0.6rem', fontSize: '0.62rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Sugestões
            </div>
            {filteredHints.map((hint) => (
              <button
                key={hint}
                onMouseDown={() => { setInput(hint); setShowSuggestions(false) }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: 'none',
                  background: 'none',
                  color: 'white',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
              >
                <Sparkles size={12} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span>{hint}</span>
              </button>
            ))}
          </motion.div>
        )}

        {showHistory && history.length > 0 && !input.trim() && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '0.3rem',
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              zIndex: 100,
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ padding: '0.3rem 0.6rem', fontSize: '0.62rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <History size={10} /> Histórico
            </div>
            {history.map((h) => (
              <button
                key={h}
                onMouseDown={() => { setInput(h); setShowHistory(false) }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  padding: '0.4rem 0.75rem',
                  border: 'none',
                  background: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
              >
                <History size={11} style={{ flexShrink: 0 }} />
                {h}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
