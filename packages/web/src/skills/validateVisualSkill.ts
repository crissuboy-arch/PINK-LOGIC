/**
 * Valida a consistência visual de um projeto comparando elementos
 * contra as regras de branding definidas.
 */
import { isColorLight, contrastText, isHexColor } from '../design-system/colors'

export interface VisualValidationItem {
  element: string
  field: string
  expected: string
  actual: string
  valid: boolean
}

export interface ValidateVisualInput {
  projectId: string
  palette: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
  }
  fonts: {
    heading: string
    body: string
  }
}

export interface ValidateVisualOutput {
  projectId: string
  valid: boolean
  items: VisualValidationItem[]
  score: number
  errors: number
  warnings: number
}

const RULES = [
  'All colors must be valid hex codes',
  'Text must contrast with background',
  'Primary color must differ from background',
  'Fonts must be defined for heading and body',
  'Minimum 3 colors in palette',
]

export async function validateVisualSkill(input: ValidateVisualInput): Promise<ValidateVisualOutput> {
  const items: VisualValidationItem[] = []
  let errors = 0
  let warnings = 0

  const add = (el: string, field: string, expected: string, actual: string, valid: boolean) => {
    items.push({ element: el, field, expected, actual, valid })
    if (!valid) errors++
  }

  const warn = (el: string, field: string, expected: string, actual: string) => {
    items.push({ element: el, field, expected, actual, valid: false })
    warnings++
  }

  // Validate hex codes
  for (const [key, value] of Object.entries(input.palette)) {
    if (!isHexColor(value)) {
      add('palette', key, 'valid hex', value, false)
    }
  }

  // Validate contrast
  const expectedText = contrastText(input.palette.background)
  if (input.palette.text.toLowerCase() !== expectedText.toLowerCase()) {
    warn('palette', 'text', expectedText, input.palette.text)
  }

  // Primary vs background
  if (input.palette.primary.toLowerCase() === input.palette.background.toLowerCase()) {
    add('palette', 'primary', 'different from background', input.palette.primary, false)
  }

  // Fonts
  if (!input.fonts.heading) {
    add('fonts', 'heading', 'defined', '(empty)', false)
  }
  if (!input.fonts.body) {
    add('fonts', 'body', 'defined', '(empty)', false)
  }

  // Palette size
  const definedColors = Object.values(input.palette).filter(c => c && c !== '#').length
  if (definedColors < 3) {
    add('palette', 'count', '≥ 3 colors', `${definedColors} colors`, false)
  }

  const totalChecks = items.length
  const passed = items.filter(i => i.valid).length
  const score = totalChecks > 0 ? Math.round((passed / totalChecks) * 100) : 100

  return {
    projectId: input.projectId,
    valid: errors === 0,
    items,
    score,
    errors,
    warnings,
  }
}

export { RULES as validateVisualRules }
