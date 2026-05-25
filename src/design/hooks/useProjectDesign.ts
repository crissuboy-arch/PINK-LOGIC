import { useMemo } from 'react'
import { OpenDesignEngine } from '../core/OpenDesignEngine'
import type { ProjectBrandInput } from '../tokens/projectTokenTypes'
import type { ResolvedDesign } from '../resolvers/resolveProjectDesign'
import type { DesignValidationResult } from '../resolvers/validateBranding'
import type { CSSVariableMap } from '../resolvers/createCSSVariables'

const engine = new OpenDesignEngine()

export interface UseProjectDesignReturn {
  tokens: Record<string, string | number>
  projectTokens: ResolvedDesign['projectTokens']
  cssVariables: CSSVariableMap['combined']
  brandTheme: ResolvedDesign['brandTheme']
  resolved: ResolvedDesign
  validation: DesignValidationResult
  violations: string[]
  projectId: string | null
}

export function useProjectDesign(brand?: ProjectBrandInput | null): UseProjectDesignReturn {
  const resolved = useMemo(() => engine.resolve(brand ?? null), [brand])

  return {
    tokens: resolved.tokens,
    projectTokens: resolved.projectTokens,
    cssVariables: resolved.cssVariables.combined,
    brandTheme: resolved.brandTheme,
    resolved,
    validation: resolved.validation,
    violations: resolved.violations,
    projectId: resolved.projectId,
  }
}

export { engine as designEngine }
