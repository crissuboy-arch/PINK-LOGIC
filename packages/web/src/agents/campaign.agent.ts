import { createAgent } from './core/BaseAgent'
import type { AgentExecutionInput, AgentExecutionResult } from './types'

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const campaignAgent = createAgent({
  id: 'campaign-agent',
  name: 'CampaignAgent',
  description: 'Planeja, executa e monitora campanhas de marketing multicanal',
  capabilities: ['campaign', 'analytics'],
  triggers: ['campanha', 'criar campanha'],
  workflows: ['criar-campanha-instagram'],
  async executeImpl(input: AgentExecutionInput): Promise<AgentExecutionResult> {
    const start = Date.now()
    const logs: string[] = []
    logs.push(`[CampaignAgent] Planejando campanha: ${input.step.name}`)

    await delay(80 + Math.random() * 50)

    const platform = input.intent.platform ?? 'instagram'
    const output: Record<string, unknown> = {
      campaignName: `Campanha ${platform} - ${new Date().toLocaleDateString()}`,
      goal: input.step.input?.goal ?? 'Aumentar engajamento',
      channels: [platform, 'email'],
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      status: 'draft',
      milestones: [
        { date: new Date().toISOString(), description: 'Início da campanha' },
        { date: new Date(Date.now() + 15 * 86400000).toISOString(), description: 'Revisão de métricas' },
      ],
      mockResult: `[MOCK] CampaignAgent: campanha para ${platform} planejada`,
    }

    logs.push(`[CampaignAgent] Canais: ${(output.channels as string[]).join(', ')}`)
    logs.push(`[CampaignAgent] Campanha estruturada em ${Date.now() - start}ms`)

    return { agentId: 'campaign-agent', status: 'success', output, logs, duration: Date.now() - start }
  },
})
