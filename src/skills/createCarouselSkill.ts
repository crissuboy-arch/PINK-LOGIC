/**
 * Cria um carrossel de slides com design consistente.
 * Cada slide herda a identidade visual do projeto.
 */
export interface CarouselSlide {
  title: string
  body: string
  imageUrl?: string
}

export interface CarouselInput {
  projectId: string
  slides: CarouselSlide[]
  brandColors: { primary: string; background: string; text: string }
  brandFonts: { heading: string; body: string }
}

export interface CarouselOutput {
  id: string
  projectId: string
  slideCount: number
  slides: CarouselSlide[]
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
  'All slides share the same brand identity',
  'Slide backgrounds use project background color',
  'Text colors use project text color',
  'Accent elements use project primary color',
]

export async function createCarouselSkill(input: CarouselInput): Promise<CarouselOutput> {
  return {
    id: crypto.randomUUID(),
    projectId: input.projectId,
    slideCount: input.slides.length,
    slides: input.slides,
    style: {
      backgroundColor: input.brandColors.background,
      textColor: input.brandColors.text,
      accentColor: input.brandColors.primary,
      headingFont: input.brandFonts.heading,
      bodyFont: input.brandFonts.body,
    },
    createdAt: new Date(),
  }
}

export { RULES as carouselRules }
