import type { AgentDefinition, AgentExecutionInput, AgentExecutionResult, AgentStatus } from '../types'

export interface AgentConfig {
  id: string
  name: string
  description: string
  capabilities: string[]
  triggers: string[]
  workflows?: string[]
  executeImpl: (input: AgentExecutionInput) => Promise<AgentExecutionResult>
}

export function createAgent(config: AgentConfig): AgentDefinition {
  let status: AgentStatus = 'idle'

  return {
    id: config.id,
    name: config.name,
    description: config.description,
    capabilities: config.capabilities,
    triggers: config.triggers,
    workflows: config.workflows ?? [],
    enabled: true,
    get status() {
      return status
    },
    set status(s: AgentStatus) {
      status = s
    },
    async execute(input: AgentExecutionInput): Promise<AgentExecutionResult> {
      status = 'running'
      try {
        const result = await config.executeImpl(input)
        status = result.status === 'success' ? 'success' : 'failed'
        return result
      } catch (err) {
        status = 'failed'
        return {
          agentId: config.id,
          status: 'failed',
          output: {},
          logs: [`Erro: ${err instanceof Error ? err.message : 'unknown'}`],
          duration: 0,
        }
      }
    },
  }
}
