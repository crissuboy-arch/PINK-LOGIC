import { useMemo } from 'react'
import { brandLearning, type BrandLearningResult } from '../learning/BrandLearningEngine'
import { getAdaptiveDesign, type AdaptiveSuggestion } from '../adaptive/AdaptiveBranding'
import type { DetectedPattern } from '../learning/PatternRecognition'
import type { LearningInsight } from '../learning/FeedbackLoop'
import type { MemoryStats } from '../memory/DesignMemory'
import type { CampaignAnalysisResult } from '../adaptive/CampaignPatternAnalyzer'

export interface UseAdaptiveDesignReturn {
  learning: BrandLearningResult
  campaignInsights: CampaignAnalysisResult
  suggestions: AdaptiveSuggestion[]
  profile: BrandLearningResult['profile']
  patterns: DetectedPattern[]
  insights: LearningInsight[]
  stats: MemoryStats
}

export function useAdaptiveDesign(projectId: string): UseAdaptiveDesignReturn {
  const adaptive = useMemo(() => getAdaptiveDesign(projectId), [projectId])

  return {
    learning: adaptive.learning,
    campaignInsights: adaptive.campaignInsights,
    suggestions: adaptive.suggestions,
    profile: adaptive.learning.profile,
    patterns: adaptive.learning.patterns,
    insights: adaptive.learning.insights,
    stats: adaptive.learning.stats,
  }
}
