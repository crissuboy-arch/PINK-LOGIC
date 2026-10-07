import { resolveIntent, type ResolvedIntent } from './resolveIntent'
import { routeTask, type TaskRoute } from './routeTask'
import { runExecution } from '../execution/executionEngine'
import { registerAllAgents } from '../../agents/registry/registerAgents'
import type { ExecutionRecord } from '../execution/executionStore'

let initialized = false

function ensureInit(): void {
  if (!initialized) {
    registerAllAgents()
    initialized = true
  }
}

export interface OrchestrationResult {
  intent: ResolvedIntent
  route: TaskRoute
  execution: ExecutionRecord
  success: boolean
}

export async function orchestrator(input: string): Promise<OrchestrationResult> {
  ensureInit()
  const intent = resolveIntent(input)
  const route = routeTask(intent)
  const execution = await runExecution(intent, route)

  return {
    intent,
    route,
    execution,
    success: execution.status === 'success',
  }
}

export async function orchestratorFromIntent(intent: ResolvedIntent): Promise<OrchestrationResult> {
  ensureInit()
  const route = routeTask(intent)
  const execution = await runExecution(intent, route)

  return {
    intent,
    route,
    execution,
    success: execution.status === 'success',
  }
}
