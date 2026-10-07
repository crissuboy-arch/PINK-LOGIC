export interface ResolvedIntent {
  type: string
  action: string
  target: string
  platform?: string
  confidence: number
  params: Record<string, string>
  raw: string
}

const INTENT_PATTERNS: { pattern: RegExp; extract: (match: RegExpMatchArray) => ResolvedIntent }[] = [
  {
    pattern: /criar?\s*(?:uma?\s*)?campanha\s*(?:para\s*)?(?:o\s*)?(instagram|facebook|tiktok|linkedin)/i,
    extract: ([, platform]) => ({
      type: 'campaign',
      action: 'create',
      target: 'campaign',
      platform: platform.toLowerCase(),
      confidence: 0.9,
      params: { platform: platform.toLowerCase() },
      raw: '',
    }),
  },
  {
    pattern: /criar?\s*(?:uma?\s*)?campanha/i,
    extract: () => ({
      type: 'campaign',
      action: 'create',
      target: 'campaign',
      confidence: 0.7,
      params: {},
      raw: '',
    }),
  },
  {
    pattern: /gerar?\s*(?:um\s*)?conteudo/i,
    extract: () => ({
      type: 'content',
      action: 'create',
      target: 'content',
      confidence: 0.8,
      params: {},
      raw: '',
    }),
  },
  {
    pattern: /criar?\s*(?:um\s*)?branding/i,
    extract: () => ({
      type: 'branding',
      action: 'create',
      target: 'branding',
      confidence: 0.85,
      params: {},
      raw: '',
    }),
  },
  {
    pattern: /validar?\s*(?:um\s*)?projeto/i,
    extract: () => ({
      type: 'validation',
      action: 'validate',
      target: 'project',
      confidence: 0.85,
      params: {},
      raw: '',
    }),
  },
]

export function resolveIntent(input: string): ResolvedIntent {
  const trimmed = input.trim()

  for (const { pattern, extract } of INTENT_PATTERNS) {
    const match = trimmed.match(pattern)
    if (match) {
      const intent = extract(match)
      intent.raw = trimmed
      return intent
    }
  }

  return {
    type: 'unknown',
    action: 'unknown',
    target: 'unknown',
    confidence: 0.1,
    params: {},
    raw: trimmed,
  }
}
