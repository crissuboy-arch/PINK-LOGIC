import { listAgents } from './agents.registry'
import { listSkills } from './skills.registry'

export interface CapabilityDefinition {
  id: string
  name: string
  description: string
  agentIds: string[]
  skillIds: string[]
  dependencies: string[]
}

const capabilities = new Map<string, CapabilityDefinition>()

export function registerCapability(cap: CapabilityDefinition): void {
  capabilities.set(cap.id, cap)
}

export function getCapability(id: string): CapabilityDefinition | undefined {
  return capabilities.get(id)
}

export function listCapabilities(): CapabilityDefinition[] {
  return Array.from(capabilities.values())
}

export function resolveCapabilityForIntent(intentType: string): CapabilityDefinition | undefined {
  const match = intentType.toLowerCase().replace(/\s+/g, '-')
  return listCapabilities().find((c) => c.id === match || c.name.toLowerCase().includes(match))
}

export function getSystemCapabilityMap(): Record<string, string[]> {
  const agentCaps = listAgents().flatMap((a) =>
    a.capabilities.map((c) => ({ capability: c, agent: a.name })),
  )
  const skillCaps = listSkills().map((s) => ({ capability: s.id, skill: s.name }))

  const agentMap: Record<string, string[]> = {}
  for (const { capability, agent } of agentCaps) {
    if (!agentMap[capability]) agentMap[capability] = []
    agentMap[capability].push(agent)
  }

  return agentMap
}

registerCapability({
  id: 'branding',
  name: 'branding',
  description: 'Criação e gerenciamento de identidade visual',
  agentIds: ['branding-agent'],
  skillIds: ['create-branding-kit'],
  dependencies: [],
})

registerCapability({
  id: 'visual-identity',
  name: 'visual-identity',
  description: 'Definição de paleta, tipografia e estilo visual',
  agentIds: ['branding-agent'],
  skillIds: ['create-branding-kit'],
  dependencies: ['branding'],
})

registerCapability({
  id: 'content',
  name: 'content',
  description: 'Geração de conteúdo textual para redes sociais',
  agentIds: ['content-agent'],
  skillIds: ['create-social-content', 'create-carousel'],
  dependencies: ['branding'],
})

registerCapability({
  id: 'copywriting',
  name: 'copywriting',
  description: 'Redação de copies para campanhas e posts',
  agentIds: ['content-agent'],
  skillIds: ['create-social-content'],
  dependencies: ['branding'],
})

registerCapability({
  id: 'social-media',
  name: 'social-media',
  description: 'Gestão de conteúdo para redes sociais',
  agentIds: ['content-agent'],
  skillIds: ['create-social-content', 'create-content-calendar'],
  dependencies: ['content'],
})

registerCapability({
  id: 'campaign',
  name: 'campaign',
  description: 'Planejamento e execução de campanhas',
  agentIds: ['campaign-agent'],
  skillIds: ['create-campaign-plan'],
  dependencies: ['content', 'branding'],
})

registerCapability({
  id: 'marketing',
  name: 'marketing',
  description: 'Estratégia de marketing multicanal',
  agentIds: ['campaign-agent'],
  skillIds: ['create-campaign-plan'],
  dependencies: ['campaign'],
})

registerCapability({
  id: 'analytics',
  name: 'analytics',
  description: 'Análise de métricas e desempenho',
  agentIds: ['campaign-agent'],
  skillIds: [],
  dependencies: ['campaign'],
})

registerCapability({
  id: 'validation',
  name: 'validation',
  description: 'Validação de projetos e conformidade',
  agentIds: ['validation-agent'],
  skillIds: ['validate-project', 'validate-visual'],
  dependencies: [],
})

registerCapability({
  id: 'qa',
  name: 'qa',
  description: 'Garantia de qualidade e testes',
  agentIds: ['validation-agent'],
  skillIds: ['validate-project'],
  dependencies: ['validation'],
})

registerCapability({
  id: 'compliance',
  name: 'compliance',
  description: 'Conformidade com regras de marca e plataforma',
  agentIds: ['validation-agent'],
  skillIds: ['validate-project'],
  dependencies: ['validation'],
})
