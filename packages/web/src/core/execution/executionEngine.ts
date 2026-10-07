import type { ResolvedIntent } from '../orchestrator/resolveIntent'
import type { TaskRoute } from '../orchestrator/routeTask'
import { AgentRegistry } from '../../agents/registry/AgentRegistry'
import { getSkill } from '../registry/skills.registry'
import { saveExecution, type ExecutionRecord, type ExecutionStepRecord } from './executionStore'
import { addLog } from '../logs/agentLogs'
import { addTimelineEvent } from '../logs/taskTimeline'

function generateId(): string {
  return crypto.randomUUID()
}

function nowISO(): string {
  return new Date().toISOString()
}

function log(executionId: string, stepId: string | null, agentId: string, agentName: string, level: LogLevel, message: string) {
  addLog({ id: generateId(), executionId, stepId, agentId, agentName, level, message, timestamp: nowISO() })
}

type LogLevel = 'info' | 'warn' | 'error'

function timeline(executionId: string, type: TimelineEventType, message: string, meta?: { stepId?: string; stepName?: string; agentId?: string; agentName?: string }) {
  addTimelineEvent({
    id: generateId(),
    executionId,
    type,
    stepId: meta?.stepId ?? null,
    stepName: meta?.stepName ?? null,
    agentId: meta?.agentId ?? null,
    agentName: meta?.agentName ?? null,
    message,
    timestamp: nowISO(),
  })
}

type TimelineEventType = 'started' | 'step-started' | 'step-completed' | 'step-failed' | 'completed' | 'failed' | 'log'

function getAgentName(agentId: string): string {
  const agent = AgentRegistry.get(agentId)
  return agent?.name ?? agentId ?? 'unknown'
}

function getSkillName(skillId: string): string {
  const skill = getSkill(skillId)
  return skill?.name ?? skillId ?? 'none'
}

export async function runExecution(intent: ResolvedIntent, route: TaskRoute): Promise<ExecutionRecord> {
  const executionId = generateId()
  const workflowName = route.workflow?.name ?? 'Rota dinâmica'

  const stepRecords: ExecutionStepRecord[] = route.steps.map((s) => ({
    id: s.id,
    order: s.order,
    name: s.name,
    agentId: s.agentId ?? null,
    agentName: getAgentName(s.agentId ?? ''),
    skillId: s.skillId ?? null,
    skillName: getSkillName(s.skillId ?? ''),
    status: 'pending',
    startedAt: nowISO(),
    finishedAt: null,
    duration: 0,
    output: {},
  }))

  const execution: ExecutionRecord = {
    id: executionId,
    workflowId: route.workflow?.id ?? null,
    workflowName,
    intent: intent.raw,
    intentType: intent.type,
    intentConfidence: intent.confidence,
    status: 'running',
    startedAt: nowISO(),
    finishedAt: null,
    totalDuration: null,
    steps: stepRecords,
  }

  saveExecution(execution)
  log(executionId, null, 'system', 'Orchestrator', 'info', `Execução iniciada: "${intent.raw}"`)
  timeline(executionId, 'started', `Pipeline "${workflowName}" iniciado`, { agentName: 'Orchestrator' })

  let allSuccess = true

  for (let i = 0; i < route.steps.length; i++) {
    const step = route.steps[i]
    const agentName = getAgentName(step.agentId ?? '')
    const agentDef = step.agentId ? AgentRegistry.get(step.agentId) : undefined

    execution.steps[i].status = 'running'
    execution.steps[i].startedAt = nowISO()
    saveExecution(execution)

    log(executionId, step.id, step.agentId ?? 'system', agentName, 'info', `Step ${i + 1}: ${step.name} — iniciado`)
    timeline(executionId, 'step-started', `Step ${i + 1}: ${step.name}`, {
      stepId: step.id,
      stepName: step.name,
      agentId: step.agentId,
      agentName,
    })

    if (agentDef) {
      const result = await agentDef.execute({ intent, step, context: {} })
      execution.steps[i].status = result.status === 'success' ? 'success' : 'failed'
      execution.steps[i].finishedAt = nowISO()
      execution.steps[i].duration = result.duration
      execution.steps[i].output = result.output
      if (result.logs) result.logs.forEach((msg: string) => log(executionId, step.id, step.agentId ?? 'system', agentName, 'info', msg))
    } else {
      execution.steps[i].status = 'failed'
      execution.steps[i].finishedAt = nowISO()
      execution.steps[i].duration = 0
      execution.steps[i].output = { error: `Nenhum agente encontrado para: ${step.agentId}` }
      allSuccess = false
    }

    saveExecution(execution)
    log(executionId, step.id, step.agentId ?? 'system', agentName, 'info', `Step ${i + 1}: ${step.name} — ${execution.steps[i].status} (${execution.steps[i].duration}ms)`)
    timeline(executionId, execution.steps[i].status === 'success' ? 'step-completed' : 'step-failed', `Step ${i + 1}: ${step.name} — ${execution.steps[i].duration}ms`, {
      stepId: step.id,
      stepName: step.name,
      agentId: step.agentId,
      agentName,
    })
  }

  const totalDuration = route.steps.reduce((sum, _, i) => sum + execution.steps[i].duration, 0)
  execution.status = allSuccess ? 'success' : 'failed'
  execution.finishedAt = nowISO()
  execution.totalDuration = totalDuration
  saveExecution(execution)

  log(executionId, null, 'system', 'Orchestrator', 'info', `Execução concluída — status: ${execution.status} (${totalDuration}ms)`)
  timeline(executionId, allSuccess ? 'completed' : 'failed', `Pipeline "${workflowName}" ${allSuccess ? 'concluído' : 'falhou'} — ${totalDuration}ms`, {
    agentName: 'Orchestrator',
  })

  return execution
}
