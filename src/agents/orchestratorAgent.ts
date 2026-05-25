export interface AgentTask {
  id: string
  type: 'branding' | 'content' | 'campaign' | 'workflow' | 'prompt' | 'qa'
  input: Record<string, unknown>
  projectId?: string
}

export interface AgentResult {
  taskId: string
  success: boolean
  data: Record<string, unknown>
  error?: string
}

export function orchestratorAgent(task: AgentTask): Promise<AgentResult> {
  return Promise.resolve({
    taskId: task.id,
    success: true,
    data: { message: `Task ${task.type} received by Orchestrator` },
  })
}
