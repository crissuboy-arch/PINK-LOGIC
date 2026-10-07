import { createContext, useContext, useCallback, type ReactNode } from 'react'
import { useCentralStore } from '../store/CentralStore'
import type { Project, Brand } from '../store/types'
import {
  type ProjectSchema,
  type ProjectBranding,
  type ProjectSettings,
  type ProjectMetadata,
} from '../types/ProjectSchema'

export type { ProjectSchema, ProjectBranding, ProjectSettings, ProjectMetadata }

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

export function mapToProjectSchema(p: Project, b?: Brand | null): ProjectSchema {
  const colors = b?.colors || {
    primary: '#FF2D8D',
    secondary: '#7000FF',
    accent: '#00E0FF',
    background: '#0D0D12',
    text: '#FFFFFF',
    glow: '#FF2D8D',
  };
  return {
    id: p.id,
    name: p.name,
    slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    createdAt: new Date(p.createdAt),
    updatedAt: new Date(p.createdAt),
    branding: {
      palette: {
        primary: colors.primary,
        secondary: colors.secondary,
        accent: colors.accent,
        background: colors.background,
        text: colors.text,
      },
      fonts: {
        heading: b?.fonts.heading || 'Outfit',
        body: b?.fonts.body || 'Inter',
      },
      tone: b?.tone || '',
      visualStyle: b?.style || '',
      logo: b?.logo,
    },
    content: { pieces: 0, formats: [] },
    campaigns: [],
    calendar: { events: 0 },
    workflows: [],
    automations: [],
    assets: { images: [], logos: [], fonts: [], templates: [] },
    settings: {
      niche: '',
      audience: '',
      objective: p.description,
      platform: p.socialAccounts.join(','),
      timezone: p.timezone,
      language: 'pt-BR',
    },
    metadata: {
      version: 2,
      createdBy: 'system',
      tags: [],
      notes: '',
      status: p.status === 'active' ? 'active' : 'draft',
    }
  };
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const {
    projects: centralProjects,
    brands: centralBrands,
    activeProjectId,
    activeProject,
    activeBrand,
    setActiveProjectId,
    createProject: centralCreateProject,
    updateProject: centralUpdateProject,
    deleteProject: centralDeleteProject,
  } = useCentralStore();

  const mappedProjects = centralProjects.map(p => {
    const brand = centralBrands.find(b => b.projectId === p.id);
    return mapToProjectSchema(p, brand);
  });

  const currentProject = activeProject ? mapToProjectSchema(activeProject, activeBrand) : null;

  const createProject = useCallback((data: Partial<ProjectSchema>): ProjectSchema => {
    const name = data.name || 'Novo Projeto';
    const email = '';
    const desc = data.settings?.objective || '';
    
    // Call centralized store creation which handles Projects & Brands creation
    centralCreateProject({
      name,
      description: desc,
      brandId: '',
      socialAccounts: data.settings?.platform ? [data.settings.platform] : ['Instagram'],
      email,
      timezone: data.settings?.timezone || 'America/Sao_Paulo',
      status: 'active'
    });

    // Mock direct sync return value
    const tempId = crypto.randomUUID();
    return {
      id: tempId,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      createdAt: new Date(),
      updatedAt: new Date(),
      branding: {
        palette: {
          primary: data.branding?.palette?.primary || '#FF2D8D',
          secondary: data.branding?.palette?.secondary || '#7B2D8E',
          accent: data.branding?.palette?.accent || '#FFD700',
          background: data.branding?.palette?.background || '#0D0D12',
          text: data.branding?.palette?.text || '#FFFFFF',
        },
        fonts: {
          heading: data.branding?.fonts?.heading || 'Outfit',
          body: data.branding?.fonts?.body || 'Inter',
        },
        tone: '',
        visualStyle: '',
      },
      content: { pieces: 0, formats: [] },
      campaigns: [],
      calendar: { events: 0 },
      workflows: [],
      automations: [],
      assets: { images: [], logos: [], fonts: [], templates: [] },
      settings: {
        niche: '',
        audience: '',
        objective: desc,
        platform: data.settings?.platform || 'Instagram',
        timezone: data.settings?.timezone || 'America/Sao_Paulo',
        language: 'pt-BR',
      },
      metadata: {
        version: 2,
        createdBy: 'system',
        tags: [],
        notes: '',
        status: 'draft',
      }
    };
  }, [centralCreateProject]);

  const updateProject = useCallback((id: string, data: Partial<ProjectSchema>) => {
    const updates: Partial<Project> = {};
    if (data.name) updates.name = data.name;
    if (data.settings?.objective) updates.description = data.settings.objective;
    if (data.settings?.timezone) updates.timezone = data.settings.timezone;
    centralUpdateProject(id, updates);
  }, [centralUpdateProject]);

  const removeProject = useCallback((id: string) => {
    centralDeleteProject(id);
  }, [centralDeleteProject]);

  const setCurrentProject = useCallback((id: string | null) => {
    setActiveProjectId(id);
  }, [setActiveProjectId]);

  const clearProjects = useCallback(() => {
    // Clear handled by store or left as no-op for safety
  }, []);

  return (
    <ProjectContext.Provider value={{
      projects: mappedProjects,
      currentProjectId: activeProjectId,
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
