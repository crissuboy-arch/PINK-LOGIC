import { platformColors } from '../design-system/colors'
import { platformFonts } from '../design-system/typography'
import type { BrandSchema } from '../providers/BrandProvider'

export interface InterpretedBrand {
  name: string
  palette: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
  }
  typography: {
    heading: string
    body: string
  }
  tone: string
  visualStyle: string
  designTokens: Record<string, string>
}

export class BrandInterpreter {
  interpret(brand: BrandSchema): InterpretedBrand {
    const palette = {
      primary:   brand.palette.primary   || platformColors.primary,
      secondary: brand.palette.secondary || platformColors.secondary,
      accent:    brand.palette.accent    || platformColors.accent,
      background: brand.palette.background || platformColors.background,
      text:      brand.palette.text      || platformColors.text,
    }

    const typography = {
      heading: brand.typography.heading || platformFonts.heading,
      body:    brand.typography.body    || platformFonts.body,
    }

    const designTokens: Record<string, string> = {
      '--brand-primary': palette.primary,
      '--brand-secondary': palette.secondary,
      '--brand-accent': palette.accent,
      '--brand-background': palette.background,
      '--brand-text': palette.text,
      '--brand-font-heading': typography.heading,
      '--brand-font-body': typography.body,
    }

    return {
      name: brand.name,
      palette,
      typography,
      tone: brand.tone || 'profissional e acolhedor',
      visualStyle: brand.visualStyle || 'moderno e feminino',
      designTokens,
    }
  }

  getInlineStyles(brand: BrandSchema): Record<string, string> {
    return this.interpret(brand).designTokens
  }
}
