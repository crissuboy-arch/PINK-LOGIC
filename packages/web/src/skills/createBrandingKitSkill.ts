import type { BrandingKit } from '../agents/brandingAgent'

export interface BrandingKitInput {
  projectId: string
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  headingFont?: string
  bodyFont?: string
  tone?: string
  style?: string
}

export async function createBrandingKitSkill(input: BrandingKitInput): Promise<BrandingKit> {
  const { brandingAgent } = await import('../agents/brandingAgent')
  return brandingAgent(input.projectId, {
    palette: {
      primary: input.primaryColor ?? '#FF2D8D',
      secondary: input.secondaryColor ?? '#7B2D8E',
      accent: input.accentColor ?? '#FFD700',
      background: '#0D0D12',
      text: '#FFFFFF',
    },
    fonts: {
      heading: input.headingFont ?? 'Inter',
      body: input.bodyFont ?? 'Inter',
    },
    tone: input.tone || 'profissional',
    visualStyle: input.style || 'moderno',
  })
}
