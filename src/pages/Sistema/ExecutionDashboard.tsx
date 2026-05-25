import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Cpu, Activity, CheckCircle, XCircle, Loader2, Clock, DollarSign,
  Terminal, Send, Sparkles, FileText, Zap, ArrowRight, History,
  Eye, ChevronDown, ChevronUp, Server, Hash, RefreshCw,
  Bot, Brain, Route, Layers,
} from 'lucide-react'
import { agentExecutionService } from '../../agents/execution/AgentExecutionService'
import { getModelForAgent } from '../../ai/modelConfig'
import { aiClient } from '../../ai/OpenAIClient'
import type { AgentDefinition, AgentExecutionInput } from '../../agents/types'
import type { ResolvedIntent } from '../../core/orchestrator/resolveIntent'
import type { WorkflowStep } from '../../core/registry/workflows.registry'

type ExecState = 'idle' | 'thinking' | 'executing' | 'streaming' | 'done' | 'error'

interface TimelineStep { id: string; label: string; status: 'pending' | 'active' | 'done' | 'failed'; detail?: string }

const TIMELINE: TimelineStep[] = [
  { id: 'intent', label: 'Intenção', status: 'pending' },
  { id: 'routing', label: 'Roteamento', status: 'pending' },
  { id: 'exec', label: 'Executando IA', status: 'pending' },
  { id: 'parse', label: 'Parsing', status: 'pending' },
  { id: 'done', label: 'Finalizado', status: 'pending' },
]

const QUICK_INTENTS = [
  'Criar campanha Instagram',
  'Gerar branding para marca',
  'Criar conteúdo para redes',
  'Analisar oferta de produto',
  'Criar identidade visual',
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
}

function createDemoAgent(type: string, name: string): AgentDefinition {
  return {
    id: `${type}-agent`, name,
    description: `AI-powered ${type} agent`,
    capabilities: [type], triggers: [], workflows: [],
    enabled: true, status: 'idle',
    execute: async () => ({ agentId: `${type}-agent`, status: 'success' as const, output: {}, logs: [], duration: 0 }),
  }
}

function updateSteps(steps: TimelineStep[], updates: Record<string, { status?: TimelineStep['status']; detail?: string }>): TimelineStep[] {
  return steps.map((s) => (updates[s.id] ? { ...s, ...updates[s.id] } : s))
}

