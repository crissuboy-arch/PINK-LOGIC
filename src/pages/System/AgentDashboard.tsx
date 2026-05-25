import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Activity, CheckCircle, XCircle, Loader2, Power, PowerOff,
  Brain, Workflow, Zap, Terminal, Clock, Hash, TrendingUp,
  ChevronDown, ChevronUp, Play, FileText, AlertCircle, Layers,
  User, Wrench, Search, Sparkles, Server, BarChart3
} from 'lucide-react';
import { AgentRegistry } from '../../agents/registry/AgentRegistry';
import { registerAllAgents } from '../../agents/registry/registerAgents';
import type { AgentDefinition } from '../../agents/types';
import { listExecutions, getExecution } from '../../core/execution/executionStore';
import type { ExecutionRecord } from '../../core/execution/executionStore';
import { getSummary } from '../../core/history/executionHistory';
import { getRecentLogs } from '../../core/logs/agentLogs';
import { getRecentTimeline } from '../../core/logs/taskTimeline';
import type { LogEntry } from '../../core/logs/agentLogs';
import type { TimelineEvent } from '../../core/logs/taskTimeline';
import { orchestrator } from '../../core/orchestrator/orchestrator';

registerAllAgents();

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

function MiniBadge({ status }: { status: string }) {
  const cfg: Record<string, { color: string; bg: string }> = {
    success: { color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    active: { color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    running: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    failed: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
    idle: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    disabled: { color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
  };
  const c = cfg[status] ?? cfg.idle;
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.5rem', borderRadius: '100px', fontSize: '0.68rem', fontWeight: 600, background: c.bg, color: c.color }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: c.color }} />{status}</span>;
}

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <motion.div variants={itemVariants} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: `${color}08`, pointerEvents: 'none' }} />
      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
        <Icon size={22} />
      </div>
      <div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white', fontFamily: 'Outfit, sans-serif', lineHeight: 1.2 }}>{value}</div>
        {sub && <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>{sub}</div>}
      </div>
    </motion.div>
  );
}

