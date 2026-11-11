// ---------------------------------------------------------------------------
// Entrega do carrossel — Fase 2 (passos k, l).
//
// (k) legenda + variantes de CTA + plano em PDF + mensagens de DM.
// (l) manifesto do ZIP de exportação (o que entra no ficheiro, por ordem).
//
// Tudo local: o PDF é gerado à mão (texto simples, fonte Helvetica) sem
// dependências nem rede; nenhum conteúdo é inventado — usa os dados do
// projecto. Os slides PNG/JPG continuam a ser renderizados pelo Editor
// (Fase 1); o manifesto inclui-os por nome para o ZIP ficar completo.
// ---------------------------------------------------------------------------

export interface DeliveryInput {
  brandName: string;
  title: string;
  caption: string;
  hashtags: string[];
  slides: { title: string; body: string }[];
  cta: string;
}

/** Legenda + 2 variantes curtas (mesmo conteúdo, enquadramentos diferentes). */
export function buildCaptionVariants(input: DeliveryInput): { main: string; short: string; question: string } {
  const base = input.caption.trim();
  const tags = input.hashtags.length ? `\n\n${input.hashtags.join(' ')}` : '';
  return {
    main: `${base}${tags}`,
    short: `${input.title}\n\n${input.cta}.${tags}`,
    question: `${base}\n\nO que achaste? Conta nos comentários 👇${tags}`,
  };
}

/** 3 variantes de CTA a partir do CTA da marca (sem inventar ofertas). */
export function buildCtaVariants(cta: string): string[] {
  const c = cta.trim() || 'Guarda este post';
  return [c, `${c} — e partilha com alguém que precise disto.`, `Gostaste? ${c}.`];
}

/** Templates de DM (resposta a comentário / envio directo) — sem links inventados. */
export function buildDmTemplates(input: DeliveryInput): { replyToComment: string; followUp: string; share: string } {
  const brand = input.brandName || 'a marca';
  return {
    replyToComment: `Obrigada pelo comentário! 🙌 Enviei-te os detalhes por aqui. Qualquer dúvida, diz — ${brand}.`,
    followUp: `Olá! Viste o carrossel «${input.title}»? Se quiseres, explico o primeiro passo por aqui.`,
    share: `Achei que isto te podia ajudar: «${input.title}» — ${input.cta}.`,
  };
}

// ---------------------------------------------------------------------------
// PDF simples do plano (texto): gerado à mão, sem dependências.
// Estrutura PDF mínima válida: catálogo → páginas → página → conteúdo
// (Helvetica) → fonte. Os offsets do xref são calculados, não fixos.
// ---------------------------------------------------------------------------

function pdfEscape(text: string): string {
  return text
    .replace(/[^\x20-\x7EÀ-ÿ]/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function wrapLine(line: string, maxChars: number): string[] {
  const words = line.split(/\s+/).filter(Boolean);
  const out: string[] = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars) {
      if (current) out.push(current);
      current = word.length > maxChars ? word.slice(0, maxChars) : word;
    } else {
      current = next;
    }
  }
  if (current) out.push(current);
  return out;
}

/**
 * Gera o PDF do plano (título, legenda, slides, CTA) como bytes.
 * Texto puro A4; uma ou mais páginas conforme o tamanho do conteúdo.
 */
