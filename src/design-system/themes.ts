import { pinkLogicTokens } from './tokens'
import type { BrandSchema } from '../providers/BrandProvider'

export interface Theme {
  id: string
  name: string
  tokens: Record<string, string | number>
  isPlatform: boolean
}

export const pinkLogicTheme: Theme = {
  id: 'pink-logic',
  name: 'Pink Logic',
  isPlatform: true,
  tokens: Object.fromEntries(
    Object.entries(pinkLogicTokens).map(([k, t]) => [k, t.value])
  ),
}

export function createProjectTheme(brand: BrandSchema): Theme {
  return {
    id: `project-${brand.projectId}`,
    name: brand.name,
    isPlatform: false,
    tokens: {
      // Inherits platform defaults, overrides with project branding
      'color.primary': brand.palette.primary,
      'color.secondary': brand.palette.secondary,
      'color.accent': brand.palette.accent,
      'color.background': brand.palette.background,
      'color.text': brand.palette.text,
      'typography.family.heading': brand.typography.heading,
      'typography.family.body': brand.typography.body,
    },
  }
}

export function isPlatformToken(tokenKey: string): boolean {
  const platformTokens = [
    'color.surface',
    'color.textMuted',
    'color.border',
    'color.error',
    'color.success',
    'color.warning',
    'spacing',
    'radius',
  ]
  return platformTokens.some(p => tokenKey.startsWith(p))
}

export function resolveTheme(base: Theme, projectTheme?: Theme): Record<string, string | number> {
  if (!projectTheme) return base.tokens
  return {
    ...base.tokens,
    ...Object.fromEntries(
      Object.entries(projectTheme.tokens).filter(
        ([key]) => !isPlatformToken(key)
      )
    ),
  }
}
