import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Terminal } from 'lucide-react'

export default function StreamingOutput({
  content,
  fullContent,
  logs,
  isStreaming,
}: {
  content: string
  fullContent: string
  logs: string[]
  isStreaming: boolean
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [content, logs])

  if (!fullContent && logs.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'rgba(0,0,0,0.3)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(255,255,255,0.06)',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.15)' }}>
        <Terminal size={12} style={{ color: 'var(--primary)' }} />
        <span style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>Output</span>
        {isStreaming && <span style={{ marginLeft: 'auto', fontSize: '0.6rem', color: 'var(--primary)', fontWeight: 600 }}>LIVE</span>}
      </div>
      <div ref={scrollRef} style={{ padding: '0.75rem', maxHeight: 300, overflow: 'auto', fontFamily: 'monospace', fontSize: '0.72rem', lineHeight: 1.5 }}>
        {logs.length > 0 && (
          <div style={{ marginBottom: '0.75rem' }}>
            {logs.map((log, i) => (
              <div key={i} style={{ color: 'var(--text-secondary)', padding: '0.1rem 0', borderBottom: i < logs.length - 1 ? '1px solid rgba(255,255,255,0.02)' : 'none' }}>
                <span style={{ color: 'var(--primary)', opacity: 0.6 }}>$</span> {log}
              </div>
            ))}
          </div>
        )}
        {fullContent && (
          <div style={{ color: '#10b981', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {content}
            {isStreaming && <motion.span animate={{ opacity: [0, 1] }} transition={{ duration: 0.5, repeat: Infinity }} style={{ color: 'var(--primary)' }}>▊</motion.span>}
          </div>
        )}
      </div>
    </motion.div>
  )
}
