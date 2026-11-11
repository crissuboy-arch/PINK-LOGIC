// Testes da ligação de IA — Fase 3.
// Correr: ./node_modules/.bin/tsx --test tests/ai-connection.test.mjs
// Tudo local e determinístico: a rede é sempre injectada (stub fetch); a
// geração real NUNCA é chamada com fetch real — o gate é provado com um
// fetch que falha se for chamado. Custo real: $0.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  defaultAiState, effectiveStatus, aiStatusLabel, apiNotReadyReason,
  validateApiKeyFormat, validateSettings, applySettings, keyHint, redactText,
  publicStatus, checkApiGate, recordSpend, monthKey,
  generateTestCopy, generateCarouselCopy, generateCarouselImage,
  testConnection, estimateChatCost,
  OPENAI_MODELS_URL, OPENAI_CHAT_URL, DEFAULT_AI_SETTINGS,
} from '../packages/web/src/services/aiConnection.ts';
import { generateCopy } from '../packages/web/src/services/carouselRadar.ts';
import { normalizeBrandContext } from '../packages/web/src/services/carouselFlow.ts';

const CONTEXT = normalizeBrandContext({
  audience: 'Pequenas empresas',
  pains: ['a agenda vazia'],
  goals: ['encher a agenda'],
  themes: ['IA nas pequenas empresas'],
  avoid: ['promessas de resultados garantidos'],
  defaultCta: 'Comenta LINK',
  hashtags: ['#OfensivaCriativa'],
});

const INPUT = {
  topic: 'IA nas pequenas empresas',
  architectureId: 'lista',
  context: CONTEXT,
  brandName: 'Ofensiva Criativa',
  tone: 'Directo e sem filtro',
};

const FAKE_KEY = 'sk-proj-abcdefghij1234567890ABCDEFGH';

/** fetch que regista as chamadas e rebenta se for chamado (prova "sem rede"). */
function forbiddenFetch() {
  const calls = [];
  const fn = async (...args) => {
    calls.push(args);
    throw new Error('fetch NÃO devia ter sido chamado');
  };
  return { fn, calls };
}

function stubFetch(handler) {
  const calls = [];
  const fn = async (url, init) => {
    calls.push({ url, init });
    return handler(url, init);
  };
  return { fn, calls };
}

const okJson = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
  text: async () => JSON.stringify(body),
});

// (1) Predefinições: modo de teste, API desactivada, limites conservadores.
test('(1) predefinições: modo de teste, API desactivada, teto $5/mês e $0.10 por chamada', () => {
  const state = defaultAiState(new Date('2026-11-11T10:00:00Z'));
  assert.equal(state.settings.mode, 'teste');
  assert.equal(state.settings.apiEnabled, false);
  assert.equal(state.settings.monthlyCapUsd, 5);
  assert.equal(state.settings.maxPerCallUsd, 0.1);
  assert.equal(state.settings.model, 'gpt-4o-mini');
  assert.equal(state.hasKey, false);
  assert.equal(state.keyHint, null);
  assert.equal(effectiveStatus(state), 'teste');
  assert.equal(aiStatusLabel(state), 'IA: Modo de teste');
  assert.equal(DEFAULT_AI_SETTINGS.mode, 'teste');
});

// (2) Estado efectivo + rótulos coerentes em toda a app.
test('(2) estado: só «api + opt-in + chave» é «API ligada»; sem chave ou desligada cai para «Desligada»', () => {
  const base = defaultAiState();
  const apiReady = { ...base, settings: { ...base.settings, mode: 'api', apiEnabled: true }, hasKey: true, keyHint: 'sk-…ABCD' };
  assert.equal(effectiveStatus(apiReady), 'api');
  assert.equal(aiStatusLabel(apiReady), 'IA: API ligada');
  assert.equal(apiNotReadyReason(apiReady), null);

  const noKey = { ...apiReady, hasKey: false, keyHint: null };
  assert.equal(effectiveStatus(noKey), 'desligada');
  assert.equal(aiStatusLabel(noKey), 'IA: Desligada');
  assert.match(apiNotReadyReason(noKey) ?? '', /Sem chave/);

  const notEnabled = { ...apiReady, settings: { ...apiReady.settings, apiEnabled: false } };
  assert.equal(effectiveStatus(notEnabled), 'desligada');
  assert.match(apiNotReadyReason(notEnabled) ?? '', /não activada/);

  const off = { ...base, settings: { ...base.settings, mode: 'desligada' } };
  assert.equal(effectiveStatus(off), 'desligada');
  assert.equal(aiStatusLabel(off), 'IA: Desligada');
});

