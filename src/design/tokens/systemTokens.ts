export type TokenCategory = 'color' | 'typography' | 'spacing' | 'radius' | 'shadow' | 'animation'

export interface SystemToken {
  name: string
  value: string | number
  category: TokenCategory
  description?: string
  protected: boolean
}

export const systemTokens: Record<string, SystemToken> = {
  'color.primary':     { name: 'color.primary',     value: '#FF2D8D', category: 'color', description: 'Pink Logic brand pink', protected: true },
  'color.secondary':   { name: 'color.secondary',   value: '#B026FF', category: 'color', description: 'Pink Logic purple', protected: true },
  'color.accent':      { name: 'color.accent',      value: '#FFD700', category: 'color', description: 'Pink Logic gold', protected: true },
  'color.background':  { name: 'color.background',  value: '#0D0D12', category: 'color', description: 'Dark background', protected: true },
  'color.surface':     { name: 'color.surface',     value: '#15151F', category: 'color', description: 'Card/surface background', protected: true },
  'color.text':        { name: 'color.text',        value: '#FFFFFF', category: 'color', description: 'Primary text', protected: true },
  'color.textMuted':   { name: 'color.textMuted',   value: '#A0A0B2', category: 'color', description: 'Secondary text', protected: true },
  'color.border':      { name: 'color.border',      value: 'rgba(255,255,255,0.08)', category: 'color', description: 'Border color', protected: true },
  'color.error':       { name: 'color.error',       value: '#FF4444', category: 'color', description: 'Error/danger', protected: true },
  'color.success':     { name: 'color.success',     value: '#10B981', category: 'color', description: 'Success', protected: true },
  'color.warning':     { name: 'color.warning',     value: '#F59E0B', category: 'color', description: 'Warning', protected: true },

  'typography.family.heading': { name: 'typography.family.heading', value: 'Outfit', category: 'typography', protected: true },
  'typography.family.body':    { name: 'typography.family.body',    value: 'Inter', category: 'typography', protected: true },
  'typography.size.h1':        { name: 'typography.size.h1',        value: 48,     category: 'typography', protected: true },
  'typography.size.h2':        { name: 'typography.size.h2',        value: 32,     category: 'typography', protected: true },
  'typography.size.h3':        { name: 'typography.size.h3',        value: 24,     category: 'typography', protected: true },
  'typography.size.body':      { name: 'typography.size.body',      value: 16,     category: 'typography', protected: true },
  'typography.size.small':     { name: 'typography.size.small',     value: 14,     category: 'typography', protected: true },
  'typography.weight.normal':  { name: 'typography.weight.normal',  value: 400,    category: 'typography', protected: true },
  'typography.weight.medium':  { name: 'typography.weight.medium',  value: 500,    category: 'typography', protected: true },
  'typography.weight.bold':    { name: 'typography.weight.bold',    value: 700,    category: 'typography', protected: true },

  'spacing.xs':   { name: 'spacing.xs',   value: 4,   category: 'spacing', protected: true },
  'spacing.sm':   { name: 'spacing.sm',   value: 8,   category: 'spacing', protected: true },
  'spacing.md':   { name: 'spacing.md',   value: 16,  category: 'spacing', protected: true },
  'spacing.lg':   { name: 'spacing.lg',   value: 24,  category: 'spacing', protected: true },
  'spacing.xl':   { name: 'spacing.xl',   value: 32,  category: 'spacing', protected: true },
  'spacing.xxl':  { name: 'spacing.xxl',  value: 48,  category: 'spacing', protected: true },

  'radius.none':  { name: 'radius.none',  value: 0,    category: 'radius', protected: true },
  'radius.sm':    { name: 'radius.sm',    value: 4,    category: 'radius', protected: true },
  'radius.md':    { name: 'radius.md',    value: 8,    category: 'radius', protected: true },
  'radius.lg':    { name: 'radius.lg',    value: 12,   category: 'radius', protected: true },
  'radius.xl':    { name: 'radius.xl',    value: 16,   category: 'radius', protected: true },
  'radius.full':  { name: 'radius.full',  value: 9999, category: 'radius', protected: true },
}

export type SystemTokenKey = keyof typeof systemTokens

export function getSystemToken(key: string): SystemToken | undefined {
  return systemTokens[key]
}

export function getSystemTokenValue(key: string): string | number | undefined {
  return systemTokens[key]?.value
}

export function listSystemTokens(): SystemToken[] {
  return Object.values(systemTokens)
}

export function listProtectedKeys(): string[] {
  return Object.entries(systemTokens).filter(([, t]) => t.protected).map(([k]) => k)
}
