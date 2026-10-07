import { VisualRules, type RuleResult } from './visualRules'
import { BrandInterpreter } from './brandInterpreter'
import { isHexColor, isColorLight, contrastText } from '../design-system/colors'
import type { BrandSchema } from '../providers/BrandProvider'

export interface ValidationReport {
  valid: boolean
  brandName: string
  results: RuleResult[]
  errors: number
  warnings: number
  suggestions: string[]
}

export class DesignValidator {
  private visualRules = new VisualRules()
  private brandInterpreter = new BrandInterpreter()

  validate(brand: BrandSchema): ValidationReport {
    const results = this.visualRules.evaluate(brand)
    const errors = results.filter(r => r.severity === 'error').length
    const warnings = results.filter(r => r.severity === 'warning').length
    const suggestions: string[] = []

    if (!isHexColor(brand.palette.primary)) {
      suggestions.push('Cor primária não é um hex válido')
    }

    const interpreted = this.brandInterpreter.interpret(brand)
    if (interpreted.palette.primary === interpreted.palette.background) {
      suggestions.push('Cor primária igual ao fundo — elementos podem desaparecer')
    }

    const expectedText = contrastText(brand.palette.background)
    if (brand.palette.text.toLowerCase() !== expectedText.toLowerCase()) {
      suggestions.push(`Considere usar ${expectedText} como cor de texto para melhor contraste`)
    }

    if (!brand.typography.heading && !brand.typography.body) {
      suggestions.push('Nenhuma fonte definida — use ao menos uma fonte heading ou body')
    }

    return {
      valid: errors === 0,
      brandName: brand.name,
      results,
      errors,
      warnings,
      suggestions,
    }
  }

  isBrandUsable(brand: BrandSchema): boolean {
    const report = this.validate(brand)
    return report.valid
  }
}
