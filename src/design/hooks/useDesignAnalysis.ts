import { useMemo } from 'react'
import { DesignIntelligence } from '../intelligence/DesignIntelligence'
import type { DesignAnalysisResult, Suggestion } from '../intelligence/DesignIntelligence'
import type { ProjectBrandInput } from '../tokens/projectTokenTypes'

const engine = new DesignIntelligence()

export interface UseDesignAnalysisReturn {
  analysis: DesignAnalysisResult | null
  score: number
  summary: string
  suggestions: Suggestion[]
  strategicSuggestions: Suggestion[]
  allSuggestions: Suggestion[]
  isLoading: boolean
}

export function useDesignAnalysis(brand?: ProjectBrandInput | null): UseDesignAnalysisReturn {
  const result = useMemo(() => {
    if (!brand) return null
    return engine.analyze(brand)
  }, [brand])

  const suggestions = useMemo(() => {
    if (!result) return []
    return engine.getSuggestions(result)
  }, [result])

  const strategic = useMemo(() => {
    if (!result) return []
    return engine.getStrategicSuggestions(result)
  }, [result])

  const all = useMemo(() => {
    if (!result) return []
    return [...suggestions, ...strategic]
  }, [suggestions, strategic])

  return {
    analysis: result,
    score: result?.score ?? 0,
    summary: result?.summary ?? '',
    suggestions,
    strategicSuggestions: strategic,
    allSuggestions: all,
    isLoading: false,
  }
}
