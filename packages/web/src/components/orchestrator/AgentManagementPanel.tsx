import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Bot, Power, PowerOff, Brain, Workflow, Zap, ChevronDown, ChevronUp } from 'lucide-react'
import { AgentRegistry } from '../../agents/registry/AgentRegistry'
import type { AgentDefinition } from '../../agents/types'

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

function AgentCard({ agent }: { agent: AgentDefinition }) {
  const [expanded, setExpanded] = useState(false)

  const toggleEnabled = useCallback(() => {
    if (agent.enabled) {
      AgentRegistry.disable(agent.id)
    } else {
      AgentRegistry.enable(agent.id)
    }
    agent.enabled = !agent.enabled
    setExpanded((prev) => prev)
  }, [agent])

  return (
    <motion.div variants={itemVariants} style={{ background: 'var(--card)', border: `1px solid ${agent.enabled ? 'var(--border)' : 'rgba(255,255,255,0.03)'}`, borderRadius: 'var(--radius-lg)', overflow: 'hidden', opacity: agent.enabled ? 1 : 0.5, transition: 'var(--transition)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: agent.enabled ? 'rgba(255,45,141,0.12)' : 'rgba(100,100,120,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: agent.enabled ? 'var(--primary)' : 'var(--text-secondary)', flexShrink: 0 }}>
          <Bot size={18} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'white' }}>{agent.name}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>{agent.description}</div>
        </div>
        <button
          onClick={toggleEnabled}
          style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', background: agent.enabled ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: agent.enabled ? '#10b981' : '#ef4444', flexShrink: 0, transition: 'var(--transition)' }}
          title={agent.enabled ? 'Desativar' : 'Ativar'}
        >
          {agent.enabled ? <Power size={14} /> : <PowerOff size={14} />}
        </button>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{ width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', background: 'transparent', color: 'var(--text-secondary)', flexShrink: 0 }}
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.78rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
              <Brain size={12} />
              <span style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.04em' }}>Capabilities</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
              {agent.capabilities.map((cap) => (
                <span key={cap} style={{ padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'rgba(255,45,141,0.08)', color: 'var(--primary)', fontSize: '0.7rem', fontWeight: 500 }}>{cap}</span>
              ))}
            </div>
          </div>

          {agent.workflows.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                <Workflow size={12} />
                <span style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.04em' }}>Workflows</span>
              </div>
              <div style={{ color: '#10b981', fontSize: '0.72rem' }}>{agent.workflows.join(', ')}</div>
            </div>
          )}

          {agent.triggers.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                <Zap size={12} />
                <span style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.04em' }}>Triggers</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                {agent.triggers.map((t) => (
                  <span key={t} style={{ padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(176,38,255,0.08)', color: '#B026FF', fontSize: '0.7rem', fontWeight: 500 }}>{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

export default function AgentManagementPanel() {
  const [agents, setAgents] = useState<AgentDefinition[]>([])

  useEffect(() => {
    setAgents(AgentRegistry.list())
    const interval = setInterval(() => {
      setAgents(AgentRegistry.list())
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const activeCount = agents.filter((a) => a.enabled).length

  return (
    <motion.div variants={itemVariants} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 className="section-title" style={{ fontSize: '1.5rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <Bot size={22} style={{ color: 'var(--primary)' }} />
          Agentes
        </h2>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          <span style={{ color: '#10b981', fontWeight: 700 }}>{activeCount}</span>/{agents.length} ativos
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '0.6rem' }}>
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </motion.div>
  )
}
