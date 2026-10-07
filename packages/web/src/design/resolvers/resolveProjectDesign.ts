import { systemTokens } from '../tokens/systemTokens'
import type { ProjectBrandInput, ProjectTokens } from '../tokens/projectTokenTypes'
import { buildProjectTokens } from '../tokens/projectTokenTypes'
import { mergeTokens } from './tokenIsolation'
import { validateBranding, type DesignValidationResult } from './validateBranding'
import { createFullCSSVariables, type CSSVariableMap } from './createCSSVariables'

export interface ResolvedDesign {
  tokens: Record<string, string | number>
  projectTokens: ProjectTokens | null
  cssVariables: CSSVariableMap
  validation: DesignValidationResult
  brandTheme: {
    palette: ProjectBrandInput['palette']
    fonts: ProjectBrandInput['fonts']
    tone: string
    visualStyle: string
  } | null
  projectId: string | null
  violations: string[]
}

export function resolveProjectDesign(brand?: ProjectBrandInput | null): ResolvedDesign {
  const systemBase: Record<string, string | number> = {}
  for (const [key, token] of Object.entries(systemTokens)) {
    systemBase[key] = token.value
  }

  if (!brand) {
    return {
      tokens: systemBase,
      projectTokens: null,
      cssVariables: createFullCSSVariables(null),
      validation: { valid: true, issues: [], score: 100 },
      brandTheme: null,
      projectId: null,
      violations: [],
    }
  }

  const validation = validateBranding(brand)
  const projectTokens = buildProjectTokens(brand)
  const projectOverrides: Record<string, string | number> = {}
  for (const [key, value] of Object.entries(projectTokens)) {
    const systemKey = key.replace(/^project\./, '')
    if (key.startsWith('project.color.')) {
      projectOverrides[`color.${key.slice('project.color.'.length)}`] = value
    }
    if (key.startsWith('project.typography.family.')) {
      projectOverrides[`typography.family.${key.slice('project.typography.family.'.length)}`] = value
    }
  }

  const { merged, rejected } = mergeTokens(systemBase, projectOverrides)

  const cssVariables = createFullCSSVariables(brand)

  return {
    tokens: merged,
    projectTokens,
    cssVariables,
    validation,
    brandTheme: {
      palette: brand.palette,
      fonts: brand.fonts,
      tone: brand.tone ?? '',
      visualStyle: brand.visualStyle ?? '',
    },
    projectId: brand.projectId ?? null,
    violations: [
      ...validation.issues.filter((i) => i.severity === 'error').map((i) => i.message),
      ...rejected.map((r) => r.reason),
    ],
  }
}
