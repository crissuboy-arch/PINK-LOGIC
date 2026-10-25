/**
 * Testes de segurança — correções dos Achados 1–5 (branch
 * fix/pink-logic-seguranca-achados-1-5).
 *
 * Cobrem as regras (puras e testáveis sem base de dados nem rede real):
 * - dono: só a proprietária publica/agenda/aprova;
 * - porta de publicação: dono + agendado + aprovado + Jev não reprovado;
 * - cron: só dono + agendado + aprovado + vencido;
 * - SSRF: IPs privados/reservados e redirects para eles são bloqueados,
 *   sem que o fetch chegue a ser chamado;
 * - rate limit / quota: o limite dispara e o reset funciona;
 * - erros seguros: 500 nunca vaza detalhe interno;
 * - segredo do cron: comparação em tempo constante;
 * - tetos de entrada: prompt e carrossel com máximos.
 *
 * O que NÃO é testável sem base de dados (e fica para a re-auditoria
 * pós-deploy): o filtro user_id nas queries Supabase, a migration de
 * aprovação aplicada e o comportamento do bundle deployado.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { getOwnerUserId, isOwner, requireOwner } from '../packages/api/dist/services/ownership.js';
import { canPublishPost, isCronEligible } from '../packages/api/dist/services/posts.js';
import { isBlockedIp, isBlockedHostname } from '../packages/api/dist/services/ssrf.js';
import { resolveArtwork } from '../packages/api/dist/services/mockup-render.js';
import { RateLimiter } from '../packages/api/dist/services/rate-limit.js';
import { toPublicError } from '../packages/api/dist/services/http-errors.js';
import { isCronSecretValid } from '../packages/api/dist/services/cron-auth.js';
import { GenerateRequestSchema, CarouselRenderSchema, MockupRequestSchema } from '../packages/shared/dist/index.js';

const OWNER = '11111111-1111-1111-1111-111111111111';
const OTHER = '22222222-2222-2222-2222-222222222222';

function withOwnerEnv(fn) {
  const prev = process.env.PINK_LOGIC_OWNER_USER_ID;
  process.env.PINK_LOGIC_OWNER_USER_ID = OWNER;
  try { return fn(); } finally {
    if (prev === undefined) delete process.env.PINK_LOGIC_OWNER_USER_ID;
    else process.env.PINK_LOGIC_OWNER_USER_ID = prev;
  }
}

// ─── Achado 1: dono ─────────────────────────────────────────
test('dono: só a proprietária é dona; sem env, ninguém é dono', () => {
  withOwnerEnv(() => {
    assert.equal(getOwnerUserId(), OWNER);
    assert.equal(isOwner({ kind: 'user', userId: OWNER, email: null }), true);
    assert.equal(isOwner({ kind: 'user', userId: OTHER, email: null }), false);
    assert.equal(isOwner({ kind: 'service' }), true); // service age pelo dono configurado
    assert.equal(requireOwner({ kind: 'user', userId: OWNER, email: null }), OWNER);
    assert.throws(() => requireOwner({ kind: 'user', userId: OTHER, email: null }), (e) => e.status === 403);
  });
  const prev = process.env.PINK_LOGIC_OWNER_USER_ID;
  delete process.env.PINK_LOGIC_OWNER_USER_ID;
  try {
    assert.equal(getOwnerUserId(), null);
    assert.equal(isOwner({ kind: 'user', userId: OWNER, email: null }), false);
    assert.equal(isOwner({ kind: 'service' }), false);
    assert.throws(() => requireOwner({ kind: 'user', userId: OWNER, email: null }), (e) => e.status === 503);
  } finally {
    if (prev !== undefined) process.env.PINK_LOGIC_OWNER_USER_ID = prev;
  }
});

// ─── Achados 1+2: porta de publicação ───────────────────────
const basePost = {
  user_id: OWNER, status: 'agendado', approved_at: '2026-10-25T10:00:00.000Z',
  scheduled_at: '2026-10-25T09:00:00.000Z', decision: { passed: true },
};

test('publicar: dono + agendado + aprovado + Jev ok → pode', () => {
  assert.deepEqual(canPublishPost({ ...basePost }, OWNER), { ok: true });
});

test('publicar: não-dono NÃO pode, mesmo com tudo o resto certo', () => {
  const r = canPublishPost({ ...basePost }, OWNER);
  assert.equal(r.ok, true);
  assert.equal(canPublishPost({ ...basePost, user_id: OTHER }, OWNER).ok, false);
});

test('publicar: sem aprovação humana NÃO sai (nunca por omissão)', () => {
  assert.equal(canPublishPost({ ...basePost, approved_at: null }, OWNER).ok, false);
  assert.equal(canPublishPost({ ...basePost, approved_at: undefined }, OWNER).ok, false);
});

test('publicar: rascunho NÃO publica diretamente; Jev reprovado NÃO publica', () => {
  assert.equal(canPublishPost({ ...basePost, status: 'rascunho' }, OWNER).ok, false);
  assert.equal(canPublishPost({ ...basePost, decision: { passed: false } }, OWNER).ok, false);
  // Sem decisão do Jev, a aprovação humana basta.
  assert.equal(canPublishPost({ ...basePost, decision: null }, OWNER).ok, true);
});

// ─── Achado 1 (cron): elegibilidade ─────────────────────────
test('cron: só dono + agendado + aprovado + vencido é elegível', () => {
  const now = '2026-10-25T12:00:00.000Z';
  assert.equal(isCronEligible({ ...basePost }, OWNER, now), true);
  assert.equal(isCronEligible({ ...basePost, user_id: OTHER }, OWNER, now), false);
  assert.equal(isCronEligible({ ...basePost, approved_at: null }, OWNER, now), false);
  assert.equal(isCronEligible({ ...basePost, status: 'rascunho' }, OWNER, now), false);
  assert.equal(isCronEligible({ ...basePost, scheduled_at: '2026-10-25T13:00:00.000Z' }, OWNER, now), false);
});

// ─── Achado 2: SSRF ─────────────────────────────────────────
test('SSRF: IPs privados/reservados bloqueados; públicos livres', () => {
  for (const ip of ['127.0.0.1', '10.0.0.5', '172.16.0.1', '172.31.255.255', '192.168.1.1',
    '169.254.169.254', '0.0.0.0', '100.64.0.1', '::1', 'fe80::1', 'fc00::1', '::ffff:127.0.0.1']) {
    assert.equal(isBlockedIp(ip), true, ip);
  }
  for (const ip of ['8.8.8.8', '93.184.216.34', '1.1.1.1', '2001:4860:4860::8888']) {
    assert.equal(isBlockedIp(ip), false, ip);
  }
  assert.equal(isBlockedHostname('localhost'), true);
  assert.equal(isBlockedHostname('evil.localhost'), true);
  assert.equal(isBlockedHostname('127.0.0.1'), true);
  assert.equal(isBlockedHostname('example.com'), false);
});

test('SSRF: artwork para 127.0.0.1 e localhost é rejeitada SEM chamar fetch', async () => {
  const realFetch = globalThis.fetch;
  let called = 0;
  globalThis.fetch = async () => { called++; return new Response('', { status: 200 }); };
  try {
    await assert.rejects(() => resolveArtwork('http://127.0.0.1/admin'), /não é um endereço público/);
    await assert.rejects(() => resolveArtwork('http://localhost:3000/x.png'), /não é um endereço público/);
    assert.equal(called, 0);
  } finally { globalThis.fetch = realFetch; }
});

test('SSRF: redirect para IP privado é bloqueado (revalidação pós-redirect)', async () => {
  const realFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url) => {
    calls.push(String(url));
    if (String(url).includes('93.184.216.34')) {
      return new Response('', { status: 302, headers: { location: 'http://127.0.0.1/secret.png' } });
    }
    return new Response('', { status: 200, headers: { 'content-type': 'image/png' } });
  };
  try {
    await assert.rejects(() => resolveArtwork('http://93.184.216.34/start.png'), /não é um endereço público/);
    assert.equal(calls.length, 1); // o segundo pedido nunca aconteceu
  } finally { globalThis.fetch = realFetch; }
});

test('SSRF: imagem pública (IP literal, fetch mockado) resolve para data URL', async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(Buffer.from([0x89, 0x50, 0x4e, 0x47]), {
    status: 200, headers: { 'content-type': 'image/png' },
  });
  try {
    const out = await resolveArtwork('http://93.184.216.34/img.png');
    assert.match(out, /^data:image\/png;base64,/);
  } finally { globalThis.fetch = realFetch; }
});

// ─── Achado 3: rate limit ───────────────────────────────────
test('rate limit: permite até ao máximo e depois bloqueia; reset liberta', () => {
  const lim = new RateLimiter(3, 60_000);
  assert.equal(lim.check('u1').allowed, true);
  assert.equal(lim.check('u1').allowed, true);
  assert.equal(lim.check('u1').allowed, true);
  const blocked = lim.check('u1');
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfterSec >= 1);
  assert.equal(lim.check('u2').allowed, true); // outro chamador não é afetado
  lim.reset();
  assert.equal(lim.check('u1').allowed, true);
});

// ─── Achado 5: erros seguros ────────────────────────────────
test('erros: 500 nunca vaza detalhe; 400/503 mantêm mensagem estática', () => {
  const pub = toPublicError(Object.assign(new Error('select * from users: password hash xyz'), { status: 500 }));
  assert.equal(pub.status, 500);
  assert.equal(pub.message, 'Erro interno. Tente novamente.');
  assert.doesNotMatch(pub.message, /password/);
  const bad = toPublicError(Object.assign(new Error('Pedido inválido.'), { status: 400 }));
  assert.deepEqual(bad, { status: 400, message: 'Pedido inválido.' });
});

// ─── Achado 5: segredo do cron ──────────────────────────────
test('cron: segredo válido/inválido em tempo constante', () => {
  assert.equal(isCronSecretValid('Bearer segredo123', 'segredo123'), true);
  assert.equal(isCronSecretValid('Bearer errado1234', 'segredo123'), false);
  assert.equal(isCronSecretValid('Bearer curto', 'segredo123'), false);
  assert.equal(isCronSecretValid(undefined, 'segredo123'), false);
  assert.equal(isCronSecretValid('Bearer x', ''), false);
  assert.equal(isCronSecretValid(['Bearer segredo123'], 'segredo123'), true);
});

// ─── Achado 3: tetos de entrada ─────────────────────────────
test('schemas: prompt com teto; carrossel com teto; mockup com teto', () => {
  assert.equal(GenerateRequestSchema.safeParse({ module: 'copy', prompt: 'x'.repeat(2001) }).success, false);
  assert.equal(GenerateRequestSchema.safeParse({ module: 'copy', prompt: 'ok' }).success, true);
  assert.equal(CarouselRenderSchema.safeParse({ title: 'x'.repeat(201), items: [] }).success, false);
  assert.equal(CarouselRenderSchema.safeParse({ title: 'ok', items: Array.from({ length: 11 }, () => ({})) }).success, false);
  assert.equal(CarouselRenderSchema.safeParse({ title: 'ok', items: [{ title: 'a', body: 'b' }] }).success, true);
  assert.equal(MockupRequestSchema.safeParse({ type: 'card', artworkUrl: 'https://x/' + 'a'.repeat(2000) }).success, false);
});