// (3) Modo de teste: mesma forma que a API, sem rede, custo $0, demo=true.
test('(3) modo de teste: copy por templates com a mesma forma da API, sem chamar a rede', async () => {
  const { fn, calls } = forbiddenFetch();
  const result = await generateCarouselCopy({ input: INPUT, state: defaultAiState(), keyProvider: async () => null, fetchFn: fn });
  assert.equal(calls.length, 0);
  assert.equal(result.source, 'teste');
  assert.equal(result.demo, true);
  assert.equal(result.costUsd, 0);
  // Mesma forma que generateCopy: 5 slides (lista), capa = tema, fecho com CTA.
  assert.equal(result.copy.slides.length, 5);
  assert.equal(result.copy.slides[0].title, 'IA nas pequenas empresas');
  assert.ok(result.copy.slides[4].body.includes('Comenta LINK'));
  assert.deepEqual(result.copy, generateCopy(INPUT));
  // Determinístico.
  assert.deepEqual(generateTestCopy(INPUT).copy, generateCopy(INPUT));
});

// (4) Adaptador recusa sem chave — gerar e testar — SEM chamar a rede.
test('(4) sem chave: gerar e testar recusam com mensagem clara e a rede nunca é chamada', async () => {
  const state = { ...defaultAiState(), settings: { ...defaultAiState().settings, mode: 'api', apiEnabled: true }, hasKey: false };
  const { fn, calls } = forbiddenFetch();
  await assert.rejects(
    generateCarouselCopy({ input: INPUT, state, keyProvider: async () => null, fetchFn: fn }),
    /Sem chave da API OpenAI/,
  );
  assert.equal(calls.length, 0);
  const t = await testConnection({ keyProvider: async () => null, fetchFn: fn });
  assert.equal(t.ok, false);
  assert.match(t.error ?? '', /Sem chave/);
  assert.equal(calls.length, 0);
});

// (5) Gate: sem opt-in, a geração real recusa com mensagem clara, sem rede.
test('(5) gate: modo api sem opt-in recusa a geração real (sem rede, sem cair em silêncio para teste)', async () => {
  const state = { ...defaultAiState(), settings: { ...defaultAiState().settings, mode: 'api', apiEnabled: false }, hasKey: true, keyHint: 'sk-…ABCD' };
  assert.equal(checkApiGate(state, 0.05).allowed, false);
  assert.match(checkApiGate(state, 0.05).reason ?? '', /não activada|desactivada|teste/);
  const { fn, calls } = forbiddenFetch();
  await assert.rejects(
    generateCarouselCopy({ input: INPUT, state, keyProvider: async () => FAKE_KEY, fetchFn: fn }),
    /não activada/,
  );
  assert.equal(calls.length, 0);
});

// (6) Limites: teto mensal e máximo por chamada recusam ANTES da chamada.
test('(6) limites: teto mensal atingido e estimativa acima do máximo por chamada recusam antes da rede', () => {
  const base = defaultAiState(new Date('2026-11-11T10:00:00Z'));
  const ready = { ...base, settings: { ...base.settings, mode: 'api', apiEnabled: true }, hasKey: true };
  assert.equal(checkApiGate(ready, 0.05).allowed, true);
  assert.equal(checkApiGate(ready, 0.11).allowed, false);
  assert.match(checkApiGate(ready, 0.11).reason ?? '', /máximo por chamada/);
  const spent = recordSpend(ready, 4.98, new Date('2026-11-11T10:00:00Z'));
  assert.equal(checkApiGate(spent, 0.05).allowed, false);
  assert.match(checkApiGate(spent, 0.05).reason ?? '', /Teto mensal/);
  // O gasto acumula e muda de mês recomeça a zero.
  const after = recordSpend(spent, 0.02, new Date('2026-11-11T10:00:00Z'));
  assert.equal(after.spend.spentUsd, 5);
  assert.equal(after.spend.month, '2026-11');
  const nextMonth = recordSpend(after, 0.01, new Date('2026-12-01T10:00:00Z'));
  assert.equal(nextMonth.spend.month, '2026-12');
  assert.equal(nextMonth.spend.spentUsd, 0.01);
  assert.equal(monthKey(new Date('2026-11-11T10:00:00Z')), '2026-11');
});

