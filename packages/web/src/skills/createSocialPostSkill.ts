/**
 * Cria um post social com base no projeto e identidade visual.
 * Aplica regras de branding automaticamente (paleta, fontes, tom).
 */
import { contrastText } from '../design-system/colors'

export type PostFormat = 'feed' | 'story' | 'reel'

export interface SocialPostInput {
  projectId: string
  format: PostFormat
  text: string
  brandColors: { primary: string; background: string; text: string }
  brandFonts: { heading: string; body: string }
}

export interface SocialPostOutput {
  id: string
  projectId: string
  format: PostFormat
  text: string
  style: {
    backgroundColor: string
    textColor: string
    accentColor: string
    headingFont: string
    bodyFont: string
  }
  createdAt: Date
}

const RULES = [
  'Text color must contrast with background',
  'Heading font from project branding',
  'Body font from project branding',
  'Accent color from project palette',
]

export async function createSocialPostSkill(input: SocialPostInput): Promise<SocialPostOutput> {
  const textColor = input.brandColors.text || contrastText(input.brandColors.background)

  return {
    id: crypto.randomUUID(),
    projectId: input.projectId,
    format: input.format,
    text: input.text,
    style: {
      backgroundColor: input.brandColors.background,
      textColor,
      accentColor: input.brandColors.primary,
      headingFont: input.brandFonts.heading,
      bodyFont: input.brandFonts.body,
    },
    createdAt: new Date(),
  }
}

export { RULES as socialPostRules }
