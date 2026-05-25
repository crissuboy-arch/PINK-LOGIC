export interface Campaign {
  id: string
  projectId: string
  name: string
  goal: string
  channels: string[]
  startDate: Date
  endDate: Date
  status: 'draft' | 'active' | 'paused' | 'completed'
}

export interface CampaignPlan {
  campaign: Campaign
  milestones: { date: Date; description: string }[]
}

export function campaignAgent(projectId: string, name: string, goal: string): Promise<CampaignPlan> {
  return Promise.resolve({
    campaign: {
      id: crypto.randomUUID(),
      projectId,
      name,
      goal,
      channels: ['instagram', 'email'],
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'draft',
    },
    milestones: [{ date: new Date(), description: 'Início da campanha' }],
  })
}
