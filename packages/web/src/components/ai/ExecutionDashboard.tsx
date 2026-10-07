import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Cpu, Activity, CheckCircle, XCircle, Loader2, Clock, DollarSign,
  BarChart3, TrendingUp, Key, Eye, EyeOff, RefreshCw, Trash2,
  Terminal, Hash, FileText, Zap, Send, ArrowRight,
} from 'lucide-react'
import { agentExecutionService } from '../../agents/execution/AgentExecutionService'
import { executeAgent } from '../../agents/execution/executeAgent'
import type { AIExecutionRecord, AIExecutionStats } from '../../ai/types'
import type { AgentDefinition, AgentExecutionInput } from '../../agents/types'
import type { ResolvedIntent } from '../../core/orchestrator/resolveIntent'
import type { WorkflowStep } from '../../core/registry/workflows.registry'

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
}

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <motion.div variants={itemVariants} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: 80, height: 80, borderRadius: '50%', background: `${color}08`, pointerEvents: 'none' }} />
      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
        <Icon size={22} />
      </div>
      <div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', fontFamily: 'Outfit, sans-serif', lineHeight: 1.2 }}>{value}</div>
        {sub && <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>{sub}</div>}
      </div>
    </motion.div>
  )
}

function ExecutionRow({ record }: { record: AIExecutionRecord }) {
  return (
    <motion.div variants={itemVariants} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 0.9rem', background: 'var(--input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.78rem' }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: record.success ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {record.success ? <CheckCircle size={14} style={{ color: '#10b981' }} /> : <XCircle size={14} style={{ color: '#ef4444' }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, color: 'white' }}>{record.agentName}</div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', marginTop: '0.1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}><Hash size={10} />{record.id.slice(0, 8)}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}><Clock size={10} />{record.duration}ms</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}><Cpu size={10} />{record.model}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}><FileText size={10} />{record.tokensUsed.total} tokens</span>
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ color: record.success ? '#10b981' : '#ef4444', fontWeight: 700, fontSize: '0.82rem' }}>${record.costEstimate.toFixed(4)}</div>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>{new Date(record.timestamp).toLocaleTimeString()}</div>
      </div>
    </motion.div>
  )
}

function ApiKeyInput() {
  const [visible, setVisible] = useState(false)
  const [key, setKey] = useState('')
  const [saved, setSaved] = useState(agentExecutionService.hasApiKey())

  const handleSave = useCallback(() => {
    const trimmed = key.trim()
    if (!trimmed) return
    agentExecutionService.setApiKey(trimmed)
    setSaved(true)
    setKey('')
  }, [key])

  return (
    <motion.div variants={itemVariants} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', flexShrink: 0 }}>
        <Key size={18} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'white' }}>
          {saved ? 'API Key configurada' : 'Configurar OpenAI API Key'}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
          {saved ? 'Chave salva em localStorage' : 'Necessário para execução real dos agentes'}
        </div>
      </div>
      {!saved && (
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0 0.6rem', height: 38 }}>
            <input
              type={visible ? 'text' : 'password'}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="sk-..."
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'white', fontSize: '0.78rem', width: 220, fontFamily: 'inherit' }}
            />
            <button onClick={() => setVisible(!visible)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem', display: 'flex' }}>
              {visible ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <button onClick={handleSave} className="btn-primary" style={{ height: 38, padding: '0 1rem', fontSize: '0.78rem' }}>Salvar</button>
        </div>
      )}
    </motion.div>
  )
}

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
    execute: async () => ({ agentId: `${type}-agent`, status: 'success', output: {}, logs: [], duration: 0 }),
  }
}

