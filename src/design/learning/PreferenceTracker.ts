import type { DesignMemoryRecord } from '../memory/DesignMemory'

export interface AdaptiveBrandProfile {
  projectId: string
  preferredContrast: number
  preferredSpacing: 'tight' | 'comfortable' | 'loose'
  preferredRadius: 'sharp' | 'moderate' | 'rounded'
  preferredVisualStyle: string
  preferredCTAStyle: 'subtle' | 'neon' | 'bold' | 'minimal'
  preferredLayouts: string[]
  emotionalPatterns: string[]
  tonePreferences: string[]
  averageScore: number
  totalRecords: number
  lastUpdated: string
  fontPreferences: { heading: string; body: string }
  recurringPalette: { primary?: string; secondary?: string; accent?: string }
}

function luminance(hex: string): number {
  const clean = hex.replace('#', '')
  const full = clean.length === 3 ? clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2] : clean
  const num = parseInt(full, 16)
  if (isNaN(num)) return 0
  return 0.299 * ((num >> 16) & 255) + 0.587 * ((num >> 8) & 255) + 0.114 * (num & 255)
}

function contrast(a: string, b: string): number {
  const l1 = luminance(a) + 0.05, l2 = luminance(b) + 0.05
  return l1 > l2 ? l1 / l2 : l2 / l1
}

function mostFrequent<T>(items: T[]): T | undefined {
  const map = new Map<T, number>()
  let max = 0, best: T | undefined
  for (const item of items) {
    const count = (map.get(item) ?? 0) + 1
    map.set(item, count)
    if (count > max) { max = count; best = item }
  }
  return best
}

function inferSpacing(records: DesignMemoryRecord[]): 'tight' | 'comfortable' | 'loose' {
  const spacings = records.flatMap((r) => Object.values(r.spacing))
  if (spacings.length === 0) return 'comfortable'
  const avg = spacings.reduce((a, b) => a + b, 0) / spacings.length
  if (avg < 10) return 'tight'
  if (avg < 24) return 'comfortable'
  return 'loose'
}

function inferRadius(records: DesignMemoryRecord[]): 'sharp' | 'moderate' | 'rounded' {
  const radii = records.flatMap((r) => Object.values(r.radius)).filter((v) => v < 9999)
  if (radii.length === 0) return 'moderate'
  const avg = radii.reduce((a, b) => a + b, 0) / radii.length
  if (avg < 6) return 'sharp'
  if (avg < 16) return 'moderate'
  return 'rounded'
}

function inferCTAStyle(records: DesignMemoryRecord[], profile: Partial<AdaptiveBrandProfile>): 'subtle' | 'neon' | 'bold' | 'minimal' {
  const accepted = records.filter((r) => r.accepted)
  if (accepted.length === 0) return 'bold'
  const contrasts = accepted.map((r) => contrast(r.palette.accent || '#FFD700', r.palette.background))
  const avgContrast = contrasts.reduce((a, b) => a + b, 0) / contrasts.length
  if (avgContrast > 8) return 'neon'
  if (avgContrast > 5) return 'bold'
  if (avgContrast > 3) return 'subtle'
  return 'minimal'
}

function findRecurring<T extends string>(records: DesignMemoryRecord[], extract: (r: DesignMemoryRecord) => T | undefined): T | undefined {
  const items: T[] = []
  for (const r of records) {
    const v = extract(r)
    if (v) items.push(v)
  }
  return mostFrequent(items)
}

export function buildAdaptiveProfile(projectId: string, records: DesignMemoryRecord[]): AdaptiveBrandProfile {
  const accepted = records.filter((r) => r.accepted)
  const scores = records.map((r) => r.score)
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0

  const profile: Partial<AdaptiveBrandProfile> = {
    projectId,
    preferredContrast: 50,
    preferredSpacing: inferSpacing(accepted),
    preferredRadius: inferRadius(accepted),
    preferredVisualStyle: findRecurring(accepted, (r) => r.style) ?? 'moderno',
    preferredCTAStyle: 'bold',
    preferredLayouts: ['grid'],
    emotionalPatterns: [],
    tonePreferences: [...new Set(accepted.map((r) => r.tone).filter(Boolean))],
    averageScore: avgScore,
    totalRecords: records.length,
    lastUpdated: new Date().toISOString(),
    fontPreferences: {
      heading: findRecurring(accepted, (r) => r.typography.heading) ?? 'Outfit',
      body: findRecurring(accepted, (r) => r.typography.body) ?? 'Inter',
    },
    recurringPalette: {},
  }

  profile.preferredCTAStyle = inferCTAStyle(accepted, profile)

  if (accepted.length >= 2) {
    const contrasts = accepted.map((r) => contrast(r.palette.text, r.palette.background))
    profile.preferredContrast = Math.round(contrasts.reduce((a, b) => a + b, 0) / contrasts.length * 10)

    const primary = findRecurring(accepted, (r) => r.palette.primary)
    const secondary = findRecurring(accepted, (r) => r.palette.secondary)
    const accent = findRecurring(accepted, (r) => r.palette.accent)
    profile.recurringPalette = { primary, secondary, accent }
  }

  return profile as AdaptiveBrandProfile
}

export function trackPreference(records: DesignMemoryRecord[], projectId: string): AdaptiveBrandProfile {
  return buildAdaptiveProfile(projectId, records)
}
