/**
 * Verificação automática de copy — lista de bloqueio + checklist.
 * Aplica-se ANTES de mostrar ao usuário; se reprovar, regenera 1x.
 */

// Frases/padrões proibidos (secção 3 do system prompt). Match case-insensitive.
const BLOCKED_PHRASES = [
  "no mundo de hoje",
  "você já parou para pensar",
  "voce ja parou para pensar",
  "descubra o poder de",
  "eleve seu negócio",
  "eleve o seu negócio",
  "transforme sua vida",
  "desbloqueie o seu potencial",
  "desbloqueie seu potencial",
  "leve ao próximo nível",
  "leve ao proximo nivel",
  "mergulhe em",
  "navegue pelo",
  "jornada",
  "revolucionário",
  "revolucionario",
  "inovador",
  "solução completa",
  "solucao completa",
  "design premium completo",
  "não é apenas",
  "nao e apenas",
  "aqui está o segredo",
  "aqui esta o segredo",
  // equivalentes EN/ES comuns
  "in today's world",
  "unlock your potential",
  "take it to the next level",
  "game-changer",
  "revolutionary",
];

export interface CopyCheckResult {
  passed: boolean;
  violations: string[];
}

/** Devolve as frases bloqueadas encontradas (vazio = passou). */
export function checkCopy(text: string): CopyCheckResult {
  const lower = text.toLowerCase();
  const violations: string[] = [];

  for (const phrase of BLOCKED_PHRASES) {
    if (lower.includes(phrase)) violations.push(`frase bloqueada: "${phrase}"`);
  }

  // excesso de emojis (>6) — sinal de IA
  const emojiCount = (text.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu) || []).length;
  if (emojiCount > 6) violations.push(`excesso de emojis (${emojiCount})`);

  // excesso de exclamações (>4)
  const excl = (text.match(/!/g) || []).length;
  if (excl > 4) violations.push(`excesso de exclamações (${excl})`);

  // promessas absolutas sem prova aparente
  if (/\b(10x|100%|em 7 dias|em 30 dias|garantido)\b/i.test(text)) {
    violations.push("promessa absoluta/número redondo sem prova explícita");
  }

  return { passed: violations.length === 0, violations };
}
