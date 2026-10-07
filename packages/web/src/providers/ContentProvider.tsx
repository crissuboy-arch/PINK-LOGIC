import { createContext, useContext, useCallback, type ReactNode } from 'react'
import { usePersistedState, STORAGE_KEYS } from '../memory/MemoryStore'

export type ContentFormat = 'post' | 'story' | 'reel' | 'carousel' | 'copy'

export interface ContentSchema {
  id: string
  projectId: string
  title: string
  format: ContentFormat
  content: string
  platform: string
  status: 'draft' | 'review' | 'approved' | 'published'
  scheduledFor?: Date
  createdAt: Date
  updatedAt: Date
  tags: string[]
}

interface ContentContextValue {
  pieces: ContentSchema[]
  createContent: (data: Partial<ContentSchema> & { projectId: string }) => ContentSchema
  updateContent: (id: string, data: Partial<ContentSchema>) => void
  removeContent: (id: string) => void
  getContentByProject: (projectId: string) => ContentSchema[]
  clearContent: () => void
}

const ContentContext = createContext<ContentContextValue | null>(null)

export function ContentProvider({ children }: { children: ReactNode }) {
  const [pieces, setPieces, clearContent] = usePersistedState<ContentSchema[]>(STORAGE_KEYS.CONTENT, [])

  const createContent = useCallback((data: Partial<ContentSchema> & { projectId: string }): ContentSchema => {
    const piece: ContentSchema = {
      id: crypto.randomUUID(),
      projectId: data.projectId,
      title: data.title || 'Sem título',
      format: data.format || 'post',
      content: data.content || '',
      platform: data.platform || 'instagram',
      status: 'draft',
      tags: data.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setPieces(prev => [...prev, piece])
    return piece
  }, [setPieces])

  const updateContent = useCallback((id: string, data: Partial<ContentSchema>) => {
    setPieces(prev => prev.map(p => p.id === id ? { ...p, ...data, updatedAt: new Date() } : p))
  }, [setPieces])

  const removeContent = useCallback((id: string) => {
    setPieces(prev => prev.filter(p => p.id !== id))
  }, [setPieces])

  const getContentByProject = useCallback((projectId: string) => {
    return pieces.filter(p => p.projectId === projectId)
  }, [pieces])

  return (
    <ContentContext.Provider value={{
      pieces, createContent, updateContent, removeContent,
      getContentByProject, clearContent,
    }}>
      {children}
    </ContentContext.Provider>
  )
}

export function useContent(): ContentContextValue {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useContent must be used within <ContentProvider>')
  return ctx
}
