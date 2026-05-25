import type { VisualRule, DesignIssue, RuleInput } from '../intelligence/types'

let idCounter = 0
function uid(): string { return `rule-${++idCounter}` }

function isHex(v: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(v)
}

function isLight(hex: string): boolean {
  const clean = hex.replace('#', '')
  const full = clean.length === 3 ? clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2] : clean
  const num = parseInt(full, 16)
  if (isNaN(num)) return false
  const r = (num >> 16) & 255, g = (num >> 8) & 255, b = num & 255
  return 0.299 * r + 0.587 * g + 0.114 * b > 160
}

export const validateCompositionRules: VisualRule[] = [
  {
    id: 'missing-accent',
    name: 'CTA sem destaque',
    category: 'composition',
    severity: 'major',
    evaluate(input: RuleInput): DesignIssue | null {
      if (!input.palette) return null
      const { primary, secondary, accent, background } = input.palette
      const colors = [primary, secondary, accent].filter(isHex)
      if (colors.length === 0) return null
      const bg = isHex(background) ? background : '#000000'
      const noHighContrast = colors.every((c) => {
        const clean = c.replace('#', '')
        const num = parseInt(clean.length === 3 ? clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2] : clean, 16)
        if (isNaN(num)) return true
        const r = (num >> 16) & 255, g = (num >> 8) & 255, b = num & 255
        const lum = 0.299 * r + 0.587 * g + 0.114 * b
        const bgLum = isLight(bg) ? 200 : 20
        return Math.abs(lum - bgLum) < 80
      })
      if (noHighContrast) {
        return {
          id: uid(), type: 'warning', category: 'composition', severity: 'major',
          title: 'CTA sem destaque',
          description: 'Nenhuma cor da paleta se destaca o suficiente do fundo para CTAs ou ações principais',
          fix: 'Adicionar uma cor de accent vibrante (ex: #FFD700) ou aumentar contraste da primary',
          rule: 'missing-accent',
        }
      }
      return null
    },
  },
  {
    id: 'no-hierarchy',
    name: 'Hierarquia visual fraca',
    category: 'composition',
    severity: 'minor',
    evaluate(input: RuleInput): DesignIssue | null {
      if (!input.palette || !input.fonts) return null
      const { heading, body } = input.fonts
      if (!heading || !body) return null
      if (heading.toLowerCase() === body.toLowerCase()) {
        const colors = Object.values(input.palette).filter(isHex)
        const unique = new Set(colors.map((c) => c.toLowerCase()))
        if (unique.size < 3) {
          return {
            id: uid(), type: 'suggestion', category: 'composition', severity: 'minor',
            title: 'Hierarquia visual fraca',
            description: 'Fontes iguais e poucas cores distintas dificultam criar hierarquia visual',
            fix: 'Diferenciar fontes (heading ≠ body) e usar 3+ cores para criar camadas visuais',
            rule: 'no-hierarchy',
          }
        }
      }
      return null
    },
  },
  {
    id: 'inconsistent-spacing',
    name: 'Spacing inconsistente',
    category: 'composition',
    severity: 'minor',
    evaluate(input: RuleInput): DesignIssue | null {
      if (!input.spacing) return null
      const values = Object.values(input.spacing).filter((v): v is number => typeof v === 'number')
      if (values.length < 3) return null
      const ratios: number[] = []
      for (let i = 1; i < values.length; i++) {
        if (values[i - 1] > 0) ratios.push(values[i] / values[i - 1])
      }
      const avg = ratios.reduce((s, r) => s + r, 0) / ratios.length
      const hasInconsistent = ratios.some((r) => Math.abs(r - avg) > 1)
      if (hasInconsistent) {
        return {
          id: uid(), type: 'suggestion', category: 'composition', severity: 'minor',
          title: 'Spacing inconsistente',
          description: 'Razões entre valores de spacing não são uniformes — escala parece irregular',
          fix: 'Adotar escala consistente (ex: 4, 8, 16, 24, 32, 48 — ou 4, 12, 20, 28, 36)',
          rule: 'inconsistent-spacing',
        }
      }
      return null
    },
  },
  {
    id: 'inconsistent-radius',
    name: 'Radius inconsistente',
    category: 'composition',
    severity: 'info',
    evaluate(input: RuleInput): DesignIssue | null {
      if (!input.radius) return null
      const values = Object.values(input.radius).filter((v): v is number => typeof v === 'number')
      if (values.length < 3) return null
      if (values.includes(9999)) return null
      const max = Math.max(...values)
      const min = Math.min(...values)
      if (max > 0 && min > 0 && max / min > 8) {
        return {
          id: uid(), type: 'suggestion', category: 'composition', severity: 'info',
          title: 'Variação grande de radius',
          description: `Maior radius (${max}px) é ${(max / min).toFixed(1)}x o menor (${min}px) — pode parecer inconsistente`,
          fix: 'Limitar variação de radius a 4x entre o menor e o maior valor',
          rule: 'inconsistent-radius',
        }
      }
      return null
    },
  },
  {
    id: 'excess-bright-colors',
    name: 'Excesso de cores vibrantes',
    category: 'composition',
    severity: 'minor',
    evaluate(input: RuleInput): DesignIssue | null {
      if (!input.palette) return null
      const bright = Object.values(input.palette).filter((c) => isHex(c) && isLight(c))
      if (bright.length >= 4) {
        return {
          id: uid(), type: 'warning', category: 'composition', severity: 'minor',
          title: 'Excesso de cores claras/vibrantes',
          description: `${bright.length} cores claras podem causar cansaço visual e falta de contraste`,
          fix: 'Equilibrar com cores escuras para criar profundidade e contraste',
          rule: 'excess-bright-colors',
        }
      }
      return null
    },
  },
]

export function evaluateComposition(input: RuleInput): DesignIssue[] {
  return validateCompositionRules.map((r) => r.evaluate(input)).filter(Boolean) as DesignIssue[]
}
