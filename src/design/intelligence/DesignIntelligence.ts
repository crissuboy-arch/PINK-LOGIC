import type { DesignAnalysisResult, BrandProfile, DesignIssue, RuleInput } from './types'
import { analyzeBranding } from './analyzeBranding'
import { suggestImprovements, suggestFromProfile, type Suggestion } from './suggestImprovements'
import type { ProjectBrandInput } from '../tokens/projectTokenTypes'

export type { DesignAnalysisResult, BrandProfile, DesignIssue, Suggestion }

export class DesignIntelligence {
  private lastAnalysis: DesignAnalysisResult | null = null

  analyze(brand: ProjectBrandInput): DesignAnalysisResult {
    const input = this.toRuleInput(brand)
    const result = analyzeBranding(input)
    this.lastAnalysis = result
    return result
  }

  getSuggestions(analysis?: DesignAnalysisResult): Suggestion[] {
    const target = analysis ?? this.lastAnalysis
    if (!target) return []
    return suggestImprovements(target)
  }

  getStrategicSuggestions(analysis?: DesignAnalysisResult): Suggestion[] {
    const target = analysis ?? this.lastAnalysis
    if (!target) return []
    return suggestFromProfile(target.brandProfile)
  }

  getAllSuggestions(analysis?: DesignAnalysisResult): Suggestion[] {
    const target = analysis ?? this.lastAnalysis
    if (!target) return []
    return [...suggestImprovements(target), ...suggestFromProfile(target.brandProfile)]
  }

  getScore(analysis?: DesignAnalysisResult): number {
    return (analysis ?? this.lastAnalysis)?.score ?? 0
  }

  getSummary(analysis?: DesignAnalysisResult): string {
    return (analysis ?? this.lastAnalysis)?.summary ?? 'Nenhuma análise disponível'
  }

  getLatest(): DesignAnalysisResult | null {
    return this.lastAnalysis
  }

  clear(): void {
    this.lastAnalysis = null
  }

  private toRuleInput(brand: ProjectBrandInput): RuleInput {
    return {
      palette: brand.palette,
      fonts: brand.fonts,
      tone: brand.tone,
      visualStyle: brand.visualStyle,
    }
  }
}

export const designIntelligence = new DesignIntelligence()
