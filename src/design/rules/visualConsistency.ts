import type { VisualRule, DesignIssue, RuleInput } from '../intelligence/types'

let idCounter = 0
function uid(): string { return `rule-${++idCounter}` }

function isHex(v: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(v)
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '')
  const full = clean.length === 3 ? clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2] : clean
  if (full.length !== 6) return null
  const num = parseInt(full, 16)
  if (isNaN(num)) return null
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 }
}

const PINK_LOGIC_PALETTE = { primary: '#FF2D8D', secondary: '#B026FF', accent: '#FFD700', background: '#0D0D12', text: '#FFFFFF' }

function paletteDistance(colors1: Record<string, string>, colors2: Record<string, string>): number {
  let total = 0
  let count = 0
  for (const key of Object.keys(colors1)) {
    const a = colors1[key], b = colors2[key]
    if (!isHex(a) || !isHex(b)) continue
    const ra = hexToRgb(a), rb = hexToRgb(b)
    if (!ra || !rb) continue
    total += Math.abs(ra.r - rb.r) + Math.abs(ra.g - rb.g) + Math.abs(ra.b - rb.b)
    count++
  }
  return count > 0 ? total / count : 0
}

export const visualConsistencyRules: VisualRule[] = [
  {
    id: 'branding-distance',
    name: 'Branding distante do padrão Pink Logic',
    category: 'consistency',
    severity: 'info',
    evaluate(input: RuleInput): DesignIssue | null {
      if (!input.palette) return null
      const avgDist = paletteDistance(input.palette, PINK_LOGIC_PALETTE)
      if (avgDist > 300) {
        return {
          id: uid(), type: 'suggestion', category: 'consistency', severity: 'info',
          title: 'Branding muito distante do padrão',
          description: `Paleta difere muito do padrão Pink Logic (distância média ${avgDist.toFixed(0)}). Pode quebrar consistência visual do ecossistema.`,
          fix: 'Manter ao menos uma cor do Pink Logic (primary #FF2D8D ou accent #FFD700) para coesão visual',
          rule: 'branding-distance',
        }
      }
      return null
    },
  },
  {
    id: 'missing-tone',
    name: 'Tom de voz não definido',
    category: 'consistency',
    severity: 'minor',
    evaluate(input: RuleInput): DesignIssue | null {
      if (!input.tone || input.tone.trim() === '') {
        return {
          id: uid(), type: 'warning', category: 'consistency', severity: 'minor',
          title: 'Tom de voz não definido',
          description: 'Sem tom de voz, o conteúdo pode parecer inconsistente entre canais',
          fix: 'Definir um tom de voz (ex: profissional e acolhedor, jovem e descolado)',
          rule: 'missing-tone',
        }
      }
      return null
    },
  },
  {
    id: 'missing-visual-style',
    name: 'Estilo visual não definido',
    category: 'consistency',
    severity: 'minor',
    evaluate(input: RuleInput): DesignIssue | null {
      if (!input.visualStyle || input.visualStyle.trim() === '') {
        return {
          id: uid(), type: 'warning', category: 'consistency', severity: 'minor',
          title: 'Estilo visual não definido',
          description: 'Sem estilo visual, os materiais podem não ter identidade coesa',
          fix: 'Definir estilo visual (ex: moderno e feminino, minimalista, tech)',
          rule: 'missing-visual-style',
        }
      }
      return null
    },
  },
  {
    id: 'palette-size-inconsistency',
    name: 'Paleta muito pequena',
    category: 'consistency',
    severity: 'minor',
    evaluate(input: RuleInput): DesignIssue | null {
      if (!input.palette) return null
      const defined = Object.values(input.palette).filter((c) => c && isHex(c))
      if (defined.length < 3) {
        return {
          id: uid(), type: 'warning', category: 'consistency', severity: 'minor',
          title: 'Paleta muito pequena',
          description: `Apenas ${defined.length} cores definidas — insuficiente para compor interfaces completas`,
          fix: 'Completar paleta com 5 cores: primary, secondary, accent, background, text',
          rule: 'palette-size-inconsistency',
        }
      }
      return null
    },
  },
]

export function evaluateConsistency(input: RuleInput): DesignIssue[] {
  return visualConsistencyRules.map((r) => r.evaluate(input)).filter(Boolean) as DesignIssue[]
}
