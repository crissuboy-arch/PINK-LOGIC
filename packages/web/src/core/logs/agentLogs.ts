/**
 * core/logs/agentLogs — RECONSTRUÍDO em 2026-10-07.
 * Módulo em falta no "initial push" (imports existiam, ficheiro não).
 * Log simples em memória para os agentes.
 */
export interface LogEntry {
  id: string;
  timestamp: string;
  executionId?: string;
  stepId?: string | null;
  agentId?: string;
  agentName?: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  data?: unknown;
}

const logs: LogEntry[] = [];
const MAX_LOGS = 500;

export function addLog(entry: Partial<LogEntry>): LogEntry {
  const full: LogEntry = {
    level: "info",
    message: "",
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
  };
  logs.push(full);
  if (logs.length > MAX_LOGS) logs.shift();
  return full;
}

export function getRecentLogs(limit = 50): LogEntry[] {
  return logs.slice(-limit).reverse();
}

export function clearLogs(): void {
  logs.length = 0;
}

export function getLogsForExecution(executionId: string): LogEntry[] {
  return logs.filter((l) => (l as any).executionId === executionId);
}
