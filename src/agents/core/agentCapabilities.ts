export const CAPABILITIES = {
  BRANDING: 'branding',
  CONTENT: 'content',
  CAMPAIGN: 'campaign',
  AUTOMATION: 'automation',
  ANALYTICS: 'analytics',
  MINING: 'mining',
  CALENDAR: 'calendar',
  VALIDATION: 'validation',
  WORKFLOW: 'workflow',
} as const

export type CapabilityId = (typeof CAPABILITIES)[keyof typeof CAPABILITIES]

export const CAPABILITY_DESCRIPTIONS: Record<CapabilityId, string> = {
  branding: 'Criação e gerenciamento de identidade visual',
  content: 'Geração de conteúdo textual e visual para redes sociais',
  campaign: 'Planejamento e execução de campanhas de marketing',
  automation: 'Automação de processos e tarefas repetitivas',
  analytics: 'Análise de métricas e geração de relatórios',
  mining: 'Extração e coleta de dados de fontes externas',
  calendar: 'Gestão de calendário editorial e agendamentos',
  validation: 'Validação de conformidade e qualidade',
  workflow: 'Orquestração de fluxos de trabalho',
}
