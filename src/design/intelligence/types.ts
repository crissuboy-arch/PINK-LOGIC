export type IssueType = 'violation' | 'warning' | 'suggestion'
export type IssueCategory = 'color' | 'typography' | 'composition' | 'consistency' | 'branding' | 'accessibility'
export type IssueSeverity = 'critical' | 'major' | 'minor' | 'info'

export interface DesignIssue {
  id: string
  type: IssueType
  category: IssueCategory
  severity: IssueSeverity
  title: string
  description: string
  field?: string
  value?: string
  expected?: string
  fix?: string
  rule?: string
}

export interface BrandProfile {
  tone: string
  luxuryLevel: number
  modernity: number
  minimalism: number
  vibrancy: number
  warmth: number
  formality: number
  playfulness: number
  targetAudience: string[]
  emotionalStyle: string[]
}

export interface DesignAnalysisResult {
  score: number
  brandingStrength: number
  readability: number
  contrast: number
  consistency: number
  composition: number
  accessibility: number
  issues: DesignIssue[]
  violations: DesignIssue[]
  warnings: DesignIssue[]
  suggestions: DesignIssue[]
  brandProfile: BrandProfile
  summary: string
}

export interface VisualRule {
  id: string
  name: string
  category: IssueCategory
  severity: IssueSeverity
  evaluate: (input: RuleInput) => DesignIssue | null
}

export interface RuleInput {
  palette?: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
  }
  fonts?: {
    heading: string
    body: string
  }
  tone?: string
  visualStyle?: string
  radius?: Record<string, number>
  spacing?: Record<string, number>
  colors?: string[]
}
