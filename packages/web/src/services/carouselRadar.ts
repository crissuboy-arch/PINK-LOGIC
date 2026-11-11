// ---------------------------------------------------------------------------
// Radar de pautas + arquiteturas + copy por templates — Fase 2 (passos c, e, f).
//
// Tudo por regras/templates locais a partir do contexto da marca e do tema:
// nenhuma chamada de IA paga, nenhuma rede. A pontuação do radar é
// determinística e explicável (cada pauta carrega o motivo da pontuação).
// ---------------------------------------------------------------------------
import type { BrandContext } from './carouselFlow';

export interface Pauta {
  id: string;
  title: string;
  angle: string;
  /** Dor ou objectivo do contexto que a pauta serve (ou 'tema livre'). */
  serves: string;
  /** 0–100, determinístico: base do ângulo + bónus por dor/objectivo + tema. */
  score: number;
  scoreReason: string;
}

export interface RadarResult {
  topic: string;
  generatedAt: string;
  pautas: Pauta[];
  selectedIds: string[];
}

const ANGLES = [
  { angle: 'erro comum', base: 78, template: (t: string) => `O erro que quase todos cometem com ${t}` },
  { angle: 'guia prático', base: 82, template: (t: string) => `${t} em 5 passos simples` },
  { angle: 'mito vs verdade', base: 74, template: (t: string) => `${t}: mito ou verdade?` },
  { angle: 'antes / depois', base: 76, template: (t: string) => `Antes e depois: o que muda com ${t}` },
  { angle: 'checklist', base: 80, template: (t: string) => `Checklist: ${t} sem esquecer nada` },
  { angle: 'história', base: 70, template: (t: string) => `Como ${t} mudou o meu trabalho` },
  { angle: 'números', base: 72, template: (t: string) => `${t} em números: o que vale a pena saber` },
  { angle: 'pergunta directa', base: 68, template: (t: string) => `Será que ${t} é para ti?` },
] as const;

const PAIN_ANGLES = [
  // "Cansado de a agenda vazia" soa mal: "a agenda" → "da agenda", "o problema" → "do problema".
  { angle: 'dor resolvida', base: 86, template: (pain: string, topic: string) => `Cansado ${deForm(pain)}? ${topic} resolve isto` },
  { angle: 'dor resolvida', base: 84, template: (pain: string, topic: string) => `${topic} para quem sofre com ${pain}` },
] as const;

function deForm(pain: string): string {
  if (/^a\s/i.test(pain)) return `da ${pain.slice(2)}`;
  if (/^o\s/i.test(pain)) return `do ${pain.slice(2)}`;
  return `de ${pain}`;
}

const GOAL_ANGLES = [
  { angle: 'objectivo', base: 85, template: (goal: string, topic: string) => `${topic} para ${goal}` },
  { angle: 'objectivo', base: 83, template: (goal: string, topic: string) => `O caminho mais curto para ${goal} com ${topic}` },
] as const;

/**
 * Gera EXACTAMENTE 30 pautas: ângulos sobre o tema + ângulos sobre as dores
 * e os objectivos do contexto (até esgotar) + variações de tema. Ordem
 * determinística; sem aleatoriedade (o teste pode reproduzir a lista).
 */
