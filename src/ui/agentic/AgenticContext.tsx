import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react'
import { agentExecutionService } from '../../agents/execution/AgentExecutionService'
import { executeAgent } from '../../agents/execution/executeAgent'
import type { AgentDefinition, AgentExecutionInput } from '../../agents/types'
import type { ResolvedIntent } from '../../core/orchestrator/resolveIntent'
import type { WorkflowStep } from '../../core/registry/workflows.registry'

export interface TimelineStep {
  id: string
  label: string
  icon: string
  status: 'pending' | 'active' | 'done' | 'failed'
  detail?: string
}

export interface ActiveAgentInfo {
  id: string
  name: string
  type: string
  status: 'thinking' | 'executing' | 'done' | 'failed'
  action: string
  duration: number
  tokens: number
  cost: number
  confidence: number
}

export interface AgenticState {
  mode: 'idle' | 'thinking' | 'executing' | 'streaming' | 'done' | 'error'
  command: string
  timeline: TimelineStep[]
  activeAgent: ActiveAgentInfo | null
  streamingContent: string
  streamingFullContent: string
  executionLogs: string[]
  executionResult: Record<string, unknown> | null
  errorMessage: string | null
  history: string[]
  isAgentMode: boolean
  isCommandBarOpen: boolean
  suggestions: string[]
}

export interface AgenticActions {
  execute: (input: string) => Promise<void>
  setCommand: (cmd: string) => void
  toggleAgentMode: () => void
  toggleCommandBar: () => void
  setCommandBarOpen: (open: boolean) => void
  reset: () => void
}

const SUGGESTIONS = [
  'Criar campanha Instagram',
  'Gerar branding para marca',
  'Criar conteúdo para redes sociais',
  'Analisar oferta de produto',
  'Planejar calendário editorial',
  'Gerar carrossel educativo',
  'Criar identidade visual',
  'Produzir copy para anúncio',
]

const THINKING_PHRASES = [
  'Analisando sua solicitação...',
  'Identificando intenção...',
  'Mapeando contexto criativo...',
  'Ativando agentes especializados...',
  'Processando dados de branding...',
  'Gerando conceitos visuais...',
  'Otimizando resultados...',
  'Compilando resposta final...',
]

const TIMELINE_STEPS: TimelineStep[] = [
  { id: 'intent', label: 'Intenção', icon: '🎯', status: 'pending' },
  { id: 'routing', label: 'Roteamento', icon: '🔄', status: 'pending' },
  { id: 'execution', label: 'Execução', icon: '⚡', status: 'pending' },
  { id: 'processing', label: 'Processamento', icon: '🧠', status: 'pending' },
  { id: 'render', label: 'Renderização', icon: '✨', status: 'pending' },
  { id: 'export', label: 'Exportação', icon: '📦', status: 'pending' },
]

function createDemoAgent(type: string, name: string): AgentDefinition {
  return {
    id: `${type}-agent`,
    name,
    description: `AI-powered ${type} agent`,
    capabilities: [type],
    triggers: [],
    workflows: [],
    enabled: true,
    status: 'idle',
    execute: async () => ({ agentId: `${type}-agent`, status: 'success' as const, output: {}, logs: [], duration: 0 }),
  }
}

function updateTimeline(
  steps: TimelineStep[],
  updates: Record<string, { status?: TimelineStep['status']; detail?: string }>,
): TimelineStep[] {
  return steps.map((s) => {
    const u = updates[s.id]
    return u ? { ...s, ...u } : s
  })
}

export const AgenticContext = createContext<(AgenticState & AgenticActions) | null>(null)

