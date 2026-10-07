import { AgentRegistry } from './AgentRegistry'
import { brandingAgent } from '../branding.agent'
import { contentAgent } from '../content.agent'
import { campaignAgent } from '../campaign.agent'
import { automationAgent } from '../automation.agent'
import { analyticsAgent } from '../analytics.agent'
import { miningAgent } from '../mining.agent'
import { calendarAgent } from '../calendar.agent'

export function registerAllAgents(): void {
  const agents = [
    brandingAgent,
    contentAgent,
    campaignAgent,
    automationAgent,
    analyticsAgent,
    miningAgent,
    calendarAgent,
  ]

  for (const agent of agents) {
    AgentRegistry.register(agent)
  }
}
