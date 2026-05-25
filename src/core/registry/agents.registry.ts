export interface AgentDefinition {
  id: string
  name: string
  description: string
  capabilities: string[]
  skills: string[]
  modules: string[]
  permissions: string[]
}

const agents = new Map<string, AgentDefinition>()

export function registerAgent(agent: AgentDefinition): void {
  agents.set(agent.id, agent)
}

export function getAgent(id: string): AgentDefinition | undefined {
  return agents.get(id)
}

export function listAgents(): AgentDefinition[] {
  return Array.from(agents.values())
}

export function findAgentsByCapability(capability: string): AgentDefinition[] {
  return listAgents().filter((a) => a.capabilities.includes(capability))
}

export function findAgentsBySkill(skillId: string): AgentDefinition[] {
  return listAgents().filter((a) => a.skills.includes(skillId))
}

registerAgent({
  id: 'branding-agent',
  name: 'BrandingAgent',
  description: 'Responsável por criar e gerenciar identidade visual, paletas, tipografia e tom de voz',
  capabilities: ['branding', 'visual-identity', 'design-system'],
  skills: ['create-branding-kit', 'define-tone', 'select-palette'],
  modules: ['branding', 'design'],
  permissions: ['read:projects', 'write:branding', 'write:design-tokens'],
})

registerAgent({
  id: 'content-agent',
  name: 'ContentAgent',
  description: 'Responsável por gerar e gerenciar conteúdos para redes sociais, blogs e campanhas',
  capabilities: ['content', 'copywriting', 'social-media'],
  skills: ['create-social-content', 'create-carousel', 'create-content-calendar'],
  modules: ['content', 'calendar'],
  permissions: ['read:projects', 'write:content', 'write:calendar'],
})

registerAgent({
  id: 'campaign-agent',
  name: 'CampaignAgent',
  description: 'Responsável por planejar, executar e monitorar campanhas de marketing',
  capabilities: ['campaign', 'marketing', 'analytics'],
  skills: ['create-campaign-plan', 'define-goals', 'select-channels'],
  modules: ['campaigns', 'analytics'],
  permissions: ['read:projects', 'write:campaigns', 'read:analytics'],
})

registerAgent({
  id: 'validation-agent',
  name: 'ValidationAgent',
  description: 'Responsável por validar projetos, conteúdos e conformidade com regras de marca',
  capabilities: ['validation', 'qa', 'compliance'],
  skills: ['validate-project', 'validate-visual', 'check-compliance'],
  modules: ['qa', 'validation'],
  permissions: ['read:projects', 'read:branding', 'read:content'],
})