export default function ExecutionDashboard() {
  const [executions, setExecutions] = useState<AIExecutionRecord[]>([])
  const [stats, setStats] = useState<AIExecutionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [commandInput, setCommandInput] = useState('')
  const [executing, setExecuting] = useState(false)
  const [lastResult, setLastResult] = useState<import('../../agents/execution/executeAgent').ExecutionResult | null>(null)
  const [executionError, setExecutionError] = useState<string | null>(null)

  const handleExecute = useCallback(async () => {
    const trimmed = commandInput.trim()
    if (!trimmed) return

    setExecuting(true)
    setExecutionError(null)
    setLastResult(null)

    try {
      const intent: ResolvedIntent = {
        type: trimmed.toLowerCase().includes('campanha') ? 'campaign' : 'content',
        action: 'create',
        target: trimmed.toLowerCase().includes('campanha') ? 'campaign' : 'content',
        platform: trimmed.toLowerCase().includes('instagram') ? 'instagram' : undefined,
        confidence: 0.8,
        params: {},
        raw: trimmed,
      }

      const step: WorkflowStep = {
        id: 'step-1',
        order: 1,
        name: intent.type === 'campaign' ? 'Planejar Campanha' : 'Gerar Conteúdo',
        agentId: `${intent.type}-agent`,
        skillId: intent.type === 'campaign' ? 'create-campaign-plan' : 'create-social-content',
      }

      const input: AgentExecutionInput = { intent, step, context: {} }
      const agent = createDemoAgent(intent.type, intent.type === 'campaign' ? 'Campaign Agent' : 'Content Agent')

      const result = await agentExecutionService.execute(agent, input)
      setLastResult(result)
    } catch (err) {
      setExecutionError(err instanceof Error ? err.message : 'Erro ao executar')
    } finally {
      setExecuting(false)
      setCommandInput('')
    }
  }, [commandInput])

  const refresh = useCallback(() => {
    setExecutions(agentExecutionService.getHistory())
    setStats(agentExecutionService.getStats())
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 5000)
    return () => clearInterval(interval)
  }, [refresh])

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <motion.div variants={itemVariants} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '1.5rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontWeight: 700 }}>
          <Cpu size={22} style={{ color: '#10b981' }} />
          Execução IA
        </h2>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button onClick={refresh} style={{ width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', background: 'var(--input)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <RefreshCw size={14} />
          </button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} style={{ display: 'flex', gap: '0.75rem' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0 1rem', height: 48, transition: 'var(--transition)' }}>
          <Terminal size={18} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleExecute())}
            placeholder='Ex: "Criar campanha Instagram" ou "Gerar conteúdo para redes sociais"'
            disabled={executing}
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'white', fontSize: '0.88rem', fontFamily: 'inherit' }}
          />
        </div>
        <button
          onClick={handleExecute}
          disabled={!commandInput.trim() || executing || !agentExecutionService.hasApiKey()}
          className="btn-primary"
          style={{ height: 48, padding: '0 1.25rem', justifyContent: 'center', opacity: !commandInput.trim() || executing || !agentExecutionService.hasApiKey() ? 0.5 : 1, gap: '0.4rem' }}
        >
          {executing ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
          Executar
        </button>
      </motion.div>

      {executing && (
        <motion.div variants={itemVariants} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
          <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
          Executando agente com IA real...
        </motion.div>
      )}

      {executionError && (
        <motion.div variants={itemVariants} initial="hidden" animate="show" style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)', color: '#ef4444', fontSize: '0.82rem' }}>
          {executionError}
        </motion.div>
      )}

      {lastResult && !executing && (
        <motion.div variants={itemVariants} initial="hidden" animate="show" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '0.75rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
            {lastResult.success ? <CheckCircle size={16} style={{ color: '#10b981' }} /> : <XCircle size={16} style={{ color: '#ef4444' }} />}
            <span style={{ color: 'white', fontWeight: 700, fontSize: '0.88rem' }}>
              {lastResult.success ? 'Execução concluída com sucesso' : 'Execução falhou'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            <span><Cpu size={11} style={{ marginRight: '0.2rem' }} />{lastResult.model}</span>
            <span><Clock size={11} style={{ marginRight: '0.2rem' }} />{lastResult.duration}ms</span>
            <span><FileText size={11} style={{ marginRight: '0.2rem' }} />{lastResult.tokensUsed.total} tokens</span>
            <span><DollarSign size={11} style={{ marginRight: '0.2rem' }} />${(lastResult.costEstimate).toFixed(6)}</span>
          </div>
          {Object.keys(lastResult.output).length > 0 && (
            <pre style={{ color: '#10b981', fontFamily: 'monospace', fontSize: '0.7rem', whiteSpace: 'pre-wrap', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', maxHeight: 300, overflow: 'auto' }}>
              {JSON.stringify(lastResult.output, null, 2)}
            </pre>
          )}
        </motion.div>
      )}

      <ApiKeyInput />

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.6rem' }}>
          <StatCard icon={Activity} label="Execuções" value={stats.totalExecutions} color="#10b981" />
          <StatCard icon={CheckCircle} label="Taxa de Sucesso" value={`${stats.successRate}%`} color={stats.successRate >= 70 ? '#10b981' : '#f59e0b'} />
          <StatCard icon={FileText} label="Tokens" value={stats.totalTokens.toLocaleString()} sub={stats.totalCost > 0 ? `$${stats.totalCost.toFixed(4)}` : undefined} color="#B026FF" />
          <StatCard icon={Clock} label="Duração Média" value={`${stats.averageDuration}ms`} color="#3b82f6" />
        </div>
      )}

      {stats && stats.topModels.length > 0 && (
        <motion.div variants={itemVariants} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '0.75rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
            <Cpu size={14} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>Modelos Utilizados</span>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {stats.topModels.map((m) => (
              <span key={m.model} style={{ padding: '0.2rem 0.6rem', borderRadius: 6, background: 'rgba(16,185,129,0.08)', color: '#10b981', fontSize: '0.72rem', fontWeight: 500 }}>
                {m.model} ({m.count}x)
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', marginRight: '0.5rem' }} />
          Carregando...
        </div>
      ) : executions.length === 0 ? (
        <motion.div variants={itemVariants} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', background: 'var(--card)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)' }}>
          <Terminal size={32} style={{ marginBottom: '0.5rem', opacity: 0.3 }} />
          <div>Nenhuma execução AI ainda</div>
          <div style={{ fontSize: '0.78rem', marginTop: '0.2rem' }}>Use o comando agentic para executar agentes com IA real</div>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Activity size={14} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>Execuções Recentes</span>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{executions.length} registro(s)</span>
          </div>
          <AnimatePresence>
            {executions.map((record) => (
              <div key={record.id} style={{ display: 'flex', flexDirection: 'column' }}>
                <div onClick={() => setExpanded(expanded === record.id ? null : record.id)} style={{ cursor: 'pointer' }}>
                  <ExecutionRow record={record} />
                </div>
                {expanded === record.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ marginTop: '0.3rem', padding: '0.75rem 1rem', background: 'var(--card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.75rem', overflow: 'hidden' }}
                  >
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <FileText size={12} /> Logs da Execução
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      {record.logs.map((log, i) => (
                        <div key={i} style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.68rem', padding: '0.15rem 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          {log}
                        </div>
                      ))}
                    </div>
                    {Object.keys(record.output).length > 0 && (
                      <>
                        <div style={{ color: 'var(--text-secondary)', marginTop: '0.6rem', marginBottom: '0.3rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Zap size={12} /> Output
                        </div>
                        <pre style={{ color: '#10b981', fontFamily: 'monospace', fontSize: '0.68rem', whiteSpace: 'pre-wrap', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                          {JSON.stringify(record.output, null, 2)}
                        </pre>
                      </>
                    )}
                  </motion.div>
                )}
              </div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  )
}
