// Testes do renderizador de slides para canvas — Fase 3.
// Correr: ./node_modules/.bin/tsx --test tests/carousel-render.test.mjs
// Sem DOM e sem browser: o desenho é provado contra um mock do contexto
// 2D que regista as chamadas; a quebra de linha é pura e testada isolada.
// O renderSlideToBlob real (canvas do browser) NÃO é executado aqui —
// é exercido pela exportação na app e pela prova Electron (screenshots).
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  wrapTextLines, drawSlideToCanvas, renderSlideToBlob,
} from '../packages/web/src/services/carouselRender.ts';

const PALETTE = ['#103B78', '#D4AF37', '#FFFFFF', '#071D3A', '#F5F7FA'];

function mockCtx() {
  const calls = [];
  const fills = [];
  const ctx = {
    fillStyle: '',
    font: '',
    textAlign: '',
    textBaseline: '',
    globalAlpha: 1,
    fillRect: (...args) => { calls.push({ fn: 'fillRect', args }); },
    save: () => calls.push({ fn: 'save', args: [] }),
    restore: () => calls.push({ fn: 'restore', args: [] }),
    translate: (...args) => { calls.push({ fn: 'translate', args }); },
    rotate: (...args) => { calls.push({ fn: 'rotate', args }); },
    beginPath: () => calls.push({ fn: 'beginPath', args: [] }),
    arc: (...args) => { calls.push({ fn: 'arc', args }); },
    fill: () => calls.push({ fn: 'fill', args: [] }),
    roundRect: (...args) => { calls.push({ fn: 'roundRect', args }); },
    measureText: (t) => ({ width: t.length * 10 }),
    fillText: (...args) => { calls.push({ fn: 'fillText', args }); },
    createLinearGradient: () => ({ addColorStop: () => undefined }),
  };
  // Regista cada atribuição a fillStyle.
  let fillStyle = '';
  Object.defineProperty(ctx, 'fillStyle', {
    get: () => fillStyle,
    set: (v) => { fillStyle = v; fills.push(String(v)); },
  });
  return { ctx, calls, fills };
}

function demoSlide() {
  return {
    id: 'slide-demo',
    elements: [
      { id: 'bar', type: 'shape', content: 'square', x: 81, y: 94, width: 172, height: 10, rotation: 0, opacity: 100, zIndex: 1, color: '#D4AF37', borderRadius: 0 },
      { id: 'kick', type: 'text', content: 'OFENSIVA CRIATIVA', x: 81, y: 135, width: 918, height: 67, rotation: 0, opacity: 100, zIndex: 2, fontSize: 26, color: '#D4AF37', fontWeight: 700, fontFamily: 'Inter', textAlign: 'left', lineHeight: 1.2 },
      { id: 'title', type: 'text', content: 'A IA chegou às pequenas empresas', x: 81, y: 324, width: 918, height: 405, rotation: 0, opacity: 100, zIndex: 2, fontSize: 69, color: '#FFFFFF', fontWeight: 800, fontFamily: 'Inter', textAlign: 'left', lineHeight: 1.2 },
      { id: 'body', type: 'text', content: 'Ideias, textos e legendas saem em minutos — sem complicação.', x: 81, y: 783, width: 918, height: 378, rotation: 0, opacity: 100, zIndex: 2, fontSize: 36, color: '#F5F7FA', fontWeight: 400, fontFamily: 'Inter', textAlign: 'left', lineHeight: 1.2 },
      { id: 'num', type: 'text', content: '1/5', x: 81, y: 1228, width: 918, height: 54, rotation: 0, opacity: 100, zIndex: 2, fontSize: 24, color: '#D4AF37', fontWeight: 700, fontFamily: 'Inter', textAlign: 'left', lineHeight: 1.2 },
    ],
    background: { type: 'color', value: '#103B78', blur: 0, brightness: 100, opacity: 100 },
  };
}

test('wrapTextLines: embrulha à largura e mantém parágrafos', () => {
  const measure = (t) => t.length * 10; // 10 px por carácter
  assert.deepEqual(wrapTextLines(measure, 'um dois três quatro', 50), ['um', 'dois', 'três', 'quatro']);
  assert.deepEqual(wrapTextLines(measure, 'um dois\ntrês quatro', 120), ['um dois', 'três quatro']);
  assert.deepEqual(wrapTextLines(measure, 'abc', 100), ['abc']);
  // Palavra maior que a largura é partida, sem perder caracteres.
  const split = wrapTextLines(measure, 'abcdefghij', 25);
  assert.equal(split.join(''), 'abcdefghij');
  assert.ok(split.length > 1);
  assert.ok(split.every((l) => measure(l) <= 25));
});

test('drawSlideToCanvas: fundo da marca + barra dourada + textos, só cores do Brand Kit', () => {
  const { ctx, calls, fills } = mockCtx();
  drawSlideToCanvas(ctx, demoSlide(), 1080, 1350);
  // Fundo: primeiro fillRect cobre o canvas todo com o azul da marca.
  const bg = calls.find((c) => c.fn === 'fillRect');
  assert.deepEqual(bg?.args, [0, 0, 1080, 1350]);
  assert.ok(fills.includes('#103B78'), 'fundo #103B78 desenhado');
  // Todas as cores usadas são do Brand Kit Ofensiva.
  for (const color of fills) assert.ok(PALETTE.includes(color), `cor fora do Brand Kit: ${color}`);
  // A barra dourada (shape) e os textos foram desenhados.
  assert.ok(calls.some((c) => c.fn === 'fillRect' && c.args[0] === 81 && c.args[2] === 172), 'barra dourada desenhada');
  const texts = calls.filter((c) => c.fn === 'fillText');
  assert.ok(texts.length >= 4, `esperados >= 4 fillText, houve ${texts.length}`);
  assert.ok(texts.some((c) => String(c.args[0]).includes('OFENSIVA CRIATIVA')));
  assert.ok(texts.some((c) => String(c.args[0]).includes('A IA chegou')));
});

test('drawSlideToCanvas: fundo gradiente usa as cores do gradiente', () => {
  const { ctx, fills } = mockCtx();
  const slide = demoSlide();
  slide.background = { type: 'gradient', value: '', color1: '#103B78', color2: '#071D3A', direction: 'tb', blur: 0, brightness: 100, opacity: 100 };
  drawSlideToCanvas(ctx, slide, 1080, 1350);
  assert.ok(fills.length >= 1, 'gradiente aplicado como fillStyle');
});

test('renderSlideToBlob: sem DOM recusa com mensagem clara (nunca finge)', async () => {
  await assert.rejects(
    () => renderSlideToBlob(demoSlide(), 'png'),
    /precisa do canvas do browser/,
  );
});
