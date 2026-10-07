export interface ExecutionStepRecord {
  id: string
  order: number
  name: string
  agentId: string | null
  agentName: string
  skillId: string | null
  skillName: string
  status: 'pending' | 'running' | 'success' | 'failed'
  startedAt: string
  finishedAt: string | null
  duration: number
  output: Record<string, unknown>
  error?: string
}

export interface ExecutionRecord {
  id: string
  workflowId: string | null
  workflowName: string
  intent: string
  intentType: string
  intentConfidence: number
  status: 'pending' | 'running' | 'success' | 'failed'
  startedAt: string
  finishedAt: string | null
  totalDuration: number | null
  steps: ExecutionStepRecord[]
}

const STORAGE_KEY = 'pinklogic.executions'
const MAX_EXECUTIONS = 50

function loadAll(): ExecutionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveAll(records: ExecutionRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch {
    console.warn('[ExecutionStore] Falha ao salvar execuções')
  }
}

export function saveExecution(record: ExecutionRecord): void {
  const all = loadAll()
  const idx = all.findIndex((e) => e.id === record.id)
  if (idx >= 0) {
    all[idx] = record
  } else {
    all.unshift(record)
  }
  saveAll(all.slice(0, MAX_EXECUTIONS))
}

export function getExecution(id: string): ExecutionRecord | undefined {
  return loadAll().find((e) => e.id === id)
}

export function listExecutions(limit = 10): ExecutionRecord[] {
  return loadAll().slice(0, limit)
}

export function getExecutionsByStatus(status: ExecutionRecord['status']): ExecutionRecord[] {
  return loadAll().filter((e) => e.status === status)
}
