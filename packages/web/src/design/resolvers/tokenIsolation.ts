import { listProtectedKeys, getSystemToken, type SystemToken } from '../tokens/systemTokens'

export interface IsolatedTokens {
  system: Record<string, string | number>
  project: Record<string, string | number>
  rejected: { key: string; reason: string }[]
}

const protectedKeys = new Set(listProtectedKeys())

export function isSystemProtected(key: string): boolean {
  return protectedKeys.has(key)
}

export function isolateProjectOverrides(
  projectOverrides: Record<string, string | number>,
): { allowed: Record<string, string | number>; rejected: { key: string; reason: string }[] } {
  const allowed: Record<string, string | number> = {}
  const rejected: { key: string; reason: string }[] = []

  for (const [key, value] of Object.entries(projectOverrides)) {
    const token = getSystemToken(key)
    if (token?.protected) {
      rejected.push({ key, reason: `Token protegido do sistema: "${key}" não pode ser sobrescrito` })
    } else {
      allowed[key] = value
    }
  }

  return { allowed, rejected }
}

export function mergeTokens(
  systemBase: Record<string, string | number>,
  projectOverrides: Record<string, string | number>,
): { merged: Record<string, string | number>; rejected: { key: string; reason: string }[] } {
  const { allowed, rejected } = isolateProjectOverrides(projectOverrides)

  return {
    merged: { ...systemBase, ...allowed },
    rejected,
  }
}

export function createProjectNamespace(projectId: string): string {
  return `pl-project-${projectId}`
}

export function getIsolationBoundary(projectId: string): {
  scope: string
  prefix: string
  protectedTokens: string[]
} {
  return {
    scope: createProjectNamespace(projectId),
    prefix: `--${createProjectNamespace(projectId)}-`,
    protectedTokens: listProtectedKeys(),
  }
}
