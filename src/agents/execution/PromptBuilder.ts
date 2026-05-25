import type { AgentExecutionContext } from '../runtime/AgentRuntime'

export type AgentType = 'content' | 'campaign' | 'design' | 'branding' | 'analytics' | 'automation' | 'mining' | 'calendar' | 'validation'

export interface BuiltPrompt {
  system: string
  user: string
  messages: Array<{ role: 'system' | 'user'; content: string }>
}

const SYSTEM_PROMPTS: Record<AgentType, string> = {
  content: `Você é um Copywriter e Estrategista de Conteúdo Digital especializado em marketing de alta performance.
Sua função é gerar conteúdo criativo, persuasivo e otimizado para conversão em redes sociais.
Regras:
- Use linguagem persuasiva e gatilhos mentais
- Adapte o tom ao público-alvo e plataforma
- Gere headlines que parem o scroll
- CTAs com senso de urgência
- Hashtags estratégicas (volume + nicho)
Responda APENAS com JSON válido, sem markdown.`,
  campaign: `Você é um Estrategista de Campanhas de Marketing com experiência em growth marketing.
Sua função é planejar campanhas completas e acionáveis.
Regras:
- Defina oferta clara e irresistível
- Mecanismo criativo e escalável
- Avatar detalhado do público-alvo
- Múltiplos ângulos de comunicação
- Canais de distribuição adequados
Responda APENAS com JSON válido, sem markdown.`,
  design: `Você é um Diretor de Arte e Designer Gráfico especializado em branding digital.
Sua função é definir identidade visual completa.
Regras:
- Paletas harmoniosas com contraste adequado
- Tipografia com personalidade e legibilidade
- Style tokens consistentes
- Estilo visual alinhado ao posicionamento
Responda APENAS com JSON válido, sem markdown.`,
  branding: `Você é um Especialista em Branding e Identidade Visual.
Sua função é criar sistemas de marca completos e coerentes.
Regras:
- Defina personalidade de marca clara
- Paleta com cores primária, secundária e destaque
- Tipografia para títulos e corpo
- Tom de voz consistente
- Estilo visual diferenciado
Responda APENAS com JSON válido, sem markdown.`,
  analytics: `Você é um Analista de Dados e Métricas de Marketing.
Sua função é analisar resultados e extrair insights acionáveis.
Regras:
- Identifique padrões e tendências
- Destaque oportunidades de otimização
- Baseie recomendações em dados
Responda APENAS com JSON válido, sem markdown.`,
  automation: `Você é um Especialista em Automação de Marketing.
Sua função é criar fluxos de automação inteligentes.
Regras:
- Defina triggers claros
- Ações encadeadas logicamente
- Condições e ramificações
Responda APENAS com JSON válido, sem markdown.`,
  mining: `Você é um Analista de Pesquisa e Mineração de Dados.
Sua função é extrair tendências e insights do mercado.
Regras:
- Fontes confiáveis e relevantes
- Dados estruturados e acionáveis
- Trends com potencial de aplicação
Responda APENAS com JSON válido, sem markdown.`,
  calendar: `Você é um Estrategista de Calendário Editorial.
Sua função é planejar cronogramas de conteúdo estratégicos.
Regras:
- Distribuição equilibrada de formatos
- Frequência adequada à plataforma
- Datas e temas alinhados ao negócio
Responda APENAS com JSON válido, sem markdown.`,
  validation: `Você é um Analista de Qualidade e Conformidade.
Sua função é validar projetos e identificar problemas.
Regras:
- Verifique consistência de branding
- Identifique violations de design
- Sugira correções específicas
Responda APENAS com JSON válido, sem markdown.`,
}

