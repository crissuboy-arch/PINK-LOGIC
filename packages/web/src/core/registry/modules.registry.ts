export interface ModuleDefinition {
  id: string
  name: string
  description: string
  version: string
  dependencies: string[]
  enabled: boolean
}

const modules = new Map<string, ModuleDefinition>()

export function registerModule(mod: ModuleDefinition): void {
  modules.set(mod.id, mod)
}

export function getModule(id: string): ModuleDefinition | undefined {
  return modules.get(id)
}

export function listModules(): ModuleDefinition[] {
  return Array.from(modules.values())
}

export function enableModule(id: string): boolean {
  const mod = modules.get(id)
  if (!mod) return false
  mod.enabled = true
  return true
}

export function disableModule(id: string): boolean {
  const mod = modules.get(id)
  if (!mod) return false
  mod.enabled = false
  return true
}

registerModule({
  id: 'dashboard',
  name: 'Dashboard',
  description: 'Visão geral do sistema com métricas e atalhos',
  version: '1.0.0',
  dependencies: [],
  enabled: true,
})

registerModule({
  id: 'projects',
  name: 'Projetos',
  description: 'Gerenciamento de projetos e schemas',
  version: '1.0.0',
  dependencies: [],
  enabled: true,
})

registerModule({
  id: 'branding',
  name: 'Branding',
  description: 'Identidade visual, paletas e design tokens',
  version: '1.0.0',
  dependencies: ['projects'],
  enabled: true,
})

registerModule({
  id: 'content',
  name: 'Conteúdo',
  description: 'Criação e gerenciamento de peças de conteúdo',
  version: '1.0.0',
  dependencies: ['projects', 'branding'],
  enabled: true,
})

registerModule({
  id: 'calendar',
  name: 'Calendário',
  description: 'Calendário editorial e agendamento',
  version: '1.0.0',
  dependencies: ['content'],
  enabled: true,
})

registerModule({
  id: 'campaigns',
  name: 'Campanhas',
  description: 'Planejamento e execução de campanhas',
  version: '1.0.0',
  dependencies: ['projects', 'content'],
  enabled: true,
})

registerModule({
  id: 'workflows',
  name: 'Workflows',
  description: 'Automação de processos e pipelines',
  version: '1.0.0',
  dependencies: ['projects'],
  enabled: true,
})

registerModule({
  id: 'automations',
  name: 'Automações',
  description: 'Regras de automação e triggers',
  version: '1.0.0',
  dependencies: ['workflows'],
  enabled: true,
})

registerModule({
  id: 'settings',
  name: 'Configurações',
  description: 'Configurações do sistema e preferências',
  version: '1.0.0',
  dependencies: [],
  enabled: true,
})

registerModule({
  id: 'qa',
  name: 'Qualidade',
  description: 'Validação e testes de projetos e conteúdos',
  version: '1.0.0',
  dependencies: ['projects'],
  enabled: true,
})

registerModule({
  id: 'analytics',
  name: 'Analytics',
  description: 'Métricas e relatórios de desempenho',
  version: '1.0.0',
  dependencies: ['campaigns', 'content'],
  enabled: true,
})
