import type { ContentFormat, ContentPiece } from '../agents/contentAgent'

export interface SocialContentInput {
  projectId: string
  format: ContentFormat
  topic: string
  platform: string
  brandTone?: string
}

export async function createSocialContentSkill(input: SocialContentInput): Promise<ContentPiece> {
  const { contentAgent } = await import('../agents/contentAgent')
  return contentAgent({
    projectId: input.projectId,
    format: input.format,
    topic: input.topic,
    platform: input.platform,
    brandTone: input.brandTone,
  })
}