export default function ExecutionDashboard() {
  const [input, setInput] = useState('')
  const [state, setState] = useState<ExecState>('idle')
  const [steps, setSteps] = useState<TimelineStep[]>(TIMELINE)
  const [agentInfo, setAgentInfo] = useState<{ name: string; model: string; fallback: string; duration: number; tokens: number; cost: number } | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [output, setOutput] = useState<Record<string, unknown> | null>(null)
  const [rawOutput, setRawOutput] = useState('')
  const [history, setHistory] = useState<Array<{ input: string; state: ExecState; model?: string; cost?: number; timestamp: string }>>([])
  const [showHints, setShowHints] = useState(false)
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null)
  const [streamContent, setStreamContent] = useState('')
  const [hasApiKey, setHasApiKey] = useState(false)
  const [connectionTestStatus, setConnectionTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [connectionTestResult, setConnectionTestResult] = useState<{ model: string; latency: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const logsRef = useRef<HTMLDivElement>(null)
  const streamTimerRef = useRef<number | null>(null)

  useEffect(() => { setHasApiKey(aiClient.hasApiKey()) }, [])
  useEffect(() => { try { const h = JSON.parse(localStorage.getItem('pinklogic.execution.history') || '[]'); setHistory(h) } catch {} }, [])

  useEffect(() => { if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight }, [logs, streamContent])

  const startStreaming = useCallback((full: string) => {
    setState('streaming')
    setStreamContent('')
    let idx = 0
    const chars = full.split('')
    const tick = () => {
      if (idx >= chars.length) { setState('done'); return }
      const chunk = chars.slice(idx, idx + 4).join('')
      idx += 4
      setStreamContent((prev) => prev + chunk)
      streamTimerRef.current = window.setTimeout(tick, 15)
    }
    tick()
  }, [])

  const stopStreaming = useCallback(() => {
    if (streamTimerRef.current !== null) { clearTimeout(streamTimerRef.current); streamTimerRef.current = null }
  }, [])

  const persistHistory = useCallback((entry: typeof history[0]) => {
    const updated = [entry, ...history].slice(0, 20)
    setHistory(updated)
    try { localStorage.setItem('pinklogic.execution.history', JSON.stringify(updated)) } catch {}
  }, [history])

  const testConnection = useCallback(async () => {
    setConnectionTestStatus('testing')
    setConnectionTestResult(null)
    try {
      const start = Date.now()
      const result = await aiClient.chat(
        [{ role: 'user', content: 'Responda apenas: "OK"' }],
        { model: 'gpt-4o-mini', maxTokens: 10, timeout: 15000 },
      )
      const latency = Date.now() - start
      setConnectionTestResult({ model: result.model, latency })
      setConnectionTestStatus('success')
    } catch (err) {
      setConnectionTestStatus('error')
      setConnectionTestResult(null)
    }
  }, [])

  const execute = useCallback(async () => {
    const trimmed = input.trim()
    if (!trimmed) return
    stopStreaming()
    setState('thinking')
    setSteps(TIMELINE)
    setAgentInfo(null)
    setLogs([])
    setOutput(null)
    setRawOutput('')
    setStreamContent('')
    setShowHints(false)

    const startTime = Date.now()
    const allLogs: string[] = []
    function log(msg: string) { allLogs.push(`[${new Date().toLocaleTimeString()}] ${msg}`); setLogs([...allLogs]) }

    const intentType: string = trimmed.toLowerCase().includes('campanha') ? 'campaign'
      : trimmed.toLowerCase().includes('branding') || trimmed.toLowerCase().includes('identidade') ? 'branding'
      : trimmed.toLowerCase().includes('conteudo') || trimmed.toLowerCase().includes('content') ? 'content'
      : trimmed.toLowerCase().includes('analisar') || trimmed.toLowerCase().includes('analise') ? 'analytics'
      : 'content'

    const agentNames: Record<string, string> = { campaign: 'Campaign Agent', content: 'Content Agent', branding: 'Branding Agent', analytics: 'Analytics Agent' }
    const agentName = agentNames[intentType] || 'AI Agent'
    const modelCfg = getModelForAgent(intentType)

    log(`Intenção detectada: ${intentType}`)
    log(`Modelo primário: ${modelCfg.primary}`)
    log(`Fallback: ${modelCfg.fallback.join(' → ')}`)
    setSteps((prev) => updateSteps(prev, { intent: { status: 'done', detail: intentType } }))
    await new Promise((r) => setTimeout(r, 200))

    setSteps((prev) => updateSteps(prev, { routing: { status: 'done', detail: agentName } }))
    log(`Roteado para: ${agentName}`)
    await new Promise((r) => setTimeout(r, 200))

    setSteps((prev) => updateSteps(prev, { exec: { status: 'active', detail: agentName } }))
    setState('executing')
    setAgentInfo({ name: agentName, model: modelCfg.primary, fallback: modelCfg.fallback.join(', '), duration: 0, tokens: 0, cost: 0 })

    const resolvedIntent: ResolvedIntent = {
      type: intentType, action: 'create', target: intentType,
      platform: trimmed.toLowerCase().includes('instagram') ? 'instagram' : undefined,
      confidence: 0.85, params: {}, raw: trimmed,
    }
    const step: WorkflowStep = { id: 'step-1', order: 1, name: agentName, agentId: `${intentType}-agent`, skillId: 'default' }
    const inputData: AgentExecutionInput = { intent: resolvedIntent, step, context: {} }
    const agent = createDemoAgent(intentType, agentName)

    try {
      const result = await agentExecutionService.execute(agent, inputData)
      allLogs.push(...result.logs)
      setLogs([...allLogs])

      setSteps((prev) => updateSteps(prev, { exec: { status: 'done' }, parse: { status: 'active' } }))
      log(`Parsing resposta...`)
      setAgentInfo({ name: agentName, model: result.model, fallback: modelCfg.fallback.join(', '), duration: result.duration, tokens: result.tokensUsed.total, cost: result.costEstimate })

      if (result.success) {
        setOutput(result.output)
        const json = JSON.stringify(result.output, null, 2)
        setRawOutput(json)
        setSteps((prev) => updateSteps(prev, { parse: { status: 'done' }, done: { status: 'done' } }))
        startStreaming(json)
        log(`Custo estimado: $${result.costEstimate.toFixed(6)}`)
        log(`Execução concluída em ${result.duration}ms`)
        persistHistory({ input: trimmed, state: 'done', model: result.model, cost: result.costEstimate, timestamp: new Date().toISOString() })
      } else {
        throw new Error(result.warnings.join('; ') || 'Falha na execução')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      log(`Erro: ${msg}`)
      setState('error')
      setSteps((prev) => updateSteps(prev, { exec: { status: 'failed', detail: msg } }))
      setAgentInfo((prev) => prev ? { ...prev, duration: Date.now() - startTime } : null)
      persistHistory({ input: trimmed, state: 'error', timestamp: new Date().toISOString() })
    }
  }, [input, startStreaming, stopStreaming, persistHistory])

  const isExecuting = state === 'thinking' || state === 'executing' || state === 'streaming'
  const filteredHints = input.trim() ? QUICK_INTENTS.filter((h) => h.toLowerCase().includes(input.toLowerCase())) : QUICK_INTENTS

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.25rem 0' }}>
      <motion.div variants={itemVariants} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '1.5rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontWeight: 700 }}>
          <Cpu size={22} style={{ color: '#10b981' }} />
          Execução de Agentes
        </h1>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          {state !== 'idle' && (
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Clock size={11} /> {state}
            </span>
          )}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} style={{ position: 'relative' }}>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', background: 'var(--input)', border: `1px solid ${isExecuting ? 'rgba(255,45,141,0.25)' : 'var(--border)'}`, borderRadius: 'var(--radius-lg)', padding: '0 0.9rem', height: 50, transition: 'var(--transition)', boxShadow: isExecuting ? '0 0 24px rgba(255,45,141,0.06)' : 'none' }}>
          {isExecuting ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
              <Sparkles size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            </motion.div>
          ) : (
            <Terminal size={18} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
          )}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setShowHints(true)}
            onBlur={() => setTimeout(() => setShowHints(false), 200)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), execute())}
            placeholder="O que deseja criar?"
            disabled={isExecuting}
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'white', fontSize: '0.92rem', fontFamily: 'inherit' }}
          />
          {!hasApiKey && state === 'idle' && (
            <span style={{ fontSize: '0.65rem', color: '#f59e0b', background: 'rgba(245,158,11,0.08)', padding: '0.2rem 0.45rem', borderRadius: 4 }}>sem API key</span>
          )}
          {hasApiKey && state === 'idle' && (
            <button
              onClick={testConnection}
              disabled={connectionTestStatus === 'testing'}
              title="Testar conexão OpenAI"
              style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: connectionTestStatus === 'success' ? 'rgba(16,185,129,0.12)' : connectionTestStatus === 'error' ? 'rgba(239,68,68,0.12)' : 'var(--input)', color: connectionTestStatus === 'success' ? '#10b981' : connectionTestStatus === 'error' ? '#ef4444' : 'var(--text-secondary)', cursor: 'pointer', transition: 'var(--transition)', flexShrink: 0 }}
            >
              {connectionTestStatus === 'testing' ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Zap size={14} />}
            </button>
          )}
          {connectionTestResult && state === 'idle' && (
            <span style={{ fontSize: '0.65rem', color: '#10b981', background: 'rgba(16,185,129,0.08)', padding: '0.2rem 0.45rem', borderRadius: 4, whiteSpace: 'nowrap' }}>
              {connectionTestResult.model} · {connectionTestResult.latency}ms
            </span>
          )}
          <button
            onClick={execute}
            disabled={!input.trim() || isExecuting}
            style={{ width: 36, height: 36, borderRadius: 8, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', background: !input.trim() || isExecuting ? 'transparent' : 'var(--gradient)', color: !input.trim() || isExecuting ? 'var(--text-secondary)' : 'white', cursor: !input.trim() || isExecuting ? 'default' : 'pointer', transition: 'var(--transition)', flexShrink: 0 }}
          >
            {isExecuting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <ArrowRight size={18} />}
          </button>
        </div>

        <AnimatePresence>
          {showHints && !isExecuting && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '0.25rem', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', zIndex: 50, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
              <div style={{ padding: '0.3rem 0.75rem', fontSize: '0.62rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Sugestões</div>
              {filteredHints.map((h) => (
                <button key={h} onMouseDown={() => { setInput(h); setShowHints(false) }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.45rem 0.75rem', border: 'none', background: 'none', color: 'white', fontSize: '0.78rem', cursor: 'pointer', textAlign: 'left' }}>
                  <Sparkles size={12} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  <span>{h}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {(state !== 'idle' || (state === 'idle' && history.length > 0)) && (
        <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '0.75rem', alignItems: 'start' }}>
          <div style={{ background: 'var(--card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ padding: '0.6rem 0.75rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Layers size={13} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>Pipeline</span>
            </div>
            <div style={{ padding: '0.5rem 0.75rem' }}>
              {steps.map((s, i) => {
                const isLast = i === steps.length - 1
                return (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'stretch', gap: 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 28, flexShrink: 0 }}>
                      <motion.div animate={s.status === 'active' ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 1.2, repeat: s.status === 'active' ? Infinity : 0 }}
                        style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: s.status === 'done' ? 'rgba(16,185,129,0.15)' : s.status === 'failed' ? 'rgba(239,68,68,0.15)' : s.status === 'active' ? 'rgba(255,45,141,0.12)' : 'rgba(255,255,255,0.03)',
                          border: `2px solid ${s.status === 'done' ? '#10b981' : s.status === 'failed' ? '#ef4444' : s.status === 'active' ? 'var(--primary)' : 'var(--border)'}`, fontSize: '0.6rem', position: 'relative', zIndex: 1, transition: 'var(--transition)' }}>
                        {s.status === 'done' ? <CheckCircle size={10} style={{ color: '#10b981' }} />
                          : s.status === 'failed' ? <XCircle size={10} style={{ color: '#ef4444' }} />
                          : s.status === 'active' ? <Loader2 size={10} style={{ color: 'var(--primary)', animation: 'spin 1.2s linear infinite' }} />
                          : <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--border)' }} />}
                      </motion.div>
                      {!isLast && <div style={{ width: 1.5, flex: 1, minHeight: 20, background: s.status === 'done' ? '#10b981' : 'var(--border)', opacity: s.status === 'done' ? 0.4 : 0.15, transition: 'var(--transition)' }} />}
                    </div>
                    <div style={{ flex: 1, paddingLeft: '0.6rem', paddingBottom: isLast ? 0 : '0.5rem', paddingTop: '0.1rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: s.status === 'done' ? '#10b981' : s.status === 'failed' ? '#ef4444' : s.status === 'active' ? 'white' : 'var(--text-secondary)' }}>{s.label}</div>
                      {s.detail && <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '0.05rem' }}>{s.detail}</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <AnimatePresence mode="wait">
              {state === 'idle' && history.length === 0 && (
                <motion.div key="empty" variants={itemVariants} initial="hidden" animate="show" exit="hidden" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2.5rem', color: 'var(--text-secondary)', background: 'var(--card)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)' }}>
                  <Cpu size={40} style={{ opacity: 0.2, marginBottom: '0.5rem' }} />
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white' }}>Pronto para executar</div>
                  <div style={{ fontSize: '0.78rem', marginTop: '0.2rem' }}>Digite um comando e veja a IA em ação</div>
                </motion.div>
              )}

              {state === 'thinking' && (
                <motion.div key="thinking" variants={itemVariants} initial="hidden" animate="show" exit="hidden"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, rgba(255,45,141,0.06), rgba(176,38,255,0.04))', border: '1px solid rgba(255,45,141,0.1)' }}>
                  <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.08, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,45,141,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Brain size={18} style={{ color: 'var(--primary)' }} />
                  </motion.div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', color: 'white', fontWeight: 600 }}>Analisando sua solicitação<span style={{ marginLeft: '0.15rem', display: 'inline-flex', gap: 2 }}>{[0,1,2].map((i) => (
                      <motion.span key={i} animate={{ y: [0, -4, 0], opacity: [0.4,1,0.4] }} transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.12 }} style={{ display: 'inline-block', width: 4, height: 4, borderRadius: '50%', background: 'var(--primary)' }} />
                    ))}</span></div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>Identificando intenção e roteando para o agente correto</div>
                  </div>
                </motion.div>
              )}

              {agentInfo && (state === 'executing' || state === 'streaming') && (
                <motion.div key="agent" variants={itemVariants} initial="hidden" animate="show" exit="hidden"
                  style={{ background: 'var(--card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden', position: 'relative' }}>
                  <motion.div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, var(--primary), #B026FF, var(--primary))', backgroundSize: '200% 100%' }}
                    animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }} transition={{ duration: 2, repeat: Infinity }} />
                  <div style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <motion.div animate={state === 'executing' ? { scale: [1, 1.05, 1] } : {}} transition={{ duration: 1.5, repeat: Infinity }}
                      style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Bot size={20} style={{ color: '#3b82f6' }} />
                    </motion.div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'white' }}>{agentInfo.name}</span>
                        <span style={{ padding: '0.1rem 0.4rem', borderRadius: 4, background: state === 'executing' ? 'rgba(59,130,246,0.12)' : 'rgba(16,185,129,0.12)', color: state === 'executing' ? '#3b82f6' : '#10b981', fontSize: '0.62rem', fontWeight: 600, textTransform: 'uppercase' }}>
                          {state === 'executing' ? 'executando' : 'streaming'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.15rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        <span><Server size={10} style={{ marginRight: '0.2rem' }} />{agentInfo.model}</span>
                        <span><RefreshCw size={10} style={{ marginRight: '0.2rem' }} />{agentInfo.fallback}</span>
                        {agentInfo.tokens > 0 && <span><FileText size={10} style={{ marginRight: '0.2rem' }} />{agentInfo.tokens} tokens</span>}
                        {agentInfo.cost > 0 && <span><DollarSign size={10} style={{ marginRight: '0.2rem' }} />${agentInfo.cost.toFixed(6)}</span>}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white', fontFamily: 'monospace' }}>
                        {state === 'executing' ? <LiveTimer /> : `${agentInfo.duration}ms`}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {state === 'done' && !output && (
                <motion.div key="done-empty" variants={itemVariants} initial="hidden" animate="show" exit="hidden" style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)', color: '#10b981', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} /> Execução concluída
                </motion.div>
              )}

              {state === 'error' && (
                <motion.div key="error" variants={itemVariants} initial="hidden" animate="show" exit="hidden" style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#ef4444', fontSize: '0.82rem' }}>
                  Erro durante execução
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {(state === 'executing' || state === 'streaming' || state === 'done') && logs.length > 0 && (
                <motion.div key="logs" variants={itemVariants} initial="hidden" animate="show" exit="hidden"
                  style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.1)' }}>
                    <Terminal size={12} style={{ color: 'var(--primary)' }} />
                    <span style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>Logs</span>
                    {state === 'streaming' && <span style={{ marginLeft: 'auto', fontSize: '0.6rem', color: 'var(--primary)', fontWeight: 600 }}>LIVE</span>}
                  </div>
                  <div ref={logsRef} style={{ padding: '0.5rem 0.75rem', maxHeight: 200, overflow: 'auto', fontFamily: 'monospace', fontSize: '0.7rem', lineHeight: 1.6 }}>
                    {logs.map((l, i) => (
                      <div key={i} style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}><span style={{ color: 'var(--primary)', opacity: 0.5 }}>$</span> {l}</div>
                    ))}
                    {state === 'streaming' && streamContent && (
                      <div style={{ color: '#10b981', marginTop: '0.25rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {streamContent}<motion.span animate={{ opacity: [0,1] }} transition={{ duration: 0.5, repeat: Infinity }} style={{ color: 'var(--primary)' }}>▊</motion.span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {state === 'done' && output && (
                <motion.div key="output" variants={itemVariants} initial="hidden" animate="show" exit="hidden"
                  style={{ background: 'var(--card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.75rem', borderBottom: '1px solid var(--border)' }}>
                    <FileText size={12} style={{ color: '#10b981' }} />
                    <span style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>Output</span>
                  </div>
                  <pre style={{ margin: 0, padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.72rem', lineHeight: 1.5, color: '#10b981', whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 400, overflow: 'auto' }}>
                    {rawOutput || JSON.stringify(output, null, 2)}
                  </pre>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {history.length > 0 && state === 'idle' && (
        <motion.div variants={itemVariants} style={{ background: 'var(--card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.6rem 0.75rem', borderBottom: '1px solid var(--border)' }}>
            <History size={13} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>Histórico de Execuções</span>
            <span style={{ marginLeft: 'auto', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{history.length} registro(s)</span>
          </div>
          <div style={{ padding: '0.25rem 0' }}>
            {history.map((h) => (
              <div key={h.timestamp + h.input}>
                <button onClick={() => setExpandedHistory(expandedHistory === h.timestamp + h.input ? null : h.timestamp + h.input)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%', padding: '0.5rem 0.75rem', border: 'none', background: 'none', color: 'white', fontSize: '0.78rem', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: h.state === 'done' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {h.state === 'done' ? <CheckCircle size={12} style={{ color: '#10b981' }} /> : <XCircle size={12} style={{ color: '#ef4444' }} />}
                  </div>
                  <span style={{ flex: 1, color: 'white', fontSize: '0.78rem' }}>{h.input}</span>
                  {h.model && <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{h.model}</span>}
                  {h.cost !== undefined && <span style={{ fontSize: '0.65rem', color: '#10b981' }}>${h.cost.toFixed(4)}</span>}
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)' }}>{new Date(h.timestamp).toLocaleTimeString()}</span>
                  {expandedHistory === h.timestamp + h.input ? <ChevronUp size={12} style={{ color: 'var(--text-secondary)' }} /> : <ChevronDown size={12} style={{ color: 'var(--text-secondary)' }} />}
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  )
}

function LiveTimer() {
  const [ms, setMs] = useState(0)
  useEffect(() => { const i = setInterval(() => setMs((p) => p + 100), 100); return () => clearInterval(i) }, [])
  return <>{ms}ms</>
}
