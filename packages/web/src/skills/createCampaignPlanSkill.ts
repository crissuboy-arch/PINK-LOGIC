import type { CampaignPlan } from '../agents/campaignAgent'

export interface CampaignPlanInput {
  projectId: string
  name: string
  goal: string
  channels?: string[]
  durationDays?: number
}

export async function createCampaignPlanSkill(input: CampaignPlanInput): Promise<CampaignPlan> {
  const { campaignAgent } = await import('../agents/campaignAgent')
  return campaignAgent(input.projectId, input.name, input.goal)
}
