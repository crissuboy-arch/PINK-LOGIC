import type { ProjectPalette, ProjectTypography } from '../tokens/projectTokenTypes'

export interface DesignMemoryRecord {
  id: string
  projectId: string
  designId: string
  palette: ProjectPalette
  typography: ProjectTypography
  spacing: Record<string, number>
  radius: Record<string, number>
  style: string
  tone: string
  score: number
  accepted: boolean
  rejected: boolean
  feedback?: string
  source: 'auto' | 'manual' | 'analysis' | 'suggestion'
  timestamp: string
}

export interface MemoryStats {
  totalRecords: number
  averageScore: number
  acceptanceRate: number
  rejectionRate: number
  topStyles: { style: string; count: number }[]
  topTones: { tone: string; count: number }[]
  scoreEvolution: { date: string; score: number }[]
}

function generateId(): string {
  return crypto.randomUUID()
}

function nowISO(): string {
  return new Date().toISOString()
}

const STORAGE_KEY = 'pinklogic.design.memory'
const MAX_RECORDS = 200

function loadAll(): DesignMemoryRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveAll(records: DesignMemoryRecord[]): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)) }
  catch { console.warn('[DesignMemory] Falha ao salvar') }
}

export const DesignMemory = {
  record(data: Omit<DesignMemoryRecord, 'id' | 'timestamp'>): DesignMemoryRecord {
    const entry: DesignMemoryRecord = { id: generateId(), timestamp: nowISO(), ...data }
    const all = loadAll()
    all.unshift(entry)
    saveAll(all.slice(0, MAX_RECORDS))
    return entry
  },

  getByProject(projectId: string): DesignMemoryRecord[] {
    return loadAll().filter((r) => r.projectId === projectId)
  },

  getByDesign(designId: string): DesignMemoryRecord[] {
    return loadAll().filter((r) => r.designId === designId)
  },

  getRecent(limit = 20): DesignMemoryRecord[] {
    return loadAll().slice(0, limit)
  },

  getAll(): DesignMemoryRecord[] {
    return loadAll()
  },

  getStats(): MemoryStats {
    const all = loadAll()
    const accepted = all.filter((r) => r.accepted)
    const rejected = all.filter((r) => r.rejected)
    const scores = all.map((r) => r.score)

    const styleCount = new Map<string, number>()
    const toneCount = new Map<string, number>()
    for (const r of all) {
      if (r.style) styleCount.set(r.style, (styleCount.get(r.style) ?? 0) + 1)
      if (r.tone) toneCount.set(r.tone, (toneCount.get(r.tone) ?? 0) + 1)
    }

    const scoreEvolution = all
      .slice(0, 20)
      .reverse()
      .map((r) => ({ date: r.timestamp.split('T')[0], score: r.score }))

    return {
      totalRecords: all.length,
      averageScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
      acceptanceRate: all.length > 0 ? Math.round((accepted.length / all.length) * 100) : 0,
      rejectionRate: all.length > 0 ? Math.round((rejected.length / all.length) * 100) : 0,
      topStyles: [...styleCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([style, count]) => ({ style, count })),
      topTones: [...toneCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([tone, count]) => ({ tone, count })),
      scoreEvolution,
    }
  },

  getAccepted(): DesignMemoryRecord[] {
    return loadAll().filter((r) => r.accepted)
  },

  getRejected(): DesignMemoryRecord[] {
    return loadAll().filter((r) => r.rejected)
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY)
  },
}
