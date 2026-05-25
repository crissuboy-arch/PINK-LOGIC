import type { DetectedPattern } from '../../design/learning/PatternRecognition'
import type { AdaptiveBrandProfile } from '../../design/learning/PreferenceTracker'
import type { DesignMemoryRecord } from '../../design/memory/DesignMemory'

export interface PreviousExecution {
  executionId: string
  agentId: string
  status: 'success' | 'failed'
  output: Record<string, unknown>
  duration: number
  timestamp: string
}

export interface AgentExecutionContext {
  userInput: string
  intent: {
    type: string
    action: string
    target: string
    platform?: string
    confidence: number
  }
  workflow?: {
    id: string
    name: string
    stepId: string
    stepName: string
  }
  project?: {
    id: string
    name: string
  }
  branding?: Record<string, unknown>
  memory?: {
    records: DesignMemoryRecord[]
    stats: {
      totalRecords: number
      averageScore: number
      acceptanceRate: number
    }
  }
  adaptiveProfile?: AdaptiveBrandProfile
  previousExecutions: PreviousExecution[]
}

export function buildContext(params: Partial<AgentExecutionContext>): AgentExecutionContext {
  return {
    userInput: params.userInput || '',
    intent: params.intent || { type: 'unknown', action: '', target: '', confidence: 0 },
    previousExecutions: params.previousExecutions || [],
    ...params,
  }
}
