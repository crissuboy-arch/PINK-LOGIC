import type { ProjectBrandInput, ProjectPalette } from '../tokens/projectTokenTypes'

export interface ValidationIssue {
  type: 'contrast' | 'palette-conflict' | 'invalid-hex' | 'excess-colors' | 'incompatible-font' | 'missing-field'
  field?: string
  message: string
  severity: 'error' | 'warning'
}

export interface DesignValidationResult {
  valid: boolean
  issues: ValidationIssue[]
  score: number
}

function isHexColor(value: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value)
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '')
  if (clean.length !== 6 && clean.length !== 3) return null
  const full = clean.length === 3 ? clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2] : clean
  const num = parseInt(full, 16)
  if (isNaN(num)) return null
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 }
}

function isColorLight(hex: string): boolean {
  const rgb = hexToRgb(hex)
  if (!rgb) return false
  return 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b > 160
}

function luminance(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0
  return 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b
}

function contrastRatio(a: string, b: string): number {
  const l1 = luminance(a) + 0.05
  const l2 = luminance(b) + 0.05
  return l1 > l2 ? l1 / l2 : l2 / l1
}

const REQUIRED_FIELDS: (keyof ProjectPalette)[] = ['primary', 'secondary', 'accent', 'background', 'text']

export function validateBranding(brand: ProjectBrandInput): DesignValidationResult {
  const issues: ValidationIssue[] = []

  for (const field of REQUIRED_FIELDS) {
    const value = brand.palette[field]
    if (!value) {
      issues.push({ type: 'missing-field', field, message: `Campo "${field}" da paleta está vazio`, severity: 'error' })
    } else if (!isHexColor(value)) {
      issues.push({ type: 'invalid-hex', field, message: `Cor "${field}": "${value}" não é um hex válido`, severity: 'error' })
    }
  }

  const validColors = REQUIRED_FIELDS.filter((f) => brand.palette[f] && isHexColor(brand.palette[f]))
    .map((f) => brand.palette[f])
  const unique = new Set(validColors.map((c) => c.toLowerCase()))
  if (unique.size < validColors.length) {
    issues.push({ type: 'palette-conflict', message: 'Paleta contém cores duplicadas', severity: 'warning' })
  }

  if (validColors.length >= 2) {
    if (brand.palette.primary && brand.palette.background) {
      const ratio = contrastRatio(brand.palette.primary, brand.palette.background)
      if (ratio < 2.5) {
        issues.push({ type: 'contrast', message: `Contraste baixo entre primary e background (${ratio.toFixed(1)}:1)`, severity: 'error' })
      }
    }
    if (brand.palette.text && brand.palette.background) {
      const ratio = contrastRatio(brand.palette.text, brand.palette.background)
      if (ratio < 4.5) {
        issues.push({ type: 'contrast', message: `Contraste insuficiente entre texto e fundo (${ratio.toFixed(1)}:1, mínimo 4.5:1)`, severity: 'error' })
      }
    }
  }

  if (validColors.length > 5) {
    issues.push({ type: 'excess-colors', message: `Paleta com ${validColors.length} cores — considere simplificar`, severity: 'warning' })
  }

  if (brand.fonts.heading && brand.fonts.body) {
    if (brand.fonts.heading === brand.fonts.body) {
      issues.push({ type: 'incompatible-font', message: 'Fonte heading igual à body — considere usar fontes diferentes para contraste hierárquico', severity: 'warning' })
    }
  }

  if (!brand.fonts.heading) {
    issues.push({ type: 'missing-field', field: 'fonts.heading', message: 'Fonte heading não definida', severity: 'warning' })
  }
  if (!brand.fonts.body) {
    issues.push({ type: 'missing-field', field: 'fonts.body', message: 'Fonte body não definida', severity: 'warning' })
  }

  const errors = issues.filter((i) => i.severity === 'error').length
  const warnings = issues.filter((i) => i.severity === 'warning').length

  const rawScore = Math.max(0, 100 - errors * 25 - warnings * 10)
  const score = Math.min(100, rawScore)

  return {
    valid: errors === 0,
    issues,
    score,
  }
}

export function validatePalette(palette: ProjectPalette): Pick<DesignValidationResult, 'valid' | 'issues'> {
  return validateBranding({ palette, fonts: { heading: '', body: '' } })
}
