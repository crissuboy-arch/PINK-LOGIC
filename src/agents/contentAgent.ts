export type ContentFormat = 'post' | 'story' | 'reel' | 'carousel' | 'copy'

export interface ContentRequest {
  projectId: string
  format: ContentFormat
  topic: string
  platform: string
  brandTone?: string
}

export interface ContentPiece {
  id: string
  format: ContentFormat
  content: string
  createdAt: Date
}

export function contentAgent(request: ContentRequest): Promise<ContentPiece> {
  return Promise.resolve({
    id: crypto.randomUUID(),
    format: request.format,
    content: `[${request.format.toUpperCase()}] Conteúdo sobre: ${request.topic} para ${request.platform}`,
    createdAt: new Date(),
  })
}
