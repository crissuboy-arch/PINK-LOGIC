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

const JEV_API_URL = process.env.JEV_API_URL || "https://api.typesafe.ai/v1/decide";
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

  const res = await fetch(JEV_API_URL, {
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
          ? { type: "choice", options: req.options }
          : { type: "boolean" },
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Jev falhou: HTTP ${res.status}`);
  }

  const data = (await res.json()) as any;
  const q = data.questions?.decision ?? data.decision ?? {};
  const confidence = typeof q.confidence === "number" ? q.confidence : 0;
  const value = q.value ?? false;

  return {
    value,
    confidence,
    passed: confidence >= req.threshold,
    provider: "jev",
  };
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
