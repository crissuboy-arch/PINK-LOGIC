/**
 * AIsa — camada de coleta e geração via gateway unificado.
 *
 * Uma chave (AISA_API_KEY) → 100+ modelos de IA + 1000+ APIs.
 * Sem chave: os endpoints devolvem 503 com instrução clara.
 * Nada quebra sem a chave; a máquina funciona em modo local.
 */
import { CollectRequest } from "@pink-logic/shared";

const AISA_API_URL = process.env.AISA_API_URL || "https://api.aisa.one/v1";
const AISA_API_KEY = process.env.AISA_API_KEY || "";

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
  const res = await fetch(`${AISA_API_URL}/skills/fetch-trending`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      source: req.source,
      query: req.query,
      limit: req.limit,
    }),
  });
  if (!res.ok) throw new Error(`AIsa collect falhou: HTTP ${res.status}`);
  return res.json();
}

/** Geração de texto com system prompt (usado pelo Gerador de Copy). */
export async function generateTextWithSystem(system: string, user: string, model = "claude-opus-5") {
  if (!aisaReady()) {
    const err: any = new Error("AIsa não configurada: define AISA_API_KEY no .env");
    err.status = 503;
    throw err;
  }
  const res = await fetch(`${AISA_API_URL}/v1/chat/completions`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`AIsa generate falhou: HTTP ${res.status}`);
  const data = (await res.json()) as any;
  return data.choices?.[0]?.message?.content ?? "";
}

/** Geração de texto via modelos (substitui o copy mock). */
export async function generateText(prompt: string, model = "claude-opus-5") {
  if (!aisaReady()) {
    const err: any = new Error("AIsa não configurada: define AISA_API_KEY no .env");
    err.status = 503;
    throw err;
  }
  const res = await fetch(`${AISA_API_URL}/v1/chat/completions`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }] }),
  });
  if (!res.ok) throw new Error(`AIsa generate falhou: HTTP ${res.status}`);
  const data = (await res.json()) as any;
  return data.choices?.[0]?.message?.content ?? "";
}
