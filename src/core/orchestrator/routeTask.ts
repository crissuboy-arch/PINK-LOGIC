import type { ResolvedIntent } from './resolveIntent'
import { findWorkflowsByTrigger } from '../registry/workflows.registry'
import { findSkillsByObjective } from '../registry/skills.registry'
import { AgentRegistry } from '../../agents/registry/AgentRegistry'
import type { WorkflowDefinition, WorkflowStep } from '../registry/workflows.registry'

export interface TaskRoute {
  workflow: WorkflowDefinition | null
  agents: { id: string; name: string }[]
  skills: { id: string; name: string }[]
  steps: WorkflowStep[]
  confidence: number
}

export function routeTask(intent: ResolvedIntent): TaskRoute {
  const triggerKey = `intent:${intent.action}:${intent.target}${intent.platform ? `:${intent.platform}` : ''}`
  const workflows = findWorkflowsByTrigger(triggerKey)

  if (workflows.length > 0) {
    const wf = workflows[0]
    return {
      workflow: wf,
      agents: wf.agents.map((id) => {
        const agent = AgentRegistry.get(id)
        return { id, name: agent?.name ?? id }
      }),
      skills: wf.skills.map((id) => ({
        id,
        name: id,
      })),
      steps: wf.steps,
      confidence: 0.9,
    }
  }

  const agents = AgentRegistry.findByCapability(intent.type)

  return {
    workflow: null,
    agents: agents.map((a) => ({ id: a.id, name: a.name })),
    skills: agents.flatMap((a) => a.capabilities.map((c) => ({ id: c, name: c }))),
    steps: agents.map((a, i) => ({
      id: `auto-step-${i + 1}`,
      order: i + 1,
      name: `Executar ${a.name}`,
      description: `Delegar tarefa para ${a.name}`,
      agentId: a.id,
    })),
    confidence: agents.length > 0 ? 0.6 : 0.2,
  }
}
