export interface ProjectPalette {
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
}

export interface ProjectTypography {
  heading: string
  body: string
}

export interface ProjectBrandInput {
  projectId?: string
  name?: string
  palette: ProjectPalette
  fonts: ProjectTypography
  tone?: string
  visualStyle?: string
  logo?: string
}

export interface ProjectTokens {
  'project.color.primary': string
  'project.color.secondary': string
  'project.color.accent': string
  'project.color.background': string
  'project.color.text': string
  'project.typography.family.heading': string
  'project.typography.family.body': string
  'project.brand.tone': string
  'project.brand.visualStyle': string
}

export function buildProjectTokens(brand: ProjectBrandInput): ProjectTokens {
  return {
    'project.color.primary': brand.palette.primary,
    'project.color.secondary': brand.palette.secondary,
    'project.color.accent': brand.palette.accent,
    'project.color.background': brand.palette.background,
    'project.color.text': brand.palette.text,
    'project.typography.family.heading': brand.fonts.heading,
    'project.typography.family.body': brand.fonts.body,
    'project.brand.tone': brand.tone ?? '',
    'project.brand.visualStyle': brand.visualStyle ?? '',
  }
}
