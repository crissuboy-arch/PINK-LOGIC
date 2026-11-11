/**
 * Render server-side 4:5 com marca (Fase 1, Ofensiva Criativa).
 *
 * Corre com: npm run build --workspace=@pink-logic/shared
 *            && npm run build --workspace=@pink-logic/api
 *            && node --test tests/carousel-render-4x5.test.mjs
 *
 * Lê o PNG pela assinatura + cabeçalho IHDR (sem dependências): bytes
 * 16-19 = largura, 20-23 = altura (big-endian). A verificação de que a
 * cor de marca está mesmo no pixel é feita no passo de prova com PIL
 * (ver .proof/, relatório da Fase 1) — aqui prova-se dimensões + que o
 * modo marca produz bytes diferentes do default.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { renderSlide, CAROUSEL_SIZES } from "../packages/api/dist/services/carousel-render.js";

function pngSize(buf) {
  assert.equal(buf.subarray(0, 8).toString("hex"), "89504e470d0a1a0a", "não é PNG");
  assert.equal(buf.subarray(12, 16).toString("ascii"), "IHDR", "sem IHDR");
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

const SLIDE = {
  title: "Marketing sem filtro",
  items: ["Resultados sem desculpa", "Direto ao ponto"],
  footer: "Ofensiva Criativa",
  handle: "@ofensivacriativa",
  counter: "1/1",
};

const OFENSIVA = { background: "#071D3A", text: "#FFFFFF", accent: "#D4AF37" };

test("default (sem opções) continua 1080×1080 estilo maestro", async () => {
  const png = await renderSlide(SLIDE);
  assert.ok(png.length > 10_000, `PNG suspeito de vazio: ${png.length} bytes`);
  assert.deepEqual(pngSize(png), CAROUSEL_SIZES["1:1"]);
});

test("size 4:5 com cores da Ofensiva → 1080×1350", async () => {
  const png = await renderSlide(SLIDE, { size: "4:5", colors: OFENSIVA });
  assert.ok(png.length > 10_000, `PNG suspeito de vazio: ${png.length} bytes`);
  assert.deepEqual(pngSize(png), { width: 1080, height: 1350 });
});

test("modo marca produz imagem diferente do default (cores aplicadas)", async () => {
  const a = await renderSlide(SLIDE);
  const b = await renderSlide(SLIDE, { size: "1:1", colors: OFENSIVA });
  assert.notEqual(Buffer.compare(a, b), 0, "PNG com marca é byte-idêntico ao default");
});
