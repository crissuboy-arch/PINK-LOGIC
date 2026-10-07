import { DesignMemory, type DesignMemoryRecord } from '../memory/DesignMemory'
import { buildAdaptiveProfile, type AdaptiveBrandProfile } from '../learning/PreferenceTracker'

export interface CampaignPattern {
  campaignId: string
  campaignName: string
  averageScore: number
  totalDesigns: number
  topStyles: string[]
  performance: 'high' | 'medium' | 'low'
  paletteSignature: Record<string, string>
}

export interface CampaignAnalysisResult {
  patterns: CampaignPattern[]
  bestPerforming: CampaignPattern | null
  recommendations: string[]
}

function generateId(): string {
  return crypto.randomUUID()
}

export function analyzeCampaignPatterns(): CampaignAnalysisResult {
  const all = DesignMemory.getAll()
  const byProject = new Map<string, DesignMemoryRecord[]>()

  for (const record of all) {
    const existing = byProject.get(record.projectId) ?? []
    existing.push(record)
    byProject.set(record.projectId, existing)
  }

  const patterns: CampaignPattern[] = []
  for (const [projectId, records] of byProject) {
    const accepted = records.filter((r) => r.accepted)
    const scores = records.map((r) => r.score)
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0

    const styleCount = new Map<string, number>()
    for (const r of records) {
      if (r.style) styleCount.set(r.style, (styleCount.get(r.style) ?? 0) + 1)
    }
    const topStyles = [...styleCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([s]) => s)

    const last = records[records.length - 1]
    const paletteSignature = last?.palette ? { ...last.palette } : {}

    patterns.push({
      campaignId: projectId,
      campaignName: `Projeto ${projectId.slice(0, 8)}`,
      averageScore: avgScore,
      totalDesigns: records.length,
      topStyles,
      performance: avgScore >= 75 ? 'high' : avgScore >= 50 ? 'medium' : 'low',
      paletteSignature,
    })
  }

  const sorted = [...patterns].sort((a, b) => b.averageScore - a.averageScore)
  const bestPerforming = sorted[0] ?? null

  const recommendations: string[] = []
  if (bestPerforming) {
    recommendations.push(`Campanha "${bestPerforming.campaignName}" tem melhor score (${bestPerforming.averageScore}) — analisar estilos usados`)
    if (bestPerforming.topStyles.length > 0) {
      recommendations.push(`Estilos de alto desempenho: ${bestPerforming.topStyles.join(', ')}`)
    }
  }
  const lowPerforming = patterns.filter((p) => p.performance === 'low')
  if (lowPerforming.length > 0) {
    recommendations.push(`${lowPerforming.length} campanha(s) com performance baixa — revisar branding`)
  }

  return { patterns, bestPerforming, recommendations }
}
