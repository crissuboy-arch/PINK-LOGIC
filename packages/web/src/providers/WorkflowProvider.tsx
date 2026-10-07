import { createContext, useContext, useCallback, type ReactNode } from 'react'
import { usePersistedState, STORAGE_KEYS } from '../memory/MemoryStore'

export interface WorkflowStepSchema {
  id: string
  name: string
  description: string
  order: number
  status: 'pending' | 'running' | 'completed' | 'failed'
  assignedTo?: string
}

export interface WorkflowSchema {
  id: string
  projectId: string
  name: string
  description: string
  steps: WorkflowStepSchema[]
  status: 'draft' | 'active' | 'paused' | 'completed'
  createdAt: Date
  updatedAt: Date
}

interface WorkflowContextValue {
  workflows: WorkflowSchema[]
  createWorkflow: (data: Partial<WorkflowSchema> & { projectId: string }) => WorkflowSchema
  updateWorkflow: (id: string, data: Partial<WorkflowSchema>) => void
  removeWorkflow: (id: string) => void
  addStep: (workflowId: string, step: Omit<WorkflowStepSchema, 'id' | 'status'>) => void
  updateStep: (workflowId: string, stepId: string, data: Partial<WorkflowStepSchema>) => void
  removeStep: (workflowId: string, stepId: string) => void
  getWorkflowsByProject: (projectId: string) => WorkflowSchema[]
  clearWorkflows: () => void
}

const WorkflowContext = createContext<WorkflowContextValue | null>(null)

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [workflows, setWorkflows, clearWorkflows] = usePersistedState<WorkflowSchema[]>(STORAGE_KEYS.WORKFLOWS, [])

  const createWorkflow = useCallback((data: Partial<WorkflowSchema> & { projectId: string }): WorkflowSchema => {
    const workflow: WorkflowSchema = {
      id: crypto.randomUUID(),
      projectId: data.projectId,
      name: data.name || 'Novo Fluxo',
      description: data.description || '',
      steps: data.steps || [],
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setWorkflows(prev => [...prev, workflow])
    return workflow
  }, [setWorkflows])

  const updateWorkflow = useCallback((id: string, data: Partial<WorkflowSchema>) => {
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, ...data, updatedAt: new Date() } : w))
  }, [setWorkflows])

  const removeWorkflow = useCallback((id: string) => {
    setWorkflows(prev => prev.filter(w => w.id !== id))
  }, [setWorkflows])

  const addStep = useCallback((workflowId: string, step: Omit<WorkflowStepSchema, 'id' | 'status'>) => {
    setWorkflows(prev => prev.map(w => {
      if (w.id !== workflowId) return w
      const newStep: WorkflowStepSchema = {
        id: crypto.randomUUID(),
        ...step,
        status: 'pending',
      }
      return { ...w, steps: [...w.steps, newStep], updatedAt: new Date() }
    }))
  }, [setWorkflows])

  const updateStep = useCallback((workflowId: string, stepId: string, data: Partial<WorkflowStepSchema>) => {
    setWorkflows(prev => prev.map(w => {
      if (w.id !== workflowId) return w
      return { ...w, steps: w.steps.map(s => s.id === stepId ? { ...s, ...data } : s), updatedAt: new Date() }
    }))
  }, [setWorkflows])

  const removeStep = useCallback((workflowId: string, stepId: string) => {
    setWorkflows(prev => prev.map(w => {
      if (w.id !== workflowId) return w
      return { ...w, steps: w.steps.filter(s => s.id !== stepId), updatedAt: new Date() }
    }))
  }, [setWorkflows])

  const getWorkflowsByProject = useCallback((projectId: string) => {
    return workflows.filter(w => w.projectId === projectId)
  }, [workflows])

  return (
    <WorkflowContext.Provider value={{
      workflows, createWorkflow, updateWorkflow, removeWorkflow,
      addStep, updateStep, removeStep, getWorkflowsByProject,
      clearWorkflows,
    }}>
      {children}
    </WorkflowContext.Provider>
  )
}

export function useWorkflow(): WorkflowContextValue {
  const ctx = useContext(WorkflowContext)
  if (!ctx) throw new Error('useWorkflow must be used within <WorkflowProvider>')
  return ctx
}
