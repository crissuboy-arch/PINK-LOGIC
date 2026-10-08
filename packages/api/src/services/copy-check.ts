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
  // aberturas/fechamentos prontos e frases de marketing (adaptado de marketingskills, MIT)
  "nos dias de hoje",
  "quando se trata de",
  "a verdade é que",
  "a verdade e que",
  "diga adeus",
  "diga olá",
  "porque você merece",
  "isso muda tudo",
  "tudo o que você precisa",
  "tudo o que voce precisa",
  "sem esforço",
  "sem esforco",
  "em poucos cliques",
  "junte-se a milhares",
  "divisor de águas",
  "especialistas afirmam",
  "estudos mostram",
  "alavancar",
  "alavanque",
  "potencializ",
  "turbine",
  "turbinar",
];

// Formatos em que o travessão é proibido (texto curto). E-mail (corpo) fica de fora.
const SHORT_FORMATS = ["legenda", "headline", "reels", "anúncio", "anuncio", "whatsapp", "carrossel"];

/** Parte da resposta que é a copy em si (antes da direção de arte / explicação). */
function copySection(text: string): string {
  // Corta no TÍTULO da seção ("## Direção de arte", "**Direção de arte**", ou linha que começa assim).
  const cut = text.search(/^[ \t]*(#{1,6}[ \t]*|\*\*)?[ \t]*dire[cç][aã]o de arte/im);
  return cut >= 0 ? text.slice(0, cut) : text;
}

export interface CopyCheckResult {
  passed: boolean;
  violations: string[];
}

/** Devolve as frases bloqueadas encontradas (vazio = passou). */
export function checkCopy(text: string, format?: string): CopyCheckResult {
  const lower = text.toLowerCase();
  const violations: string[] = [];

  for (const phrase of BLOCKED_PHRASES) {
    if (lower.includes(phrase)) violations.push(`frase bloqueada: "${phrase}"`);
  }

  // Estruturas típicas de IA — verificadas só na copy (não na direção de arte).
  const copy = copySection(text);

  // abertura "Imagine/Imagina..." no início de frase
  if (/(^|[.!?\n>]\s*)imagin[ea]\b/i.test(copy)) violations.push('abertura "Imagine/Imagina..."');

  // revelação por contraste: "não é X, é Y" / "não foi seu, foi do método"
  if (/\bn[ãa]o (é|foi|era|são)\s[^.!?\n]{0,50}[,;.]\s*(é|foi|era|são)\s/i.test(copy)) {
    violations.push('revelação por contraste ("não é X, é Y")');
  }

  // lista de negações: "Sem X. Sem Y." / "sem X, sem Y" / "Nada de X, Y ou Z"
  if (/\bsem\s[^.!?,\n]{1,40}[.,]\s+sem\s/i.test(copy) || /\bnada de\s[^.!?\n]{1,40},\s[^.!?\n]{1,40}\sou\s/i.test(copy)) {
    violations.push('lista de negações ("sem X, sem Y")');
  }

  // pergunta/dois-pontos que revelam a resposta
  if (/\b(o resultado|a melhor parte|o segredo|a diferença|a diferenca|o motivo)\s*[?:]/i.test(copy)) {
    violations.push('revelação com "?" ou ":" ("O resultado? ...")');
  }

  // travessão em texto curto
  const f = (format || "").toLowerCase();
  // (ignora títulos de seção como "## Variação 1 — ângulo DOR", que não são copy)
  const copyLines = copy.split("\n").filter((l) => !/^\s*#/.test(l)).join("\n");
  if (f && SHORT_FORMATS.some((s) => f.includes(s)) && copyLines.includes("—")) {
    violations.push("travessão (—) em texto curto");
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
