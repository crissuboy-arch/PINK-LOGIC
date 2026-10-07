import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Brain } from 'lucide-react'

const THINKING_PHRASES = [
  'Analisando sua solicitação...',
  'Identificando intenção...',
  'Mapeando contexto criativo...',
  'Ativando agentes especializados...',
  'Processando dados de branding...',
  'Gerando conceitos visuais...',
  'Otimizando resultados...',
  'Compilando resposta final...',
]

const DOT = { display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: 'var(--primary)' }

const dotVariants = {
  animate: (i: number) => ({
    y: [0, -6, 0],
    opacity: [0.4, 1, 0.4],
    transition: { duration: 0.8, repeat: Infinity, delay: i * 0.15 },
  }),
}

const glowVariants = {
  animate: {
    boxShadow: [
      '0 0 20px rgba(255,45,141,0.15)',
      '0 0 40px rgba(255,45,141,0.3)',
      '0 0 20px rgba(255,45,141,0.15)',
    ],
    transition: { duration: 2, repeat: Infinity },
  },
}

export default function AgentThinkingIndicator({ action }: { action?: string }) {
  const [phraseIdx, setPhraseIdx] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIdx((prev) => (prev + 1) % THINKING_PHRASES.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      variants={glowVariants}
      animate="animate"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        borderRadius: 'var(--radius-lg)',
        background: 'linear-gradient(135deg, rgba(255,45,141,0.06), rgba(176,38,255,0.04))',
        border: '1px solid rgba(255,45,141,0.1)',
      }}
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,45,141,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
      >
        <Brain size={18} style={{ color: 'var(--primary)' }} />
      </motion.div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.82rem', color: 'white', fontWeight: 600, marginBottom: '0.15rem', minHeight: '1.2em' }}>
          {action || THINKING_PHRASES[phraseIdx]}
          <span style={{ marginLeft: '0.2rem', display: 'inline-flex', gap: 3, alignItems: 'center' }}>
            {[0, 1, 2].map((i) => (
              <motion.span key={i} custom={i} variants={dotVariants} animate="animate" style={DOT} />
            ))}
          </span>
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
          Agente pensando...
        </div>
      </div>
    </motion.div>
  )
}
