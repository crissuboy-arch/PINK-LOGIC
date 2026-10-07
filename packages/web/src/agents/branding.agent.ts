import { createAgent } from './core/BaseAgent'
import type { AgentExecutionInput, AgentExecutionResult } from './types'

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const brandingAgent = createAgent({
  id: 'branding-agent',
  name: 'BrandingAgent',
  description: 'Cria e gerencia identidade visual: paletas, tipografia, tom de voz e estilo visual',
  capabilities: ['branding', 'validation'],
  triggers: ['branding', 'criar branding', 'identidade visual'],
  workflows: ['criar-branding-completo'],
  async executeImpl(input: AgentExecutionInput): Promise<AgentExecutionResult> {
    const start = Date.now()
    const logs: string[] = []
    logs.push(`[BrandingAgent] Iniciando tarefa: ${input.step.name}`)

    await delay(60 + Math.random() * 40)

    const output = {
      palette: { primary: '#FF2D8D', secondary: '#7B2D8E', accent: '#FFD700', background: '#0D0D12', text: '#FFFFFF' },
      fonts: { heading: 'Outfit', body: 'Inter' },
      tone: input.context?.tone ?? 'profissional e acolhedor',
      visualStyle: 'moderno e feminino',
      mockResult: `[MOCK] BrandingAgent: identidade visual gerada para "${input.intent.raw}"`,
    }

    logs.push(`[BrandingAgent] Paleta gerada: ${output.palette.primary}`)
    logs.push(`[BrandingAgent] Task concluída em ${Date.now() - start}ms`)

    return { agentId: 'branding-agent', status: 'success', output, logs, duration: Date.now() - start }
  },
})