export function buildPlanPdf(input: DeliveryInput): Uint8Array<ArrayBuffer> {
  const lines: { text: string; size: number; bold: boolean }[] = [];
  lines.push({ text: input.brandName || 'Pink Logic', size: 18, bold: true });
  lines.push({ text: input.title, size: 14, bold: true });
  lines.push({ text: '', size: 11, bold: false });
  lines.push({ text: 'LEGENDA', size: 11, bold: true });
  for (const l of input.caption.trim().split('\n')) {
    for (const w of wrapLine(l || ' ', 95)) lines.push({ text: w, size: 11, bold: false });
  }
  if (input.hashtags.length) lines.push({ text: input.hashtags.join(' '), size: 11, bold: false });
  lines.push({ text: '', size: 11, bold: false });
  lines.push({ text: 'SLIDES', size: 11, bold: true });
  input.slides.forEach((s, i) => {
    lines.push({ text: `${i + 1}. ${s.title}`, size: 11, bold: true });
    for (const w of wrapLine(s.body, 95)) lines.push({ text: w, size: 11, bold: false });
  });
  lines.push({ text: '', size: 11, bold: false });
  lines.push({ text: `CTA: ${input.cta}`, size: 11, bold: true });
  lines.push({ text: 'Plano composto a partir de templates locais (sem IA).', size: 9, bold: false });

  // Paginação: 45 linhas por página A4 (margem 50pt, avanço 15pt).
  const PER_PAGE = 45;
  const pages: typeof lines[] = [];
  for (let i = 0; i < lines.length; i += PER_PAGE) pages.push(lines.slice(i, i + PER_PAGE));

  const objects: string[] = [];
  // 1: catálogo, 2: páginas, depois por página: página + conteúdo, no fim a fonte.
  const fontId = 3 + pages.length * 2;
  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  objects[2] = `<< /Type /Pages /Kids [${pages.map((_, i) => `${3 + i * 2} 0 R`).join(' ')}] /Count ${pages.length} >>`;
  pages.forEach((pageLines, p) => {
    const pageId = 3 + p * 2;
    const contentId = pageId + 1;
    objects[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`;
    let stream = 'BT\n';
    let y = 790;
    for (const line of pageLines) {
      stream += `/F1 ${line.size} Tf 1 0 0 1 50 ${y} Tm (${pdfEscape(line.text)}) Tj\n`;
      y -= 15;
    }
    stream += 'ET';
    objects[contentId] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  });
  objects[fontId] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';

  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const push = (s: string) => chunks.push(encoder.encode(s));
  push('%PDF-1.4\n');
  const offsets: number[] = [0];
  let length = '%PDF-1.4\n'.length;
  for (let id = 1; id < objects.length; id++) {
    if (!objects[id]) continue;
    offsets[id] = length;
    const body = `${id} 0 obj\n${objects[id]}\nendobj\n`;
    push(body);
    length += encoder.encode(body).length;
  }
  const xrefPos = length;
  let xref = `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let id = 1; id < objects.length; id++) {
    xref += `${String(offsets[id] ?? 0).padStart(10, '0')} 00000 n \n`;
  }
  xref += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;
  push(xref);
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Uint8Array(total);
  let pos = 0;
  for (const c of chunks) { out.set(c, pos); pos += c.length; }
  return out;
}

// ---------------------------------------------------------------------------
// (l) Manifesto do ZIP de exportação.
// ---------------------------------------------------------------------------

export interface ExportManifestEntry { name: string; kind: 'slide-png' | 'slide-jpg' | 'caption' | 'pdf' | 'dm' | 'project'; }

export function buildExportManifest(input: { slideCount: number; includeProjectJson?: boolean }): ExportManifestEntry[] {
  const n = input.slideCount;
  if (!Number.isInteger(n) || n < 1 || n > 10) throw new Error('O export precisa de 1 a 10 slides.');
  const entries: ExportManifestEntry[] = [];
  for (let i = 1; i <= n; i++) entries.push({ name: `slide-${i}.png`, kind: 'slide-png' });
  for (let i = 1; i <= n; i++) entries.push({ name: `slide-${i}.jpg`, kind: 'slide-jpg' });
  entries.push({ name: 'caption.txt', kind: 'caption' });
  entries.push({ name: 'plano.pdf', kind: 'pdf' });
  entries.push({ name: 'dm.txt', kind: 'dm' });
  if (input.includeProjectJson !== false) entries.push({ name: 'project.json', kind: 'project' });
  return entries;
}

export function buildDmText(input: DeliveryInput): string {
  const dm = buildDmTemplates(input);
  return [
    'MENSAGENS DE DM — templates (editar antes de enviar)',
    '',
    'Resposta a comentário:',
    dm.replyToComment,
    '',
    'Follow-up:',
    dm.followUp,
    '',
    'Partilha:',
    dm.share,
    '',
    '—',
    'Templates locais (sem IA). Nada aqui é enviado automaticamente.',
  ].join('\n');
}
