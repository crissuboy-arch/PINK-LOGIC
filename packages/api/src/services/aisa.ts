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
  const res = await fetch(`${AISA_BASE_URL}/v1/chat/completions`, {
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
  // [copy-diag] TEMPORÁRIO: só metadados — nunca o texto, token ou dados pessoais.
  console.log("[copy-diag] aisa status", res.status, "ok", res.ok, "model", model);
  if (!res.ok) throw await upstreamError("AIsa generate falhou", res);
  const raw = await res.text();
  let data: any;
  try {
    data = JSON.parse(raw);
  } catch (e: any) {
    console.log("[copy-diag] aisa parse error", e?.message, "bytes", raw.length);
    throw e;
  }
  const choice = data?.choices?.[0];
  const msg = choice?.message;
  const content = msg?.content;
  console.log("[copy-diag] aisa body", JSON.stringify({
    bytes: raw.length,
    topKeys: Object.keys(data || {}),
    choices: Array.isArray(data?.choices) ? data.choices.length : typeof data?.choices,
    finish: choice?.finish_reason ?? null,
    choiceKeys: Object.keys(choice || {}),
    msgKeys: Object.keys(msg || {}),
    contentType: Array.isArray(content) ? "array" : content === null ? "null" : typeof content,
    contentLen: typeof content === "string" ? content.length : Array.isArray(content) ? content.length : 0,
    contentParts: Array.isArray(content) ? content.map((p: any) => ({ type: p?.type, len: (p?.text || "").length })) : undefined,
    altLens: Object.fromEntries(Object.entries(msg || {}).filter(([k, v]) => k !== "content" && typeof v === "string").map(([k, v]) => [k, (v as string).length])),
    errorField: data?.error ? Object.keys(data.error) : null,
  }));
  return data.choices?.[0]?.message?.content ?? "";
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
