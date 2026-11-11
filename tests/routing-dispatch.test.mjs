/**
 * Testes de dispatch/roteamento do FRONT-CONTROLLER (plano Hobby:
 * 1 função) — provam que TODAS as rotas chegam ao handler certo, com
 * os gates certos, sem base de dados nem rede real.
 *
 * Importam o BUNDLE REAL (api/router.js) — o código exato que a
 * Vercel vai correr — por isso só correm DEPOIS do bundle:
 *   npm run build --workspace=@pink-logic/shared
 *   npm run build --workspace=@pink-logic/api
 *   node scripts/bundle-functions.mjs
 *   node --test tests/routing-dispatch.test.mjs
 * (ou: npm run test:routing)
 *
 * Estratégia de prova (sem DB): cada ramo tem uma assinatura
 * distinguível SEM chegar ao serviço — 405 com mensagem própria,
 * 401 sem auth, 503 com auth de serviço mas sem dono/base configurados,
 * 200 público no health/ping, 404 em rotas desconhecidas. Um dispatch
 * errado dá outro código/mensagem e o teste falha.
 *
 * O router lê o caminho por ordem: query.__path (rewrite vercel.json),
 * query.path, query.all e pathname do req.url. Os testes cobrem as
 * vias __path e URL (as que a Vercel e o vercel dev usam).
 *
 * Auth de serviço em testes: PINK_LOGIC_SERVICE_KEY de teste (≥32
 * chars) + `Bearer` — o authenticate() aceita-a sem rede. As envs de
 * Supabase/dono/Athena são apagadas para os caminhos 503 serem
 * determinísticos (nenhuma chamada real sai daqui).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import router from '../api/router.js';

// --- ambiente determinístico (antes de qualquer invocação) -----------
delete process.env.SUPABASE_URL;
delete process.env.VITE_SUPABASE_URL;
delete process.env.SUPABASE_SERVICE_ROLE_KEY;
delete process.env.SUPABASE_ANON_KEY;
delete process.env.VITE_SUPABASE_ANON_KEY;
delete process.env.PINK_LOGIC_OWNER_USER_ID;
delete process.env.PINKLOGIC_ATHENA_API_KEY;
delete process.env.CRON_SECRET;
process.env.PINK_LOGIC_SERVICE_KEY = 'test-service-key-0123456789abcdef';

const SERVICE_AUTH = { authorization: 'Bearer test-service-key-0123456789abcdef' };

// --- mocks -------------------------------------------------------------
// fakeReq simula a Vercel: query já vem parseada do URL (como a
// Vercel faz); `path` simula o rewrite (__path), `url` a invocação
// direta, `segments` a compatibilidade query.all.
function fakeReq({ method, path, url, segments, query = {}, headers = {}, body } = {}) {
  const q = { ...query };
  if (path !== undefined) q.__path = path;
  if (segments !== undefined) q.all = segments;
  let u = url ?? '/api/router';
  if (u.includes('?')) {
    const [base, qs] = u.split('?', 2);
    u = base;
    for (const [k, v] of new URLSearchParams(qs)) if (!(k in q)) q[k] = v;
  }
  return { method, query: q, headers, body, url: u };
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

async function call(req) {
  const res = fakeRes();
  await router(req, res);
  return res;
}

// --- posts: base -------------------------------------------------------
test('router: posts base GET sem auth → 401 (via __path)', async () => {
  const res = await call(fakeReq({ method: 'GET', path: 'posts' }));
  assert.equal(res.statusCode, 401);
});

test('router: posts base POST sem auth → 401', async () => {
  const res = await call(fakeReq({ method: 'POST', path: 'posts' }));
  assert.equal(res.statusCode, 401);
});

test('router: posts base PUT com auth → 405 "Só GET ou POST"', async () => {
  const res = await call(fakeReq({ method: 'PUT', path: 'posts', headers: SERVICE_AUTH }));
  assert.equal(res.statusCode, 405);
  assert.match(res.body.error, /Só GET ou POST/);
});

test('router: posts base GET com auth → 503 (chega ao listPosts; sem dono/base)', async () => {
  const res = await call(fakeReq({ method: 'GET', path: 'posts', headers: SERVICE_AUTH }));
  assert.equal(res.statusCode, 503);
});

test('router: posts base GET com filtros → 503 (query atravessa, menos __path)', async () => {
  const res = await call(fakeReq({
    method: 'GET', path: 'posts', headers: SERVICE_AUTH, query: { status: 'agendado', limit: '10' },
  }));
  assert.equal(res.statusCode, 503);
});

test('router: posts base só URL → 401 (fallback do URL, sem __path)', async () => {
  const res = await call(fakeReq({ method: 'GET', url: '/api/posts' }));
  assert.equal(res.statusCode, 401);
});

test('router: posts base URL com query → 503 (filtros do URL atravessam)', async () => {
  const res = await call(fakeReq({ method: 'GET', url: '/api/posts?status=agendado', headers: SERVICE_AUTH }));
  assert.equal(res.statusCode, 503);
});

// --- posts: detalhe ------------------------------------------------------
test('router: [id] PUT com auth → 405 "Só GET, PATCH ou DELETE"', async () => {
  const res = await call(fakeReq({ method: 'PUT', path: 'posts/abc-123', headers: SERVICE_AUTH }));
  assert.equal(res.statusCode, 405);
  assert.match(res.body.error, /Só GET, PATCH ou DELETE/);
});

test('router: [id] GET com auth → 503 (chega ao getPost; sem dono/base)', async () => {
  const res = await call(fakeReq({ method: 'GET', path: 'posts/abc-123', headers: SERVICE_AUTH }));
  assert.equal(res.statusCode, 503);
});

test('router: [id] PATCH com body inválido → 400 (validação antes do serviço)', async () => {
  const res = await call(fakeReq({
    method: 'PATCH', path: 'posts/abc-123', headers: SERVICE_AUTH, body: { status: 'invalido' },
  }));
  assert.equal(res.statusCode, 400);
});

test('router: [id] PATCH com body válido → 503 (chega ao updatePost; sem dono)', async () => {
  const res = await call(fakeReq({
    method: 'PATCH', path: 'posts/abc-123', headers: SERVICE_AUTH, body: { title: 'novo' },
  }));
  assert.equal(res.statusCode, 503);
});

test('router: [id] via URL → 503 (fallback do URL)', async () => {
  const res = await call(fakeReq({ method: 'GET', url: '/api/posts/abc-123', headers: SERVICE_AUTH }));
  assert.equal(res.statusCode, 503);
});

// --- posts: approve / publish / schedule (2 segmentos) -------------------
test('router: approve GET → 405 "Só POST" (método antes da auth)', async () => {
  const res = await call(fakeReq({ method: 'GET', path: 'posts/abc-123/approve' }));
  assert.equal(res.statusCode, 405);
  assert.match(res.body.error, /Só POST/);
});

test('router: approve POST sem auth → 401', async () => {
  const res = await call(fakeReq({ method: 'POST', path: 'posts/abc-123/approve' }));
  assert.equal(res.statusCode, 401);
});

test('router: approve POST com auth → 503 (chega ao approvePostHuman; sem dono)', async () => {
  const res = await call(fakeReq({ method: 'POST', path: 'posts/abc-123/approve', headers: SERVICE_AUTH }));
  assert.equal(res.statusCode, 503);
});

test('router: approve via URL sem __path → 405 (fallback do URL)', async () => {
  const res = await call(fakeReq({ method: 'GET', url: '/api/posts/abc-123/approve' }));
  assert.equal(res.statusCode, 405);
});

test('router: __path tem prioridade sobre o URL /api/router (caso rewrite)', async () => {
  const res = await call(fakeReq({ method: 'GET', url: '/api/router', path: 'posts/abc-123/approve' }));
  assert.equal(res.statusCode, 405);
  assert.match(res.body.error, /Só POST/);
});

test('router: publish GET → 405 "Só POST"', async () => {
  const res = await call(fakeReq({ method: 'GET', path: 'posts/abc-123/publish' }));
  assert.equal(res.statusCode, 405);
});

test('router: publish POST sem auth → 401', async () => {
  const res = await call(fakeReq({ method: 'POST', path: 'posts/abc-123/publish' }));
  assert.equal(res.statusCode, 401);
});

test('router: schedule GET → 405 "Só POST"', async () => {
  const res = await call(fakeReq({ method: 'GET', path: 'posts/abc-123/schedule' }));
  assert.equal(res.statusCode, 405);
});

test('router: schedule POST sem auth → 401 (auth antes da validação do body)', async () => {
  const res = await call(fakeReq({ method: 'POST', path: 'posts/abc-123/schedule', body: { scheduledAt: 'x' } }));
  assert.equal(res.statusCode, 401);
});

test('router: schedule POST com auth e body inválido → 400', async () => {
  const res = await call(fakeReq({
    method: 'POST', path: 'posts/abc-123/schedule', headers: SERVICE_AUTH, body: { scheduledAt: 'não-data' },
  }));
  assert.equal(res.statusCode, 400);
});

test('router: schedule POST com auth e body válido → 503 (chega ao serviço; sem dono)', async () => {
  const res = await call(fakeReq({
    method: 'POST', path: 'posts/abc-123/schedule', headers: SERVICE_AUTH,
    body: { scheduledAt: '2030-01-01T09:00:00.000Z' },
  }));
  assert.equal(res.statusCode, 503);
});

// --- brands (ChatGPT) ----------------------------------------------------
test('router: brands GET sem auth → 401', async () => {
  const res = await call(fakeReq({ method: 'GET', path: 'brands' }));
  assert.equal(res.statusCode, 401);
});

test('router: brands GET com auth → 503 (chega ao listBrands; sem dono/base)', async () => {
  const res = await call(fakeReq({ method: 'GET', path: 'brands', headers: SERVICE_AUTH }));
  assert.equal(res.statusCode, 503);
});

test('router: brands POST sem auth → 401', async () => {
  const res = await call(fakeReq({ method: 'POST', path: 'brands', body: { name: 'X' } }));
  assert.equal(res.statusCode, 401);
});

test('router: brands POST com auth e body inválido → 400 (falta o nome)', async () => {
  const res = await call(fakeReq({ method: 'POST', path: 'brands', headers: SERVICE_AUTH, body: {} }));
  assert.equal(res.statusCode, 400);
});

test('router: brands POST com auth e body válido → 503 (chega ao createBrand; sem dono)', async () => {
  const res = await call(fakeReq({ method: 'POST', path: 'brands', headers: SERVICE_AUTH, body: { name: 'Marca Teste' } }));
  assert.equal(res.statusCode, 503);
});

test('router: brands/:id GET sem auth → 401', async () => {
  const res = await call(fakeReq({ method: 'GET', path: 'brands/abc-123' }));
  assert.equal(res.statusCode, 401);
});

test('router: brands/:id GET com auth → 503 (chega ao getBrand; sem dono)', async () => {
  const res = await call(fakeReq({ method: 'GET', path: 'brands/abc-123', headers: SERVICE_AUTH }));
  assert.equal(res.statusCode, 503);
});

test('router: brands/:id PUT com auth → 405 "Só GET"', async () => {
  const res = await call(fakeReq({ method: 'PUT', path: 'brands/abc-123', headers: SERVICE_AUTH }));
  assert.equal(res.statusCode, 405);
  assert.match(res.body.error, /Só GET/);
});

// --- campaigns (ChatGPT) -------------------------------------------------
test('router: campaigns GET sem auth → 401', async () => {
  const res = await call(fakeReq({ method: 'GET', path: 'campaigns' }));
  assert.equal(res.statusCode, 401);
});

test('router: campaigns GET com auth → 503 (chega ao listCampaigns; sem dono/base)', async () => {
  const res = await call(fakeReq({ method: 'GET', path: 'campaigns', headers: SERVICE_AUTH }));
  assert.equal(res.statusCode, 503);
});

test('router: campaigns POST com auth e body inválido → 400 (falta o nome)', async () => {
  const res = await call(fakeReq({ method: 'POST', path: 'campaigns', headers: SERVICE_AUTH, body: {} }));
  assert.equal(res.statusCode, 400);
});

test('router: campaigns POST com auth e body válido → 503 (chega ao createCampaign; sem dono)', async () => {
  const res = await call(fakeReq({ method: 'POST', path: 'campaigns', headers: SERVICE_AUTH, body: { name: 'Campanha Teste' } }));
  assert.equal(res.statusCode, 503);
});

// --- media/import (ChatGPT) ----------------------------------------------
test('router: media/import GET → 405 "Só POST" (método antes da auth)', async () => {
  const res = await call(fakeReq({ method: 'GET', path: 'media/import' }));
  assert.equal(res.statusCode, 405);
  assert.match(res.body.error, /Só POST/);
});

test('router: media/import POST sem auth → 401', async () => {
  const res = await call(fakeReq({ method: 'POST', path: 'media/import', body: { url: 'https://example.com/a.png' } }));
  assert.equal(res.statusCode, 401);
});

test('router: media/import POST com auth e body inválido → 400 (URL inválida)', async () => {
  const res = await call(fakeReq({ method: 'POST', path: 'media/import', headers: SERVICE_AUTH, body: { url: 'não-url' } }));
  assert.equal(res.statusCode, 400);
});

test('router: media/import POST com auth e body válido → 503 (chega ao importMedia; sem dono)', async () => {
  const res = await call(fakeReq({ method: 'POST', path: 'media/import', headers: SERVICE_AUTH, body: { url: 'https://example.com/a.png' } }));
  assert.equal(res.statusCode, 503);
});

// --- desconhecidos / vazios ----------------------------------------------
test('router: ação desconhecida → 404', async () => {
  const res = await call(fakeReq({ method: 'GET', path: 'posts/abc-123/unknown', headers: SERVICE_AUTH }));
  assert.equal(res.statusCode, 404);
});

test('router: caminho profundo → 404', async () => {
  const res = await call(fakeReq({ method: 'GET', path: 'posts/abc-123/approve/extra', headers: SERVICE_AUTH }));
  assert.equal(res.statusCode, 404);
});

test('router: /api vazio → 404', async () => {
  const res = await call(fakeReq({ method: 'GET', url: '/api' }));
  assert.equal(res.statusCode, 404);
});

test('router: /api/router direto sem __path → 404', async () => {
  const res = await call(fakeReq({ method: 'GET', url: '/api/router' }));
  assert.equal(res.statusCode, 404);
});

test('router: topo desconhecido → 404', async () => {
  const res = await call(fakeReq({ method: 'GET', path: 'desconhecido', headers: SERVICE_AUTH }));
  assert.equal(res.statusCode, 404);
});

test('router: integrations sem segmento → 404 (não há rota base)', async () => {
  const res = await call(fakeReq({ method: 'GET', path: 'integrations' }));
  assert.equal(res.statusCode, 404);
});

test('router: __path com barra final e segmentos vazios → ignora vazios', async () => {
  const res = await call(fakeReq({ method: 'GET', path: 'posts/abc-123/', headers: SERVICE_AUTH }));
  assert.equal(res.statusCode, 503);
});

test('router: __path com encoding → descodifica (id com hífen)', async () => {
  const res = await call(fakeReq({ method: 'GET', path: 'posts/abc%2D123', headers: SERVICE_AUTH }));
  assert.equal(res.statusCode, 503);
});

// --- integrations ----------------------------------------------------------
test('router: integrations health GET → 200 público, contrato v1', async () => {
  const res = await call(fakeReq({ method: 'GET', path: 'integrations/health' }));
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.platform, 'PinkLogic');
  assert.equal(res.body.contract, 'v1');
  assert.equal(res.body.status, 'operational');
});

test('router: integrations health POST → 200 (método ignorado, como antes)', async () => {
  const res = await call(fakeReq({ method: 'POST', path: 'integrations/health' }));
  assert.equal(res.statusCode, 200);
});

test('router: integrations stats sem chave → 503 "Integração não configurada."', async () => {
  delete process.env.PINKLOGIC_ATHENA_API_KEY;
  const res = await call(fakeReq({ method: 'GET', path: 'integrations/stats' }));
  assert.equal(res.statusCode, 503);
  assert.match(res.body.error, /Integração não configurada/);
});

test('router: integrations stats POST → 405 "Só GET." (método antes da auth)', async () => {
  const res = await call(fakeReq({ method: 'POST', path: 'integrations/stats' }));
  assert.equal(res.statusCode, 405);
});

test('router: integrations stats com chave e bearer errado → 401', async () => {
  process.env.PINKLOGIC_ATHENA_API_KEY = 'athena-test-key-0123456789abcdef';
  const res = await call(fakeReq({
    method: 'GET', path: 'integrations/stats', headers: { authorization: 'Bearer chave-errada' },
  }));
  assert.equal(res.statusCode, 401);
  delete process.env.PINKLOGIC_ATHENA_API_KEY;
});

test('router: integrations stats com bearer certo e sem base → 503 (não chega à rede)', async () => {
  process.env.PINKLOGIC_ATHENA_API_KEY = 'athena-test-key-0123456789abcdef';
  const res = await call(fakeReq({
    method: 'GET', path: 'integrations/stats',
    headers: { authorization: 'Bearer athena-test-key-0123456789abcdef' },
  }));
  assert.equal(res.statusCode, 503);
  assert.match(res.body.error, /Banco de dados não configurado/);
  delete process.env.PINKLOGIC_ATHENA_API_KEY;
});

test('router: integrations segmento desconhecido → 404', async () => {
  const res = await call(fakeReq({ method: 'GET', path: 'integrations/unknown' }));
  assert.equal(res.statusCode, 404);
});

// --- owner-status ------------------------------------------------------------
test('router: owner-status GET sem auth → 401', async () => {
  const res = await call(fakeReq({ method: 'GET', path: 'auth/owner-status' }));
  assert.equal(res.statusCode, 401);
});

test('router: owner-status POST → 405 "Só GET" (método antes da auth)', async () => {
  const res = await call(fakeReq({ method: 'POST', path: 'auth/owner-status' }));
  assert.equal(res.statusCode, 405);
  assert.match(res.body.error, /Só GET/);
});

// --- cron ---------------------------------------------------------------------
test('router: cron sem CRON_SECRET → 503 "CRON_SECRET não configurado."', async () => {
  delete process.env.CRON_SECRET;
  const res = await call(fakeReq({ method: 'GET', path: 'cron/publish' }));
  assert.equal(res.statusCode, 503);
  assert.match(res.body.error, /CRON_SECRET não configurado/);
});

test('router: cron com segredo e sem auth → 401 (chega ao handler do cron)', async () => {
  process.env.CRON_SECRET = 'cron-test-secret-0123456789abcdef';
  const res = await call(fakeReq({ method: 'GET', path: 'cron/publish' }));
  assert.equal(res.statusCode, 401);
});

test('router: cron com segredo errado → 401', async () => {
  process.env.CRON_SECRET = 'cron-test-secret-0123456789abcdef';
  const res = await call(fakeReq({
    method: 'GET', path: 'cron/publish', headers: { authorization: 'Bearer errado' },
  }));
  assert.equal(res.statusCode, 401);
  delete process.env.CRON_SECRET;
});

test('router: cron via URL → 401 (fallback do URL, com segredo)', async () => {
  process.env.CRON_SECRET = 'cron-test-secret-0123456789abcdef';
  const res = await call(fakeReq({ method: 'GET', url: '/api/cron/publish' }));
  assert.equal(res.statusCode, 401);
  delete process.env.CRON_SECRET;
});

// --- health / ping / singles ---------------------------------------------------
test('router: health GET → 200 público', async () => {
  const res = await call(fakeReq({ method: 'GET', path: 'health' }));
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.ok, true);
});

test('router: ping GET → 200 pong', async () => {
  const res = await call(fakeReq({ method: 'GET', path: 'ping' }));
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.ping, 'pong');
});

test('router: collect GET → 405 "Só POST"', async () => {
  const res = await call(fakeReq({ method: 'GET', path: 'collect' }));
  assert.equal(res.statusCode, 405);
});

test('router: decide GET → 405 "Só POST"', async () => {
  const res = await call(fakeReq({ method: 'GET', path: 'decide' }));
  assert.equal(res.statusCode, 405);
});

test('router: generate GET → 405 "Só POST"', async () => {
  const res = await call(fakeReq({ method: 'GET', path: 'generate' }));
  assert.equal(res.statusCode, 405);
});

test('router: mockup GET → 405 "Só POST"', async () => {
  const res = await call(fakeReq({ method: 'GET', path: 'mockup' }));
  assert.equal(res.statusCode, 405);
});

test('router: carousel/render GET → 405 "Só POST"', async () => {
  const res = await call(fakeReq({ method: 'GET', path: 'carousel/render' }));
  assert.equal(res.statusCode, 405);
});
