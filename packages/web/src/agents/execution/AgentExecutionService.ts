import type { AgentDefinition } from '../types'
import type { AgentExecutionInput } from '../types'
import { executeAgent, type ExecutionResult, mapAgentType } from './executeAgent'
import { saveAIExecution, listAIExecutions, getAIStats } from './aiExecutionStore'
import type { AIExecutionRecord, AIExecutionStats } from '../../ai/types'
import { aiClient } from '../../ai/OpenAIClient'
import { addLog } from '../../core/logs/agentLogs'
import { addTimelineEvent } from '../../core/logs/taskTimeline'

function generateId(): string {
  return crypto.randomUUID()
}

export interface AIServiceConfig {
  enableLogging?: boolean
}

export class AgentExecutionService {
  private config: Required<AIServiceConfig>

  constructor(config: AIServiceConfig = {}) {
    this.config = {
      enableLogging: true,
      ...config,
    }
  }

  async execute(agent: AgentDefinition, input: AgentExecutionInput): Promise<ExecutionResult> {
    const executionId = generateId()
    const startTime = Date.now()

    if (this.config.enableLogging) {
      addLog({
        id: generateId(),
        executionId,
        stepId: input.step?.id || null,
        agentId: agent.id,
        agentName: agent.name,
        level: 'info',
        message: `[AI] Execução iniciada: ${agent.name}`,
        timestamp: new Date().toISOString(),
      })

      addTimelineEvent({
        id: generateId(),
        executionId,
        type: 'started',
        stepId: input.step?.id || null,
        stepName: input.step?.name || null,
        agentId: agent.id,
        agentName: agent.name,
        message: `Execução AI do agente ${agent.name} iniciada`,
        timestamp: new Date().toISOString(),
      })
    }

    const result = await executeAgent(agent, input)

    const record: AIExecutionRecord = {
      id: executionId,
      agentId: agent.id,
      agentName: agent.name,
      agentType: mapAgentType(agent.id),
      input: input.intent?.raw || '',
      output: result.output,
      success: result.success,
      model: result.model,
      tokensUsed: result.tokensUsed,
      duration: result.duration,
      costEstimate: result.costEstimate,
      warnings: result.warnings,
      logs: result.logs,
      timestamp: new Date().toISOString(),
    }

    saveAIExecution(record)

    if (this.config.enableLogging) {
      const elapsed = Date.now() - startTime
      addLog({
        id: generateId(),
        executionId,
        stepId: input.step?.id || null,
        agentId: agent.id,
        agentName: agent.name,
        level: result.success ? 'info' : 'error',
        message: `[AI] Execução concluída: ${result.success ? 'sucesso' : 'falha'} | modelo: ${result.model} | tokens: ${result.tokensUsed.total} | custo: $${result.costEstimate.toFixed(6)} | duração: ${elapsed}ms`,
        timestamp: new Date().toISOString(),
      })

      addTimelineEvent({
        id: generateId(),
        executionId,
        type: result.success ? 'completed' : 'failed',
        stepId: input.step?.id || null,
        stepName: input.step?.name || null,
        agentId: agent.id,
        agentName: agent.name,
        message: `Execução AI ${result.success ? 'concluída' : 'falhou'} — ${result.model}, ${result.tokensUsed.total} tokens, $${result.costEstimate.toFixed(4)}`,
        timestamp: new Date().toISOString(),
      })
    }

    return result
  }

  getHistory(): AIExecutionRecord[] {
    return listAIExecutions()
  }

  getStats(): AIExecutionStats {
    return getAIStats()
  }

  setApiKey(key: string): void {
    aiClient.setApiKey(key)
  }

  hasApiKey(): boolean {
    return aiClient.hasApiKey()
  }
}

export const agentExecutionService = new AgentExecutionService()
