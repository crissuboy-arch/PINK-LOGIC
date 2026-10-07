import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import type { BrandProfile } from '../../design/intelligence/types'

interface BarProps { label: string; value: number; color: string }

function StatBar({ label, value, color }: BarProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
        <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ color: 'white', fontWeight: 600 }}>{value}%</span>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ height: '100%', borderRadius: 3, background: color }}
        />
      </div>
    </div>
  )
}

export default function BrandStrengthIndicator({ profile, score }: { profile: BrandProfile; score: number }) {
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <Sparkles size={16} style={{ color: 'var(--primary)' }} />
        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'white' }}>Perfil da Marca</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <StatBar label="Luxo" value={profile.luxuryLevel} color="#FFD700" />
        <StatBar label="Modernidade" value={profile.modernity} color="#3b82f6" />
        <StatBar label="Minimalismo" value={profile.minimalism} color="#10b981" />
        <StatBar label="Vibração" value={profile.vibrancy} color="var(--primary)" />
        <StatBar label="Calor Humano" value={profile.warmth} color="#f97316" />
        <StatBar label="Formalidade" value={profile.formality} color="#6b7280" />
        <StatBar label="Descontração" value={profile.playfulness} color="var(--secondary)" />
      </div>

      <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Tom: </span>
        <span style={{ fontSize: '0.78rem', color: 'white', fontWeight: 500 }}>{profile.tone}</span>
      </div>
    </motion.div>
  )
}
