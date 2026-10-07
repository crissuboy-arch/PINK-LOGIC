import { motion } from 'framer-motion'
import { Brain, TrendingUp, Lightbulb, Eye, ArrowUp, Zap, Award, Cpu } from 'lucide-react'
import { useAdaptiveDesign } from '../../design/hooks/useAdaptiveDesign'

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

const typeIcons: Record<string, React.ReactNode> = {
  'recurring-style': <Eye size={13} />,
  'color-tendency': <Award size={13} />,
  'tone-preference': <Zap size={13} />,
  'font-preference': <Lightbulb size={13} />,
  'preferred-contrast': <Cpu size={13} />,
  'preferred-radius': <Cpu size={13} />,
  'preferred-spacing': <Cpu size={13} />,
}

const typeColors: Record<string, string> = {
  'recurring-style': '#10b981',
  'color-tendency': '#B026FF',
  'tone-preference': '#FFD700',
  'font-preference': '#3b82f6',
  'preferred-contrast': '#f59e0b',
  'preferred-radius': '#f59e0b',
  'preferred-spacing': '#f59e0b',
}

function PatternCard({ pattern }: { pattern: { id: string; type: string; label: string; description: string; confidence: number; evidence: string[]; value: string | number } }) {
  const color = typeColors[pattern.type] ?? 'var(--text-secondary)'
  const icon = typeIcons[pattern.type] ?? <Cpu size={13} />

  return (
    <motion.div variants={itemVariants} initial="hidden" animate="show" style={{ padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', background: `${color}06`, border: `1px solid ${color}14`, fontSize: '0.78rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.15rem' }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, background: `${color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>{icon}</div>
        <span style={{ color: 'white', fontWeight: 600, flex: 1 }}>{pattern.label}</span>
        <span style={{ fontSize: '0.65rem', fontWeight: 600, color, padding: '0.1rem 0.35rem', borderRadius: 4, background: `${color}10` }}>{pattern.confidence}%</span>
      </div>
      <div style={{ color: 'var(--text-secondary)', marginLeft: '1.65rem' }}>{pattern.description}</div>
    </motion.div>
  )
}

function SuggestionCard({ suggestion }: { suggestion: { id: string; type: string; title: string; description: string; confidence: number; basedOn: string; suggestedValue: string | Record<string, string> } }) {
  const isHighConfidence = suggestion.confidence >= 75
  const color = isHighConfidence ? '#10b981' : 'var(--text-secondary)'

  return (
    <motion.div variants={itemVariants} initial="hidden" animate="show" style={{ padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--card)', border: `1px solid ${isHighConfidence ? 'rgba(16,185,129,0.15)' : 'var(--border)'}`, fontSize: '0.78rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.15rem' }}>
        <Lightbulb size={14} style={{ color, flexShrink: 0 }} />
        <span style={{ color: 'white', fontWeight: 600, flex: 1 }}>{suggestion.title}</span>
        <span style={{ fontSize: '0.65rem', fontWeight: 600, color, padding: '0.1rem 0.35rem', borderRadius: 4, background: `${isHighConfidence ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.04)'}` }}>{suggestion.confidence}%</span>
      </div>
      <div style={{ color: 'var(--text-secondary)', marginLeft: '1.3rem' }}>{suggestion.description}</div>
      <div style={{ color: 'var(--text-secondary)', marginLeft: '1.3rem', marginTop: '0.1rem', fontSize: '0.7rem' }}>Baseado em: {suggestion.basedOn}</div>
    </motion.div>
  )
}

function RecommendationTag({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', padding: '0.5rem 0.65rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,45,141,0.04)', border: '1px solid rgba(255,45,141,0.1)', fontSize: '0.75rem' }}>
      <ArrowUp size={12} style={{ color: 'var(--primary)', marginTop: '0.15rem', flexShrink: 0 }} />
      <span style={{ color: 'var(--text-secondary)' }}>{text}</span>
    </div>
  )
}

export default function VisualIntelligencePanel({ projectId }: { projectId: string }) {
  const { patterns, suggestions, campaignInsights, insights } = useAdaptiveDesign(projectId)

  const recommendationInsights = insights.filter((i) => i.recommendation)

  return (
    <motion.div variants={itemVariants} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '1.15rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontWeight: 700 }}>
          <Brain size={20} style={{ color: '#B026FF' }} />
          Inteligência Visual
        </h2>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{patterns.length} padrão(ões)</span>
      </div>

      {campaignInsights.bestPerforming && (
        <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(255,215,0,0.04))', borderRadius: 'var(--radius-lg)', padding: '0.75rem 1rem', border: '1px solid rgba(16,185,129,0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
            <TrendingUp size={15} style={{ color: '#10b981' }} />
            <span style={{ fontSize: '0.82rem', color: 'white', fontWeight: 700 }}>Melhor Campanha</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Score: <strong style={{ color: '#10b981' }}>{campaignInsights.bestPerforming.averageScore}</strong> — {campaignInsights.bestPerforming.totalDesigns} design(s)
          </div>
          {campaignInsights.bestPerforming.topStyles.length > 0 && (
            <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
              {campaignInsights.bestPerforming.topStyles.map((style) => (
                <span key={style} style={{ padding: '0.15rem 0.45rem', borderRadius: 4, background: 'rgba(16,185,129,0.08)', color: '#10b981', fontSize: '0.7rem', fontWeight: 500 }}>{style}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {patterns.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Eye size={14} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>Padrões Detectados</span>
          </div>
          {patterns.map((pattern) => (
            <PatternCard key={pattern.id} pattern={pattern} />
          ))}
        </div>
      )}

      {suggestions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Lightbulb size={14} style={{ color: '#FFD700' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>Sugestões Adaptativas</span>
          </div>
          {suggestions.map((s) => (
            <SuggestionCard key={s.id} suggestion={s} />
          ))}
        </div>
      )}

      {campaignInsights.recommendations.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ArrowUp size={14} style={{ color: '#B026FF' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>Recomendações</span>
          </div>
          {campaignInsights.recommendations.map((rec, i) => (
            <RecommendationTag key={i} text={rec} />
          ))}
        </div>
      )}

      {recommendationInsights.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Lightbulb size={14} style={{ color: '#10b981' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>Insights com Ação</span>
          </div>
          {recommendationInsights.map((insight) => (
            <div key={insight.id} style={{ padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.1)', fontSize: '0.78rem' }}>
              <div style={{ color: '#10b981', fontWeight: 600, marginBottom: '0.1rem' }}>{insight.title}</div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '0.15rem' }}>{insight.description}</div>
              <div style={{ color: 'white', fontSize: '0.72rem' }}>→ {insight.recommendation}</div>
            </div>
          ))}
        </div>
      )}

      {patterns.length === 0 && suggestions.length === 0 && campaignInsights.recommendations.length === 0 && (
        <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.82rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)' }}>
          Nenhum padrão detectado ainda. Crie e aprove designs para alimentar a inteligência visual.
        </div>
      )}
    </motion.div>
  )
}
