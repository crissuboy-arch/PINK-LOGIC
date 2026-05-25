import { isColorLight, hexToRgb } from '../design-system/colors'
import type { BrandSchema } from '../providers/BrandProvider'

export interface RuleResult {
  rule: string
  passed: boolean
  message: string
  severity: 'error' | 'warning' | 'info'
}

export class VisualRules {
  evaluate(brand: BrandSchema): RuleResult[] {
    return [
      this.checkPaletteContrast(brand),
      this.checkFontPairing(brand),
      this.checkPaletteCompleteness(brand),
      this.checkPrimaryVisibility(brand),
    ]
  }

  private checkPaletteContrast(brand: BrandSchema): RuleResult {
    const bg = brand.palette.background
    const text = brand.palette.text
    const textOnBg = isColorLight(bg) ? '#000000' : '#FFFFFF'
    const ok = text === textOnBg || text.toLowerCase() === textOnBg.toLowerCase()
    return {
      rule: 'palette-contrast',
      passed: ok,
      message: ok
        ? 'Contraste entre fundo e texto OK'
        : `Texto (${text}) pode ter contraste baixo com fundo (${bg}). Recomendado: ${textOnBg}`,
      severity: ok ? 'info' : 'warning',
    }
  }

  private checkFontPairing(brand: BrandSchema): RuleResult {
    const noHeading = !brand.typography.heading || brand.typography.heading.trim() === ''
    const noBody = !brand.typography.body || brand.typography.body.trim() === ''
    if (noHeading && noBody) {
      return { rule: 'font-pairing', passed: false, message: 'Defina ao menos uma fonte', severity: 'error' }
    }
    return { rule: 'font-pairing', passed: true, message: 'Fontes configuradas', severity: 'info' }
  }

  private checkPaletteCompleteness(brand: BrandSchema): RuleResult {
    const palette = brand.palette
    const required = ['primary', 'secondary', 'accent', 'background', 'text']
    const missing = required.filter(k => !palette[k as keyof typeof palette])
    if (missing.length > 0) {
      return {
        rule: 'palette-completeness',
        passed: false,
        message: `Cores ausentes na paleta: ${missing.join(', ')}`,
        severity: 'error',
      }
    }
    return { rule: 'palette-completeness', passed: true, message: 'Paleta completa', severity: 'info' }
  }

  private checkPrimaryVisibility(brand: BrandSchema): RuleResult {
    const primary = brand.palette.primary
    const bg = brand.palette.background
    const rgb = hexToRgb(primary)
    const bgRgb = hexToRgb(bg)
    if (!rgb || !bgRgb) {
      return { rule: 'primary-visibility', passed: false, message: 'Cor primária ou fundo inválidos', severity: 'error' }
    }
    const contrast = Math.abs(rgb.r - bgRgb.r) + Math.abs(rgb.g - bgRgb.g) + Math.abs(rgb.b - bgRgb.b)
    const passed = contrast > 200
    return {
      rule: 'primary-visibility',
      passed,
      message: passed ? 'Cor primária visível sobre o fundo' : 'Cor primária pode não ser visível — contraste baixo com o fundo',
      severity: passed ? 'info' : 'warning',
    }
  }
}
