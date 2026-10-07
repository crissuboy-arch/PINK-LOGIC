import { listExecutions, getExecutionsByStatus, getExecution } from '../execution/executionStore'
import type { ExecutionRecord } from '../execution/executionStore'
import { getLogsForExecution } from '../logs/agentLogs'
import { getTimelineForExecution } from '../logs/taskTimeline'

export interface ExecutionSummary {
  total: number
  success: number
  failed: number
  running: number
  averageDuration: number
}

export function getSummary(): ExecutionSummary {
  const all = listExecutions(50)
  const success = all.filter((e) => e.status === 'success').length
  const failed = all.filter((e) => e.status === 'failed').length
  const running = all.filter((e) => e.status === 'running').length

  const completed = all.filter((e) => e.status === 'success' && e.totalDuration != null)
  const averageDuration =
    completed.length > 0
      ? Math.round(completed.reduce((sum, e) => sum + (e.totalDuration ?? 0), 0) / completed.length)
      : 0

  return {
    total: all.length,
    success,
    failed,
    running,
    averageDuration,
  }
}

export function getHistory(limit = 10): ExecutionRecord[] {
  return listExecutions(limit)
}

export function getByStatus(status: ExecutionRecord['status']): ExecutionRecord[] {
  return getExecutionsByStatus(status)
}

export function getExecutionDetail(id: string) {
  const execution = getExecution(id)
  if (!execution) return null
  const logs = getLogsForExecution(id)
  const timeline = getTimelineForExecution(id)
  return { execution, logs, timeline }
}
