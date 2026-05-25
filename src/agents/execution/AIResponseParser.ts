export interface ParsedResponse {
  success: boolean
  data: Record<string, unknown>
  raw: string
  warnings: string[]
}

export function parseAIResponse(content: string): ParsedResponse {
  const warnings: string[] = []
  let data: Record<string, unknown> = {}
  let jsonStr = content.trim()

  const blockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (blockMatch) {
    jsonStr = blockMatch[1].trim()
  }

  try {
    data = JSON.parse(jsonStr)
  } catch {
    const objectMatch = jsonStr.match(/\{[\s\S]*\}/)
    if (objectMatch) {
      try {
        data = JSON.parse(objectMatch[0])
      } catch {
        warnings.push('Resposta não contém JSON válido')
      }
    } else {
      warnings.push('Resposta não contém JSON válido')
    }
  }

  return { success: Object.keys(data).length > 0, data, raw: content, warnings }
}

export function validateResponse(
  data: Record<string, unknown>,
  requiredFields: string[],
): string[] {
  const missing: string[] = []
  for (const field of requiredFields) {
    const value = data[field]
    if (value === undefined || value === null || value === '') {
      missing.push(field)
    }
  }
  return missing
}
