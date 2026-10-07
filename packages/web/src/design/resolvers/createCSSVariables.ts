import { systemTokens } from '../tokens/systemTokens'
import type { ProjectBrandInput, ProjectTokens } from '../tokens/projectTokenTypes'
import { buildProjectTokens } from '../tokens/projectTokenTypes'

export interface CSSVariableMap {
  system: Record<string, string>
  project: Record<string, string>
  combined: Record<string, string>
}

function tokenKeyToCSSVar(key: string): string {
  return `--pl-${key.replace(/\./g, '-')}`
}

function projectKeyToCSSVar(key: string): string {
  return `--${key.replace(/\./g, '-')}`
}

export function createSystemCSSVariables(): Record<string, string> {
  const vars: Record<string, string> = {}
  for (const [key, token] of Object.entries(systemTokens)) {
    vars[tokenKeyToCSSVar(key)] = String(token.value)
  }
  vars['--pl-gradient'] = 'linear-gradient(135deg, #FF2D8D 0%, #B026FF 100%)'
  return vars
}

export function createProjectCSSVariables(brand: ProjectBrandInput): Record<string, string> {
  const tokens = buildProjectTokens(brand)
  const vars: Record<string, string> = {}
  for (const [key, value] of Object.entries(tokens)) {
    vars[projectKeyToCSSVar(key)] = String(value)
  }
  return vars
}

export function createFullCSSVariables(brand?: ProjectBrandInput | null): CSSVariableMap {
  const system = createSystemCSSVariables()
  const project = brand ? createProjectCSSVariables(brand) : {}

  return {
    system,
    project,
    combined: { ...system, ...project },
  }
}
