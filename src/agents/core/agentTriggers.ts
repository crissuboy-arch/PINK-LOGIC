export interface TriggerPattern {
  pattern: RegExp
  capability: string
  extract: (match: RegExpMatchArray) => { target: string; platform?: string }
}

export const TRIGGER_PATTERNS: TriggerPattern[] = [
  {
    pattern: /criar?\s*(?:uma?\s*)?campanha\s*(?:para\s*)?(?:o\s*)?(instagram|facebook|tiktok|linkedin)/i,
    capability: 'campaign',
    extract: ([, platform]) => ({ target: 'campaign', platform: platform.toLowerCase() }),
  },
  {
    pattern: /criar?\s*(?:uma?\s*)?campanha/i,
    capability: 'campaign',
    extract: () => ({ target: 'campaign' }),
  },
  {
    pattern: /gerar?\s*(?:um\s*)?conteudo/i,
    capability: 'content',
    extract: () => ({ target: 'content' }),
  },
  {
    pattern: /criar?\s*(?:um\s*)?branding/i,
    capability: 'branding',
    extract: () => ({ target: 'branding' }),
  },
  {
    pattern: /agendar?\s*(?:um\s*)?post/i,
    capability: 'calendar',
    extract: () => ({ target: 'calendar' }),
  },
  {
    pattern: /analisar?\s*(?:os\s*)?resultados/i,
    capability: 'analytics',
    extract: () => ({ target: 'analytics' }),
  },
  {
    pattern: /automatizar?\s*(?:um\s*)?processo/i,
    capability: 'automation',
    extract: () => ({ target: 'automation' }),
  },
  {
    pattern: /extrair?\s*(?:dados|conteudo)/i,
    capability: 'mining',
    extract: () => ({ target: 'mining' }),
  },
  {
    pattern: /validar?\s*(?:um\s*)?projeto/i,
    capability: 'validation',
    extract: () => ({ target: 'project' }),
  },
]

export function matchTrigger(input: string): { capability: string; target: string; platform?: string } | null {
  for (const tp of TRIGGER_PATTERNS) {
    const match = input.match(tp.pattern)
    if (match) {
      return { capability: tp.capability, ...tp.extract(match) }
    }
  }
  return null
}
