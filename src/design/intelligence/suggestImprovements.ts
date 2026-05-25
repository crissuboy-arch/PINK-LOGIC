import type { DesignAnalysisResult, BrandProfile, DesignIssue } from './types'

export interface Suggestion {
  id: string
  priority: 'high' | 'medium' | 'low'
  category: string
  title: string
  description: string
  action: string
  impact: string
  effort: 'low' | 'medium' | 'high'
}

function generateId(): string {
  return crypto.randomUUID()
}

const IMPROVEMENT_TEMPLATES: Record<string, (issue: DesignIssue) => Suggestion> = {
  'excess-colors': (issue) => ({
    id: generateId(), priority: 'medium', category: 'cores',
    title: 'Simplificar paleta de cores',
    description: issue.description,
    action: issue.fix ?? 'Remover cores não essenciais e manter 3-5 cores principais',
    impact: 'Interface mais limpa e consistente', effort: 'low',
  }),
  'duplicate-colors': (issue) => ({
    id: generateId(), priority: 'high', category: 'cores',
    title: 'Corrigir cores duplicadas',
    description: issue.description,
    action: issue.fix ?? 'Atribuir cores distintas para cada função',
    impact: 'Melhor hierarquia visual e usabilidade', effort: 'low',
  }),
  'low-contrast-text': (issue) => ({
    id: generateId(), priority: 'high', category: 'acessibilidade',
    title: 'Aumentar contraste do texto',
    description: issue.description,
    action: issue.fix ?? 'Escurecer texto ou clarear fundo para atingir 4.5:1',
    impact: 'Legibilidade para todos os usuários, incluindo baixa visão', effort: 'low',
  }),
  'primary-background-contrast': (issue) => ({
    id: generateId(), priority: 'high', category: 'cores',
    title: 'Aumentar contraste da cor primária',
    description: issue.description,
    action: issue.fix ?? 'Escolher primary com contraste ≥ 2:1 contra o fundo',
    impact: 'Elementos primários ficarão visíveis', effort: 'medium',
  }),
  'colors-too-similar': (issue) => ({
    id: generateId(), priority: 'medium', category: 'cores',
    title: 'Diferenciar cores similares',
    description: issue.description,
    action: issue.fix ?? 'Aumentar diferença de matiz ou luminosidade',
    impact: 'Elementos visuais mais distinguíveis', effort: 'medium',
  }),
  'missing-fonts': (issue) => ({
    id: generateId(), priority: 'high', category: 'tipografia',
    title: 'Definir fontes do projeto',
    description: issue.description,
    action: issue.fix ?? 'Escolher fontes heading e body',
    impact: 'Identidade tipográfica estabelecida', effort: 'low',
  }),
  'same-font-heading-body': (issue) => ({
    id: generateId(), priority: 'medium', category: 'tipografia',
    title: 'Diferenciar heading de body',
    description: issue.description,
    action: issue.fix ?? 'Usar fonte display/serif para heading e sans-serif para body',
    impact: 'Hierarquia visual mais clara', effort: 'medium',
  }),
  'incompatible-font-pairing': (issue) => ({
    id: generateId(), priority: 'medium', category: 'tipografia',
    title: 'Corrigir par de fontes',
    description: issue.description,
    action: issue.fix ?? 'Escolher fontes que se complementam',
    impact: 'Melhor harmonia tipográfica', effort: 'medium',
  }),
  'tone-font-mismatch': (issue) => ({
    id: generateId(), priority: 'medium', category: 'tipografia',
    title: 'Alinhar fonte ao tom da marca',
    description: issue.description,
    action: issue.fix ?? 'Escolher fonte que reflita a personalidade da marca',
    impact: 'Identidade de marca mais coesa', effort: 'medium',
  }),
  'handwriting-body': (issue) => ({
    id: generateId(), priority: 'high', category: 'tipografia',
    title: 'Substituir fonte body',
    description: issue.description,
    action: issue.fix ?? 'Usar fonte legível para body (Inter, Roboto, etc)',
    impact: 'Textos longos legíveis', effort: 'low',
  }),
  'missing-accent': (issue) => ({
    id: generateId(), priority: 'high', category: 'composição',
    title: 'Adicionar cor de destaque para CTA',
    description: issue.description,
    action: issue.fix ?? 'Adicionar accent vibrante que contraste com o fundo',
    impact: 'Botões e CTAs terão maior taxa de clique', effort: 'low',
  }),
  'no-hierarchy': (issue) => ({
    id: generateId(), priority: 'medium', category: 'composição',
    title: 'Melhorar hierarquia visual',
    description: issue.description,
    action: issue.fix ?? 'Diferenciar fontes e usar 3+ cores em camadas',
    impact: 'Interface mais escaneável e intuitiva', effort: 'medium',
  }),
  'inconsistent-spacing': (issue) => ({
    id: generateId(), priority: 'low', category: 'composição',
    title: 'Padronizar escala de spacing',
    description: issue.description,
    action: issue.fix ?? 'Adotar escala consistente de espaçamento',
    impact: 'Layout mais harmonioso', effort: 'medium',
  }),
  'inconsistent-radius': (issue) => ({
    id: generateId(), priority: 'low', category: 'composição',
    title: 'Padronizar cantos arredondados',
    description: issue.description,
    action: issue.fix ?? 'Limitar variação de radius a 4x entre valores',
    impact: 'Aparência mais consistente', effort: 'low',
  }),
  'missing-tone': (issue) => ({
    id: generateId(), priority: 'medium', category: 'consistência',
    title: 'Definir tom de voz',
    description: issue.description,
    action: issue.fix ?? 'Criar um guia de tom de voz para a marca',
    impact: 'Comunicação consistente em todos os canais', effort: 'low',
  }),
  'missing-visual-style': (issue) => ({
    id: generateId(), priority: 'medium', category: 'consistência',
    title: 'Definir estilo visual',
    description: issue.description,
    action: issue.fix ?? 'Criar moodboard e guia de estilo visual',
    impact: 'Materiais com identidade coesa', effort: 'medium',
  }),
  'palette-size-inconsistency': (issue) => ({
    id: generateId(), priority: 'high', category: 'cores',
    title: 'Completar paleta de cores',
    description: issue.description,
    action: issue.fix ?? 'Adicionar cores faltantes: primary, secondary, accent, background, text',
    impact: 'Sistema de design completo', effort: 'low',
  }),
}

