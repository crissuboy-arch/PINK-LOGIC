import { pinkLogicTokens } from './tokens'

export interface TypeStyle {
  fontFamily: string
  fontSize: number
  fontWeight: number
  lineHeight: number
  letterSpacing: number
}

export const platformFonts = {
  heading: pinkLogicTokens['typography.family.heading'].value as string,
  body:    pinkLogicTokens['typography.family.body'].value as string,
}

export const typeScale: Record<string, TypeStyle> = {
  h1: {
    fontFamily: platformFonts.heading,
    fontSize: pinkLogicTokens['typography.size.h1'].value as number,
    fontWeight: pinkLogicTokens['typography.weight.bold'].value as number,
    lineHeight: 1.1,
    letterSpacing: -0.02,
  },
  h2: {
    fontFamily: platformFonts.heading,
    fontSize: pinkLogicTokens['typography.size.h2'].value as number,
    fontWeight: pinkLogicTokens['typography.weight.bold'].value as number,
    lineHeight: 1.2,
    letterSpacing: -0.01,
  },
  h3: {
    fontFamily: platformFonts.heading,
    fontSize: pinkLogicTokens['typography.size.h3'].value as number,
    fontWeight: pinkLogicTokens['typography.weight.medium'].value as number,
    lineHeight: 1.3,
    letterSpacing: 0,
  },
  body: {
    fontFamily: platformFonts.body,
    fontSize: pinkLogicTokens['typography.size.body'].value as number,
    fontWeight: pinkLogicTokens['typography.weight.normal'].value as number,
    lineHeight: 1.5,
    letterSpacing: 0,
  },
  small: {
    fontFamily: platformFonts.body,
    fontSize: pinkLogicTokens['typography.size.small'].value as number,
    fontWeight: pinkLogicTokens['typography.weight.normal'].value as number,
    lineHeight: 1.4,
    letterSpacing: 0.01,
  },
}

export function createTypeStyle(
  fontFamily: string,
  fontSize: number,
  fontWeight?: number,
  lineHeight?: number,
): TypeStyle {
  return { fontFamily, fontSize, fontWeight: fontWeight ?? 400, lineHeight: lineHeight ?? 1.5, letterSpacing: 0 }
}

export function typeStyleToCSS(style: TypeStyle): Record<string, string | number> {
  return {
    fontFamily: style.fontFamily,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    lineHeight: style.lineHeight,
    letterSpacing: style.letterSpacing,
  }
}
