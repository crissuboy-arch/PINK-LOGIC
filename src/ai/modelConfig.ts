export const DEFAULT_MODEL = 'gpt-4o-mini'

export interface AgentModelConfig {
  primary: string
  fallback: string[]
  maxTokens: number
  temperature: number
}

export const AGENT_MODEL_MAP: Record<string, AgentModelConfig> = {
  campaign: {
    primary: 'gpt-4.1-mini',
    fallback: ['gpt-4o-mini', 'gpt-4o'],
    maxTokens: 4096,
    temperature: 0.7,
  },
  branding: {
    primary: 'gpt-4o',
    fallback: ['gpt-4o-mini'],
    maxTokens: 3072,
    temperature: 0.7,
  },
  analytics: {
    primary: 'gpt-4o-mini',
    fallback: ['gpt-4o'],
    maxTokens: 2048,
    temperature: 0.5,
  },
  content: {
    primary: 'gpt-4o-mini',
    fallback: ['gpt-4o'],
    maxTokens: 2048,
    temperature: 0.8,
  },
  automation: {
    primary: 'gpt-4o-mini',
    fallback: ['gpt-4o'],
    maxTokens: 2048,
    temperature: 0.5,
  },
  design: {
    primary: 'gpt-4o-mini',
    fallback: ['gpt-4o'],
    maxTokens: 2048,
    temperature: 0.6,
  },
  mining: {
    primary: 'gpt-4o-mini',
    fallback: ['gpt-4o'],
    maxTokens: 2048,
    temperature: 0.5,
  },
  calendar: {
    primary: 'gpt-4o-mini',
    fallback: ['gpt-4o'],
    maxTokens: 2048,
    temperature: 0.6,
  },
  validation: {
    primary: 'gpt-4o-mini',
    fallback: ['gpt-4o'],
    maxTokens: 2048,
    temperature: 0.4,
  },
  orchestrator: {
    primary: 'gpt-4.1-mini',
    fallback: ['gpt-4o-mini', 'gpt-4o'],
    maxTokens: 4096,
    temperature: 0.7,
  },
}

export function getModelForAgent(agentType: string): AgentModelConfig {
  return AGENT_MODEL_MAP[agentType] || AGENT_MODEL_MAP.content
}
