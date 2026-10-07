export interface Shadow {
  color: string
  offsetX: number
  offsetY: number
  blur: number
  spread: number
}

export interface ShadowDefinition {
  name: string
  value: Shadow[]
  css: string
}

function shadowCSS(shadows: Shadow[]): string {
  return shadows.map(s => `${s.offsetX}px ${s.offsetY}px ${s.blur}px ${s.spread}px ${s.color}`).join(', ')
}

export const shadows: Record<string, ShadowDefinition> = {
  sm: {
    name: 'sm',
    value: [{ color: 'rgba(0,0,0,0.3)', offsetX: 0, offsetY: 2, blur: 4, spread: 0 }],
    css: shadowCSS([{ color: 'rgba(0,0,0,0.3)', offsetX: 0, offsetY: 2, blur: 4, spread: 0 }]),
  },
  md: {
    name: 'md',
    value: [
      { color: 'rgba(0,0,0,0.2)', offsetX: 0, offsetY: 4, blur: 8, spread: 0 },
      { color: 'rgba(0,0,0,0.1)', offsetX: 0, offsetY: 2, blur: 4, spread: -2 },
    ],
    css: shadowCSS([
      { color: 'rgba(0,0,0,0.2)', offsetX: 0, offsetY: 4, blur: 8, spread: 0 },
      { color: 'rgba(0,0,0,0.1)', offsetX: 0, offsetY: 2, blur: 4, spread: -2 },
    ]),
  },
  lg: {
    name: 'lg',
    value: [
      { color: 'rgba(0,0,0,0.25)', offsetX: 0, offsetY: 8, blur: 16, spread: 0 },
      { color: 'rgba(0,0,0,0.1)', offsetX: 0, offsetY: 4, blur: 8, spread: -4 },
    ],
    css: shadowCSS([
      { color: 'rgba(0,0,0,0.25)', offsetX: 0, offsetY: 8, blur: 16, spread: 0 },
      { color: 'rgba(0,0,0,0.1)', offsetX: 0, offsetY: 4, blur: 8, spread: -4 },
    ]),
  },
  glow: {
    name: 'glow',
    value: [{ color: '#FF2D8D', offsetX: 0, offsetY: 0, blur: 20, spread: 0 }],
    css: shadowCSS([{ color: '#FF2D8D', offsetX: 0, offsetY: 0, blur: 20, spread: 0 }]),
  },
}

export type ShadowKey = keyof typeof shadows
