import test from 'node:test';
import assert from 'node:assert/strict';
import { flattenCarouselItems } from '../packages/api/dist/services/carousel-render.js';

// Regressão: POST /api/carousel/render falhava com "text.split is not a
// function" porque CarouselRenderSchema valida `items` como {title?, body?}[]
// mas renderSlide/wrapText sempre esperou string[]. flattenCarouselItems é a
// ponte entre as duas formas.
test('achata {title,body} em uma linha "Title: Body"', () => {
  assert.deepEqual(
    flattenCarouselItems([{ title: 'Promessa', body: 'Validar a integração real' }]),
    ['Promessa: Validar a integração real'],
  );
});

test('usa só o campo presente quando title ou body faltam', () => {
  assert.deepEqual(flattenCarouselItems([{ title: 'Só título' }]), ['Só título']);
  assert.deepEqual(flattenCarouselItems([{ body: 'Só corpo' }]), ['Só corpo']);
});

test('descarta itens totalmente vazios, sem quebrar em itens vizinhos válidos', () => {
  assert.deepEqual(
    flattenCarouselItems([{ title: 'A' }, {}, { body: 'B' }]),
    ['A', 'B'],
  );
});

test('aceita strings simples (formato antigo/legado) sem alteração', () => {
  assert.deepEqual(flattenCarouselItems(['linha pronta']), ['linha pronta']);
});

test('items ausente não lança — devolve lista vazia', () => {
  assert.deepEqual(flattenCarouselItems(undefined), []);
  assert.deepEqual(flattenCarouselItems([]), []);
});
