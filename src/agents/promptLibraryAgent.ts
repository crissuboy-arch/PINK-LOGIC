export interface Prompt {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  projectId?: string
}

export interface PromptQuery {
  category?: string
  tag?: string
  projectId?: string
}

export function promptLibraryAgent(prompt: Omit<Prompt, 'id'>): Promise<Prompt> {
  return Promise.resolve({
    id: crypto.randomUUID(),
    ...prompt,
  })
}

export function searchPrompts(query: PromptQuery, library: Prompt[]): Prompt[] {
  return library.filter((p) => {
    if (query.category && p.category !== query.category) return false
    if (query.projectId && p.projectId !== query.projectId) return false
    if (query.tag && !p.tags.includes(query.tag)) return false
    return true
  })
}
