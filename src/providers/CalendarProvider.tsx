import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export type CalendarEventType = 'post' | 'story' | 'reel' | 'campaign' | 'milestone' | 'task'

export interface CalendarEvent {
  id: string
  projectId: string
  title: string
  description: string
  date: Date
  endDate?: Date
  eventType: CalendarEventType
  platform: string
  status: 'draft' | 'scheduled' | 'published' | 'cancelled'
  contentId?: string
}

interface CalendarContextValue {
  events: CalendarEvent[]
  createEvent: (data: Partial<CalendarEvent> & { projectId: string }) => CalendarEvent
  updateEvent: (id: string, data: Partial<CalendarEvent>) => void
  removeEvent: (id: string) => void
  getEventsByProject: (projectId: string) => CalendarEvent[]
  getEventsByMonth: (projectId: string, month: number, year: number) => CalendarEvent[]
}

const CalendarContext = createContext<CalendarContextValue | null>(null)

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<CalendarEvent[]>([])

  const createEvent = useCallback((data: Partial<CalendarEvent> & { projectId: string }): CalendarEvent => {
    const event: CalendarEvent = {
      id: crypto.randomUUID(),
      projectId: data.projectId,
      title: data.title || 'Novo evento',
      description: data.description || '',
      date: data.date || new Date(),
      endDate: data.endDate,
      eventType: data.eventType || 'post',
      platform: data.platform || 'instagram',
      status: 'draft',
      contentId: data.contentId,
    }
    setEvents(prev => [...prev, event])
    return event
  }, [])

  const updateEvent = useCallback((id: string, data: Partial<CalendarEvent>) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...data } : e))
  }, [])

  const removeEvent = useCallback((id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id))
  }, [])

  const getEventsByProject = useCallback((projectId: string) => {
    return events.filter(e => e.projectId === projectId)
  }, [events])

  const getEventsByMonth = useCallback((projectId: string, month: number, year: number) => {
    return events.filter(e => {
      if (e.projectId !== projectId) return false
      const d = new Date(e.date)
      return d.getMonth() === month && d.getFullYear() === year
    })
  }, [events])

  return (
    <CalendarContext.Provider value={{ events, createEvent, updateEvent, removeEvent, getEventsByProject, getEventsByMonth }}>
      {children}
    </CalendarContext.Provider>
  )
}

export function useCalendar(): CalendarContextValue {
  const ctx = useContext(CalendarContext)
  if (!ctx) throw new Error('useCalendar must be used within <CalendarProvider>')
  return ctx
}
