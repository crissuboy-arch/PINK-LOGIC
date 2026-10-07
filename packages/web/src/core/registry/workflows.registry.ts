import type { AgentDefinition } from './agents.registry'
import type { SkillDefinition } from './skills.registry'

export interface WorkflowStep {
  id: string
  order: number
  name: string
  description?: string
  agentId?: string
  skillId?: string
  input?: Record<string, unknown>
  condition?: string
}

export interface WorkflowDefinition {
  id: string
  name: string
  description: string
  steps: WorkflowStep[]
  agents: string[]
  skills: string[]
  triggers: string[]
}

const workflows = new Map<string, WorkflowDefinition>()

export function registerWorkflow(workflow: WorkflowDefinition): void {
  workflows.set(workflow.id, workflow)
}

export function getWorkflow(id: string): WorkflowDefinition | undefined {
  return workflows.get(id)
}

export function listWorkflows(): WorkflowDefinition[] {
  return Array.from(workflows.values())
}

export function findWorkflowsByTrigger(trigger: string): WorkflowDefinition[] {
  return listWorkflows().filter((w) => w.triggers.includes(trigger))
}

export function findWorkflowsByAgent(agentId: string): WorkflowDefinition[] {
  return listWorkflows().filter((w) => w.agents.includes(agentId))
}

registerWorkflow({
  id: 'criar-campanha-instagram',
  name: 'Criar Campanha Instagram',
  description: 'Pipeline completo para criação de campanha no Instagram: branding → conteúdo → campanha → validação',
  steps: [
    {
      id: 'step-1',
      order: 1,
      name: 'Definir Branding',
      description: 'Verificar ou criar identidade visual da campanha',
      agentId: 'branding-agent',
      skillId: 'create-branding-kit',
    },
    {
      id: 'step-2',
      order: 2,
      name: 'Criar Conteúdo',
      description: 'Gerar peças de conteúdo para o Instagram',
      agentId: 'content-agent',
      skillId: 'create-social-content',
      input: { format: 'post', platform: 'instagram' },
    },
    {
      id: 'step-3',
      order: 3,
      name: 'Planejar Campanha',
      description: 'Estruturar metas, canais e cronograma',
      agentId: 'campaign-agent',
      skillId: 'create-campaign-plan',
      input: { channels: ['instagram'] },
    },
    {
      id: 'step-4',
      order: 4,
      name: 'Validar Projeto',
      description: 'Validar consistência e conformidade',
      agentId: 'validation-agent',
      skillId: 'validate-project',
    },
  ],
  agents: ['branding-agent', 'content-agent', 'campaign-agent', 'validation-agent'],
  skills: ['create-branding-kit', 'create-social-content', 'create-campaign-plan', 'validate-project'],
  triggers: ['intent:create:campaign:instagram'],
})

registerWorkflow({
  id: 'gerar-conteudo-redes',
  name: 'Gerar Conteúdo para Redes Sociais',
  description: 'Pipeline para gerar conteúdo multiplataforma com validação',
  steps: [
    {
      id: 'step-1',
      order: 1,
      name: 'Criar Conteúdo',
      description: 'Gerar peça de conteúdo para a plataforma alvo',
      agentId: 'content-agent',
      skillId: 'create-social-content',
    },
    {
      id: 'step-2',
      order: 2,
      name: 'Validar Conteúdo',
      description: 'Verificar qualidade e conformidade',
      agentId: 'validation-agent',
      skillId: 'validate-project',
    },
  ],
  agents: ['content-agent', 'validation-agent'],
  skills: ['create-social-content', 'validate-project'],
  triggers: ['intent:create:content:social'],
})

registerWorkflow({
  id: 'criar-branding-completo',
  name: 'Criar Branding Completo',
  description: 'Pipeline para criação de identidade visual do zero',
  steps: [
    {
      id: 'step-1',
      order: 1,
      name: 'Criar Branding Kit',
      description: 'Gerar paleta, fontes, tom e estilo visual',
      agentId: 'branding-agent',
      skillId: 'create-branding-kit',
    },
    {
      id: 'step-2',
      order: 2,
      name: 'Validar Identidade',
      description: 'Validar contraste, acessibilidade e consistência',
      agentId: 'validation-agent',
      skillId: 'validate-project',
    },
  ],
  agents: ['branding-agent', 'validation-agent'],
  skills: ['create-branding-kit', 'validate-project'],
  triggers: ['intent:create:branding:full'],
})
