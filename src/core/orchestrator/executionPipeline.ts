import type { TaskRoute } from './routeTask'
import type { ResolvedIntent } from './resolveIntent'
import { getAgent } from '../registry/agents.registry'
import { getSkill } from '../registry/skills.registry'

export interface StepResult {
  stepId: string
  stepName: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  agentId?: string
  skillId?: string
  output: Record<string, unknown>
  duration: number
  error?: string
}

export interface PipelineResult {
  intent: ResolvedIntent
  route: TaskRoute
  steps: StepResult[]
  status: 'completed' | 'partial' | 'failed'
  totalDuration: number
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function executeStep(
  step: TaskRoute['steps'][number],
  intent: ResolvedIntent,
): Promise<StepResult> {
  const startTime = Date.now()
  const agentInfo = step.agentId ? getAgent(step.agentId) : undefined
  const skillInfo = step.skillId ? getSkill(step.skillId) : undefined

  await delay(100)

  const output: Record<string, unknown> = {
    intentType: intent.type,
    intentAction: intent.action,
    intentTarget: intent.target,
    agentUsed: agentInfo?.name ?? step.agentId ?? 'unknown',
    skillUsed: skillInfo?.name ?? step.skillId ?? 'none',
    mockResult: `[MOCK] ${agentInfo?.name ?? 'Agente'} executou "${skillInfo?.name ?? step.name}" com sucesso`,
  }

  return {
    stepId: step.id,
    stepName: step.name,
    status: 'completed',
    agentId: step.agentId,
    skillId: step.skillId,
    output,
    duration: Date.now() - startTime,
  }
}

export async function executePipeline(
  intent: ResolvedIntent,
  route: TaskRoute,
): Promise<PipelineResult> {
  const overallStart = Date.now()
  const stepResults: StepResult[] = []

  for (const step of route.steps) {
    stepResults.push(await executeStep(step, intent))
  }

  const failed = stepResults.filter((s) => s.status === 'failed').length
  const status: PipelineResult['status'] =
    failed === 0 ? 'completed' : failed === stepResults.length ? 'failed' : 'partial'

  return {
    intent,
    route,
    steps: stepResults,
    status,
    totalDuration: Date.now() - overallStart,
  }
}
