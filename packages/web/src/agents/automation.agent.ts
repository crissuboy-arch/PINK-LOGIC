import { createAgent } from './core/BaseAgent'
import type { AgentExecutionInput, AgentExecutionResult } from './types'

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const automationAgent = createAgent({
  id: 'automation-agent',
  name: 'AutomationAgent',
  description: 'Automatiza processos repetitivos: agendamento, publicação, notificações e integrações',
  capabilities: ['automation', 'workflow'],
  triggers: ['automatizar', 'automacao', 'automação', 'processo'],
  workflows: [],
  async executeImpl(input: AgentExecutionInput): Promise<AgentExecutionResult> {
    const start = Date.now()
    const logs: string[] = []
    logs.push(`[AutomationAgent] Configurando automação: ${input.step.name}`)

    await delay(50 + Math.random() * 30)

    const output: Record<string, unknown> = {
      automationType: 'schedule',
      trigger: 'time-based',
      action: input.step.name,
      scheduledFor: new Date(Date.now() + 3600000).toISOString(),
      enabled: true,
      mockResult: `[MOCK] AutomationAgent: regra de automação criada para "${input.step.name}"`,
    }

    logs.push(`[AutomationAgent] Automação configurada: ${output.automationType}`)
    logs.push(`[AutomationAgent] Concluído em ${Date.now() - start}ms`)

    return { agentId: 'automation-agent', status: 'success', output, logs, duration: Date.now() - start }
  },
})
