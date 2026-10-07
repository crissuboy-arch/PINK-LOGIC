import { createAgent } from './core/BaseAgent'
import type { AgentExecutionInput, AgentExecutionResult } from './types'

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const analyticsAgent = createAgent({
  id: 'analytics-agent',
  name: 'AnalyticsAgent',
  description: 'Analisa métricas de campanhas, conteúdos e desempenho geral, gerando relatórios',
  capabilities: ['analytics'],
  triggers: ['analisar', 'analytics', 'resultados', 'metricas', 'relatorio'],
  workflows: [],
  async executeImpl(input: AgentExecutionInput): Promise<AgentExecutionResult> {
    const start = Date.now()
    const logs: string[] = []
    logs.push(`[AnalyticsAgent] Iniciando análise: ${input.step.name}`)

    await delay(90 + Math.random() * 60)

    const output: Record<string, unknown> = {
      period: 'Últimos 30 dias',
      metrics: {
        impressions: Math.floor(Math.random() * 50000),
        engagement: `${(Math.random() * 5 + 1).toFixed(1)}%`,
        clicks: Math.floor(Math.random() * 3000),
        conversions: Math.floor(Math.random() * 200),
      },
      topContent: ['Post 1', 'Post 2', 'Post 3'],
      recommendation: 'Aumentar frequência de posts no horário das 18h-21h',
      mockResult: '[MOCK] AnalyticsAgent: relatório gerado com métricas simuladas',
    }

    logs.push(`[AnalyticsAgent] Métricas: ${JSON.stringify(output.metrics)}`)
    logs.push(`[AnalyticsAgent] Análise concluída em ${Date.now() - start}ms`)

    return { agentId: 'analytics-agent', status: 'success', output, logs, duration: Date.now() - start }
  },
})
