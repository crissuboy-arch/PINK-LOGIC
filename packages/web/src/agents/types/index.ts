import type { ResolvedIntent } from '../../core/orchestrator/resolveIntent'
import type { WorkflowStep } from '../../core/registry/workflows.registry'

export type AgentStatus = 'idle' | 'running' | 'success' | 'failed' | 'disabled'

export interface AgentExecutionInput {
  intent: ResolvedIntent
  step: WorkflowStep
  context: Record<string, unknown>
}

export interface AgentExecutionResult {
  agentId: string
  status: 'success' | 'failed'
  output: Record<string, unknown>
  logs: string[]
  duration: number
}

export interface AgentDefinition {
  id: string
  name: string
  description: string
  capabilities: string[]
  triggers: string[]
  workflows: string[]
  enabled: boolean
  status: AgentStatus
  execute(input: AgentExecutionInput): Promise<AgentExecutionResult>
}

export type CapabilityMap = Record<string, AgentDefinition[]>

export function buildCapabilityMap(agents: AgentDefinition[]): CapabilityMap {
  const map: CapabilityMap = {}
  for (const agent of agents) {
    for (const cap of agent.capabilities) {
      if (!map[cap]) map[cap] = []
      map[cap].push(agent)
    }
  }
  return map
}
