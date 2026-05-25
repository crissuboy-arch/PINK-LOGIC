import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export type AutomationTrigger = 'onContentCreated' | 'onCampaignStart' | 'onSchedule' | 'onStatusChange' | 'manual'
export type AutomationAction = 'notify' | 'createContent' | 'schedulePost' | 'updateStatus' | 'runWorkflow'

export interface AutomationRule {
  id: string
  projectId: string
  name: string
  description: string
  trigger: AutomationTrigger
  action: AutomationAction
  config: Record<string, unknown>
  enabled: boolean
  createdAt: Date
}

interface AutomationContextValue {
  rules: AutomationRule[]
  createRule: (data: Partial<AutomationRule> & { projectId: string }) => AutomationRule
  updateRule: (id: string, data: Partial<AutomationRule>) => void
  removeRule: (id: string) => void
  toggleRule: (id: string) => void
  getRulesByProject: (projectId: string) => AutomationRule[]
}

const AutomationContext = createContext<AutomationContextValue | null>(null)

export function AutomationProvider({ children }: { children: ReactNode }) {
  const [rules, setRules] = useState<AutomationRule[]>([])

  const createRule = useCallback((data: Partial<AutomationRule> & { projectId: string }): AutomationRule => {
    const rule: AutomationRule = {
      id: crypto.randomUUID(),
      projectId: data.projectId,
      name: data.name || 'Nova automação',
      description: data.description || '',
      trigger: data.trigger || 'manual',
      action: data.action || 'notify',
      config: data.config || {},
      enabled: data.enabled ?? true,
      createdAt: new Date(),
    }
    setRules(prev => [...prev, rule])
    return rule
  }, [])

  const updateRule = useCallback((id: string, data: Partial<AutomationRule>) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, ...data } : r))
  }, [])

  const removeRule = useCallback((id: string) => {
    setRules(prev => prev.filter(r => r.id !== id))
  }, [])

  const toggleRule = useCallback((id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r))
  }, [])

  const getRulesByProject = useCallback((projectId: string) => {
    return rules.filter(r => r.projectId === projectId)
  }, [rules])

  return (
    <AutomationContext.Provider value={{ rules, createRule, updateRule, removeRule, toggleRule, getRulesByProject }}>
      {children}
    </AutomationContext.Provider>
  )
}

export function useAutomation(): AutomationContextValue {
  const ctx = useContext(AutomationContext)
  if (!ctx) throw new Error('useAutomation must be used within <AutomationProvider>')
  return ctx
}
