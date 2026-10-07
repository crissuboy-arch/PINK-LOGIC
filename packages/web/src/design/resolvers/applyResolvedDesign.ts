import type { CSSVariableMap } from './createCSSVariables'

export interface ApplyDesignInput {
  cssVariables: Record<string, string>
  violations?: string[]
  projectId?: string
}

export function applyResolvedDesign(
  element: HTMLElement,
  design: ApplyDesignInput,
): void {
  for (const [key, value] of Object.entries(design.cssVariables)) {
    element.style.setProperty(key, value)
  }
}

export function clearProjectDesign(
  element: HTMLElement,
  prefix = '--project-',
): void {
  const toRemove: string[] = []
  for (let i = 0; i < element.style.length; i++) {
    const key = element.style.item(i)
    if (key.startsWith(prefix)) {
      toRemove.push(key)
    }
  }
  for (const key of toRemove) {
    element.style.removeProperty(key)
  }
}

export function applyFullDesign(
  element: HTMLElement,
  cssMap: CSSVariableMap,
  projectId?: string,
): void {
  for (const [key, value] of Object.entries(cssMap.system)) {
    element.style.setProperty(key, value)
  }
  for (const [key, value] of Object.entries(cssMap.project)) {
    element.style.setProperty(key, value)
  }
}
