import type { AgentExecutionContext } from '../runtime/AgentRuntime'
import { aiClient } from '../../ai/OpenAIClient'
import type { OpenAIResponse } from '../../ai/types'
import { buildPrompt, type AgentType } from './PromptBuilder'
import { parseAIResponse, type ParsedResponse } from './AIResponseParser'
import { getModelForAgent, DEFAULT_MODEL } from '../../ai/modelConfig'

export interface SkillExecutionResult {
  success: boolean
  output: Record<string, unknown>
  raw: string
  tokens: { prompt: number; completion: number; total: number }
  duration: number
  model: string
  cost: number
  warnings: string[]
  logs: string[]
}

export async function executeSkill(
  agentType: AgentType,
  skillId: string,
  context: AgentExecutionContext,
  options?: { model?: string; temperature?: number },
): Promise<SkillExecutionResult> {
  const logs: string[] = []
  const startTime = Date.now()

  logs.push(`Executando skill ${skillId} com agente ${agentType}`)

  const prompt = buildPrompt(agentType, context)
  logs.push(`Prompt: ${prompt.messages.length} mensagens`)

  if (!aiClient.hasApiKey()) {
    logs.push('API key ausente')
    return {
      success: false,
      output: {},
      raw: '',
      tokens: { prompt: 0, completion: 0, total: 0 },
      duration: Date.now() - startTime,
      model: '',
      cost: 0,
      warnings: ['API key da OpenAI não configurada. Configure em Configurações > IA.'],
      logs,
    }
  }

  const modelCfg = getModelForAgent(agentType)
  const primaryModel = options?.model || modelCfg.primary
  const fallbackModels = modelCfg.fallback.filter((m) => m !== primaryModel)
  const fallbackModel = fallbackModels[0] || DEFAULT_MODEL

  logs.push(`Modelo primário: ${primaryModel}`)
  logs.push(`Fallback: ${fallbackModel}`)

  let response: OpenAIResponse
  try {
    response = await aiClient.chatWithFallback(
      prompt.messages,
      primaryModel as any,
      fallbackModel as any,
    )
    const duration = Date.now() - startTime
    const cost = aiClient.estimateCost(response.model, response.usage)
    logs.push(`Resposta: modelo=${response.model} tokens=${response.usage.totalTokens} custo=$${cost.toFixed(6)} duração=${duration}ms`)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logs.push(`Erro: ${message}`)
    return {
      success: false,
      output: {},
      raw: '',
      tokens: { prompt: 0, completion: 0, total: 0 },
      duration: Date.now() - startTime,
      model: primaryModel,
      cost: 0,
      warnings: [message],
      logs,
    }
  }

  const parsed: ParsedResponse = parseAIResponse(response.content)
  logs.push(`Parse: ${parsed.success ? 'sucesso' : 'falha'}`)
  if (parsed.warnings.length > 0) {
    logs.push(`Warnings: ${parsed.warnings.join(', ')}`)
  }

  const cost = aiClient.estimateCost(response.model, response.usage)

  return {
    success: parsed.success,
    output: parsed.data,
    raw: parsed.raw,
    tokens: {
      prompt: response.usage.promptTokens,
      completion: response.usage.completionTokens,
      total: response.usage.totalTokens,
    },
    duration: Date.now() - startTime,
    model: response.model,
    cost,
    warnings: parsed.warnings,
    logs,
  }
}
