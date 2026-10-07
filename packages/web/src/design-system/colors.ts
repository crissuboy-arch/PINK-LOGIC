import { pinkLogicTokens } from './tokens'

export interface RGB { r: number; g: number; b: number }

export const platformColors = {
  primary:   pinkLogicTokens['color.primary'].value as string,
  secondary: pinkLogicTokens['color.secondary'].value as string,
  accent:    pinkLogicTokens['color.accent'].value as string,
  background: pinkLogicTokens['color.background'].value as string,
  surface:   pinkLogicTokens['color.surface'].value as string,
  text:      pinkLogicTokens['color.text'].value as string,
  textMuted: pinkLogicTokens['color.textMuted'].value as string,
  border:    pinkLogicTokens['color.border'].value as string,
  error:     pinkLogicTokens['color.error'].value as string,
  success:   pinkLogicTokens['color.success'].value as string,
  warning:   pinkLogicTokens['color.warning'].value as string,
}

export function hexToRgb(hex: string): RGB | null {
  const clean = hex.replace('#', '')
  if (clean.length !== 6 && clean.length !== 3) return null
  const full = clean.length === 3
    ? clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2]
    : clean
  const num = parseInt(full, 16)
  if (isNaN(num)) return null
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 }
}

export function hexToRgba(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
}

export function isColorLight(hex: string): boolean {
  const rgb = hexToRgb(hex)
  if (!rgb) return false
  const luminance = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b
  return luminance > 128
}

export function contrastText(bgColor: string): string {
  return isColorLight(bgColor) ? '#0D0D12' : '#FFFFFF'
}

export function isHexColor(value: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value)
}
