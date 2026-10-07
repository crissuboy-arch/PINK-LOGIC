import type { ChatMessage, OpenAIModel, OpenAIConfig, OpenAIResponse, OpenAIUsage } from './types'

const API_URL = 'https://api.openai.com/v1/chat/completions'

const COST_PER_1K: Record<string, { input: number; output: number }> = {
  'gpt-4o': { input: 0.005, output: 0.015 },
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-4.1-mini': { input: 0.0004, output: 0.0016 },
}

const STORAGE_KEY = 'pinklogic.openai.key'
const MAX_LOG_LINES = 100

function loadApiKey(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return stored
    const envKey = import.meta.env.VITE_OPENAI_API_KEY
    if (envKey && typeof envKey === 'string' && envKey.startsWith('sk-')) return envKey
    return ''
  }
  catch { return '' }
}

function saveApiKey(key: string): void {
  try { localStorage.setItem(STORAGE_KEY, key) }
  catch { console.warn('[OpenAI] Falha ao salvar API key') }
}

export class OpenAIClient {
  private config: Required<OpenAIConfig>
  private logs: string[]

  constructor(config: OpenAIConfig = {}) {
    this.config = {
      model: config.model || 'gpt-4o-mini',
      maxTokens: config.maxTokens || 2048,
      temperature: config.temperature ?? 0.7,
      timeout: config.timeout || 30000,
      retryCount: config.retryCount ?? 3,
      apiKey: config.apiKey || '',
    }
    this.logs = []
  }

  setApiKey(key: string): void {
    saveApiKey(key)
    this.log(`API key atualizada`)
  }

  getApiKey(): string {
    return this.config.apiKey || loadApiKey()
  }

  hasApiKey(): boolean {
    return this.getApiKey().length > 0
  }

  async chat(
    messages: ChatMessage[],
    options?: Partial<OpenAIConfig>,
  ): Promise<OpenAIResponse> {
    const model = options?.model || this.config.model
    const maxTokens = options?.maxTokens || this.config.maxTokens
    const temperature = options?.temperature ?? this.config.temperature
    const timeout = options?.timeout || this.config.timeout
    const retryCount = options?.retryCount ?? this.config.retryCount

    this.log(`Chamando ${model} com ${messages.length} mensagens`)

    const startTime = Date.now()
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        const response = await this.withTimeout(
          this.callAPI(messages, model, maxTokens, temperature),
          timeout,
        )

        const duration = Date.now() - startTime
        const usage: OpenAIUsage = {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens,
        }

        this.log(`Resposta em ${duration}ms (tentativa ${attempt}) — ${usage.totalTokens} tokens`)

        return {
          content: response.choices[0].message.content,
          model: response.model,
          usage,
          finishReason: response.choices[0].finish_reason,
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        this.log(`Erro na tentativa ${attempt}: ${lastError.message}`)

        if (attempt < retryCount) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000)
          await new Promise((r) => setTimeout(r, delay))
        }
      }
    }

    throw lastError || new Error('Falha na comunicação com OpenAI')
  }

  async chatWithFallback(
    messages: ChatMessage[],
    primaryModel: OpenAIModel = 'gpt-4o',
    fallbackModel: OpenAIModel = 'gpt-4o-mini',
  ): Promise<OpenAIResponse> {
    try {
      this.log(`Tentando modelo primário: ${primaryModel}`)
      return await this.chat(messages, { model: primaryModel })
    } catch (error) {
      this.log(`Fallback para ${fallbackModel} após erro: ${error instanceof Error ? error.message : String(error)}`)
      return await this.chat(messages, { model: fallbackModel })
    }
  }

  estimateCost(model: string, usage: OpenAIUsage): number {
    const pricing = COST_PER_1K[model] || COST_PER_1K['gpt-4o-mini']
    return (usage.promptTokens / 1000) * pricing.input + (usage.completionTokens / 1000) * pricing.output
  }

  getLogs(): string[] {
    return [...this.logs]
  }

  clearLogs(): void {
    this.logs = []
  }

  private log(message: string): void {
    const line = `[${new Date().toISOString()}] ${message}`
    this.logs.unshift(line)
    if (this.logs.length > MAX_LOG_LINES) this.logs.pop()
  }

  private async callAPI(
    messages: ChatMessage[],
    model: string,
    maxTokens: number,
    temperature: number,
  ): Promise<any> {
    const apiKey = this.getApiKey()
    if (!apiKey) throw new Error('API key da OpenAI não configurada')

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature }),
    })

    if (!response.ok) {
      const body = await response.text()
      throw new Error(`OpenAI ${response.status}: ${body}`)
    }

    return response.json()
  }

  private withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`Timeout após ${ms}ms`)), ms)
      promise.then(resolve, reject).finally(() => clearTimeout(timer))
    })
  }
}

export const aiClient = new OpenAIClient()
