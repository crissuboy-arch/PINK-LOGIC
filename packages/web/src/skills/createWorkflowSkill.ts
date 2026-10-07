import type { Workflow } from '../agents/workflowAgent'

export interface WorkflowInput {
  projectId: string
  name: string
  steps: string[]
}

export async function createWorkflowSkill(input: WorkflowInput): Promise<Workflow> {
  const { workflowAgent } = await import('../agents/workflowAgent')
  return workflowAgent(input.projectId, input.name, input.steps)
}
