import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Palette, Type, Layout, Sparkles, MousePointer } from 'lucide-react'
import { useAdaptiveDesign } from '../../design/hooks/useAdaptiveDesign'
import type { AdaptiveBrandProfile } from '../../design/learning/PreferenceTracker'

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

function StatBadge({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-md)', background: `${color}0c`, border: `1px solid ${color}18`, minWidth: 0 }}>
      <span style={{ fontSize: '0.62rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontSize: '1.1rem', fontWeight: 700, color }}>{value}</span>
    </div>
  )
}

function ProfileRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0' }}>
      <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(255,45,141,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>{icon}</div>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', minWidth: 100 }}>{label}</span>
      <span style={{ fontSize: '0.78rem', color: 'white', fontWeight: 600 }}>{value}</span>
    </div>
  )
}

function ScoreTimeline({ evolution }: { evolution: { date: string; score: number }[] }) {
  const maxScore = Math.max(...evolution.map((e) => e.score), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.25rem', height: 60, paddingTop: 8 }}>
      {evolution.map((point, i) => {
        const height = (point.score / maxScore) * 100
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem' }}>
            <div style={{ width: '100%', height: `${height}%`, minHeight: 4, borderRadius: '3px 3px 0 0', background: point.score >= 75 ? '#10b981' : point.score >= 50 ? 'var(--primary)' : '#ef4444', opacity: 0.8, transition: 'var(--transition)' }} title={`${point.date}: ${point.score}`} />
          </div>
        )
      })}
    </div>
  )
}

export default function DesignEvolutionPanel({ projectId }: { projectId: string }) {
  const { stats, profile, insights } = useAdaptiveDesign(projectId)

  const preferenceInsights = insights.filter((i) => i.type === 'preference')
  const trendInsights = insights.filter((i) => i.type === 'trend')

  return (
    <motion.div variants={itemVariants} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '1.15rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontWeight: 700 }}>
          <BarChart3 size={20} style={{ color: 'var(--primary)' }} />
          Evolução de Design
        </h2>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{stats.totalRecords} registro(s)</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
        <StatBadge label="Score Médio" value={stats.averageScore} color={stats.averageScore >= 75 ? '#10b981' : stats.averageScore >= 50 ? 'var(--primary)' : '#ef4444'} />
        <StatBadge label="Aprovação" value={`${stats.acceptanceRate}%`} color="#10b981" />
        <StatBadge label="Rejeição" value={`${stats.rejectionRate}%`} color="#ef4444" />
        <StatBadge label="Total" value={stats.totalRecords} color="var(--primary)" />
      </div>

      {stats.scoreEvolution.length > 1 && (
        <div style={{ background: 'var(--card)', borderRadius: 'var(--radius-lg)', padding: '0.75rem 1rem', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
            <TrendingUp size={14} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>Evolução de Score</span>
          </div>
          <ScoreTimeline evolution={stats.scoreEvolution} />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={{ background: 'var(--card)', borderRadius: 'var(--radius-lg)', padding: '0.75rem 1rem', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
            <Palette size={14} style={{ color: '#B026FF' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>Estilos Principais</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {stats.topStyles.slice(0, 4).map((s) => (
              <div key={s.style} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                <span style={{ color: 'white' }}>{s.style}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{s.count}x</span>
              </div>
            ))}
            {stats.topStyles.length === 0 && <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Nenhum estilo registrado</span>}
          </div>
        </div>

        <div style={{ background: 'var(--card)', borderRadius: 'var(--radius-lg)', padding: '0.75rem 1rem', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
            <Type size={14} style={{ color: '#10b981' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>Tons de Voz</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {stats.topTones.slice(0, 4).map((t) => (
              <div key={t.tone} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                <span style={{ color: 'white' }}>{t.tone}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{t.count}x</span>
              </div>
            ))}
            {stats.topTones.length === 0 && <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Nenhum tom registrado</span>}
          </div>
        </div>
      </div>

      {profile && (
        <div style={{ background: 'var(--card)', borderRadius: 'var(--radius-lg)', padding: '0.75rem 1rem', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }}>
            <Sparkles size={14} style={{ color: '#FFD700' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>Perfil Adaptativo</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.15rem 1rem' }}>
            <ProfileRow icon={<Layout size={13} />} label="Spacing" value={profile.preferredSpacing} />
            <ProfileRow icon={<Layout size={13} />} label="Radius" value={profile.preferredRadius} />
            <ProfileRow icon={<MousePointer size={13} />} label="CTA Style" value={profile.preferredCTAStyle} />
            <ProfileRow icon={<Palette size={13} />} label="Estilo" value={profile.preferredVisualStyle} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
            {profile.recurringPalette.primary && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.5rem', borderRadius: 6, background: 'rgba(255,255,255,0.03)', fontSize: '0.7rem' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: profile.recurringPalette.primary, display: 'inline-block' }} />
                <span style={{ color: 'var(--text-secondary)' }}>Primary: {profile.recurringPalette.primary}</span>
              </div>
            )}
            {profile.fontPreferences.heading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.5rem', borderRadius: 6, background: 'rgba(255,255,255,0.03)', fontSize: '0.7rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Heading: <strong style={{ color: 'white' }}>{profile.fontPreferences.heading}</strong></span>
              </div>
            )}
            {profile.fontPreferences.body && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.5rem', borderRadius: 6, background: 'rgba(255,255,255,0.03)', fontSize: '0.7rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Body: <strong style={{ color: 'white' }}>{profile.fontPreferences.body}</strong></span>
              </div>
            )}
          </div>
        </div>
      )}

      {preferenceInsights.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {preferenceInsights.map((insight) => (
            <div key={insight.id} style={{ padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.1)', fontSize: '0.78rem' }}>
              <div style={{ color: '#10b981', fontWeight: 600, marginBottom: '0.15rem' }}>{insight.title}</div>
              <div style={{ color: 'var(--text-secondary)' }}>{insight.description}</div>
              {insight.recommendation && <div style={{ color: 'var(--primary)', marginTop: '0.2rem', fontSize: '0.72rem' }}>→ {insight.recommendation}</div>}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
