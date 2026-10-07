export interface ValidationResult {
  valid: boolean
  checks: { name: string; passed: boolean; message: string }[]
}

export interface ProjectToValidate {
  name?: string
  palette?: Record<string, string>
  fonts?: { heading?: string; body?: string }
  tone?: string
}

export function validateProjectSkill(project: ProjectToValidate): ValidationResult {
  const checks = [
    {
      name: 'Nome do projeto',
      passed: !!project.name && project.name.trim().length > 0,
      message: project.name ? 'OK' : 'Nome do projeto é obrigatório',
    },
    {
      name: 'Paleta de cores',
      passed: !!project.palette && Object.keys(project.palette).length >= 3,
      message: !!project.palette && Object.keys(project.palette).length >= 3
        ? 'OK'
        : 'Mínimo de 3 cores na paleta',
    },
    {
      name: 'Fontes',
      passed: !!project.fonts?.heading && !!project.fonts?.body,
      message: project.fonts?.heading && project.fonts?.body ? 'OK' : 'Defina heading e body font',
    },
    {
      name: 'Tom de voz',
      passed: !!project.tone && project.tone.trim().length > 0,
      message: project.tone ? 'OK' : 'Tom de voz é obrigatório',
    },
  ]

  return {
    valid: checks.every((c) => c.passed),
    checks,
  }
}
