import type { VisualRule, DesignIssue, RuleInput } from '../intelligence/types'

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '')
  const full = clean.length === 3 ? clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2] : clean
  if (full.length !== 6) return null
  const num = parseInt(full, 16)
  if (isNaN(num)) return null
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 }
}

function luminance(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0
  return 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b
}

function contrast(a: string, b: string): number {
  const l1 = luminance(a) + 0.05
  const l2 = luminance(b) + 0.05
  return l1 > l2 ? l1 / l2 : l2 / l1
}

function isHex(v: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(v)
}

function hslLike(hex: string): { h: number; s: number; l: number } {
  const rgb = hexToRgb(hex)
  if (!rgb) return { h: 0, s: 0, l: 0 }
  const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l: l * 100 }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6
  return { h: h * 360, s: s * 100, l: l * 100 }
}

function hueDistance(a: string, b: string): number {
  const ha = hslLike(a).h, hb = hslLike(b).h
  const d = Math.abs(ha - hb)
  return Math.min(d, 360 - d)
}

let idCounter = 0
function uid(): string { return `rule-${++idCounter}` }

export const validatePaletteRules: VisualRule[] = [
  {
    id: 'excess-colors',
    name: 'Excesso de cores na paleta',
    category: 'color',
    severity: 'minor',
    evaluate(input: RuleInput): DesignIssue | null {
      if (!input.palette) return null
      const colors = Object.values(input.palette).filter(isHex)
      const unique = new Set(colors.map((c) => c.toLowerCase()))
      if (unique.size > 5) {
        return {
          id: uid(), type: 'warning', category: 'color', severity: 'minor',
          title: 'Excesso de cores',
          description: `Paleta contém ${unique.size} cores distintas. Considere reduzir para 3-5.`,
          fix: 'Simplificar paleta removendo cores não essenciais',
          rule: 'excess-colors',
        }
      }
      return null
    },
  },
  {
    id: 'duplicate-colors',
    name: 'Cores duplicadas na paleta',
    category: 'color',
    severity: 'major',
    evaluate(input: RuleInput): DesignIssue | null {
      if (!input.palette) return null
      const map = new Map<string, string[]>()
      for (const [key, val] of Object.entries(input.palette)) {
        const low = val.toLowerCase()
        if (!map.has(low)) map.set(low, [])
        map.get(low)!.push(key)
      }
      for (const [, keys] of map) {
        if (keys.length > 1) {
          return {
            id: uid(), type: 'violation', category: 'color', severity: 'major',
            title: 'Cores duplicadas',
            description: `Os campos ${keys.join(', ')} têm a mesma cor. Eles devem ser visualmente distintos.`,
            field: keys[0], value: input.palette[keys[0] as keyof typeof input.palette],
            fix: `Atribuir cores diferentes para ${keys.join(' e ')}`,
            rule: 'duplicate-colors',
          }
        }
      }
      return null
    },
  },
  {
    id: 'low-contrast-text',
    name: 'Contraste texto/fundo insuficiente',
    category: 'accessibility',
    severity: 'critical',
    evaluate(input: RuleInput): DesignIssue | null {
      if (!input.palette) return null
      const { text, background } = input.palette
      if (!isHex(text) || !isHex(background)) return null
      const ratio = contrast(text, background)
      if (ratio < 4.5) {
        return {
          id: uid(), type: 'violation', category: 'accessibility', severity: 'critical',
          title: 'Contraste insuficiente',
          description: `Texto (${text}) sobre fundo (${background}): ${ratio.toFixed(1)}:1. Mínimo WCAG AA: 4.5:1`,
          field: 'text', value: text, expected: `cor com contraste ≥ 4.5:1 contra ${background}`,
          fix: `Escurecer ou clarear o texto para obter contraste ≥ 4.5:1`,
          rule: 'low-contrast-text',
        }
      }
      return null
    },
  },
  {
    id: 'primary-background-contrast',
    name: 'Cor primária desaparece no fundo',
    category: 'color',
    severity: 'major',
    evaluate(input: RuleInput): DesignIssue | null {
      if (!input.palette) return null
      const { primary, background } = input.palette
      if (!isHex(primary) || !isHex(background)) return null
      const ratio = contrast(primary, background)
      if (ratio < 2) {
        return {
          id: uid(), type: 'violation', category: 'color', severity: 'major',
          title: 'Cor primária invisível no fundo',
          description: `Primary (${primary}) e background (${background}) têm contraste de apenas ${ratio.toFixed(1)}:1`,
          field: 'primary', value: primary,
          fix: 'Escolher uma primary mais clara ou mais escura que o fundo',
          rule: 'primary-background-contrast',
        }
      }
      return null
    },
  },
  {
    id: 'colors-too-similar',
    name: 'Cores muito similares entre si',
    category: 'color',
    severity: 'warning',
    evaluate(input: RuleInput): DesignIssue | null {
      if (!input.palette) return null
      const colors = Object.values(input.palette).filter(isHex)
      for (let i = 0; i < colors.length; i++) {
        for (let j = i + 1; j < colors.length; j++) {
          const d = hueDistance(colors[i], colors[j])
          const l1 = luminance(colors[i]), l2 = luminance(colors[j])
          if (d < 30 && Math.abs(l1 - l2) < 30) {
            return {
              id: uid(), type: 'warning', category: 'color', severity: 'minor',
              title: 'Cores muito similares',
              description: `"${colors[i]}" e "${colors[j]}" são visualmente próximas — podem causar confusão`,
              fix: 'Aumentar diferença de matiz ou luminosidade entre cores similares',
              rule: 'colors-too-similar',
            }
          }
        }
      }
      return null
    },
  },
  {
    id: 'invalid-hex',
    name: 'Cor hexadecimal inválida',
    category: 'color',
    severity: 'critical',
    evaluate(input: RuleInput): DesignIssue | null {
      if (!input.palette) return null
      for (const [key, val] of Object.entries(input.palette)) {
        if (val && !isHex(val)) {
          return {
            id: uid(), type: 'violation', category: 'color', severity: 'critical',
            title: 'Hex inválido',
            description: `"${val}" não é um hexadecimal válido para o campo "${key}"`,
            field: key, value: val, expected: '#RRGGBB ou #RGB',
            fix: 'Substituir por um valor hexadecimal válido (ex: #FF2D8D)',
            rule: 'invalid-hex',
          }
        }
      }
      return null
    },
  },
]

export function evaluatePalette(input: RuleInput): DesignIssue[] {
  return validatePaletteRules.map((r) => r.evaluate(input)).filter(Boolean) as DesignIssue[]
}
