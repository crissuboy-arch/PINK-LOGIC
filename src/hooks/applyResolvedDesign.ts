import type { BrandSchema } from '../providers/BrandProvider'

export interface ApplyDesignInput {
  cssVariables: Record<string, string>
  violations?: string[]
}

export function applyResolvedDesign(
  element: HTMLElement,
  design: ApplyDesignInput
): void {
  for (const [key, value] of Object.entries(design.cssVariables)) {
    element.style.setProperty(key, value)
  }
}

export function getBrandColorsArray(brand: BrandSchema | null): string[] | undefined {
  if (!brand) return undefined
  return [
    brand.palette.primary,
    brand.palette.secondary,
    brand.palette.accent,
    brand.palette.background,
    brand.palette.text,
  ]
}