export function generateRadar(topic: string, context: BrandContext): RadarResult {
  const t = topic.trim();
  if (!t) throw new Error('O radar precisa de um tema.');
  const clean = (s: string) => s.trim().replace(/\.$/, '');
  const pautas: Pauta[] = [];
  const push = (title: string, angle: string, serves: string, score: number, reason: string) => {
    if (pautas.length >= 30) return;
    const id = `pauta-${String(pautas.length + 1).padStart(2, '0')}`;
    pautas.push({ id, title: title.trim(), angle, serves, score, scoreReason: reason });
  };

  // 1) Dores primeiro (maior pontuação — servem uma dor real do público).
  for (const pain of context.pains) {
    for (const a of PAIN_ANGLES) {
      push(a.template(clean(pain), clean(t)), a.angle, `dor: ${clean(pain)}`, a.base,
        `Serve uma dor do público («${clean(pain)}») — base ${a.base}.`);
    }
  }
  // 2) Objectivos.
  for (const goal of context.goals) {
    for (const g of GOAL_ANGLES) {
      push(g.template(clean(goal), clean(t)), g.angle, `objectivo: ${clean(goal)}`, g.base,
        `Serve um objectivo do público («${clean(goal)}») — base ${g.base}.`);
    }
  }
  // 3) Ângulos genéricos sobre o tema.
  for (const a of ANGLES) {
    push(a.template(clean(t)), a.angle, 'tema', a.base, `Ângulo «${a.angle}» sobre o tema — base ${a.base}.`);
  }
  // 4) Variações com os temas recorrentes da marca, até chegar a 30.
  let i = 0;
  while (pautas.length < 30) {
    const theme = context.themes[i % Math.max(context.themes.length, 1)] || 'o teu negócio';
    const angle = ANGLES[i % ANGLES.length];
    push(`${angle.template(clean(theme))} — e ${clean(t)}`, angle.angle, `tema da marca: ${clean(theme)}`,
      Math.max(50, angle.base - 10), `Variação com tema da marca («${clean(theme)}») — base ${angle.base} − 10.`);
    i++;
    if (i > 60) break; // segurança: sem temas, o ciclo acima repete o tema livre
  }
  // Ordenar por pontuação (estável: em empate fica a ordem de geração).
  const sorted = pautas
    .map((p, idx) => ({ p, idx }))
    .sort((a, b) => b.p.score - a.p.score || a.idx - b.idx)
    .map(({ p }) => p);
  return { topic: t, generatedAt: new Date().toISOString(), pautas: sorted, selectedIds: [] };
}

/** As 10 prioritárias: as 10 com maior pontuação (o utilizador pode trocar). */
export function topPautas(radar: RadarResult, n = 10): Pauta[] {
  if (n < 1 || n > radar.pautas.length) throw new Error(`n tem de estar entre 1 e ${radar.pautas.length}.`);
  return radar.pautas.slice(0, n);
}

/** Selecção manual: 1–10 ids, todos têm de existir no radar. */
export function selectPautas(radar: RadarResult, ids: string[]): RadarResult {
  const known = new Set(radar.pautas.map((p) => p.id));
  const unique = [...new Set(ids)];
  if (!unique.length || unique.length > 10) throw new Error('Selecciona entre 1 e 10 pautas.');
  for (const id of unique) if (!known.has(id)) throw new Error(`Pauta desconhecida: ${id}.`);
  return { ...radar, selectedIds: unique };
}

// ---------------------------------------------------------------------------
// (e) Arquiteturas do carrossel — planos de slides por template.
// ---------------------------------------------------------------------------

export type ArchitectureId = 'lista' | 'antes-depois' | 'passo-a-passo' | 'historia' | 'mito-verdade';

export interface CarouselArchitecture {
  id: ArchitectureId;
  label: string;
  description: string;
  /** Nº de slides recomendado (capa + corpo + fecho). */
  slideCount: number;
  /** Rótulos dos slides do corpo, por ordem (sem a capa nem o fecho). */
  bodyPlan: string[];
}

export const ARCHITECTURES: CarouselArchitecture[] = [
  {
    id: 'lista', label: 'Lista', slideCount: 5,
    description: 'Capa com a promessa, 3 itens numerados e fecho com CTA.',
    bodyPlan: ['1. Primeiro ponto', '2. Segundo ponto', '3. Terceiro ponto'],
  },
  {
    id: 'antes-depois', label: 'Antes / Depois', slideCount: 5,
    description: 'Capa com o contraste, o antes, o depois e fecho com CTA.',
    bodyPlan: ['Antes: como está hoje', 'A mudança: o que muda', 'Depois: como fica'],
  },
  {
    id: 'passo-a-passo', label: 'Passo a passo', slideCount: 6,
    description: 'Capa com o resultado, 4 passos numerados e fecho com CTA.',
    bodyPlan: ['Passo 1: começar', 'Passo 2: executar', 'Passo 3: rever', 'Passo 4: manter'],
  },
  {
    id: 'historia', label: 'História', slideCount: 5,
    description: 'Capa com o gancho, contexto, viragem, lição e fecho com CTA.',
    bodyPlan: ['O contexto', 'A viragem', 'A lição'],
  },
  {
    id: 'mito-verdade', label: 'Mito vs Verdade', slideCount: 5,
    description: 'Capa com o mito, 3 mitos desmontados e fecho com CTA.',
    bodyPlan: ['Mito 1 — e a verdade', 'Mito 2 — e a verdade', 'Mito 3 — e a verdade'],
  },
];

