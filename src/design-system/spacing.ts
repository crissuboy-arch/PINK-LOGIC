import { pinkLogicTokens } from './tokens'

export const spacing: Record<string, number> = {
  xs:  pinkLogicTokens['spacing.xs'].value as number,
  sm:  pinkLogicTokens['spacing.sm'].value as number,
  md:  pinkLogicTokens['spacing.md'].value as number,
  lg:  pinkLogicTokens['spacing.lg'].value as number,
  xl:  pinkLogicTokens['spacing.xl'].value as number,
  xxl: pinkLogicTokens['spacing.xxl'].value as number,
}

export function px(value: number): string {
  return `${value}px`
}

export function multiply(value: number, factor: number): number {
  return value * factor
}

export type SpacingKey = keyof typeof spacing
