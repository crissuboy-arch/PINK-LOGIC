import type { DesignMemoryRecord } from '../memory/DesignMemory'
import { detectPatterns, type DetectedPattern } from './PatternRecognition'
import { buildAdaptiveProfile, type AdaptiveBrandProfile } from './PreferenceTracker'

export interface FeedbackAction {
  action: 'approve' | 'reject' | 'adjust' | 'ignore'
  field?: string
  value?: string
  reason?: string
}

export interface FeedbackResult {
  recordId: string
  action: FeedbackAction
  patterns: DetectedPattern[]
  profile: AdaptiveBrandProfile
  insights: LearningInsight[]
}

export interface LearningInsight {
  id: string
  type: 'preference' | 'pattern' | 'trend' | 'suggestion'
  category: 'color' | 'typography' | 'composition' | 'style' | 'performance'
  title: string
  description: string
  confidence: number
  evidence: string[]
  recommendation?: string
}

let counter = 0
function uid(): string { return `insight-${++counter}` }

function computeInsights(
  records: DesignMemoryRecord[],
  profile: AdaptiveBrandProfile,
  patterns: DetectedPattern[],
): LearningInsight[] {
  const insights: LearningInsight[] = []

  if (profile.preferredSpacing === 'loose') {
    insights.push({
      id: uid(), type: 'preference', category: 'composition',
      title: 'Prefere espaçamento amplo',
      description: 'Usuário consistentemente escolhe layouts com bastante espaço entre elementos',
      confidence: 70, evidence: ['Spacing preferido: loose'],
      recommendation: 'Priorizar layouts com padding e gap generosos',
    })
  }

  if (profile.preferredRadius === 'rounded') {
    insights.push({
      id: uid(), type: 'preference', category: 'composition',
      title: 'Prefere cantos arredondados',
      description: 'Usuário opta por radius alto — estética mais suave e acolhedora',
      confidence: 75, evidence: ['Radius preferido: rounded'],
      recommendation: 'Usar radius ≥ 16px em cards, botões e modais',
    })
  }

  if (profile.preferredCTAStyle === 'neon') {
    insights.push({
      id: uid(), type: 'preference', category: 'style',
      title: 'CTA neon tem melhor performance',
      description: 'CTAs com cores vibrantes e alto contraste são aprovados com mais frequência',
      confidence: 80, evidence: ['CTA style: neon'],
      recommendation: 'Manter CTAs com cores fluorescentes e glow effect',
    })
  }

  const accepted = records.filter((r) => r.accepted)
  if (accepted.length >= 3) {
    const scores = accepted.map((r) => r.score)
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    if (avg >= 80) {
      insights.push({
        id: uid(), type: 'trend', category: 'performance',
        title: 'Qualidade visual crescente',
        description: `Score médio de ${avg} indica designs de alta qualidade`,
        confidence: 85, evidence: [`Score médio: ${avg}`, `${accepted.length} designs aprovados`],
        recommendation: 'Manter o nível atual de qualidade',
      })
    }
  }

  for (const pattern of patterns) {
    insights.push({
      id: uid(), type: 'pattern', category: 'style',
      title: pattern.label,
      description: pattern.description,
      confidence: pattern.confidence,
      evidence: pattern.evidence,
    })
  }

  const allTones = [...new Set(records.map((r) => r.tone).filter(Boolean))]
  if (allTones.length > 2) {
    insights.push({
      id: uid(), type: 'trend', category: 'style',
      title: 'Diversidade de tom de voz',
      description: `${allTones.length} tons diferentes usados — pode indicar experimentação ou falta de diretriz`,
      confidence: 50, evidence: [`Tons: ${allTones.join(', ')}`],
      recommendation: 'Consolidar tom de voz principal para consistência',
    })
  }

  return insights
}

export function processFeedback(
  records: DesignMemoryRecord[],
  projectId: string,
  action: FeedbackAction,
): FeedbackResult {
  const patterns = detectPatterns(records)
  const profile = buildAdaptiveProfile(projectId, records)
  const insights = computeInsights(records, profile, patterns)

  return {
    recordId: records[0]?.id ?? '',
    action,
    patterns,
    profile,
    insights,
  }
}

export function analyzeLearning(
  records: DesignMemoryRecord[],
  projectId: string,
): {
  profile: AdaptiveBrandProfile
  patterns: DetectedPattern[]
  insights: LearningInsight[]
} {
  const patterns = detectPatterns(records)
  const profile = buildAdaptiveProfile(projectId, records)
  const insights = computeInsights(records, profile, patterns)
  return { profile, patterns, insights }
}
