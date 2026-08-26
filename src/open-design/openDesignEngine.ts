import { pinkLogicTokens } from '../design-system/tokens'
import { pinkLogicTheme, createProjectTheme, resolveTheme } from '../design-system/themes'
import { BrandInterpreter } from './brandInterpreter'
import { VisualRules } from './visualRules'
import type { BrandSchema } from '../providers/BrandProvider'

export interface ResolvedDesign {
  tokens: Record<string, string | number>
  brandTheme: ReturnType<typeof createProjectTheme> | null
  violations: string[]
}

export class OpenDesignEngine {
  private brandInterpreter = new BrandInterpreter()
  private visualRules = new VisualRules()

  resolveProjectDesign(brand?: BrandSchema | null): ResolvedDesign {
    const violations: string[] = []

    if (!brand) {
      return {
        tokens: { ...pinkLogicTheme.tokens },
        brandTheme: null,
        violations: [],
      }
    }

    const interpreted = this.brandInterpreter.interpret(brand)
    const projectTheme = createProjectTheme(brand)
    const merged = resolveTheme(pinkLogicTheme, projectTheme)

    const ruleResults = this.visualRules.evaluate(brand)
    for (const r of ruleResults) {
      if (!r.passed) violations.push(r.message)
    }

    return {
      tokens: merged,
      brandTheme: projectTheme,
      violations,
    }
  }

  getCSSVariables(brand?: BrandSchema | null): Record<string, string> {
    const { tokens } = this.resolveProjectDesign(brand)
    const vars: Record<string, string> = {}
    for (const [key, value] of Object.entries(tokens)) {
      const cssKey = `--pl-${key.replace(/\./g, '-')}`
      vars[cssKey] = String(value)
    }
    vars['--pl-brand-primary'] = brand?.palette.primary ?? pinkLogicTokens['color.primary'].value as string
    vars['--pl-brand-secondary'] = brand?.palette.secondary ?? pinkLogicTokens['color.secondary'].value as string
    vars['--pl-brand-accent'] = brand?.palette.accent ?? pinkLogicTokens['color.accent'].value as string
    return vars
  }

  isProjectToken(tokenKey: string): boolean {
    return ['color.primary', 'color.secondary', 'color.accent', 'color.background', 'color.text',
            'typography.family.heading', 'typography.family.body'].includes(tokenKey)
  }
}
