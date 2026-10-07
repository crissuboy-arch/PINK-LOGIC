export interface ComponentTokens {
  background?: string
  color?: string
  borderColor?: string
  borderRadius?: string | number
  padding?: string | number
  fontFamily?: string
  fontSize?: string | number
  fontWeight?: string | number
}

export interface ComponentDefinition {
  name: string
  description: string
  tokens: ComponentTokens
  variants: string[]
}

export const componentRegistry: Record<string, ComponentDefinition> = {
  Button: {
    name: 'Button',
    description: 'Primary action button',
    tokens: {
      background: '#FF2D8D',
      color: '#FFFFFF',
      borderRadius: 8,
      padding: '12px 24px',
      fontFamily: 'Outfit',
      fontSize: 16,
      fontWeight: 600,
    },
    variants: ['primary', 'secondary', 'ghost', 'outline'],
  },
  Card: {
    name: 'Card',
    description: 'Content container',
    tokens: {
      background: '#1A1A24',
      borderColor: '#2A2A35',
      borderRadius: 12,
      padding: 24,
    },
    variants: ['default', 'elevated', 'bordered'],
  },
  Input: {
    name: 'Input',
    description: 'Text input field',
    tokens: {
      background: '#1A1A24',
      color: '#FFFFFF',
      borderColor: '#2A2A35',
      borderRadius: 8,
      padding: '12px 16px',
      fontFamily: 'Inter',
      fontSize: 16,
    },
    variants: ['default', 'filled', 'outline'],
  },
  Badge: {
    name: 'Badge',
    description: 'Status indicator',
    tokens: {
      borderRadius: 4,
      padding: '4px 8px',
      fontSize: 12,
      fontWeight: 600,
    },
    variants: ['default', 'success', 'warning', 'error'],
  },
}

export function getComponentTokens(name: string, variant?: string): ComponentTokens | undefined {
  return componentRegistry[name]?.tokens
}
