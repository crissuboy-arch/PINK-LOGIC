import { createAgent } from './core/BaseAgent'
import type { AgentExecutionInput, AgentExecutionResult } from './types'

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const contentAgent = createAgent({
  id: 'content-agent',
  name: 'ContentAgent',
  description: 'Gera conteúdos para redes sociais: posts, stories, reels, carrosséis e copies',
  capabilities: ['content', 'calendar'],
  triggers: ['conteudo', 'gerar conteudo', 'post', 'copy'],
  workflows: ['gerar-conteudo-redes', 'criar-campanha-instagram'],
  async executeImpl(input: AgentExecutionInput): Promise<AgentExecutionResult> {
    const start = Date.now()
    const logs: string[] = []
    logs.push(`[ContentAgent] Iniciando: ${input.step.name}`)

    await delay(70 + Math.random() * 60)

    const platform = input.intent.platform ?? 'instagram'
    const output: Record<string, unknown> = {
      format: input.step.input?.format ?? 'post',
      platform,
      content: `[${platform.toUpperCase()}] Conteúdo gerado sobre: "${input.intent.raw}"`,
      characterCount: 180,
      hashtags: ['#pinklogic', '#marketing'],
      mockResult: `[MOCK] ContentAgent: conteúdo para ${platform} criado com sucesso`,
    }

    logs.push(`[ContentAgent] Formato: ${output.format}, Plataforma: ${platform}`)
    logs.push(`[ContentAgent] Conteúdo gerado em ${Date.now() - start}ms`)

    return { agentId: 'content-agent', status: 'success', output, logs, duration: Date.now() - start }
  },
})
