import type { AgentDefinition } from '../types'
import type { AgentExecutionInput } from '../types'
import type { ResolvedIntent } from '../../core/orchestrator/resolveIntent'
import type { WorkflowStep } from '../../core/registry/workflows.registry'
import { buildContext, type AgentExecutionContext, type PreviousExecution } from '../runtime/AgentRuntime'
import { executeSkill, type SkillExecutionResult } from './SkillExecutor'
import { listExecutions } from '../../core/execution/executionStore'
import type { ExecutionRecord } from '../../core/execution/executionStore'
import { getModelForAgent } from '../../ai/modelConfig'

export interface ExecutionResult {
  success: boolean
  output: Record<string, unknown>
  tokensUsed: { prompt: number; completion: number; total: number }
  duration: number
  model: string
  logs: string[]
  warnings: string[]
  costEstimate: number
}

export type AgentType = 'content' | 'campaign' | 'design' | 'branding' | 'analytics' | 'automation' | 'mining' | 'calendar' | 'validation'

function getPreviousExecutions(): PreviousExecution[] {
  try {
    const records: ExecutionRecord[] = listExecutions(10)
    return records.map((r) => ({
      executionId: r.id,
      agentId: '',
      status: r.status === 'success' ? 'success' : 'failed',
      output: {},
      duration: r.totalDuration || 0,
      timestamp: r.startedAt,
    }))
  } catch {
    return []
  }
}

function mapAgentType(agentId: string): AgentType {
  if (agentId.includes('content')) return 'content'
  if (agentId.includes('campaign')) return 'campaign'
  if (agentId.includes('design') || agentId.includes('branding')) return 'branding'
  if (agentId.includes('analytics')) return 'analytics'
  if (agentId.includes('automation')) return 'automation'
  if (agentId.includes('mining')) return 'mining'
  if (agentId.includes('calendar')) return 'calendar'
  if (agentId.includes('validation') || agentId.includes('qa')) return 'validation'
  return 'content'
}

export async function executeAgent(
  agent: AgentDefinition,
  input: AgentExecutionInput,
): Promise<ExecutionResult> {
  const logs: string[] = []
  const startTime = Date.now()

  logs.push(`Iniciando agente: ${agent.id} (${agent.name})`)

  const intent: ResolvedIntent = input.intent
  const step: WorkflowStep = input.step

  const context: AgentExecutionContext = buildContext({
    userInput: intent?.raw || '',
    intent: {
      type: intent?.type || 'unknown',
      action: intent?.action || '',
      target: intent?.target || '',
      platform: intent?.platform,
      confidence: intent?.confidence || 0,
    },
    workflow: step ? {
      id: step.id,
      name: step.name,
      stepId: step.id,
      stepName: step.name,
    } : undefined,
    previousExecutions: getPreviousExecutions(),
  })

  const skillId = step?.skillId || 'default'
  const agentType = mapAgentType(agent.id)
  const modelCfg = getModelForAgent(agentType)

  logs.push(`Contexto: intent=${context.intent.type}`)
  logs.push(`Modelo atribuído: ${modelCfg.primary}`)
  logs.push(`Fallbacks: ${modelCfg.fallback.join(' → ')}`)

  try {
    const skillResult: SkillExecutionResult = await executeSkill(agentType, skillId, context)
    logs.push(...skillResult.logs)

    return {
      success: skillResult.success,
      output: skillResult.output,
      tokensUsed: skillResult.tokens,
      duration: skillResult.duration,
      model: skillResult.model,
      logs,
      warnings: skillResult.warnings,
      costEstimate: skillResult.cost,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logs.push(`Erro fatal: ${message}`)

    return {
      success: false,
      output: {},
      tokensUsed: { prompt: 0, completion: 0, total: 0 },
      duration: Date.now() - startTime,
      model: modelCfg.primary,
      logs,
      warnings: [message],
      costEstimate: 0,
    }
  }
}

export { mapAgentType }
