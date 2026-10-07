import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export type AgentId = 'orchestrator' | 'branding' | 'content' | 'campaign' | 'workflow' | 'promptLibrary' | 'qa'

export interface AgentConfig {
  id: AgentId
  label: string
  description: string
  enabled: boolean
}

interface AgentContextValue {
  agents: AgentConfig[]
  enableAgent: (id: AgentId) => void
  disableAgent: (id: AgentId) => void
  isAgentEnabled: (id: AgentId) => boolean
  executeTask: (agentId: AgentId, input: Record<string, unknown>) => Promise<{ success: boolean; data: unknown }>
}

const AgentContext = createContext<AgentContextValue | null>(null)

const defaultAgents: AgentConfig[] = [
  { id: 'orchestrator', label: 'Orchestrator', description: 'Roteia tarefas para o agente correto', enabled: true },
  { id: 'branding', label: 'Branding Agent', description: 'Gerencia identidade visual e paleta de cores', enabled: true },
  { id: 'content', label: 'Content Agent', description: 'Cria posts, reels, stories e legendas', enabled: true },
  { id: 'campaign', label: 'Campaign Agent', description: 'Organiza campanhas e lançamentos', enabled: true },
  { id: 'workflow', label: 'Workflow Agent', description: 'Cria fluxos operacionais e checklists', enabled: true },
  { id: 'promptLibrary', label: 'Prompt Library Agent', description: 'Gerencia biblioteca de prompts', enabled: true },
  { id: 'qa', label: 'QA Agent', description: 'Testa botões, rotas e consistência visual', enabled: true },
]

export function AgentProvider({ children }: { children: ReactNode }) {
  const [agents, setAgents] = useState<AgentConfig[]>(defaultAgents)

  const enableAgent = useCallback((id: AgentId) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, enabled: true } : a))
  }, [])

  const disableAgent = useCallback((id: AgentId) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, enabled: false } : a))
  }, [])

  const isAgentEnabled = useCallback((id: AgentId) => {
    return agents.find(a => a.id === id)?.enabled ?? false
  }, [agents])

  const executeTask = useCallback(async (agentId: AgentId, input: Record<string, unknown>) => {
    return { success: true, data: { agentId, input, message: 'Task received' } }
  }, [])

  return (
    <AgentContext.Provider value={{ agents, enableAgent, disableAgent, isAgentEnabled, executeTask }}>
      {children}
    </AgentContext.Provider>
  )
}

export function useAgent(): AgentContextValue {
  const ctx = useContext(AgentContext)
  if (!ctx) throw new Error('useAgent must be used within <AgentProvider>')
  return ctx
}
