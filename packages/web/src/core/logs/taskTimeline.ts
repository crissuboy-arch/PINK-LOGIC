/**
 * core/logs/taskTimeline — RECONSTRUÍDO em 2026-10-07.
 * Módulo em falta no "initial push" (imports existiam, ficheiro não).
 * Timeline de eventos de tarefas em memória.
 */
export interface TimelineEvent {
  id: string;
  timestamp: string;
  executionId?: string;
  taskId?: string;
  stepId?: string | null;
  stepName?: string | null;
  agentId?: string | null;
  agentName?: string | null;
  type: string;
  label: string;
  message?: string;
  data?: unknown;
}

const events: TimelineEvent[] = [];
const MAX_EVENTS = 500;

export function addTimelineEvent(event: Partial<TimelineEvent>): TimelineEvent {
  const full: TimelineEvent = {
    type: "event",
    label: "",
    ...event,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
  };
  events.push(full);
  if (events.length > MAX_EVENTS) events.shift();
  return full;
}

export function getRecentTimeline(limit = 50): TimelineEvent[] {
  return events.slice(-limit).reverse();
}

export function clearTimeline(): void {
  events.length = 0;
}

export function getTimelineForExecution(executionId: string): TimelineEvent[] {
  return events.filter((e) => (e as any).executionId === executionId);
}
