import type { DesignMemoryRecord } from '../memory/DesignMemory'

export interface DetectedPattern {
  id: string
  type: 'recurring-style' | 'preferred-contrast' | 'preferred-radius' | 'preferred-spacing' | 'color-tendency' | 'tone-preference' | 'font-preference'
  label: string
  description: string
  confidence: number
  evidence: string[]
  value: string | number
}

let counter = 0
function uid(): string { return `pattern-${++counter}` }

interface ColorTuple { hex: string; count: number }
interface StyleTuple { style: string; count: number }
interface ToneTuple { tone: string; count: number }

function analyzeColors(records: DesignMemoryRecord[]): DetectedPattern[] {
  const patterns: DetectedPattern[] = []
  const colorFreq = new Map<string, number>()
  for (const r of records) {
    for (const v of Object.values(r.palette)) {
      const key = v.toLowerCase()
      colorFreq.set(key, (colorFreq.get(key) ?? 0) + 1)
    }
  }
  const sorted: ColorTuple[] = [...colorFreq.entries()]
    .map(([hex, count]) => ({ hex, count }))
    .sort((a, b) => b.count - a.count)
  if (sorted.length > 0) {
    const top = sorted.slice(0, 3)
    patterns.push({
      id: uid(), type: 'color-tendency', label: 'Cores mais usadas',
      description: `Cores recorrentes: ${top.map((item) => `${item.hex} (${item.count}x)`).join(', ')}`,
      confidence: Math.min(90, top[0].count * 15),
      evidence: top.map((item) => `Cor ${item.hex} usada em ${colorFreq.get(item.hex)} designs`),
      value: top[0].hex,
    })
  }
  return patterns
}

function analyzeStyles(records: DesignMemoryRecord[]): DetectedPattern[] {
  const patterns: DetectedPattern[] = []
  const styleFreq = new Map<string, number>()
  for (const r of records) {
    if (r.style) styleFreq.set(r.style, (styleFreq.get(r.style) ?? 0) + 1)
  }
  const sorted: StyleTuple[] = [...styleFreq.entries()]
    .map(([style, count]) => ({ style, count }))
    .sort((a, b) => b.count - a.count)
  if (sorted.length > 0) {
    const top = sorted[0]
    patterns.push({
      id: uid(), type: 'recurring-style', label: 'Estilo visual preferido',
      description: `"${top.style}" aparece em ${top.count} registro(s)`,
      confidence: Math.min(85, top.count * 20),
      evidence: [`Estilo "${top.style}" usado ${top.count}x`],
      value: top.style,
    })
  }
  return patterns
}

function analyzeTones(records: DesignMemoryRecord[]): DetectedPattern[] {
  const patterns: DetectedPattern[] = []
  const toneFreq = new Map<string, number>()
  for (const r of records) {
    if (r.tone) toneFreq.set(r.tone, (toneFreq.get(r.tone) ?? 0) + 1)
  }
  const sorted: ToneTuple[] = [...toneFreq.entries()]
    .map(([tone, count]) => ({ tone, count }))
    .sort((a, b) => b.count - a.count)
  if (sorted.length > 0) {
    patterns.push({
      id: uid(), type: 'tone-preference', label: 'Tom de voz preferido',
      description: `"${sorted[0].tone}" é o tom mais frequente`,
      confidence: Math.min(80, sorted[0].count * 15),
      evidence: [`Tom "${sorted[0].tone}" em ${sorted[0].count} registros`],
      value: sorted[0].tone,
    })
  }
  return patterns
}

function analyzeTypography(records: DesignMemoryRecord[]): DetectedPattern[] {
  const patterns: DetectedPattern[] = []
  const headingFreq = new Map<string, number>()
  const bodyFreq = new Map<string, number>()
  for (const r of records) {
    headingFreq.set(r.typography.heading, (headingFreq.get(r.typography.heading) ?? 0) + 1)
    bodyFreq.set(r.typography.body, (bodyFreq.get(r.typography.body) ?? 0) + 1)
  }
  const topHeading = [...headingFreq.entries()].sort((a, b) => b[1] - a[1])[0]
  const topBody = [...bodyFreq.entries()].sort((a, b) => b[1] - a[1])[0]
  if (topHeading) {
    patterns.push({
      id: uid(), type: 'font-preference', label: 'Fonte heading preferida',
      description: `"${topHeading[0]}" usada em ${topHeading[1]} projeto(s)`,
      confidence: Math.min(80, topHeading[1] * 20),
      evidence: [`Fonte "${topHeading[0]}" em ${topHeading[1]} registros`],
      value: topHeading[0],
    })
  }
  if (topBody) {
    patterns.push({
      id: uid(), type: 'font-preference', label: 'Fonte body preferida',
      description: `"${topBody[0]}" usada em ${topBody[1]} projeto(s)`,
      confidence: Math.min(80, topBody[1] * 20),
      evidence: [`Fonte "${topBody[0]}" em ${topBody[1]} registros`],
      value: topBody[0],
    })
  }
  return patterns
}

export function detectPatterns(records: DesignMemoryRecord[]): DetectedPattern[] {
  const accepted = records.filter((r) => r.accepted)
  if (accepted.length === 0) return []
  return [
    ...analyzeColors(accepted),
    ...analyzeStyles(accepted),
    ...analyzeTones(accepted),
    ...analyzeTypography(accepted),
  ]
}

export function detectPatternsForProject(records: DesignMemoryRecord[], projectId: string): DetectedPattern[] {
  return detectPatterns(records.filter((r) => r.projectId === projectId))
}
