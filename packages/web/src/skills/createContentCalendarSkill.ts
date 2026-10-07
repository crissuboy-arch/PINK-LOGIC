/**
 * Gera um calendário editorial completo com base no projeto e frequência.
 * Distribui conteúdos uniformemente ao longo do mês.
 */
export interface CalendarEntry {
  date: Date
  title: string
  format: string
  platform: string
  status: 'draft' | 'scheduled'
}

export interface ContentCalendarInput {
  projectId: string
  month: number
  year: number
  postsPerWeek: number
  platforms: string[]
}

export interface ContentCalendarOutput {
  id: string
  projectId: string
  month: number
  year: number
  entries: CalendarEntry[]
  createdAt: Date
}

const RULES = [
  'Posts are distributed evenly across the month',
  'Each platform gets equal share of posts',
  'Weekends have reduced posting frequency',
]

const PLATFORM_ORDER = ['instagram', 'tiktok', 'youtube', 'facebook']

export async function createContentCalendarSkill(input: ContentCalendarInput): Promise<ContentCalendarOutput> {
  const daysInMonth = new Date(input.year, input.month, 0).getDate()
  const interval = Math.max(1, Math.floor(daysInMonth / (input.postsPerWeek * 4)))
  const platforms = input.platforms.length > 0 ? input.platforms : ['instagram']
  const entries: CalendarEntry[] = []

  for (let day = 1; day <= daysInMonth; day += interval) {
    const date = new Date(input.year, input.month - 1, day)
    const dayOfWeek = date.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) continue

    for (const platform of platforms) {
      entries.push({
        date,
        title: `Post ${platform}`,
        format: 'post',
        platform,
        status: 'draft',
      })
    }
  }

  const formats: string[] = ['post', 'story', 'reel', 'carousel']
  entries.forEach((e, i) => {
    e.format = formats[i % formats.length]
  })

  return {
    id: crypto.randomUUID(),
    projectId: input.projectId,
    month: input.month,
    year: input.year,
    entries,
    createdAt: new Date(),
  }
}

export { RULES as calendarRules }
