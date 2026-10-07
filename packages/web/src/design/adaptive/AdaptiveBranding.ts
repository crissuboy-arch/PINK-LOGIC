import { DesignMemory, type DesignMemoryRecord } from '../memory/DesignMemory'
import { BrandLearningEngine, type BrandLearningResult } from '../learning/BrandLearningEngine'
import { analyzeCampaignPatterns, type CampaignAnalysisResult } from './CampaignPatternAnalyzer'
import { DesignIntelligence, type DesignAnalysisResult } from '../intelligence/DesignIntelligence'
import type { ProjectBrandInput } from '../tokens/projectTokenTypes'

export interface AdaptiveSuggestion {
  id: string
  type: 'style' | 'palette' | 'typography' | 'composition' | 'cta'
  title: string
  description: string
  confidence: number
  basedOn: string
  suggestedValue: string | Record<string, string>
}

export interface AdaptiveDesignResult {
  learning: BrandLearningResult
  campaignInsights: CampaignAnalysisResult
  suggestions: AdaptiveSuggestion[]
}

let counter = 0
function uid(): string { return `adapt-${++counter}` }

function generateAdaptiveSuggestions(
  learning: BrandLearningResult,
  campaignInsights: CampaignAnalysisResult,
): AdaptiveSuggestion[] {
  const suggestions: AdaptiveSuggestion[] = []
  const { profile } = learning

  if (profile.preferredRadius === 'rounded') {
    suggestions.push({
      id: uid(), type: 'composition', title: 'Usar cantos arredondados',
      description: 'Seu histórico mostra preferência por radius alto',
      confidence: 80, basedOn: `${profile.totalRecords} registros de design`,
      suggestedValue: '16px',
    })
  }

  if (profile.preferredSpacing === 'loose') {
    suggestions.push({
      id: uid(), type: 'composition', title: 'Manter espaçamento amplo',
      description: 'Layouts com bastante espaço têm melhor aceitação',
      confidence: 75, basedOn: 'Preferência detectada em designs aprovados',
      suggestedValue: '32px',
    })
  }

  if (profile.preferredCTAStyle === 'neon') {
    suggestions.push({
      id: uid(), type: 'cta', title: 'CTA com efeito neon',
      description: 'CTAs vibrantes com glow performam melhor nos seus projetos',
      confidence: 82, basedOn: 'Padrão de aprovação de CTAs',
      suggestedValue: 'accent (#FFD700) com box-shadow glow',
    })
  }

  if (profile.preferredVisualStyle) {
    suggestions.push({
      id: uid(), type: 'style', title: `Manter estilo "${profile.preferredVisualStyle}"`,
      description: `Este estilo visual é o mais recorrente nos seus designs aprovados`,
      confidence: 70, basedOn: 'Frequência de estilo',
      suggestedValue: profile.preferredVisualStyle,
    })
  }

  if (profile.recurringPalette.primary) {
    suggestions.push({
      id: uid(), type: 'palette', title: 'Paleta recorrente detectada',
      description: `Primary "${profile.recurringPalette.primary}" aparece em múltiplos projetos`,
      confidence: 65, basedOn: 'Análise de paletas aprovadas',
      suggestedValue: profile.recurringPalette.primary,
    })
  }

  if (campaignInsights.bestPerforming) {
    const bp = campaignInsights.bestPerforming
    suggestions.push({
      id: uid(), type: 'style', title: 'Inspirar-se na melhor campanha',
      description: `Campanha com score ${bp.averageScore} usa estilos: ${bp.topStyles.join(', ')}`,
      confidence: 60, basedOn: `Score ${bp.averageScore} em ${bp.totalDesigns} designs`,
      suggestedValue: bp.topStyles[0] ?? '',
    })
  }

  return suggestions
}

export function getAdaptiveDesign(projectId: string): AdaptiveDesignResult {
  const engine = new BrandLearningEngine()
  const learning = engine.learn(projectId)
  const campaignInsights = analyzeCampaignPatterns()
  const suggestions = generateAdaptiveSuggestions(learning, campaignInsights)

  return { learning, campaignInsights, suggestions }
}

export function suggestBrandForProject(
  projectId: string,
  currentBrand?: ProjectBrandInput,
): { suggestions: AdaptiveSuggestion[]; brand: ProjectBrandInput } {
  const engine = new BrandLearningEngine()
  const profile = engine.getProfile(projectId)

  const brand: ProjectBrandInput = {
    palette: {
      primary: profile.recurringPalette.primary ?? currentBrand?.palette?.primary ?? '#FF2D8D',
      secondary: profile.recurringPalette.secondary ?? currentBrand?.palette?.secondary ?? '#7B2D8E',
      accent: profile.recurringPalette.accent ?? currentBrand?.palette?.accent ?? '#FFD700',
      background: currentBrand?.palette?.background ?? '#0D0D12',
      text: currentBrand?.palette?.text ?? '#FFFFFF',
    },
    fonts: {
      heading: profile.fontPreferences.heading ?? currentBrand?.fonts?.heading ?? 'Outfit',
      body: profile.fontPreferences.body ?? currentBrand?.fonts?.body ?? 'Inter',
    },
    tone: profile.tonePreferences[0] ?? currentBrand?.tone ?? '',
    visualStyle: profile.preferredVisualStyle ?? currentBrand?.visualStyle ?? '',
  }

  const result = getAdaptiveDesign(projectId)
  return { suggestions: result.suggestions, brand }
}
