export interface ProjectPalette {
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
}

export interface ProjectBranding {
  palette: ProjectPalette
  fonts: { heading: string; body: string }
  tone: string
  visualStyle: string
  logo?: string
}

export interface ProjectContent {
  pieces: number
  lastGenerated?: Date
  formats: string[]
}

export interface ProjectCampaign {
  id: string
  name: string
  goal: string
  channels: string[]
  startDate: Date
  endDate?: Date
  status: 'draft' | 'active' | 'paused' | 'completed'
}

export interface ProjectCalendar {
  events: number
  lastSync?: Date
}

export interface ProjectWorkflow {
  id: string
  name: string
  steps: number
  status: 'draft' | 'active' | 'paused' | 'completed'
}

export interface ProjectAutomation {
  id: string
  name: string
  trigger: string
  action: string
  enabled: boolean
}

export interface ProjectAssets {
  images: string[]
  logos: string[]
  fonts: string[]
  templates: string[]
}

export interface ProjectSettings {
  niche: string
  audience: string
  objective: string
  platform: string
  timezone: string
  language: string
}

export interface ProjectMetadata {
  version: number
  createdBy: string
  tags: string[]
  notes: string
  status: 'draft' | 'active' | 'paused' | 'archived'
}

export interface ProjectSchema {
  id: string
  name: string
  slug: string
  createdAt: Date
  updatedAt: Date

  branding: ProjectBranding
  content: ProjectContent
  campaigns: ProjectCampaign[]
  calendar: ProjectCalendar
  workflows: ProjectWorkflow[]
  automations: ProjectAutomation[]
  assets: ProjectAssets
  settings: ProjectSettings
  metadata: ProjectMetadata
}

export const SCHEMA_VERSION = 2

export const defaultBranding: ProjectBranding = {
  palette: { primary: '#FF2D8D', secondary: '#7B2D8E', accent: '#FFD700', background: '#0D0D12', text: '#FFFFFF' },
  fonts: { heading: 'Outfit', body: 'Inter' },
  tone: '',
  visualStyle: '',
}

export const defaultSettings: ProjectSettings = {
  niche: '',
  audience: '',
  objective: '',
  platform: 'instagram',
  timezone: 'America/Sao_Paulo',
  language: 'pt-BR',
}

export const defaultMetadata: ProjectMetadata = {
  version: SCHEMA_VERSION,
  createdBy: 'system',
  tags: [],
  notes: '',
  status: 'draft',
}

export function createSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    || 'projeto'
}

export interface LegacyProjectSchema {
  id: string
  name: string
  niche?: string
  audience?: string
  objective?: string
  platform?: string
  branding?: Partial<ProjectBranding>
  status?: string
  createdAt?: Date
  updatedAt?: Date
  metadata?: { version?: number }
  [key: string]: unknown
}

export function migrateProject(raw: Record<string, unknown>): ProjectSchema {
  const old = raw as unknown as LegacyProjectSchema

  const isV1 = !old.metadata?.version || old.metadata.version < 2
  const isNew = old.metadata?.version === SCHEMA_VERSION

  if (isNew) {
    return raw as unknown as ProjectSchema
  }

  if (isV1) {
    return {
      id: old.id || crypto.randomUUID(),
      name: old.name || 'Projeto',
      slug: createSlug(old.name || 'projeto'),
      createdAt: old.createdAt ? new Date(old.createdAt) : new Date(),
      updatedAt: old.updatedAt ? new Date(old.updatedAt) : new Date(),

      branding: {
        palette: {
          primary: old.branding?.palette?.primary || defaultBranding.palette.primary,
          secondary: old.branding?.palette?.secondary || defaultBranding.palette.secondary,
          accent: old.branding?.palette?.accent || defaultBranding.palette.accent,
          background: old.branding?.palette?.background || defaultBranding.palette.background,
          text: old.branding?.palette?.text || defaultBranding.palette.text,
        },
        fonts: {
          heading: old.branding?.fonts?.heading || defaultBranding.fonts.heading,
          body: old.branding?.fonts?.body || defaultBranding.fonts.body,
        },
        tone: old.branding?.tone || '',
        visualStyle: old.branding?.visualStyle || '',
        logo: old.branding?.logo,
      },

      content: { pieces: 0, lastGenerated: undefined, formats: [] },
      campaigns: [],
      calendar: { events: 0 },
      workflows: [],
      automations: [],
      assets: { images: [], logos: [], fonts: [], templates: [] },

      settings: {
        niche: old.niche || '',
        audience: old.audience || '',
        objective: old.objective || '',
        platform: old.platform || 'instagram',
        timezone: 'America/Sao_Paulo',
        language: 'pt-BR',
      },

      metadata: {
        version: SCHEMA_VERSION,
        createdBy: 'system',
        tags: [],
        notes: '',
        status: (old.status as ProjectMetadata['status']) || 'draft',
      },
    }
  }

  return raw as unknown as ProjectSchema
}
