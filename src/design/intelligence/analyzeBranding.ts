import type { DesignAnalysisResult, DesignIssue, BrandProfile, RuleInput, IssueCategory, IssueSeverity } from './types'
import { evaluatePalette } from '../rules/validatePalette'
import { evaluateTypography } from '../rules/validateTypography'
import { evaluateComposition } from '../rules/validateComposition'
import { evaluateConsistency } from '../rules/visualConsistency'

function generateId(): string {
  return crypto.randomUUID()
}

function buildBrandProfile(input: RuleInput): BrandProfile {
  const tone = input.tone ?? ''
  const style = input.visualStyle ?? ''
  const t = tone.toLowerCase()
  const s = style.toLowerCase()

  const profile: BrandProfile = {
    tone: tone || 'não definido',
    luxuryLevel: t.includes('luxo') || t.includes('premium') || s.includes('luxo') || s.includes('elegant') ? 80 : t.includes('acessível') || t.includes('simples') ? 20 : 50,
    modernity: t.includes('moderno') || t.includes('tech') || t.includes('digital') || s.includes('moderno') ? 80 : t.includes('clássico') || t.includes('tradicional') ? 20 : 50,
    minimalism: s.includes('minimalista') || s.includes('clean') ? 80 : s.includes('complexo') || s.includes('detalhado') ? 20 : 50,
    vibrancy: 50,
    warmth: 50,
    formality: t.includes('profissional') || t.includes('formal') || t.includes('corporativo') ? 75 : t.includes('casual') || t.includes('descontraído') ? 25 : 50,
    playfulness: t.includes('divertido') || t.includes('jovem') || t.includes('criativo') ? 75 : t.includes('sério') || t.includes('formal') ? 15 : 40,
    targetAudience: [],
    emotionalStyle: [],
  }

  if (input.palette) {
    const isLight = (hex: string): boolean => {
      const clean = hex.replace('#', '')
      const full = clean.length === 3 ? clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2] : clean
      const num = parseInt(full, 16)
      if (isNaN(num)) return false
      const r = (num >> 16) & 255, g = (num >> 8) & 255, b = num & 255
      return 0.299 * r + 0.587 * g + 0.114 * b > 160
    }
    const brightCount = Object.values(input.palette).filter((c) => /^#[0-9A-Fa-f]{6}$/.test(c) && isLight(c)).length
    profile.vibrancy = Math.min(100, brightCount * 20 + 10)
    profile.warmth = input.palette.accent.toLowerCase() === '#ffd700' ? 70 : input.palette.primary.toLowerCase() === '#ff2d8d' ? 65 : 50
  }

  if (input.fonts) {
    const luxury = ['Playfair Display', 'Cormorant', 'Cinzel', 'Cardo']
    profile.luxuryLevel = luxury.some((f) => input.fonts!.heading?.toLowerCase().includes(f.toLowerCase())) ? 80 : profile.luxuryLevel
  }

  return profile
}

function computeScores(issues: DesignIssue[]): {
  score: number; brandingStrength: number; readability: number; contrast: number; consistency: number; composition: number; accessibility: number
} {
  const scoreByCategory: Record<string, { total: number; count: number }> = {
    color: { total: 100, count: 1 },
    typography: { total: 100, count: 1 },
    composition: { total: 100, count: 1 },
    consistency: { total: 100, count: 1 },
    accessibility: { total: 100, count: 1 },
    branding: { total: 100, count: 1 },
  }

  const penalties: Record<string, number> = {
    critical: 30,
    major: 15,
    minor: 7,
    info: 3,
  }

  for (const issue of issues) {
    const cat = scoreByCategory[issue.category]
    if (cat) {
      cat.total = Math.max(0, cat.total - (penalties[issue.severity] ?? 5))
    }
  }

  const all = Object.values(scoreByCategory)
  const totalScore = Math.round(all.reduce((s, c) => s + c.total, 0) / all.length)

  return {
    score: totalScore,
    brandingStrength: Math.round(scoreByCategory.color.total * 0.5 + scoreByCategory.consistency.total * 0.3 + scoreByCategory.typography.total * 0.2),
    readability: Math.round(scoreByCategory.typography.total * 0.6 + scoreByCategory.accessibility.total * 0.4),
    contrast: Math.round(scoreByCategory.accessibility.total),
    consistency: Math.round(scoreByCategory.consistency.total),
    composition: Math.round(scoreByCategory.composition.total),
    accessibility: Math.round(scoreByCategory.accessibility.total),
  }
}

function buildSummary(
  scores: ReturnType<typeof computeScores>,
  issues: DesignIssue[],
): string {
  const errors = issues.filter((i) => i.severity === 'critical' || i.severity === 'major').length
  const warnings = issues.filter((i) => i.severity === 'minor').length
  if (scores.score >= 90) return 'Branding excelente. Identidade visual forte e consistente.'
  if (scores.score >= 70) return `Branding bom. ${errors} ajuste(s) crítico(s) e ${warnings} melhoria(s) sugerida(s).`
  if (scores.score >= 50) return `Branding precisa de atenção. ${errors} problema(s) e ${warnings} ajuste(s) recomendado(s).`
  return `Branding crítico. ${errors} erro(s) grave(is) precisam ser corrigidos para garantir qualidade visual.`
}

export function analyzeBranding(input: RuleInput): DesignAnalysisResult {
  const paletteIssues = evaluatePalette(input)
  const typographyIssues = evaluateTypography(input)
  const compositionIssues = evaluateComposition(input)
  const consistencyIssues = evaluateConsistency(input)

  const allIssues: DesignIssue[] = [...paletteIssues, ...typographyIssues, ...compositionIssues, ...consistencyIssues]
  const brandProfile = buildBrandProfile(input)
  const scores = computeScores(allIssues)

  return {
    ...scores,
    issues: allIssues,
    violations: allIssues.filter((i) => i.type === 'violation'),
    warnings: allIssues.filter((i) => i.type === 'warning'),
    suggestions: allIssues.filter((i) => i.type === 'suggestion'),
    brandProfile,
    summary: buildSummary(scores, allIssues),
  }
}