export function AgenticProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AgenticState['mode']>('idle')
  const [command, setCommand] = useState('')
  const [timeline, setTimeline] = useState<TimelineStep[]>(TIMELINE_STEPS)
  const [activeAgent, setActiveAgent] = useState<ActiveAgentInfo | null>(null)
  const [streamingContent, setStreamingContent] = useState('')
  const [streamingFullContent, setStreamingFullContent] = useState('')
  const [executionLogs, setExecutionLogs] = useState<string[]>([])
  const [executionResult, setExecutionResult] = useState<Record<string, unknown> | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [history, setHistory] = useState<string[]>([])
  const [isAgentMode, setIsAgentMode] = useState(false)
  const [isCommandBarOpen, setCommandBarOpen] = useState(false)
  const streamTimerRef = useRef<number | null>(null)
  const thinkingTimerRef = useRef<number | null>(null)
  const startTimeRef = useRef(0)

  const startStreaming = useCallback((fullContent: string) => {
    setStreamingFullContent(fullContent)
    setStreamingContent('')
    setMode('streaming')

    let idx = 0
    const chars = fullContent.split('')

    const tick = () => {
      if (idx >= chars.length) {
        setMode('done')
        return
      }
      const chunk = chars.slice(idx, idx + 3).join('')
      idx += 3
      setStreamingContent((prev) => prev + chunk)
      streamTimerRef.current = window.setTimeout(tick, 20)
    }

    tick()
  }, [])

  const stopStreaming = useCallback(() => {
    if (streamTimerRef.current !== null) {
      clearTimeout(streamTimerRef.current)
      streamTimerRef.current = null
    }
  }, [])

  const runThinkingPhases = useCallback((phases: string[], onDone: () => void) => {
    let i = 0
    const next = () => {
      if (i >= phases.length) {
        onDone()
        return
      }
      setActiveAgent((prev) => prev ? { ...prev, action: phases[i], status: 'thinking' } : null)
      i++
      thinkingTimerRef.current = window.setTimeout(next, 600 + Math.random() * 400)
    }
    next()
  }, [])

  const execute = useCallback(async (input: string) => {
    stopStreaming()
    setCommand(input)
    setMode('thinking')
    setTimeline(TIMELINE_STEPS)
    setExecutionLogs([])
    setExecutionResult(null)
    setErrorMessage(null)
    setHistory((prev) => [input, ...prev].slice(0, 20))

    const trimmed = input.trim()
    const intentType = trimmed.toLowerCase().includes('campanha') ? 'campaign'
      : trimmed.toLowerCase().includes('branding') || trimmed.toLowerCase().includes('identidade') ? 'branding'
      : trimmed.toLowerCase().includes('conteudo') || trimmed.toLowerCase().includes('content') ? 'content'
      : trimmed.toLowerCase().includes('analisar') || trimmed.toLowerCase().includes('analise') ? 'analytics'
      : trimmed.toLowerCase().includes('calendario') || trimmed.toLowerCase().includes('editorial') ? 'calendar'
      : 'content'

    const resolvedIntent: ResolvedIntent = {
      type: intentType,
      action: 'create',
      target: intentType === 'campaign' ? 'campaign' : intentType,
      platform: trimmed.toLowerCase().includes('instagram') ? 'instagram'
        : trimmed.toLowerCase().includes('facebook') ? 'facebook'
        : trimmed.toLowerCase().includes('tiktok') ? 'tiktok'
        : trimmed.toLowerCase().includes('linkedin') ? 'linkedin'
        : undefined,
      confidence: 0.85,
      params: {},
      raw: trimmed,
    }

    const agentNames: Record<string, string> = {
      campaign: 'Campaign Agent',
      content: 'Content Agent',
      branding: 'Branding Agent',
      analytics: 'Analytics Agent',
      calendar: 'Calendar Agent',
    }
    const agentName = agentNames[intentType] || 'AI Agent'

    setActiveAgent({
      id: `${intentType}-agent`,
      name: agentName,
      type: intentType,
      status: 'thinking',
      action: 'Inicializando...',
      duration: 0,
      tokens: 0,
      cost: 0,
      confidence: 0,
    })

    setTimeline((prev) => updateTimeline(prev, { intent: { status: 'done', detail: resolvedIntent.type } }))
    await new Promise((r) => setTimeout(r, 200))

    setTimeline((prev) => updateTimeline(prev, { routing: { status: 'done', detail: agentName } }))
    setActiveAgent((prev) => prev ? { ...prev, action: 'Analisando solicitação...' } : null)
    await new Promise((r) => setTimeout(r, 300))

    setTimeline((prev) => updateTimeline(prev, { execution: { status: 'active', detail: agentName } }))
    setMode('executing')
    setActiveAgent((prev) => prev ? { ...prev, status: 'executing', action: 'Conectando à IA...' } : null)

    const step: WorkflowStep = {
      id: 'step-1',
      order: 1,
      name: intentType === 'campaign' ? 'Planejar Campanha'
        : intentType === 'branding' ? 'Criar Branding'
        : intentType === 'content' ? 'Gerar Conteúdo'
        : intentType === 'analytics' ? 'Analisar Dados'
        : intentType === 'calendar' ? 'Planejar Calendário'
        : 'Executar Tarefa',
      agentId: `${intentType}-agent`,
      skillId: intentType === 'campaign' ? 'create-campaign-plan'
        : intentType === 'branding' ? 'create-branding-kit'
        : intentType === 'content' ? 'create-social-content'
        : 'default',
    }

    const inputData: AgentExecutionInput = { intent: resolvedIntent, step, context: {} }
    const agent = createDemoAgent(intentType, agentName)

    try {
      const result = await agentExecutionService.execute(agent, inputData)

      if (result.success) {
        setTimeline((prev) => updateTimeline(prev, { execution: { status: 'done' } }))
        setActiveAgent((prev) => prev ? { ...prev, status: 'done', duration: result.duration, tokens: result.tokensUsed.total, cost: result.costEstimate, confidence: 85 } : null)

        setTimeline((prev) => updateTimeline(prev, { processing: { status: 'active' } }))
        await new Promise((r) => setTimeout(r, 400))

        setExecutionLogs(result.logs)
        setExecutionResult(result.output)

        const outputText = JSON.stringify(result.output, null, 2)
        startStreaming(outputText)

        setTimeline((prev) => updateTimeline(prev, {
          processing: { status: 'done' },
          render: { status: 'done' },
          export: { status: 'done' },
        }))
      } else {
        throw new Error(result.warnings.join(', ') || 'Execução falhou')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setMode('error')
      setErrorMessage(message)
      setTimeline((prev) => updateTimeline(prev, { execution: { status: 'failed', detail: message } }))
      setActiveAgent((prev) => prev ? { ...prev, status: 'failed' } : null)
    }
  }, [startStreaming, stopStreaming])

  const toggleAgentMode = useCallback(() => {
    setIsAgentMode((prev) => !prev)
  }, [])

  const reset = useCallback(() => {
    stopStreaming()
    setMode('idle')
    setTimeline(TIMELINE_STEPS)
    setActiveAgent(null)
    setStreamingContent('')
    setStreamingFullContent('')
    setExecutionLogs([])
    setExecutionResult(null)
    setErrorMessage(null)
  }, [stopStreaming])

  const value: AgenticState & AgenticActions = {
    mode, command, timeline, activeAgent,
    streamingContent, streamingFullContent,
    executionLogs, executionResult, errorMessage,
    history: history.slice(0, 10),
    isAgentMode, isCommandBarOpen,
    suggestions: SUGGESTIONS,
    execute, setCommand, toggleAgentMode,
    toggleCommandBar: () => setCommandBarOpen((p) => !p),
    setCommandBarOpen, reset,
  }

  return (
    <AgenticContext.Provider value={value}>
      {children}
    </AgenticContext.Provider>
  )
}

export function useAgentic(): AgenticState & AgenticActions {
  const ctx = useContext(AgenticContext)
  if (!ctx) throw new Error('useAgentic must be used within AgenticProvider')
  return ctx
}
