import type { AIExecutionRecord, AIExecutionStats } from '../../ai/types'

const STORAGE_KEY = 'pinklogic.ai.executions'
const MAX_RECORDS = 100

function loadAll(): AIExecutionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveAll(records: AIExecutionRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch {
    console.warn('[AIStore] Falha ao salvar')
  }
}

export function saveAIExecution(record: AIExecutionRecord): void {
  const all = loadAll()
  all.unshift(record)
  saveAll(all.slice(0, MAX_RECORDS))
}

export function listAIExecutions(limit = 20): AIExecutionRecord[] {
  return loadAll().slice(0, limit)
}

export function getAIExecution(id: string): AIExecutionRecord | undefined {
  return loadAll().find((r) => r.id === id)
}

export function getAIStats(): AIExecutionStats {
  const all = loadAll()
  const completed = all.filter((r) => r.success || !r.success)
  const success = all.filter((r) => r.success)
  const totalTokens = all.reduce((sum, r) => sum + r.tokensUsed.total, 0)
  const totalCost = all.reduce((sum, r) => sum + r.costEstimate, 0)
  const durations = all.filter((r) => r.duration > 0).map((r) => r.duration)
  const avgDuration = durations.length > 0
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : 0

  const modelCount = new Map<string, number>()
  for (const r of all) {
    if (r.model) modelCount.set(r.model, (modelCount.get(r.model) || 0) + 1)
  }

  return {
    totalExecutions: all.length,
    successRate: completed.length > 0 ? Math.round((success.length / completed.length) * 100) : 0,
    totalTokens,
    totalCost,
    averageDuration: avgDuration,
    topModels: [...modelCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([model, count]) => ({ model, count })),
  }
}

export function clearAIExecutions(): void {
  localStorage.removeItem(STORAGE_KEY)
}
