/**
 * Cria ou atualiza a identidade visual de um projeto.
 * Respeita a regra: Pink Logic não sobrescreve a paleta do projeto.
 */
export interface BrandingSkillInput {
  projectId: string
  name?: string
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  headingFont?: string
  bodyFont?: string
  tone?: string
  visualStyle?: string
}

export interface BrandingSkillOutput {
  id: string
  projectId: string
  name: string
  colors: { primary: string; secondary: string; accent: string }
  fonts: { heading: string; body: string }
  tone: string
  visualStyle: string
}

const RULES = [
  'Pink Logic platform colors are never overwritten by project branding',
  'Each project must have its own isolated palette',
  'Primary color must contrast with background',
  'Fonts must be from allowed families',
]

export async function createBrandingSkill(input: BrandingSkillInput): Promise<BrandingSkillOutput> {
  return {
    id: crypto.randomUUID(),
    projectId: input.projectId,
    name: input.name || 'Identidade Visual',
    colors: {
      primary: input.primaryColor || '#FF2D8D',
      secondary: input.secondaryColor || '#7B2D8E',
      accent: input.accentColor || '#FFD700',
    },
    fonts: {
      heading: input.headingFont || 'Outfit',
      body: input.bodyFont || 'Inter',
    },
    tone: input.tone || 'profissional e acolhedor',
    visualStyle: input.visualStyle || 'moderno e feminino',
  }
}

export { RULES as brandingSkillRules }
