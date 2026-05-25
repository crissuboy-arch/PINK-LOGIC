import type { AgentDefinition, CapabilityMap } from '../types'
import { buildCapabilityMap } from '../types'

class AgentRegistryImpl {
  private agents = new Map<string, AgentDefinition>()
  private capabilityCache: CapabilityMap = {}

  register(agent: AgentDefinition): void {
    this.agents.set(agent.id, agent)
    this.rebuildCache()
  }

  unregister(id: string): boolean {
    const removed = this.agents.delete(id)
    if (removed) this.rebuildCache()
    return removed
  }

  get(id: string): AgentDefinition | undefined {
    return this.agents.get(id)
  }

  list(): AgentDefinition[] {
    return Array.from(this.agents.values())
  }

  listActive(): AgentDefinition[] {
    return this.list().filter((a) => a.enabled)
  }

  findByCapability(capability: string): AgentDefinition[] {
    return this.capabilityCache[capability] ?? []
  }

  findByTrigger(triggerKey: string): AgentDefinition[] {
    const key = triggerKey.toLowerCase()
    return this.listActive().filter((a) =>
      a.triggers.some((t) => key.includes(t.toLowerCase()) || t.toLowerCase().includes(key)),
    )
  }

  enable(id: string): boolean {
    const agent = this.agents.get(id)
    if (!agent) return false
    agent.enabled = true
    this.rebuildCache()
    return true
  }

  disable(id: string): boolean {
    const agent = this.agents.get(id)
    if (!agent) return false
    agent.enabled = false
    this.rebuildCache()
    return true
  }

  getCapabilityMap(): CapabilityMap {
    return { ...this.capabilityCache }
  }

  getCapabilitiesSummary(): { capability: string; agents: string[] }[] {
    return Object.entries(this.capabilityCache).map(([cap, agents]) => ({
      capability: cap,
      agents: agents.map((a) => a.name),
    }))
  }

  private rebuildCache(): void {
    this.capabilityCache = buildCapabilityMap(this.listActive())
  }

  clear(): void {
    this.agents.clear()
    this.capabilityCache = {}
  }
}

export const AgentRegistry = new AgentRegistryImpl()
