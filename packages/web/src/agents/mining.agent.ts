import { createAgent } from './core/BaseAgent'
import type { AgentExecutionInput, AgentExecutionResult } from './types'

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const miningAgent = createAgent({
  id: 'mining-agent',
  name: 'MiningAgent',
  description: 'Extrai e coleta dados de fontes externas: tendências, concorrência, referências',
  capabilities: ['mining'],
  triggers: ['extrair', 'minerar', 'coletar', 'dados', 'tendencias'],
  workflows: [],
  async executeImpl(input: AgentExecutionInput): Promise<AgentExecutionResult> {
    const start = Date.now()
    const logs: string[] = []
    logs.push(`[MiningAgent] Iniciando extração: ${input.step.name}`)

    await delay(100 + Math.random() * 80)

    const output: Record<string, unknown> = {
      source: 'mock-data',
      collectedAt: new Date().toISOString(),
      items: [
        { topic: 'Tendência 1', volume: Math.floor(Math.random() * 10000), sentiment: 'positivo' },
        { topic: 'Tendência 2', volume: Math.floor(Math.random() * 5000), sentiment: 'neutro' },
      ],
      totalCollected: Math.floor(Math.random() * 50 + 10),
      mockResult: '[MOCK] MiningAgent: dados extraídos com sucesso (modo simulação)',
    }

    logs.push(`[MiningAgent] Itens coletados: ${output.totalCollected}`)
    logs.push(`[MiningAgent] Extração concluída em ${Date.now() - start}ms`)

    return { agentId: 'mining-agent', status: 'success', output, logs, duration: Date.now() - start }
  },
})
