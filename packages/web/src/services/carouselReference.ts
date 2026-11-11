// ---------------------------------------------------------------------------
// Modelador de referências + replicador — Fase 2 (passos d, n).
//
// Regra central: guardam-se DADOS DE ESTRUTURA (gancho, plano de slides,
// CTA), nunca imagens nem texto alheios copiados. A referência é descrita
// pela utilizadora (o que ela observou), não extraída de conteúdo de
// terceiros. O replicador transpõe a estrutura para um novo tema — o texto
// novo nasce dos templates da marca, não do original.
// ---------------------------------------------------------------------------
import type { BrandContext } from './carouselFlow';
import { generateCopy, type ArchitectureId } from './carouselRadar';

export interface ReferenceModel {
  id: string;
  /** Nome dado pela utilizadora (ex.: "Carrossel X — conta Y"). */
  label: string;
  /** O gancho, descrito por palavras da utilizadora (não colado do original). */
  hook: string;
  /** Nº de slides do original. */
  slideCount: number;
  /** Rótulos da estrutura (ex.: ["problema", "solução", "prova", "CTA"]). */
  structure: string[];
  /** CTA observado, descrito pela utilizadora. */
  cta: string;
  notes: string;
  createdAt: string;
}

export function modelReference(input: {
  label: string;
  hook: string;
  slideCount: number;
  structure: string[];
  cta: string;
  notes?: string;
}): ReferenceModel {
  const label = input.label.trim();
  const hook = input.hook.trim();
  const cta = input.cta.trim();
  const structure = input.structure.map((s) => s.trim()).filter(Boolean).slice(0, 12);
  if (!label) throw new Error('A referência precisa de um nome.');
  if (!hook) throw new Error('Descreve o gancho com as tuas palavras (não coles texto alheio).');
  if (!Number.isInteger(input.slideCount) || input.slideCount < 2 || input.slideCount > 10) {
    throw new Error('O nº de slides da referência tem de estar entre 2 e 10.');
  }
  if (structure.length < 2) throw new Error('A estrutura precisa de pelo menos 2 passos (ex.: problema → CTA).');
  if (!cta) throw new Error('A referência precisa de um CTA descrito.');
  return {
    id: `ref-${Date.now().toString(36)}`,
    label,
    hook,
    slideCount: input.slideCount,
    structure,
    cta,
    notes: input.notes?.trim() ?? '',
    createdAt: new Date().toISOString(),
  };
}

/** Valida uma referência guardada (ficheiro JSON) antes de a usar. */
export function parseReference(raw: string): ReferenceModel {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('A referência não é JSON válido.');
  }
  const r = parsed as Partial<ReferenceModel>;
  if (!r.id || !r.label || !r.hook || !r.cta || !Array.isArray(r.structure)) {
    throw new Error('A referência não tem os campos obrigatórios (id, label, hook, structure, cta).');
  }
  return r as ReferenceModel;
}

// ---------------------------------------------------------------------------
// (n) Replicador: transpõe a estrutura de um carrossel passado para um novo
// tema. O texto novo é gerado pelos templates da marca (generateCopy) — a
// estrutura é o único elemento reutilizado.
// ---------------------------------------------------------------------------

export interface ReplicationInput {
  /** Estrutura de origem: referência modelada OU projecto passado. */
  source: ReferenceModel | { slides: { title: string; body: string }[]; architectureId?: string };
  newTopic: string;
  architectureId: ArchitectureId;
  slideCount?: number | 'auto';
  context: BrandContext;
  brandName: string;
  tone: string;
}

export interface ReplicationResult {
  slides: { title: string; body: string }[];
  caption: string;
  hashtags: string[];
  /** Como cada slide novo corresponde à estrutura de origem. */
  mapping: { from: string; to: string }[];
}

function isReference(source: ReplicationInput['source']): source is ReferenceModel {
  return 'structure' in source && Array.isArray((source as ReferenceModel).structure);
}

export function replicateContent(input: ReplicationInput): ReplicationResult {
  const topic = input.newTopic.trim();
  if (!topic) throw new Error('O replicador precisa de um tema novo.');
  const generated = generateCopy({
    topic,
    architectureId: input.architectureId,
    slideCount: input.slideCount,
    context: input.context,
    brandName: input.brandName,
    tone: input.tone,
  });
  const source = input.source;
  const fromSteps: string[] = isReference(source)
    ? source.structure
    : source.slides.map((s, i) => (i === 0 ? 'capa' : i === source.slides.length - 1 ? 'fecho' : `slide ${i + 1}`));
  const mapping = generated.slides.map((slide, i) => ({
    from: fromSteps[Math.min(i, fromSteps.length - 1)],
    to: slide.title,
  }));
  return { slides: generated.slides, caption: generated.caption, hashtags: generated.hashtags, mapping };
}
