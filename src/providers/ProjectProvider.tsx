import { createContext, useContext, useCallback, type ReactNode } from 'react'
import { usePersistedState, STORAGE_KEYS } from '../memory/MemoryStore'
import {
  type ProjectSchema,
  type ProjectBranding,
  type ProjectSettings,
  type ProjectMetadata,
  defaultBranding,
  defaultSettings,
  defaultMetadata,
  createSlug,
  migrateProject,
  SCHEMA_VERSION,
} from '../types/ProjectSchema'

export type { ProjectSchema, ProjectBranding, ProjectSettings, ProjectMetadata }

interface ProjectState {
  projects: ProjectSchema[]
  currentProjectId: string | null
}

interface ProjectContextValue {
  projects: ProjectSchema[]
  currentProjectId: string | null
  currentProject: ProjectSchema | null
  createProject: (data: Partial<ProjectSchema>) => ProjectSchema
  updateProject: (id: string, data: Partial<ProjectSchema>) => void
  removeProject: (id: string) => void
  setCurrentProject: (id: string | null) => void
  clearProjects: () => void
}

const ProjectContext = createContext<ProjectContextValue | null>(null)

const defaultState: ProjectState = {
  projects: [],
  currentProjectId: null,
}

function hydrateState(raw: unknown): ProjectState {
  const state = raw as ProjectState | null
  if (!state || !Array.isArray(state.projects)) return defaultState
  return {
    projects: state.projects.map(p => migrateProject(p as unknown as Record<string, unknown>)),
    currentProjectId: state.currentProjectId ?? null,
  }
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [state, setState, clearProjects] = usePersistedState<ProjectState>(
    STORAGE_KEYS.PROJECTS,
    defaultState,
    hydrateState,
  )

  const currentProject = state.currentProjectId
    ? state.projects.find(p => p.id === state.currentProjectId) ?? null
    : null

  const createProject = useCallback((data: Partial<ProjectSchema>): ProjectSchema => {
    const now = new Date()
    const name = data.name || 'Novo Projeto'
    const project: ProjectSchema = {
      id: data.id || crypto.randomUUID(),
      name,
      slug: data.slug || createSlug(name),
      createdAt: now,
      updatedAt: now,

      branding: {
        palette: {
          primary: data.branding?.palette?.primary || defaultBranding.palette.primary,
          secondary: data.branding?.palette?.secondary || defaultBranding.palette.secondary,
          accent: data.branding?.palette?.accent || defaultBranding.palette.accent,
          background: data.branding?.palette?.background || defaultBranding.palette.background,
          text: data.branding?.palette?.text || defaultBranding.palette.text,
        },
        fonts: {
          heading: data.branding?.fonts?.heading || defaultBranding.fonts.heading,
          body: data.branding?.fonts?.body || defaultBranding.fonts.body,
        },
        tone: data.branding?.tone ?? '',
        visualStyle: data.branding?.visualStyle ?? '',
        logo: data.branding?.logo,
      },

      content: data.content ?? { pieces: 0, formats: [] },
      campaigns: data.campaigns ?? [],
      calendar: data.calendar ?? { events: 0 },
      workflows: data.workflows ?? [],
      automations: data.automations ?? [],
      assets: data.assets ?? { images: [], logos: [], fonts: [], templates: [] },

      settings: {
        niche: data.settings?.niche ?? '',
        audience: data.settings?.audience ?? '',
        objective: data.settings?.objective ?? '',
        platform: data.settings?.platform ?? 'instagram',
        timezone: data.settings?.timezone ?? 'America/Sao_Paulo',
        language: data.settings?.language ?? 'pt-BR',
      },

      metadata: {
        version: SCHEMA_VERSION,
        createdBy: data.metadata?.createdBy ?? 'system',
        tags: data.metadata?.tags ?? [],
        notes: data.metadata?.notes ?? '',
        status: data.metadata?.status ?? 'draft',
      },
    }
    setState(prev => ({
      projects: [...prev.projects, project],
      currentProjectId: project.id,
    }))
    return project
  }, [setState])

  const updateProject = useCallback((id: string, data: Partial<ProjectSchema>) => {
    setState(prev => ({
      projects: prev.projects.map(p =>
        p.id === id ? { ...p, ...data, updatedAt: new Date() } : p
      ),
      currentProjectId: prev.currentProjectId,
    }))
  }, [setState])

  const removeProject = useCallback((id: string) => {
    setState(prev => ({
      projects: prev.projects.filter(p => p.id !== id),
      currentProjectId: prev.currentProjectId === id ? null : prev.currentProjectId,
    }))
  }, [setState])

  const setCurrentProject = useCallback((id: string | null) => {
    setState(prev => ({
      ...prev,
      currentProjectId: id,
    }))
  }, [setState])

  return (
    <ProjectContext.Provider value={{
      projects: state.projects,
      currentProjectId: state.currentProjectId,
      currentProject,
      createProject,
      updateProject,
      removeProject,
      setCurrentProject,
      clearProjects,
    }}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject(): ProjectContextValue {
  const ctx = useContext(ProjectContext)
  if (!ctx) throw new Error('useProject must be used within <ProjectProvider>')
  return ctx
}