export function getArchitecture(id: string): CarouselArchitecture {
  const found = ARCHITECTURES.find((a) => a.id === id);
  if (!found) throw new Error(`Arquitetura desconhecida: ${id}.`);
  return found;
}

// ---------------------------------------------------------------------------
// (f) Copy por templates — a partir da voz da marca + tema + arquitetura.
// Nada de IA: frases-molde locais com os dados da marca. A revisão/edição
// por card é a do Editor (correctSlide) — a copy aqui nasce editável.
// ---------------------------------------------------------------------------

export interface CopyInput {
  topic: string;
  architectureId: ArchitectureId;
  context: BrandContext;
  brandName: string;
  tone: string;
}

export interface GeneratedCopy {
  slides: { title: string; body: string }[];
  caption: string;
  hashtags: string[];
}

const TONE_OPENERS: Record<string, string> = {
  directo: 'Vamos directos ao assunto.',
  direto: 'Vamos directos ao assunto.',
  acolhedor: 'Respira: isto é mais simples do que parece.',
  tecnico: 'Os factos, sem rodeios.',
};

function openerFor(tone: string): string {
  const key = tone.trim().toLowerCase();
  for (const [k, v] of Object.entries(TONE_OPENERS)) if (key.includes(k)) return v;
  return 'Vamos por partes.';
}

/** Gera os slides da arquitetura escolhida (capa + corpo + fecho com CTA). */
export function generateCopy(input: CopyInput): GeneratedCopy {
  const topic = input.topic.trim();
  if (!topic) throw new Error('A copy precisa de um tema.');
  const arch = getArchitecture(input.architectureId);
  const ctx = input.context;
  const cta = ctx.defaultCta || 'Guarda este post';
  const opener = openerFor(input.tone);
  const pain = ctx.pains[0] ? ` Se ${ctx.pains[0]} te soa familiar, este post é para ti.` : '';
  const goal = ctx.goals[0] ? ` O objectivo é simples: ${ctx.goals[0]}.` : '';

  const cover = {
    title: topic,
    body: `${opener}${pain}${goal} Desliza para ver como.`.trim(),
  };

  const bodyByArch: Record<ArchitectureId, { title: string; body: string }[]> = {
    lista: [1, 2, 3].map((n) => ({
      title: `${n}. ${topic} — ponto ${n}`,
      body: `Ponto ${n} de ${topic}: aplica hoje, sem ferramentas pagas e sem complicação.`,
    })),
    'antes-depois': [
      { title: 'Antes', body: `Hoje: ${ctx.pains[0] ?? 'o trabalho repete-se todos os dias e o resultado não aparece'}.` },
      { title: 'A mudança', body: `${topic}: um passo de cada vez, com o que já tens.` },
      { title: 'Depois', body: `Depois: ${ctx.goals[0] ?? 'mais tempo para o que importa e um processo que funciona'}.` },
    ],
    'passo-a-passo': [1, 2, 3, 4].map((n) => ({
      title: `Passo ${n}`,
      body: `Passo ${n} de ${topic}: faz isto antes de passar ao seguinte.`,
    })),
    historia: [
      { title: 'O contexto', body: `Isto começou com ${ctx.pains[0] ?? 'um problema que se repetia todos os dias'}.` },
      { title: 'A viragem', body: `${topic} foi a mudança que fez a diferença.` },
      { title: 'A lição', body: `A lição: ${ctx.goals[0] ?? 'começar pequeno e manter o ritmo'}.` },
    ],
    'mito-verdade': [1, 2, 3].map((n) => ({
      title: `Mito ${n}`,
      body: `Mito ${n} sobre ${topic}: não é bem assim — a verdade está no próximo passo.`,
    })),
  };

  const closing = {
    title: 'O próximo passo é teu',
    body: `${cta}. ${ctx.defaultCta ? '' : 'Comenta o que achaste deste carrossel.'}`.trim(),
  };

  const slides = [cover, ...bodyByArch[input.architectureId], closing];
  if (slides.length !== arch.slideCount) {
    throw new Error(`Arquitetura ${arch.id}: esperados ${arch.slideCount} slides, gerados ${slides.length}.`);
  }
  const caption = `${topic}\n\n${opener}${pain}${goal}\n\n${cta}.`;
  return { slides, caption: caption.trim(), hashtags: ctx.hashtags };
}
