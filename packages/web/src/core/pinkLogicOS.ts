export interface PinkLogicOS {
  version: string
  agents: AgentRegistry
  skills: SkillRegistry
  modules: ModuleRegistry
  projectSchema: ProjectSchema
}

export interface AgentRegistry {
  orchestrator: boolean
  branding: boolean
  content: boolean
  campaign: boolean
  workflow: boolean
  promptLibrary: boolean
  qa: boolean
}

export interface SkillRegistry {
  createSocialContent: boolean
  createContentCalendar: boolean
  createBrandingKit: boolean
  createCampaignPlan: boolean
  createWorkflow: boolean
  validateProject: boolean
}

export interface ModuleRegistry {
  dashboard: boolean
  projects: boolean
  branding: boolean
  prompts: boolean
  content: boolean
  calendar: boolean
  campaigns: boolean
  workflows: boolean
  automations: boolean
  settings: boolean
}

export interface ProjectSchema {
  name: string
  niche: string
  audience: string
  objective: string
  platform: string
  palette: { primary: string; secondary: string; accent: string; background: string; text: string }
  fonts: { heading: string; body: string }
  tone: string
  visualStyle: string
  status: 'draft' | 'active' | 'paused' | 'archived'
  createdAt: Date
  updatedAt: Date
}

export const pinkLogicOS: PinkLogicOS = {
  version: '0.1.0',
  agents: {
    orchestrator: true,
    branding: true,
    content: true,
    campaign: true,
    workflow: true,
    promptLibrary: true,
    qa: true,
  },
  skills: {
    createSocialContent: true,
    createContentCalendar: true,
    createBrandingKit: true,
    createCampaignPlan: true,
    createWorkflow: true,
    validateProject: true,
  },
  modules: {
    dashboard: true,
    projects: true,
    branding: true,
    prompts: true,
    content: true,
    calendar: true,
    campaigns: true,
    workflows: true,
    automations: true,
    settings: true,
  },
  projectSchema: {
    name: '',
    niche: '',
    audience: '',
    objective: '',
    platform: '',
    palette: { primary: '#FF2D8D', secondary: '#7B2D8E', accent: '#FFD700', background: '#0D0D12', text: '#FFFFFF' },
    fonts: { heading: 'Inter', body: 'Inter' },
    tone: '',
    visualStyle: '',
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
}