// (7) Teste de ligação: custo zero — só GET /v1/models, sem gerar nada.
test('(7) teste de ligação: GET /v1/models, sem corpo, e a chave nunca aparece no resultado', async () => {
  const { fn, calls } = stubFetch((_url, _init) => okJson({ data: [{ id: 'gpt-4o-mini' }, { id: 'gpt-4o' }] }));
  const result = await testConnection({ keyProvider: async () => FAKE_KEY, fetchFn: fn });
  assert.equal(result.ok, true);
  assert.equal(result.modelCount, 2);
  assert.deepEqual(result.models, ['gpt-4o-mini', 'gpt-4o']);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, OPENAI_MODELS_URL);
  assert.equal(calls[0].init?.method, 'GET');
  assert.equal(calls[0].init?.headers?.Authorization, `Bearer ${FAKE_KEY}`);
  assert.equal(calls[0].init?.body, undefined);
  assert.ok(!JSON.stringify(result).includes(FAKE_KEY), 'o resultado do teste não pode conter a chave');
  assert.ok(!JSON.stringify(result).includes(FAKE_KEY.slice(-8)), 'nem parte da chave');
});

// (8) Teste de ligação: 401 dá erro legível sem vazar a chave.
test('(8) teste de ligação: chave rejeitada (401) com mensagem clara e sem a chave na mensagem', async () => {
  const { fn, calls } = stubFetch(() => okJson({ error: { message: `chave inválida ${FAKE_KEY}` } }, 401));
  const result = await testConnection({ keyProvider: async () => FAKE_KEY, fetchFn: fn });
  assert.equal(result.ok, false);
  assert.equal(result.modelCount, 0);
  assert.match(result.error ?? '', /401/);
  assert.ok(!(result.error ?? '').includes(FAKE_KEY));
  assert.equal(calls.length, 1);
});

// (9) Geração via API (stub): mesma forma de resposta que o modo de teste.
test('(9) API: com gate OK, o stub devolve copy válida na mesma forma do modo de teste', async () => {
  const state = { ...defaultAiState(), settings: { ...defaultAiState().settings, mode: 'api', apiEnabled: true }, hasKey: true };
  const slides = [
    { title: 'IA nas pequenas empresas', body: 'Capa da API.' },
    { title: '1. Ponto', body: 'Corpo 1.' },
    { title: '2. Ponto', body: 'Corpo 2.' },
    { title: '3. Ponto', body: 'Corpo 3.' },
    { title: 'O próximo passo é teu', body: 'Comenta LINK.' },
  ];
  const { fn, calls } = stubFetch(() => okJson({
    choices: [{ message: { content: JSON.stringify({ slides, caption: 'Legenda da API.', hashtags: ['#OfensivaCriativa'] }) } }],
    usage: { prompt_tokens: 1000, completion_tokens: 500 },
  }));
  const result = await generateCarouselCopy({ input: INPUT, state, keyProvider: async () => FAKE_KEY, fetchFn: fn });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, OPENAI_CHAT_URL);
  assert.equal(calls[0].init?.method, 'POST');
  assert.ok((calls[0].init?.body ?? '').includes('gpt-4o-mini'));
  assert.equal(result.source, 'api');
  assert.equal(result.demo, false);
  assert.deepEqual(result.copy.slides, slides);
  assert.equal(result.copy.caption, 'Legenda da API.');
  assert.ok(result.costUsd > 0 && result.costUsd < 0.1);
  assert.equal(result.costUsd, Math.round(estimateChatCost('gpt-4o-mini', 1000, 500) * 10000) / 10000);
});

// (10) Geração via API: nº de slides errado é rejeitado, nada é aplicado.
test('(10) API: resposta com nº de slides errado é rejeitada', async () => {
  const state = { ...defaultAiState(), settings: { ...defaultAiState().settings, mode: 'api', apiEnabled: true }, hasKey: true };
  const { fn } = stubFetch(() => okJson({
    choices: [{ message: { content: JSON.stringify({ slides: [{ title: 'Só um', body: 'x' }], caption: 'c', hashtags: [] }) } }],
    usage: { prompt_tokens: 10, completion_tokens: 10 },
  }));
  await assert.rejects(
    generateCarouselCopy({ input: INPUT, state, keyProvider: async () => FAKE_KEY, fetchFn: fn }),
    /1 slides \(esperados 5\)/,
  );
});

