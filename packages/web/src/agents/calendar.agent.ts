import { createAgent } from './core/BaseAgent'
import type { AgentExecutionInput, AgentExecutionResult } from './types'

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const calendarAgent = createAgent({
  id: 'calendar-agent',
  name: 'CalendarAgent',
  description: 'Gerencia calendário editorial, agendamento de posts e distribuição de conteúdo',
  capabilities: ['calendar', 'content'],
  triggers: ['calendario', 'agendar', 'agendamento', 'calendário'],
  workflows: [],
  async executeImpl(input: AgentExecutionInput): Promise<AgentExecutionResult> {
    const start = Date.now()
    const logs: string[] = []
    logs.push(`[CalendarAgent] Organizando calendário: ${input.step.name}`)

    await delay(60 + Math.random() * 40)

    const now = new Date()
    const events = Array.from({ length: 5 }, (_, i) => ({
      date: new Date(now.getTime() + i * 86400000).toISOString().split('T')[0],
      type: ['post', 'story', 'reel'][Math.floor(Math.random() * 3)],
      topic: `Conteúdo ${i + 1}`,
      status: 'scheduled',
    }))

    const output: Record<string, unknown> = {
      events,
      totalEvents: events.length,
      frequency: '1 post/dia',
      nextWeekSummary: `${events.length} eventos agendados para os próximos dias`,
      mockResult: '[MOCK] CalendarAgent: calendário editorial organizado',
    }

    logs.push(`[CalendarAgent] ${events.length} eventos organizados`)
    logs.push(`[CalendarAgent] Calendário gerado em ${Date.now() - start}ms`)

    return { agentId: 'calendar-agent', status: 'success', output, logs, duration: Date.now() - start }
  },
})