export function suggestImprovements(analysis: DesignAnalysisResult): Suggestion[] {
  const suggestions: Suggestion[] = []

  for (const issue of analysis.issues) {
    const template = issue.rule ? IMPROVEMENT_TEMPLATES[issue.rule] : undefined
    if (template) {
      suggestions.push(template(issue))
    } else {
      suggestions.push({
        id: generateId(),
        priority: issue.severity === 'critical' ? 'high' : issue.severity === 'major' ? 'high' : 'medium',
        category: issue.category,
        title: issue.title,
        description: issue.description,
        action: issue.fix ?? 'Revisar e ajustar',
        impact: 'Melhoria geral na qualidade visual',
        effort: issue.severity === 'critical' ? 'high' : 'medium',
      })
    }
  }

  return suggestions
}

export function suggestFromProfile(profile: BrandProfile): Suggestion[] {
  const suggestions: Suggestion[] = []
  if (profile.luxuryLevel > 70 && profile.minimalism > 70) {
    suggestions.push({
      id: generateId(), priority: 'low', category: 'estratégia',
      title: 'Luxo minimalista',
      description: 'Marca combina alto luxo com minimalismo — usar bastante espaço negativo e tipografia refinada',
      action: 'Investir em fotografia premium e tipografia serifada',
      impact: 'Posicionamento de luxo aspiracional', effort: 'medium',
    })
  }
  if (profile.modernity > 70 && profile.playfulness > 70) {
    suggestions.push({
      id: generateId(), priority: 'low', category: 'estratégia',
      title: 'Marca jovem e moderna',
      description: 'Perfil sugere marca digital-first com personalidade vibrante',
      action: 'Usar micro-interações, animações e linguagem visual ousada',
      impact: 'Engajamento com público jovem', effort: 'medium',
    })
  }
  if (profile.formality > 70) {
    suggestions.push({
      id: generateId(), priority: 'low', category: 'estratégia',
      title: 'Tom profissional',
      description: 'Marca com perfil formal — priorizar clareza e precisão',
      action: 'Usar fotografia corporativa, gráficos limpos e tipografia sem serifa',
      impact: 'Credibilidade e profissionalismo', effort: 'low',
    })
  }
  return suggestions
}
