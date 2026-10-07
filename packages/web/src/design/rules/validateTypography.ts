import type { VisualRule, DesignIssue, RuleInput } from '../intelligence/types'

let idCounter = 0
function uid(): string { return `rule-${++idCounter}` }

const SERIF_FONTS = ['Merriweather', 'Playfair Display', 'Lora', 'PT Serif', 'Noto Serif', 'Georgia', 'Times New Roman', 'Cardo', 'Cormorant']
const SANS_FONTS = ['Inter', 'Outfit', 'Roboto', 'Open Sans', 'Montserrat', 'Poppins', 'Work Sans', 'DM Sans', 'Manrope', 'Plus Jakarta Sans']
const DISPLAY_FONTS = ['Anton', 'Bebas Neue', 'Oswald', 'Raleway', 'Playfair Display', 'Cinzel', 'Unbounded', 'Clash Display']
const HANDWRITING_FONTS = ['Dancing Script', 'Pacifico', 'Caveat', 'Permanent Marker', 'Satisfy', 'Kalam']
const MONO_FONTS = ['JetBrains Mono', 'Fira Code', 'Source Code Pro', 'IBM Plex Mono', 'Inconsolata', 'Victor Mono']

function classifyFont(font: string): 'serif' | 'sans' | 'display' | 'handwriting' | 'mono' | 'unknown' {
  const f = font.trim().toLowerCase()
  if (SERIF_FONTS.some((sf) => f.includes(sf.toLowerCase()))) return 'serif'
  if (SANS_FONTS.some((sf) => f.includes(sf.toLowerCase()))) return 'sans'
  if (DISPLAY_FONTS.some((df) => f.includes(df.toLowerCase()))) return 'display'
  if (HANDWRITING_FONTS.some((hf) => f.includes(hf.toLowerCase()))) return 'handwriting'
  if (MONO_FONTS.some((mf) => f.includes(mf.toLowerCase()))) return 'mono'
  return 'unknown'
}

function isLuxuryFont(font: string): boolean {
  const luxury = ['Playfair Display', 'Cormorant', 'Cardo', 'Cinzel', 'Unbounded']
  return luxury.some((lf) => font.toLowerCase().includes(lf.toLowerCase()))
}

function isModernFont(font: string): boolean {
  const modern = ['Inter', 'Outfit', 'Manrope', 'DM Sans', 'Plus Jakarta Sans', 'Clash Display']
  return modern.some((mf) => font.toLowerCase().includes(mf.toLowerCase()))
}

