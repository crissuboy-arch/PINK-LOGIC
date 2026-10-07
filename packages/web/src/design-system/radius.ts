import { pinkLogicTokens } from './tokens'

export const radius: Record<string, number> = {
  none: pinkLogicTokens['radius.none'].value as number,
  sm:   pinkLogicTokens['radius.sm'].value as number,
  md:   pinkLogicTokens['radius.md'].value as number,
  lg:   pinkLogicTokens['radius.lg'].value as number,
  xl:   pinkLogicTokens['radius.xl'].value as number,
  full: pinkLogicTokens['radius.full'].value as number,
}

export type RadiusKey = keyof typeof radius
