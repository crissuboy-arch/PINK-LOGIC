export type OpenAIModel = 'gpt-4o' | 'gpt-4o-mini' | 'gpt-4.1-mini'

export interface OpenAIConfig {
  model?: OpenAIModel
  maxTokens?: number
  temperature?: number
  timeout?: number
  retryCount?: number
  apiKey?: string
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface OpenAIUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

export interface OpenAIResponse {
  content: string
  model: string
  usage: OpenAIUsage
  finishReason: string
}

export interface AIExecutionRecord {
  id: string
  agentId: string
  agentName: string
  agentType: string
  input: string
  output: Record<string, unknown>
  success: boolean
  model: string
  tokensUsed: { prompt: number; completion: number; total: number }
  duration: number
  costEstimate: number
  warnings: string[]
  logs: string[]
  timestamp: string
}

export interface AIExecutionStats {
  totalExecutions: number
  successRate: number
  totalTokens: number
  totalCost: number
  averageDuration: number
  topModels: { model: string; count: number }[]
}
