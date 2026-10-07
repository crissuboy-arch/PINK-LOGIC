/**
 * Cria um plano de campanha completo com milestones e canais.
 * Usa a identidade visual do projeto para consistência.
 */
export interface CampaignMilestone {
  date: Date
  description: string
  type: 'kickoff' | 'content' | 'review' | 'launch' | 'report'
}

export interface CampaignInput {
  projectId: string
  name: string
  goal: string
  channels: string[]
  startDate: Date
  endDate?: Date
  brandTone?: string
}

export interface CampaignOutput {
  id: string
  projectId: string
  name: string
  goal: string
  channels: string[]
  startDate: Date
  endDate: Date
  milestones: CampaignMilestone[]
  tone: string
  status: 'draft'
  createdAt: Date
}

const RULES = [
  'Campaign tone matches project brand tone',
  'All content uses project visual identity',
  'Minimum 1 milestone per campaign',
  'Channels must be defined before launch',
]

export async function createCampaignSkill(input: CampaignInput): Promise<CampaignOutput> {
  const endDate = input.endDate || new Date(input.startDate.getTime() + 30 * 24 * 60 * 60 * 1000)
  const milestones: CampaignMilestone[] = [
    { date: input.startDate, description: 'Kickoff da campanha', type: 'kickoff' },
    { date: new Date(input.startDate.getTime() + 7 * 24 * 60 * 60 * 1000), description: 'Revisão de conteúdo', type: 'review' },
    { date: endDate, description: 'Relatório final', type: 'report' },
  ]

  return {
    id: crypto.randomUUID(),
    projectId: input.projectId,
    name: input.name,
    goal: input.goal,
    channels: input.channels,
    startDate: input.startDate,
    endDate,
    milestones,
    tone: input.brandTone || 'profissional e acolhedor',
    status: 'draft',
    createdAt: new Date(),
  }
}

export { RULES as campaignRules }
