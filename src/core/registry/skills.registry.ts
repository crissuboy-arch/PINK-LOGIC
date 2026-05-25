export interface SkillDefinition {
  id: string
  name: string
  objective: string
  input: Record<string, string>
  output: Record<string, string>
  rules: string[]
}

const skills = new Map<string, SkillDefinition>()

export function registerSkill(skill: SkillDefinition): void {
  skills.set(skill.id, skill)
}

export function getSkill(id: string): SkillDefinition | undefined {
  return skills.get(id)
}

export function listSkills(): SkillDefinition[] {
  return Array.from(skills.values())
}

export function findSkillsByObjective(objective: string): SkillDefinition[] {
  return listSkills().filter((s) =>
    s.objective.toLowerCase().includes(objective.toLowerCase()),
  )
}

registerSkill({
  id: 'create-branding-kit',
  name: 'Criar Branding Kit',
  objective: 'Criar identidade visual completa com paleta, fontes, tom e estilo',
  input: { projectId: 'ID do projeto', brand: 'Diretrizes de marca (parcial ou completo)' },
  output: { palette: 'Paleta de cores', fonts: 'Fontes definidas', tone: 'Tom de voz', visualStyle: 'Estilo visual' },
  rules: ['Usar cores da marca', 'Respeitar contraste de acessibilidade', 'Manter consistência visual'],
})

registerSkill({
  id: 'create-social-content',
  name: 'Criar Conteúdo Social',
  objective: 'Gerar peças de conteúdo para redes sociais (post, story, reel, carousel)',
  input: { projectId: 'ID do projeto', format: 'Formato do conteúdo', topic: 'Tópico', platform: 'Plataforma' },
  output: { id: 'ID do conteúdo', format: 'Formato gerado', content: 'Conteúdo textual', createdAt: 'Data de criação' },
  rules: ['Seguir tom de voz da marca', 'Otimizar para plataforma alvo', 'Respeitar limites de caracteres'],
})

registerSkill({
  id: 'create-campaign-plan',
  name: 'Criar Plano de Campanha',
  objective: 'Estruturar campanha de marketing com metas, canais e cronograma',
  input: { projectId: 'ID do projeto', name: 'Nome da campanha', goal: 'Objetivo principal' },
  output: { campaign: 'Dados da campanha', milestones: 'Marcos do cronograma' },
  rules: ['Definir metas SMART', 'Selecionar canais relevantes', 'Estabelecer prazos realistas'],
})

registerSkill({
  id: 'create-content-calendar',
  name: 'Criar Calendário de Conteúdo',
  objective: 'Organizar cronograma editorial com datas, formatos e temas',
  input: { projectId: 'ID do projeto', startDate: 'Data inicial', endDate: 'Data final', frequency: 'Frequência de postagem' },
  output: { events: 'Eventos do calendário', totalPieces: 'Total de peças planejadas' },
  rules: ['Distribuir conteúdo uniformemente', 'Variar formatos', 'Respeitar sazonalidade'],
})

registerSkill({
  id: 'validate-project',
  name: 'Validar Projeto',
  objective: 'Verificar integridade e conformidade do projeto com regras da plataforma',
  input: { project: 'Dados do projeto a validar' },
  output: { valid: 'Se o projeto é válido', issues: 'Lista de problemas encontrados', score: 'Pontuação geral' },
  rules: ['Verificar campos obrigatórios', 'Validar consistência de branding', 'Checar conflitos de agendamento'],
})

registerSkill({
  id: 'create-carousel',
  name: 'Criar Carrossel',
  objective: 'Gerar conteúdo em formato de carrossel com múltiplos slides',
  input: { projectId: 'ID do projeto', topic: 'Tópico principal', slides: 'Número de slides' },
  output: { slides: 'Conteúdo de cada slide', designTokens: 'Tokens de design aplicados' },
  rules: ['Primeiro slide deve ser atrativo', 'Último slide deve ter CTA', 'Manter progressão lógica'],
})

registerSkill({
  id: 'create-workflow',
  name: 'Criar Workflow',
  objective: 'Definir sequência de passos automatizados para um processo',
  input: { projectId: 'ID do projeto', name: 'Nome do workflow', steps: 'Lista de passos' },
  output: { workflow: 'Workflow criado com passos e status' },
  rules: ['Passos devem ter ordem lógica', 'Cada passo deve ter responsável definido', 'Workflow deve ter início e fim claros'],
})
