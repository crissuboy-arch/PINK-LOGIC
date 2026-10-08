/**
 * AIsa — camada de coleta e geração via gateway unificado.
 *
 * Uma chave (AISA_API_KEY) → 100+ modelos de IA + 1000+ APIs.
 * Sem chave: os endpoints devolvem 503 com instrução clara.
 * Nada quebra sem a chave; a máquina funciona em modo local.
 */
import { CollectRequest } from "@pink-logic/shared";

// Aceita AISA_API_URL com ou sem "/v1" no fim (evita o bug /v1/v1/...).
const AISA_BASE_URL = (process.env.AISA_API_URL || "https://api.aisa.one")
  .replace(/\/+$/, "")
  .replace(/\/v1$/, "");
const AISA_API_KEY = process.env.AISA_API_KEY || "";
// Modelo padrão configurável por variável de ambiente (AISA_MODEL).
const AISA_DEFAULT_MODEL = process.env.AISA_MODEL || "claude-opus-5";

async function upstreamError(label: string, res: Response): Promise<Error> {
  let detail = "";
  try {
    detail = (await res.text()).slice(0, 300);
  } catch {
    /* ignora */
  }
  const err: any = new Error(`${label}: HTTP ${res.status}${detail ? ` — ${detail}` : ""}`);
  // 4xx do provedor vira 502 (gateway), nunca um 500 genérico sem pista.
  err.status = 502;
  err.upstreamStatus = res.status;
  return err;
}

function headers() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${AISA_API_KEY}`,
  };
}

export function aisaReady(): boolean {
  return AISA_API_KEY.length > 0;
}

/** Coleta: reels/posts/trends de uma fonte (instagram, tiktok, trends). */
export async function collect(req: CollectRequest) {
  if (!aisaReady()) {
    const err: any = new Error("AIsa não configurada: define AISA_API_KEY no .env");
    err.status = 503;
    throw err;
  }
  const res = await fetch(`${AISA_BASE_URL}/v1/skills/fetch-trending`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      source: req.source,
      query: req.query,
      limit: req.limit,
    }),
  });
  if (!res.ok) throw await upstreamError("AIsa collect falhou", res);
  return res.json();
}

/** Geração de texto com system prompt (usado pelo Gerador de Copy). */
export async function generateTextWithSystem(system: string, user: string, model = AISA_DEFAULT_MODEL) {
  if (!aisaReady()) {
    const err: any = new Error("AIsa não configurada: define AISA_API_KEY no .env");
    err.status = 503;
    throw err;
  }
  // Streaming: o gateway da AIsa corta respostas que demoram mais de ~60s para começar;
  // com stream o texto chega aos poucos e a conexão não fica parada.
  const res = await fetch(`${AISA_BASE_URL}/v1/chat/completions`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      model,
      stream: true,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) throw await upstreamError("AIsa generate falhou", res);

  // Se a AIsa ignorar o stream e devolver JSON inteiro, continua a funcionar.
  if (!(res.headers.get("content-type") || "").includes("text/event-stream") || !res.body) {
    const data = (await res.json()) as any;
    return data.choices?.[0]?.message?.content ?? "";
  }
  return readStreamedContent(res.body);
}

/** Junta os pedaços `choices[0].delta.content` de uma resposta SSE (formato OpenAI). */
async function readStreamedContent(body: ReadableStream<Uint8Array>): Promise<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (payload === "[DONE]") return text;
      try {
        const chunk = JSON.parse(payload);
        text += chunk.choices?.[0]?.delta?.content ?? "";
      } catch {
        /* linha parcial ou keep-alive: ignora */
      }
    }
  }
  return text;
}

/** Geração de texto via modelos (substitui o copy mock). */
export async function generateText(prompt: string, model = AISA_DEFAULT_MODEL) {
  if (!aisaReady()) {
    const err: any = new Error("AIsa não configurada: define AISA_API_KEY no .env");
    err.status = 503;
    throw err;
  }
  const res = await fetch(`${AISA_BASE_URL}/v1/chat/completions`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }] }),
  });
  if (!res.ok) throw await upstreamError("AIsa generate falhou", res);
  const data = (await res.json()) as any;
  return data.choices?.[0]?.message?.content ?? "";
}
