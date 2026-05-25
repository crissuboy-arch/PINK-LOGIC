import { motion } from 'framer-motion'

function getScoreColor(score: number): string {
  if (score >= 90) return '#10b981'
  if (score >= 70) return '#3b82f6'
  if (score >= 50) return '#f59e0b'
  return '#ef4444'
}

function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excelente'
  if (score >= 70) return 'Bom'
  if (score >= 50) return 'Regular'
  return 'Crítico'
}

export default function DesignScoreBadge({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  const dimensions = { sm: 48, md: 72, lg: 96 }
  const strokeWidth = size === 'sm' ? 4 : size === 'md' ? 5 : 6
  const dim = dimensions[size]
  const radius = (dim - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = getScoreColor(score)

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}
    >
      <svg width={dim} height={dim} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={dim / 2} cy={dim / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
        <motion.circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <span style={{ fontSize: size === 'sm' ? '0.85rem' : size === 'md' ? '1.15rem' : '1.5rem', fontWeight: 800, color: 'white', fontFamily: 'Outfit, sans-serif', marginTop: '-1.8em' }}>{score}</span>
      <span style={{ fontSize: '0.65rem', fontWeight: 600, color }}>{getScoreLabel(score)}</span>
    </motion.div>
  )
}
