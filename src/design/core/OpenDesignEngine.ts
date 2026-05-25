import type { ProjectBrandInput } from '../tokens/projectTokenTypes'
import { resolveProjectDesign, type ResolvedDesign } from '../resolvers/resolveProjectDesign'
import { validateBranding, type DesignValidationResult } from '../resolvers/validateBranding'
import { createFullCSSVariables, createSystemCSSVariables, createProjectCSSVariables } from '../resolvers/createCSSVariables'
import { applyResolvedDesign, applyFullDesign, clearProjectDesign } from '../resolvers/applyResolvedDesign'
import { mergeTokens, getIsolationBoundary, isSystemProtected } from '../resolvers/tokenIsolation'
import { systemTokens } from '../tokens/systemTokens'

export class OpenDesignEngine {
  private currentDesign: ResolvedDesign | null = null

  resolve(brand?: ProjectBrandInput | null): ResolvedDesign {
    const design = resolveProjectDesign(brand)
    this.currentDesign = design
    return design
  }

  getCurrent(): ResolvedDesign | null {
    return this.currentDesign
  }

  validate(brand: ProjectBrandInput): DesignValidationResult {
    return validateBranding(brand)
  }

  getCSSVariables(brand?: ProjectBrandInput | null): Record<string, string> {
    return createFullCSSVariables(brand).combined
  }

  getSystemCSSVariables(): Record<string, string> {
    return createSystemCSSVariables()
  }

  getProjectCSSVariables(brand: ProjectBrandInput): Record<string, string> {
    return createProjectCSSVariables(brand)
  }

  applyToDOM(element: HTMLElement, brand?: ProjectBrandInput | null): void {
    const cssMap = createFullCSSVariables(brand)
    applyFullDesign(element, cssMap, brand?.projectId)
  }

  clearProjectFromDOM(element: HTMLElement): void {
    clearProjectDesign(element)
  }

  getSystemToken(key: string): string | number | undefined {
    return systemTokens[key]?.value
  }

  isSystemKey(key: string): boolean {
    return isSystemProtected(key)
  }

  getIsolationInfo(projectId: string) {
    return getIsolationBoundary(projectId)
  }

  mergeWithIsolation(
    overrides: Record<string, string | number>,
  ): { merged: Record<string, string | number>; rejected: { key: string; reason: string }[] } {
    const systemBase: Record<string, string | number> = {}
    for (const [key, token] of Object.entries(systemTokens)) {
      systemBase[key] = token.value
    }
    return mergeTokens(systemBase, overrides)
  }
}

export const designEngine = new OpenDesignEngine()