// (11) Imagens: modo de teste não inventa URL; API sem chave recusa sem rede.
test('(11) imagens: teste devolve cartão de substituição sem URL; API sem chave recusa sem rede', async () => {
  const { fn, calls } = forbiddenFetch();
  const demo = await generateCarouselImage({ input: { prompt: 'Capa azul e dourada' }, state: defaultAiState(), keyProvider: async () => null, fetchFn: fn });
  assert.equal(demo.source, 'teste');
  assert.equal(demo.demo, true);
  assert.equal(demo.url, null);
  assert.ok(demo.placeholder?.description.includes('demonstração'));
  assert.equal(demo.costUsd, 0);
  assert.equal(calls.length, 0);
  const apiState = { ...defaultAiState(), settings: { ...defaultAiState().settings, mode: 'api', apiEnabled: true }, hasKey: false };
  await assert.rejects(
    generateCarouselImage({ input: { prompt: 'x' }, state: apiState, keyProvider: async () => null, fetchFn: fn }),
    /Sem chave da API OpenAI/,
  );
  assert.equal(calls.length, 0);
});

// (12) A chave nunca aparece em ficheiros de projecto, estado público ou logs.
test('(12) segredo: estado público, hint e redacção nunca expõem a chave', () => {
  assert.equal(validateApiKeyFormat(''), 'Indica a chave da API OpenAI.');
  assert.equal(validateApiKeyFormat('abc'), 'A chave não tem o formato esperado (começa por «sk-» e tem pelo menos 20 caracteres depois).');
  assert.equal(validateApiKeyFormat('sk-curta'), 'A chave não tem o formato esperado (começa por «sk-» e tem pelo menos 20 caracteres depois).');
  assert.equal(validateApiKeyFormat(FAKE_KEY), null);
  assert.equal(keyHint(FAKE_KEY), `sk-…${FAKE_KEY.slice(-4)}`);
  assert.ok(!keyHint(FAKE_KEY).includes(FAKE_KEY.slice(0, -4)));
  assert.equal(redactText(`falhou a chave ${FAKE_KEY} aqui`), 'falhou a chave sk-…[redigido] aqui');
  const state = { ...defaultAiState(), hasKey: true, keyHint: keyHint(FAKE_KEY) };
  const pub = publicStatus(state);
  const serialized = JSON.stringify(pub);
  assert.ok(!serialized.includes(FAKE_KEY));
  assert.ok(!serialized.includes(FAKE_KEY.slice(-8)));
  assert.ok(serialized.includes(keyHint(FAKE_KEY)));
  // O ficheiro de definições que o browser guarda (settings + spend) não tem chave.
  const browserFile = JSON.stringify({ settings: state.settings, spend: state.spend });
  assert.ok(!browserFile.includes('sk-'));
});

// (13) Definições: limites inválidos são rejeitados.
test('(13) definições: teto/máximo inválidos ou incoerentes são rejeitados', () => {
  const state = defaultAiState();
  assert.match(validateSettings({ monthlyCapUsd: 0 }) ?? '', /maior que 0/);
  assert.match(validateSettings({ monthlyCapUsd: -1 }) ?? '', /maior que 0/);
  assert.match(validateSettings({ monthlyCapUsd: 5000 }) ?? '', /1000/);
  assert.match(validateSettings({ maxPerCallUsd: 0 }) ?? '', /maior que 0/);
  assert.match(validateSettings({ maxPerCallUsd: 11 }) ?? '', /10/);
  assert.match(validateSettings({ monthlyCapUsd: 1, maxPerCallUsd: 2 }) ?? '', /maior que o teto mensal/);
  assert.match(validateSettings({ model: 'modelo-inventado' }) ?? '', /desconhecido/);
  assert.equal(validateSettings({ monthlyCapUsd: 5, maxPerCallUsd: 0.1, model: 'gpt-4o' }), null);
  assert.throws(() => applySettings(state, { monthlyCapUsd: 0 }), /maior que 0/);
  const next = applySettings(state, { monthlyCapUsd: 10, maxPerCallUsd: 0.5 });
  assert.equal(next.settings.monthlyCapUsd, 10);
  assert.equal(next.settings.maxPerCallUsd, 0.5);
  assert.equal(next.settings.mode, 'teste'); // o resto não muda
});
