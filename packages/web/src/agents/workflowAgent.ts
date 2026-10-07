export interface WorkflowStep {
  id: string
  name: string
  description: string
  order: number
  status: 'pending' | 'running' | 'completed' | 'failed'
}

export interface Workflow {
  id: string
  projectId: string
  name: string
  steps: WorkflowStep[]
  createdAt: Date
}

export function workflowAgent(projectId: string, name: string, steps: string[]): Promise<Workflow> {
  return Promise.resolve({
    id: crypto.randomUUID(),
    projectId,
    name,
    steps: steps.map((step, i) => ({
      id: crypto.randomUUID(),
      name: step,
      description: `Executar: ${step}`,
      order: i + 1,
      status: 'pending',
    })),
    createdAt: new Date(),
  })
}
