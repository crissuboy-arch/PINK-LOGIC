import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCarouselDocument, generateCarouselContent } from '../packages/api/dist/services/carousel-content.js';

const doc = {
  slides: Array.from({ length: 3 }, (_, i) => ({ title: `Ideia ${i + 1}`, body: 'Conteúdo útil para revisão.' })),
  caption: 'Confira as ideias e escolha o próximo passo.', hashtags: ['#Automação'],
};
test('aceita JSON e bloco JSON e preserva caracteres portugueses', () => {
  assert.deepEqual(parseCarouselDocument(JSON.stringify(doc), 3), doc);
  assert.deepEqual(parseCarouselDocument('```json\n' + JSON.stringify(doc) + '\n```', 3), doc);
});
test('rejeita resposta vazia, conteúdo longo e número de slides errado', () => {
  for (const raw of ['', '{}', JSON.stringify({ ...doc, slides: [] }),
    JSON.stringify({ ...doc, slides: [{ title: 'x'.repeat(111), body: 'Corpo' }, ...doc.slides.slice(1)] }),
    JSON.stringify({ ...doc, hashtags: ['#não permitido'] })]) {
    assert.throws(() => parseCarouselDocument(raw, 3), error => error.status === 502);
  }
  assert.throws(() => parseCarouselDocument(JSON.stringify(doc), 5), error => error.status === 502);
});
test('rejeita briefing inválido antes de chamar provedor pago', async () => {
  await assert.rejects(generateCarouselContent({ topic: 'x', slideCount: 30 }), error => error.status === 400);
});
test('sem provedor configurado, falha em vez de simular conteúdo', async () => {
  if (process.env.AISA_API_KEY) return;
  await assert.rejects(generateCarouselContent({ topic: 'Automação para negócios', slideCount: 3 }), error => error.status === 503);
});
