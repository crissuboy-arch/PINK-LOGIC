/**
 * Jev decider — middleware de decisão (o "porteiro").
 *
 * O Jev não escreve texto: devolve escolha / nota / sim-não com
 * probabilidade calibrada. Barato ($0,042/1M input, saída grátis).
 *
 * Sem JEV_API_KEY: modo "manual" — devolve passed=false para forçar
 * revisão humana. Nunca aprova automaticamente sem o modelo.
 */
import { DecideRequest, DecideResult } from "@pink-logic/shared";

// API System One da TypeSafe (o antigo /v1/decide devolve 404).
const JEV_API_URL = process.env.JEV_API_URL || "https://api.typesafe.ai/v1/systemone";
const JEV_API_KEY = process.env.JEV_API_KEY || "";
const JEV_MODEL = process.env.JEV_MODEL || "jev-latest";

export async function decide(req: DecideRequest): Promise<DecideResult> {
  if (!JEV_API_KEY) {
    return {
      value: false,
      confidence: 0,
      passed: false,
      provider: "manual",
    };
  }

  let res: Response;
  try {
    res = await fetch(JEV_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${JEV_API_KEY}`,
    },
    body: JSON.stringify({
      model: JEV_MODEL,
      state: req.context,
      questions: {
        decision: req.options
          ? {
              type: "choice",
              instructions: `Ação "${req.action}": qual opção se aplica ao conteúdo?`,
              criteria: Object.fromEntries(req.options.map((o) => [o, null])),
            }
          : {
              type: "noul",
              instructions: `Ação "${req.action}": o conteúdo deve ser aprovado?`,
            },
      },
    }),
  });
  } catch (e: any) {
    // Falha de rede: seguro por omissão → revisão humana.
    return { value: false, confidence: 0, passed: false, provider: "manual", error: `Jev inacessível: ${e?.message}` };
  }

  if (!res.ok) {
    // Chave/endpoint/formato inválido: não derruba a API; força revisão humana
    // e devolve o motivo para diagnóstico.
    let detail = "";
    try { detail = (await res.text()).slice(0, 300); } catch { /* ignora */ }
    return { value: false, confidence: 0, passed: false, provider: "manual", error: `Jev HTTP ${res.status} ${detail}` };
  }

  const data = (await res.json()) as any;
  const a = data.answers?.decision ?? {};

  if (a.type === "noul" && typeof a.noul === "number") {
    // noul = probabilidade de "sim". Só passa com "sim" confiante:
    // um "não" confiante nunca aprova automaticamente.
    const value = a.noul >= 0.5;
    const confidence = value ? a.noul : 1 - a.noul;
    return { value, confidence, passed: value && confidence >= req.threshold, provider: "jev" };
  }

  if (a.type === "choice" && typeof a.choice === "string") {
    const confidence = typeof a.confidence === "number" ? a.confidence : 0;
    return { value: a.choice, confidence, passed: confidence >= req.threshold, provider: "jev" };
  }

  // Resposta fora do schema System One: seguro por omissão → revisão humana.
  return { value: false, confidence: 0, passed: false, provider: "manual", error: "Jev: resposta sem answers.decision válido" };
}

/**
 * Porta de aprovação de post: DRAFT → PENDING_REVIEW | SCHEDULED.
 * Sem chave: vai sempre para revisão humana (seguro por omissão).
 */
export async function approvePost(post: Record<string, unknown>, threshold = 0.7) {
  const result = await decide({
    action: "approve_post",
    context: {
      caption: post.caption,
      hashtags: post.hashtags,
      hasImage: !!post.imageUrl,
    },
    threshold,
  });
  return result;
}
