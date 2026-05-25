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
      primary: input.primaryColor,
      secondary: input.secondaryColor,
      accent: input.accentColor,
      background: '#0D0D12',
      text: '#FFFFFF',
    },
    fonts: {
      heading: input.headingFont ?? 'Inter',
      body: input.bodyFont ?? 'Inter',
    },
    tone: input.tone,
    visualStyle: input.style,
  })
}
