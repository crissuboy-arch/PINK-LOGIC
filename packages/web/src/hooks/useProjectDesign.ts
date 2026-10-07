import { useMemo, useRef } from 'react'
import { useBrand } from '../providers/BrandProvider'
import { OpenDesignEngine, type ResolvedDesign } from '../open-design/openDesignEngine'
import { VisualRules, type RuleResult } from '../open-design/visualRules'
import type { BrandSchema } from '../providers/BrandProvider'

export interface UseProjectDesignReturn {
  tokens: Record<string, string | number>
  brandTheme: ResolvedDesign['brandTheme']
  resolvedDesign: ResolvedDesign
  violations: string[]
  visualRules: RuleResult[]
  projectBranding: BrandSchema | null
  cssVariables: Record<string, string>
}

const ENGINE_INSTANCE = new OpenDesignEngine()
const RULES_INSTANCE = new VisualRules()

export function useProjectDesign(brandOverride?: BrandSchema | null): UseProjectDesignReturn {
  const { activeBrand } = useBrand()

  const brand = brandOverride !== undefined ? brandOverride : activeBrand

  const resolved = useMemo(() => ENGINE_INSTANCE.resolveProjectDesign(brand), [brand])

  const rules = useMemo(() => {
    if (!brand) return []
    return RULES_INSTANCE.evaluate(brand)
  }, [brand])

  const cssVars = useMemo(() => ENGINE_INSTANCE.getCSSVariables(brand), [brand])

  return {
    tokens: resolved.tokens,
    brandTheme: resolved.brandTheme,
    resolvedDesign: resolved,
    violations: resolved.violations,
    visualRules: rules,
    projectBranding: brand,
    cssVariables: cssVars,
  }
}
