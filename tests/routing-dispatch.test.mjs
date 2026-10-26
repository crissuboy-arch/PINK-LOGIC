/**
 * Testes de dispatch/roteamento da consolidação Opção B (limite Hobby:
 * 12 funções) — provam que as rotas consolidadas chegam ao handler
 * certo, com os gates certos, sem base de dados nem rede real.
 *
 * Importam os BUNDLES REAIS (api/posts/[[...all]].js e
 * api/integrations/[...all].js) — o código exato que a Vercel vai
 * correr — por isso só correm DEPOIS do bundle:
 *   npm run build --workspace=@pink-logic/shared
 *   npm run build --workspace=@pink-logic/api
 *   node scripts/bundle-functions.mjs
 *   node --test tests/routing-dispatch.test.mjs
 * (ou: npm run test:routing)
 *
 * Estratégia de prova (sem DB): cada ramo tem uma assinatura
 * distinguível SEM chegar ao serviço — 405 com mensagem própria,
 * 401 sem auth, 503 com auth de serviço mas sem dono/base configurados,
 * 200 público no health, 404 em rotas desconhecidas. Um dispatch errado
 * dá outro código/mensagem e o teste falha.
 *
 * Auth de serviço em testes: PINK_LOGIC_SERVICE_KEY de teste (≥32
 * chars) + `Bearer` — o authenticate() aceita-a sem rede. As envs de
 * Supabase/dono/Athena são apagadas para os caminhos 503 serem
 * determinísticos (nenhuma chamada real sai daqui).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import postsRouter from '../api/posts/[[...all]].js';
import integrationsRouter from '../api/integrations/[...all].js';

// --- ambiente determinístico (antes de qualquer invocação) -----------
delete process.env.SUPABASE_URL;
delete process.env.VITE_SUPABASE_URL;
delete process.env.SUPABASE_SERVICE_ROLE_KEY;
delete process.env.SUPABASE_ANON_KEY;
delete process.env.VITE_SUPABASE_ANON_KEY;
delete process.env.PINK_LOGIC_OWNER_USER_ID;
delete process.env.PINKLOGIC_ATHENA_API_KEY;
process.env.PINK_LOGIC_SERVICE_KEY = 'test-service-key-0123456789abcdef';

const SERVICE_AUTH = { authorization: 'Bearer test-service-key-0123456789abcdef' };

// --- mocks -------------------------------------------------------------
function fakeReq({ method, segments, query = {}, headers = {}, body, url } = {}) {
  const q = { ...query };
  if (segments !== undefined) q.all = segments;
  return {
    method,
    query: q,
    headers,
    body,
    url: url ?? '/api/posts',
  };
}

function fakeRes() {
  const r = { statusCode: 0, body: null, ended: false };
  r.status = (c) => {
    r.statusCode = c;
    return r;
  };
  r.json = (b) => {
    r.body = b;
    return r;
  };
  r.end = () => {
    r.ended = true;
    return r;
  };
  return r;
}

async function call(handler, req) {
  const res = fakeRes();
  await handler(req, res);
  return res;
}

// --- router posts ------------------------------------------------------
test('posts: base GET sem auth → 401 (ramo index, auth primeiro)', async () => {
  const res = await call(postsRouter, fakeReq({ method: 'GET', segments: [] }));
  assert.equal(res.statusCode, 401);
});

test('posts: base POST sem auth → 401', async () => {
  const res = await call(postsRouter, fakeReq({ method: 'POST', segments: [] }));
  assert.equal(res.statusCode, 401);
});

test('posts: base PUT com auth de serviço → 405 "Só GET ou POST"', async () => {
  const res = await call(postsRouter, fakeReq({ method: 'PUT', segments: [], headers: SERVICE_AUTH }));
  assert.equal(res.statusCode, 405);
  assert.match(res.body.error, /Só GET ou POST/);
});

test('posts: base GET com auth de serviço → 503 (chega ao listPosts; sem dono/base)', async () => {
  const res = await call(postsRouter, fakeReq({ method: 'GET', segments: [], headers: SERVICE_AUTH }));
  assert.equal(res.statusCode, 503);
});

test('posts: base GET com filtros válidos → 503 (query atravessa o router)', async () => {
  const res = await call(postsRouter, fakeReq({
    method: 'GET', segments: [], headers: SERVICE_AUTH, query: { status: 'agendado', limit: '10' },
  }));
  assert.equal(res.statusCode, 503);
});

test('posts: base sem query.all (só URL) → ramo index (fallback do URL)', async () => {
  const res = await call(postsRouter, fakeReq({ method: 'GET', url: '/api/posts' }));
  assert.equal(res.statusCode, 401);
});

test('posts: query.all [""] → ramo index (segmentos vazios filtrados)', async () => {
  const res = await call(postsRouter, fakeReq({ method: 'GET', segments: [''] }));
  assert.equal(res.statusCode, 401);
});

test('posts: [id] PUT com auth → 405 "Só GET, PATCH ou DELETE"', async () => {
  const res = await call(postsRouter, fakeReq({ method: 'PUT', segments: ['abc-123'], headers: SERVICE_AUTH }));
  assert.equal(res.statusCode, 405);
  assert.match(res.body.error, /Só GET, PATCH ou DELETE/);
});

test('posts: [id] GET com auth → 503 (chega ao getPost; sem dono/base)', async () => {
  const res = await call(postsRouter, fakeReq({ method: 'GET', segments: ['abc-123'], headers: SERVICE_AUTH }));
  assert.equal(res.statusCode, 503);
});

test('posts: [id] PATCH com body inválido → 400 (validação antes do serviço)', async () => {
  const res = await call(postsRouter, fakeReq({
    method: 'PATCH', segments: ['abc-123'], headers: SERVICE_AUTH, body: { status: 'invalido' },
  }));
  assert.equal(res.statusCode, 400);
});

test('posts: [id] PATCH com body válido → 503 (chega ao updatePost; sem dono)', async () => {
  const res = await call(postsRouter, fakeReq({
    method: 'PATCH', segments: ['abc-123'], headers: SERVICE_AUTH, body: { title: 'novo' },
  }));
  assert.equal(res.statusCode, 503);
});

test('posts: approve GET → 405 "Só POST" (método antes da auth, como antes)', async () => {
  const res = await call(postsRouter, fakeReq({ method: 'GET', segments: ['abc-123', 'approve'] }));
  assert.equal(res.statusCode, 405);
  assert.match(res.body.error, /Só POST/);
});

test('posts: approve POST sem auth → 401 (gate de auth do ramo)', async () => {
  const res = await call(postsRouter, fakeReq({ method: 'POST', segments: ['abc-123', 'approve'] }));
  assert.equal(res.statusCode, 401);
});

test('posts: approve POST com auth → 503 (chega ao approvePostHuman; sem dono)', async () => {
  const res = await call(postsRouter, fakeReq({ method: 'POST', segments: ['abc-123', 'approve'], headers: SERVICE_AUTH }));
  assert.equal(res.statusCode, 503);
});

test('posts: approve via URL sem query.all → 405 (fallback do URL)', async () => {
  const res = await call(postsRouter, fakeReq({ method: 'GET', url: '/api/posts/abc-123/approve' }));
  assert.equal(res.statusCode, 405);
});

test('posts: publish GET → 405 "Só POST"', async () => {
  const res = await call(postsRouter, fakeReq({ method: 'GET', segments: ['abc-123', 'publish'] }));
  assert.equal(res.statusCode, 405);
});

test('posts: publish POST sem auth → 401', async () => {
  const res = await call(postsRouter, fakeReq({ method: 'POST', segments: ['abc-123', 'publish'] }));
  assert.equal(res.statusCode, 401);
});

test('posts: schedule GET → 405 "Só POST"', async () => {
  const res = await call(postsRouter, fakeReq({ method: 'GET', segments: ['abc-123', 'schedule'] }));
  assert.equal(res.statusCode, 405);
});

test('posts: schedule POST sem auth → 401 (auth antes da validação do body)', async () => {
  const res = await call(postsRouter, fakeReq({ method: 'POST', segments: ['abc-123', 'schedule'], body: { scheduledAt: 'x' } }));
  assert.equal(res.statusCode, 401);
});

test('posts: schedule POST com auth e body inválido → 400', async () => {
  const res = await call(postsRouter, fakeReq({
    method: 'POST', segments: ['abc-123', 'schedule'], headers: SERVICE_AUTH, body: { scheduledAt: 'não-data' },
  }));
  assert.equal(res.statusCode, 400);
});

test('posts: schedule POST com auth e body válido → 503 (chega ao serviço; sem dono)', async () => {
  const res = await call(postsRouter, fakeReq({
    method: 'POST', segments: ['abc-123', 'schedule'], headers: SERVICE_AUTH,
    body: { scheduledAt: '2030-01-01T09:00:00.000Z' },
  }));
  assert.equal(res.statusCode, 503);
});

test('posts: ação desconhecida → 404 (como o 404 da Vercel antes)', async () => {
  const res = await call(postsRouter, fakeReq({ method: 'GET', segments: ['abc-123', 'unknown'], headers: SERVICE_AUTH }));
  assert.equal(res.statusCode, 404);
});

test('posts: caminho profundo → 404', async () => {
  const res = await call(postsRouter, fakeReq({ method: 'GET', segments: ['abc-123', 'approve', 'extra'], headers: SERVICE_AUTH }));
  assert.equal(res.statusCode, 404);
});

// --- router integrations ------------------------------------------------
test('integrations: GET health → 200 público, contrato v1', async () => {
  const res = await call(integrationsRouter, fakeReq({ method: 'GET', segments: ['health'], url: '/api/integrations/health' }));
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.platform, 'PinkLogic');
  assert.equal(res.body.contract, 'v1');
  assert.equal(res.body.status, 'operational');
});

test('integrations: POST health → 200 (método ignorado, como antes)', async () => {
  const res = await call(integrationsRouter, fakeReq({ method: 'POST', segments: ['health'], url: '/api/integrations/health' }));
  assert.equal(res.statusCode, 200);
});

test('integrations: GET stats sem chave → 503 "Integração não configurada."', async () => {
  delete process.env.PINKLOGIC_ATHENA_API_KEY;
  const res = await call(integrationsRouter, fakeReq({ method: 'GET', segments: ['stats'], url: '/api/integrations/stats' }));
  assert.equal(res.statusCode, 503);
  assert.match(res.body.error, /Integração não configurada/);
});

test('integrations: POST stats → 405 "Só GET." (método antes da auth)', async () => {
  const res = await call(integrationsRouter, fakeReq({ method: 'POST', segments: ['stats'], url: '/api/integrations/stats' }));
  assert.equal(res.statusCode, 405);
});

test('integrations: GET stats com chave e bearer errado → 401', async () => {
  process.env.PINKLOGIC_ATHENA_API_KEY = 'athena-test-key-0123456789abcdef';
  const res = await call(integrationsRouter, fakeReq({
    method: 'GET', segments: ['stats'], url: '/api/integrations/stats',
    headers: { authorization: 'Bearer chave-errada' },
  }));
  assert.equal(res.statusCode, 401);
  delete process.env.PINKLOGIC_ATHENA_API_KEY;
});

test('integrations: GET stats com bearer certo e sem base → 503 (não chega à rede)', async () => {
  process.env.PINKLOGIC_ATHENA_API_KEY = 'athena-test-key-0123456789abcdef';
  const res = await call(integrationsRouter, fakeReq({
    method: 'GET', segments: ['stats'], url: '/api/integrations/stats',
    headers: { authorization: 'Bearer athena-test-key-0123456789abcdef' },
  }));
  assert.equal(res.statusCode, 503);
  assert.match(res.body.error, /Banco de dados não configurado/);
  delete process.env.PINKLOGIC_ATHENA_API_KEY;
});

test('integrations: segmento desconhecido → 404', async () => {
  const res = await call(integrationsRouter, fakeReq({ method: 'GET', segments: ['unknown'], url: '/api/integrations/unknown' }));
  assert.equal(res.statusCode, 404);
});