export const validateTypographyRules: VisualRule[] = [
  {
    id: 'missing-fonts',
    name: 'Fontes não definidas',
    category: 'typography',
    severity: 'critical',
    evaluate(input: RuleInput): DesignIssue | null {
      if (!input.fonts) return null
      const missing: string[] = []
      if (!input.fonts.heading) missing.push('heading')
      if (!input.fonts.body) missing.push('body')
      if (missing.length > 0) {
        return {
          id: uid(), type: 'violation', category: 'typography', severity: 'critical',
          title: 'Fonte não definida',
          description: `Campo(s) obrigatório(s) vazio(s): ${missing.join(', ')}`,
          field: missing.join(', '),
          fix: 'Definir fontes heading e body',
          rule: 'missing-fonts',
        }
      }
      return null
    },
  },
  {
    id: 'same-font-heading-body',
    name: 'Heading igual à Body',
    category: 'typography',
    severity: 'minor',
    evaluate(input: RuleInput): DesignIssue | null {
      if (!input.fonts) return null
      const { heading, body } = input.fonts
      if (heading && body && heading.toLowerCase() === body.toLowerCase()) {
        return {
          id: uid(), type: 'suggestion', category: 'typography', severity: 'minor',
          title: 'Heading igual à Body',
          description: 'Usar fontes diferentes para heading e body cria hierarquia visual mais clara',
          field: 'fonts', value: heading,
          fix: 'Escolher uma fonte display/serif para heading e uma sans-serif para body',
          rule: 'same-font-heading-body',
        }
      }
      return null
    },
  },
  {
    id: 'incompatible-font-pairing',
    name: 'Par de fontes incompatível',
    category: 'typography',
    severity: 'major',
    evaluate(input: RuleInput): DesignIssue | null {
      if (!input.fonts) return null
      const { heading, body } = input.fonts
      if (!heading || !body) return null
      const hClass = classifyFont(heading)
      const bClass = classifyFont(body)
      if (hClass === 'handwriting' && bClass === 'handwriting') {
        return {
          id: uid(), type: 'violation', category: 'typography', severity: 'major',
          title: 'Fontes incompatíveis',
          description: `Heading (${heading}) e Body (${body}) são ambas handwriting — ilegível para textos longos`,
          field: 'fonts', value: `${heading} + ${body}`,
          fix: 'Usar no máximo uma fonte handwriting; combinar com sans-serif para body',
          rule: 'incompatible-font-pairing',
        }
      }
      if (hClass === 'display' && bClass === 'display') {
        return {
          id: uid(), type: 'warning', category: 'typography', severity: 'minor',
          title: 'Duas fontes display',
          description: `Heading (${heading}) e Body (${body}) são ambas display — pode cansar a leitura`,
          fix: 'Usar display apenas para heading; body deve ser mais neutra (sans-serif)',
          rule: 'incompatible-font-pairing',
        }
      }
      return null
    },
  },
  {
    id: 'tone-font-mismatch',
    name: 'Fonte não combina com o tom da marca',
    category: 'typography',
    severity: 'minor',
    evaluate(input: RuleInput): DesignIssue | null {
      if (!input.fonts || !input.tone) return null
      const { heading } = input.fonts
      const tone = input.tone.toLowerCase()
      if (!heading) return null

      if (tone.includes('luxo') || tone.includes('sophisticated') || tone.includes('premium')) {
        if (!isLuxuryFont(heading)) {
          return {
            id: uid(), type: 'suggestion', category: 'typography', severity: 'minor',
            title: 'Fonte não condiz com tom luxuoso',
            description: `Tom "${input.tone}" sugere luxo, mas a fonte "${heading}" não é uma fonte premium clássica`,
            field: 'fonts.heading', value: heading,
            fix: 'Considere Playfair Display, Cormorant ou Cinzel para tom luxuoso',
            rule: 'tone-font-mismatch',
          }
        }
      }

      if (tone.includes('moderno') || tone.includes('tech') || tone.includes('digital')) {
        if (!isModernFont(heading)) {
          return {
            id: uid(), type: 'suggestion', category: 'typography', severity: 'minor',
            title: 'Fonte não condiz com tom moderno',
            description: `Tom "${input.tone}" sugere modernidade, mas "${heading}" não é uma fonte moderna geométrica`,
            field: 'fonts.heading', value: heading,
            fix: 'Considere Outfit, Inter, Manrope ou Clash Display para tom moderno',
            rule: 'tone-font-mismatch',
          }
        }
      }
      return null
    },
  },
  {
    id: 'handwriting-body',
    name: 'Fonte handwriting para body',
    category: 'typography',
    severity: 'critical',
    evaluate(input: RuleInput): DesignIssue | null {
      if (!input.fonts?.body) return null
      if (classifyFont(input.fonts.body) === 'handwriting') {
        return {
          id: uid(), type: 'violation', category: 'typography', severity: 'critical',
          title: 'Body ilegível',
          description: `"${input.fonts.body}" é handwriting — inadequada para parágrafos e textos longos`,
          field: 'fonts.body', value: input.fonts.body,
          fix: 'Substituir body por uma sans-serif legível (Inter, Roboto, Open Sans)',
          rule: 'handwriting-body',
        }
      }
      return null
    },
  },
]

export function evaluateTypography(input: RuleInput): DesignIssue[] {
  return validateTypographyRules.map((r) => r.evaluate(input)).filter(Boolean) as DesignIssue[]
}