function AgentCardDetailed({ agent, onToggle, onRun }: { agent: AgentDefinition; onToggle: () => void; onRun: () => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div variants={itemVariants} layout style={{ background: 'var(--card)', border: `1px solid ${agent.enabled ? 'var(--border)' : 'rgba(255,255,255,0.04)'}`, borderRadius: 'var(--radius-lg)', overflow: 'hidden', opacity: agent.enabled ? 1 : 0.55, transition: 'all 0.3s' }}>
      <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: agent.enabled ? 'linear-gradient(135deg, rgba(255,45,141,0.2), rgba(176,38,255,0.15))' : 'rgba(100,100,120,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: agent.enabled ? 'var(--primary)' : 'var(--text-secondary)', flexShrink: 0 }}>
          <Bot size={20} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'white' }}>{agent.name}</span>
            <MiniBadge status={agent.enabled ? 'active' : 'disabled'} />
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{agent.description}</div>
        </div>
        <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
          <button onClick={onRun} title="Executar agente" style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,45,141,0.08)', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Play size={13} /></button>
          <button onClick={onToggle} title={agent.enabled ? 'Desativar' : 'Ativar'} style={{ width: 30, height: 30, borderRadius: 8, background: agent.enabled ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: 'none', color: agent.enabled ? '#10b981' : '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{agent.enabled ? <Power size={13} /> : <PowerOff size={13} />}</button>
          <button onClick={() => setExpanded(!expanded)} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button>
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ borderTop: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.78rem' }}>
              <div><span style={{ color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.04em' }}>Capabilities</span><div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.35rem' }}>{agent.capabilities.map(c => <span key={c} style={{ padding: '0.15rem 0.5rem', borderRadius: 6, background: 'rgba(255,45,141,0.07)', color: 'var(--primary)', fontSize: '0.7rem', fontWeight: 500 }}>{c}</span>)}</div></div>
              {agent.workflows.length > 0 && <div><span style={{ color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.04em' }}>Workflows</span><div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.35rem' }}>{agent.workflows.map(w => <span key={w} style={{ padding: '0.15rem 0.5rem', borderRadius: 6, background: 'rgba(16,185,129,0.07)', color: '#10b981', fontSize: '0.7rem', fontWeight: 500 }}>{w}</span>)}</div></div>}
              <div><span style={{ color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.04em' }}>Triggers</span><div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.35rem' }}>{agent.triggers.map(t => <span key={t} style={{ padding: '0.15rem 0.5rem', borderRadius: 6, background: 'rgba(176,38,255,0.07)', color: '#B026FF', fontSize: '0.7rem', fontWeight: 500 }}>{t}</span>)}</div></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function TimelineFeed({ events }: { events: TimelineEvent[] }) {
  const colors: Record<string, string> = { started: '#3b82f6', 'step-started': '#f59e0b', 'step-completed': '#10b981', 'step-failed': '#ef4444', completed: '#10b981', failed: '#ef4444' };
  return <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
    {events.slice(0, 15).map((e) => (
      <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.45rem 0.6rem', borderRadius: 8, background: 'rgba(255,255,255,0.015)', fontSize: '0.75rem' }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: colors[e.type] ?? '#6b7280', flexShrink: 0 }} />
        <span style={{ color: 'var(--text-secondary)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.message}</span>
        {e.agentName && <span style={{ color: 'var(--text-secondary)', fontSize: '0.68rem', flexShrink: 0 }}><User size={10} style={{ verticalAlign: 'middle', marginRight: 2 }} />{e.agentName}</span>}
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.65rem', flexShrink: 0 }}>{new Date(e.timestamp).toLocaleTimeString()}</span>
      </div>
    ))}
    {events.length === 0 && <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Nenhum evento ainda</div>}
  </div>;
}

function LogFeed({ logs }: { logs: LogEntry[] }) {
  const colors: Record<string, string> = { info: '#3b82f6', warn: '#f59e0b', error: '#ef4444' };
  return <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', maxHeight: 300, overflowY: 'auto' }}>
    {logs.slice(0, 30).map((l) => (
      <div key={l.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.35rem 0.5rem', borderRadius: 6, fontSize: '0.72rem', fontFamily: 'monospace' }}>
        <span style={{ color: colors[l.level] ?? '#6b7280', fontWeight: 700, flexShrink: 0, width: 36 }}>{l.level.toUpperCase()}</span>
        <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{l.message}</span>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.65rem', flexShrink: 0 }}>{new Date(l.timestamp).toLocaleTimeString()}</span>
      </div>
    ))}
    {logs.length === 0 && <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Nenhum log ainda</div>}
  </div>;
}

export default function AgentDashboard() {
  const [agents, setAgents] = useState<AgentDefinition[]>([]);
  const [executions, setExecutions] = useState<ExecutionRecord[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [summary, setSummary] = useState({ total: 0, success: 0, failed: 0, running: 0, averageDuration: 0 });
  const [commandInput, setCommandInput] = useState('');
  const [cmdLoading, setCmdLoading] = useState(false);
  const [cmdResult, setCmdResult] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setAgents(AgentRegistry.list());
    setExecutions(listExecutions(5));
    setLogs(getRecentLogs(20));
    setTimeline(getRecentTimeline(15));
    setSummary(getSummary());
  }, []);

  useEffect(() => { refresh(); const id = setInterval(refresh, 3000); return () => clearInterval(id); }, [refresh]);

  const toggleAgent = useCallback((id: string) => {
    const a = AgentRegistry.get(id);
    if (!a) return;
    a.enabled ? AgentRegistry.disable(id) : AgentRegistry.enable(id);
    refresh();
  }, [refresh]);

  const runAgent = useCallback(async (agentId: string) => {
    const a = AgentRegistry.get(agentId);
    if (!a) return;
    await orchestrator(a.triggers[0] || a.name);
    refresh();
  }, [refresh]);

  const runCommand = useCallback(async () => {
    const input = commandInput.trim();
    if (!input) return;
    setCmdLoading(true);
    setCmdResult(null);
    try {
      const res = await orchestrator(input);
      setCmdResult(`#${res.execution.id.slice(0, 8)} — ${res.execution.status} (${res.execution.totalDuration}ms, ${res.execution.steps.length} steps)`);
    } catch (e) {
      setCmdResult(`Erro: ${e instanceof Error ? e.message : 'unknown'}`);
    } finally {
      setCmdLoading(false);
      refresh();
    }
  }, [commandInput, refresh]);

  const activeAgents = agents.filter(a => a.enabled).length;
  const workflows = [...new Set(agents.flatMap(a => a.workflows))];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <motion.header variants={itemVariants} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Server size={26} style={{ color: 'var(--primary)' }} />
            Sistema de Agentes
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>Centro de comando da infraestrutura agentic do Pink Logic OS</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}><Activity size={14} style={{ color: '#10b981' }} />Online</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}><TrendingUp size={14} style={{ color: 'var(--primary)' }} />v1.0.0</span>
        </div>
      </motion.header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem' }}>
        <StatCard icon={Bot} label="Agentes" value={agents.length} sub={`${activeAgents} ativos`} color="#FF2D8D" />
        <StatCard icon={Workflow} label="Workflows" value={workflows.length} sub="registrados" color="#B026FF" />
        <StatCard icon={BarChart3} label="Execuções" value={summary.total} sub={`${summary.success} sucesso · ${summary.failed} falha`} color="#00D1FF" />
        <StatCard icon={Zap} label="Confiança Média" value={summary.averageDuration > 0 ? `${summary.averageDuration}ms` : '-'} sub={summary.total > 0 ? `${(summary.success / summary.total * 100).toFixed(0)}% sucesso` : 'sem dados'} color="#10b981" />
      </div>

      <motion.div variants={itemVariants} style={{ display: 'flex', gap: '0.75rem' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0 1rem', height: 48 }}>
          <Terminal size={16} style={{ color: 'var(--text-secondary)' }} />
          <input type="text" placeholder="Executar comando rapidamente..." value={commandInput} onChange={e => setCommandInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && runCommand()} style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'white', fontSize: '0.85rem', fontFamily: 'inherit' }} />
        </div>
        <button onClick={runCommand} disabled={!commandInput.trim() || cmdLoading} className="btn-primary" style={{ height: 48, padding: '0 1.25rem', justifyContent: 'center', opacity: !commandInput.trim() || cmdLoading ? 0.5 : 1 }}>
          {cmdLoading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Play size={16} />}
          Executar
        </button>
      </motion.div>
      {cmdResult && <motion.div variants={itemVariants} style={{ padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)', background: cmdResult.startsWith('Erro') ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)', border: `1px solid ${cmdResult.startsWith('Erro') ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`, color: cmdResult.startsWith('Erro') ? '#ef4444' : '#10b981', fontSize: '0.8rem' }}>{cmdResult}</motion.div>}

      <motion.div variants={itemVariants}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bot size={20} style={{ color: 'var(--primary)' }} />Agentes Registrados
          </h2>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {['branding', 'content', 'campaign', 'analytics', 'automation', 'mining', 'calendar'].map(c => (
              <span key={c} style={{ padding: '0.15rem 0.4rem', borderRadius: 4, background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: 500 }}>{c}</span>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '0.6rem' }}>
          {agents.map(a => <AgentCardDetailed key={a.id} agent={a} onToggle={() => toggleAgent(a.id)} onRun={() => runAgent(a.id)} />)}
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <motion.div variants={itemVariants} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'white' }}>Execuções Recentes</span>
            <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{summary.total} total</span>
          </div>
          <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {executions.map(exec => (
              <div key={exec.id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0.6rem', borderRadius: 8, background: 'rgba(255,255,255,0.015)', fontSize: '0.75rem' }}>
                <MiniBadge status={exec.status === 'success' ? 'success' : exec.status === 'failed' ? 'failed' : 'running'} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: 'white', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exec.intent}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.68rem' }}><Hash size={10} style={{ verticalAlign: 'middle' }} />{exec.id.slice(0, 8)} · {exec.workflowName} · {exec.totalDuration}ms</div>
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', flexShrink: 0, textAlign: 'right' }}>
                  {new Date(exec.startedAt).toLocaleTimeString()}
                  <div>{exec.steps.filter(s => s.status === 'success').length}/{exec.steps.length}</div>
                </div>
              </div>
            ))}
            {executions.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Nenhuma execução ainda</div>}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'white' }}>Timeline</span>
            <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{timeline.length} eventos</span>
          </div>
          <div style={{ padding: '0.5rem' }}>
            <TimelineFeed events={timeline} />
          </div>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={16} style={{ color: 'var(--primary)' }} />
          <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'white' }}>Logs dos Agentes</span>
          <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{logs.length} entradas</span>
        </div>
        <div style={{ padding: '0.5rem' }}>
          <LogFeed logs={logs} />
        </div>
      </motion.div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', padding: '0.75rem 0', fontSize: '0.75rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border)' }}>
        <span><Bot size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />{agents.length} agentes</span>
        <span><Workflow size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />{workflows.length} workflows</span>
        <span><BarChart3 size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />{summary.total} execuções</span>
        <span><TrendingUp size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />{summary.total > 0 ? `${(summary.success / summary.total * 100).toFixed(0)}%` : '0%'} sucesso</span>
        <span style={{ color: summary.running > 0 ? '#3b82f6' : '#10b981' }}><Activity size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />{summary.running > 0 ? `${summary.running} em execução` : 'Sistema ocioso'}</span>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
}