const AGENT_JSON_SCHEMAS: Record<AgentType, string> = {
  content: `{
  "headline": "string — título principal chamativo",
  "cta": "string — chamada para ação principal",
  "hooks": ["string — hook 1", "string — hook 2"],
  "legenda": "string — texto da legenda completo (mínimo 80 caracteres)",
  "hashtags": ["#string", "#string"],
  "tom": "string — tom de voz utilizado",
  "plataforma": "string — plataforma alvo"
}`,
  campaign: `{
  "nome": "string — nome da campanha",
  "oferta": "string — descrição da oferta principal",
  "mecanismo": "string — mecanismo (sorteio, desconto, lançamento...)",
  "avatar": "string — descrição do público-alvo",
  "criativos": ["string — ideia criativa 1", "string — ideia criativa 2"],
  "ângulos": ["string — ângulo de comunicação 1", "string — ângulo de comunicação 2"],
  "objetivo": "string — objetivo principal",
  "canais": ["string — canal 1", "string — canal 2"]
}`,
  design: `{
  "branding": "string — conceito de branding",
  "paleta": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "background": "#hex",
    "text": "#hex"
  },
  "tipografia": {
    "heading": "string — fonte para títulos",
    "body": "string — fonte para corpo"
  },
  "styleTokens": {
    "borderRadius": "string — px",
    "spacing": "string — tight | comfortable | loose",
    "style": "string — estilo visual",
    "tone": "string — tom de voz"
  }
}`,
  branding: `{
  "conceito": "string — conceito da marca",
  "personalidade": ["string — traço 1", "string — traço 2"],
  "paleta": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "background": "#hex",
    "text": "#hex"
  },
  "tipografia": {
    "heading": "string",
    "body": "string"
  },
  "tomVoz": "string — descrição do tom",
  "estiloVisual": "string — estilo dominante"
}`,
  analytics: `{
  "periodo": "string — período analisado",
  "metricas": { "alcance": number, "engajamento": number, "conversoes": number },
  "topConteudo": ["string — conteúdo 1", "string — conteúdo 2"],
  "insights": ["string — insight 1", "string — insight 2"],
  "recomendacao": "string — recomendação principal"
}`,
  automation: `{
  "nome": "string — nome da automação",
  "trigger": "string — evento que dispara",
  "acoes": ["string — ação 1", "string — ação 2"],
  "condicoes": { "string": "string" },
  "canais": ["string — canal 1"]
}`,
  mining: `{
  "fonte": "string — fonte dos dados",
  "itens": ["string — item 1", "string — item 2"],
  "totalColetado": number,
  "trends": ["string — trend 1", "string — trend 2"],
  "relevancia": "string — nível de relevância"
}`,
  calendar: `{
  "eventos": [
    { "data": "string — YYYY-MM-DD", "titulo": "string", "formato": "string", "plataforma": "string" }
  ],
  "totalEventos": number,
  "frequencia": "string — diária, semanal, mensal"
}`,
  validation: `{
  "valido": boolean,
  "score": number,
  "problemas": ["string — problema 1", "string — problema 2"],
  "sugestoes": ["string — sugestão 1", "string — sugestão 2"],
  "resumo": "string — resumo da validação"
}`,
}

function buildContentPrompt(context: AgentExecutionContext): string {
  return `Gere conteúdo para redes sociais.

Solicitação: "${context.userInput}"
${context.intent.platform ? `Plataforma: ${context.intent.platform}` : ''}

Responda com JSON exatamente neste formato:
${AGENT_JSON_SCHEMAS.content}`
}

function buildCampaignPrompt(context: AgentExecutionContext): string {
  return `Planeje uma campanha de marketing.

Solicitação: "${context.userInput}"

Responda com JSON exatamente neste formato:
${AGENT_JSON_SCHEMAS.campaign}`
}

function buildDesignPrompt(context: AgentExecutionContext): string {
  return `Defina a identidade visual.

Solicitação: "${context.userInput}"

Responda com JSON exatamente neste formato:
${AGENT_JSON_SCHEMAS.design}`
}

function buildBrandingPrompt(context: AgentExecutionContext): string {
  return `Crie um branding completo.

Solicitação: "${context.userInput}"

Responda com JSON exatamente neste formato:
${AGENT_JSON_SCHEMAS.branding}`
}

function buildDefaultPrompt(context: AgentExecutionContext): string {
  const schema = AGENT_JSON_SCHEMAS[context.intent.type as AgentType]
  return `Com base na solicitação abaixo, gere uma resposta em JSON.

Solicitação: "${context.userInput}"

${schema ? `Responda com JSON neste formato:\n${schema}` : 'Responda com JSON.'}`
}

export function buildPrompt(agentType: AgentType, context: AgentExecutionContext): BuiltPrompt {
  const system = SYSTEM_PROMPTS[agentType] || SYSTEM_PROMPTS.content

  let user: string
  switch (agentType) {
    case 'content':
      user = buildContentPrompt(context)
      break
    case 'campaign':
      user = buildCampaignPrompt(context)
      break
    case 'design':
      user = buildDesignPrompt(context)
      break
    case 'branding':
      user = buildBrandingPrompt(context)
      break
    default:
      user = buildDefaultPrompt(context)
  }

  return {
    system,
    user,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  }
}
