export type TokenCategory = 'color' | 'typography' | 'spacing' | 'radius' | 'shadow'

export interface DesignToken {
  name: string
  value: string | number
  category: TokenCategory
  description?: string
}

export const pinkLogicTokens: Record<string, DesignToken> = {
  // Platform identity — Pink Logic owns these. Projects never override them.
  'color.primary':     { name: 'color.primary',     value: '#FF2D8D', category: 'color', description: 'Pink Logic brand pink' },
  'color.secondary':   { name: 'color.secondary',   value: '#7B2D8E', category: 'color', description: 'Pink Logic purple' },
  'color.accent':      { name: 'color.accent',      value: '#FFD700', category: 'color', description: 'Pink Logic gold' },
  'color.background':  { name: 'color.background',  value: '#0D0D12', category: 'color', description: 'Dark background' },
  'color.surface':     { name: 'color.surface',     value: '#1A1A24', category: 'color', description: 'Card/surface background' },
  'color.text':        { name: 'color.text',        value: '#FFFFFF', category: 'color', description: 'Primary text' },
  'color.textMuted':   { name: 'color.textMuted',   value: '#888899', category: 'color', description: 'Secondary text' },
  'color.border':      { name: 'color.border',      value: '#2A2A35', category: 'color', description: 'Border color' },
  'color.error':       { name: 'color.error',       value: '#FF4444', category: 'color', description: 'Error/danger' },
  'color.success':     { name: 'color.success',     value: '#44FF88', category: 'color', description: 'Success' },
  'color.warning':     { name: 'color.warning',     value: '#FFBB33', category: 'color', description: 'Warning' },

  'typography.family.heading': { name: 'typography.family.heading', value: 'Outfit', category: 'typography' },
  'typography.family.body':    { name: 'typography.family.body',    value: 'Inter', category: 'typography' },
  'typography.size.h1':        { name: 'typography.size.h1',        value: 48,     category: 'typography' },
  'typography.size.h2':        { name: 'typography.size.h2',        value: 32,     category: 'typography' },
  'typography.size.h3':        { name: 'typography.size.h3',        value: 24,     category: 'typography' },
  'typography.size.body':      { name: 'typography.size.body',      value: 16,     category: 'typography' },
  'typography.size.small':     { name: 'typography.size.small',     value: 14,     category: 'typography' },
  'typography.weight.normal':  { name: 'typography.weight.normal',  value: 400,    category: 'typography' },
  'typography.weight.medium':  { name: 'typography.weight.medium',  value: 500,    category: 'typography' },
  'typography.weight.bold':    { name: 'typography.weight.bold',    value: 700,    category: 'typography' },

  'spacing.xs':   { name: 'spacing.xs',   value: 4,   category: 'spacing' },
  'spacing.sm':   { name: 'spacing.sm',   value: 8,   category: 'spacing' },
  'spacing.md':   { name: 'spacing.md',   value: 16,  category: 'spacing' },
  'spacing.lg':   { name: 'spacing.lg',   value: 24,  category: 'spacing' },
  'spacing.xl':   { name: 'spacing.xl',   value: 32,  category: 'spacing' },
  'spacing.xxl':  { name: 'spacing.xxl',  value: 48,  category: 'spacing' },

  'radius.none':  { name: 'radius.none',  value: 0,    category: 'radius' },
  'radius.sm':    { name: 'radius.sm',    value: 4,    category: 'radius' },
  'radius.md':    { name: 'radius.md',    value: 8,    category: 'radius' },
  'radius.lg':    { name: 'radius.lg',    value: 12,   category: 'radius' },
  'radius.xl':    { name: 'radius.xl',    value: 16,   category: 'radius' },
  'radius.full':  { name: 'radius.full',  value: 9999, category: 'radius' },
}

export function resolveProjectToken(
  tokenKey: string,
  projectOverrides?: Record<string, string | number>
): string | number {
  const token = pinkLogicTokens[tokenKey]
  if (!token) return tokenKey
  if (projectOverrides?.[tokenKey]) return projectOverrides[tokenKey]
  return token.value
}

export function getTokenValue(key: string): string | number | undefined {
  return pinkLogicTokens[key]?.value
}
