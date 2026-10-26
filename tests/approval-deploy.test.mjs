/**
 * Testes da preparação final para deploy — aprovação humana na UI
 * (branch fix/pink-logic-seguranca-achados-1-5).
 *
 * Cobre, sem base de dados nem rede real:
 * - os 6 estados de aprovação da UI (mapeamento puro em
 *   packages/web/src/lib/postApprovalState.ts, transpilado aqui com
 *   esbuild — a lib não tem imports, por isso o bundle é trivial);
 * - a visibilidade do botão de aprovar (só a proprietária; desativado
 *   com explicação quando o Jev reprovou);
 * - que aprovar NÃO publica: um rascunho aprovado continua a falhar a
 *   porta de publicação e a elegibilidade do cron (só agendado +
 *   aprovado sai, e só na sua janela);
 * - que o deploy NÃO ativa posts antigos sem aprovação: agendado antigo
 *   com approved_at NULL nunca é elegível, mesmo vencido; o mesmo post,
 *   depois de aprovação explícita, torna-se elegível (comportamento
 *   correto, documentado);
 * - o gate do dono no servidor (requireOwner 403/503, isOwner) — a
 *   mesma função que o endpoint de aprovação e o endpoint
 *   /api/auth/owner-status usam; esconder o botão nunca substitui isto.
 *
 * O que NÃO é testável sem base de dados (fica para a re-auditoria
 * pós-deploy): o round-trip do endpoint (update approved_by/at), o
 * comportamento do bundle deployado e a renderização React em si
 * (a UI é verificada por build tsc + vite).
 *
 * Correr (após build de shared+api, como os outros testes):
 *   npm run build --workspace=@pink-logic/shared
 *   npm run build --workspace=@pink-logic/api
 *   node --test tests/approval-deploy.test.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSync } from 'esbuild';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { getOwnerUserId, isOwner, requireOwner } from '../packages/api/dist/services/ownership.js';
import { canPublishPost, isCronEligible } from '../packages/api/dist/services/posts.js';

// Transpila a lib pura da UI (TypeScript sem imports) para um .mjs
// importável. Nada de React aqui — só a lógica de estados e do botão.
const OUT = join(tmpdir(), 'pink-logic-post-approval-state.mjs');
buildSync({
  entryPoints: ['packages/web/src/lib/postApprovalState.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: OUT,
  logLevel: 'silent',
});
const {
  getPostApprovalState,
  APPROVAL_STATE_LABELS,
  getApproveButtonState,
} = await import(OUT);

const OWNER = '11111111-1111-1111-1111-111111111111';
const OTHER = '22222222-2222-2222-2222-222222222222';
const NOW = '2026-10-26T10:00:00.000Z';
const PAST = '2026-10-25T09:00:00.000Z';
const FUTURE = '2026-10-27T09:00:00.000Z';

function withOwnerEnv(fn) {
  const prev = process.env.PINK_LOGIC_OWNER_USER_ID;
  process.env.PINK_LOGIC_OWNER_USER_ID = OWNER;
  try { return fn(); } finally {
    if (prev === undefined) delete process.env.PINK_LOGIC_OWNER_USER_ID;
    else process.env.PINK_LOGIC_OWNER_USER_ID = prev;
  }
}

function withoutOwnerEnv(fn) {
  const prev = process.env.PINK_LOGIC_OWNER_USER_ID;
  delete process.env.PINK_LOGIC_OWNER_USER_ID;
  try { return fn(); } finally {
    if (prev !== undefined) process.env.PINK_LOGIC_OWNER_USER_ID = prev;
  }
}

// ─── 1. Os 6 estados, sem sobreposição ──────────────────────────────
test('estados: cada combinação cai num só estado, com a precedência documentada', () => {
  const cases = [
    // [entrada, estado esperado]
    [{ status: 'published', approvedAt: NOW, decision: null }, 'publicado'],
    // Publicado ganha até a decisão reprovada (não acontece via gate, mas a ordem é esta).
    [{ status: 'published', approvedAt: NOW, decision: { passed: false } }, 'publicado'],
    [{ status: 'failed', approvedAt: NOW, decision: null }, 'bloqueado'],
    [{ status: 'cancelled', approvedAt: null, decision: null }, 'bloqueado'],
    [{ status: 'draft', approvedAt: null, decision: { passed: false } }, 'bloqueado'],
    [{ status: 'scheduled', approvedAt: NOW, decision: { passed: false } }, 'bloqueado'],
    [{ status: 'publishing', approvedAt: NOW, decision: null }, 'agendado'],
    [{ status: 'scheduled', approvedAt: NOW, decision: null }, 'agendado'],
    [{ status: 'draft', approvedAt: NOW, decision: null }, 'aprovado'],
    [{ status: 'scheduled', approvedAt: null, decision: null }, 'pendente'],
    [{ status: 'draft', approvedAt: null, decision: null }, 'rascunho'],
    // Estado desconhecido: fail-closed na exibição, nunca como publicável.
    [{ status: 'desconhecido', approvedAt: null, decision: null }, 'bloqueado'],
    [{ status: 'desconhecido', approvedAt: NOW, decision: null }, 'bloqueado'],
  ];
  for (const [input, expected] of cases) {
    assert.equal(getPostApprovalState(input), expected, JSON.stringify(input));
  }
});

test('estados: os 6 rótulos existem e são distintos', () => {
  const labels = Object.values(APPROVAL_STATE_LABELS);
  assert.equal(labels.length, 6);
  assert.equal(new Set(labels).size, 6);
  assert.deepEqual(
    [...labels].sort(),
    ['Agendado', 'Aprovado', 'Bloqueado', 'Pendente de aprovação', 'Publicado', 'Rascunho'].sort(),
  );
});

// ─── 2. Botão de aprovar ─────────────────────────────────────────────
test('botão: só a proprietária vê; desativado com Jev reprovado; escondido no resto', () => {
  const cases = [
    // [entrada, isOwner, estado esperado]
    [{ status: 'draft', approvedAt: null, decision: null }, false, 'hidden'],
    [{ status: 'scheduled', approvedAt: null, decision: null }, false, 'hidden'],
    [{ status: 'draft', approvedAt: null, decision: null }, true, 'enabled'],
    [{ status: 'scheduled', approvedAt: null, decision: null }, true, 'enabled'],
    [{ status: 'draft', approvedAt: null, decision: { passed: false } }, true, 'disabled-jev'],
    [{ status: 'scheduled', approvedAt: null, decision: { passed: false } }, true, 'disabled-jev'],
    [{ status: 'draft', approvedAt: NOW, decision: null }, true, 'hidden'],
    [{ status: 'scheduled', approvedAt: NOW, decision: null }, true, 'hidden'],
    [{ status: 'published', approvedAt: NOW, decision: null }, true, 'hidden'],
    [{ status: 'failed', approvedAt: NOW, decision: null }, true, 'hidden'],
    [{ status: 'cancelled', approvedAt: null, decision: null }, true, 'hidden'],
    [{ status: 'publishing', approvedAt: NOW, decision: null }, true, 'hidden'],
    [{ status: 'desconhecido', approvedAt: null, decision: null }, true, 'hidden'],
  ];
  for (const [input, owner, expected] of cases) {
    assert.equal(getApproveButtonState(input, owner), expected, JSON.stringify(input) + ' owner=' + owner);
  }
});

// ─── 3. Aprovar NÃO publica (tarefa 4) ───────────────────────────────
test('aprovação não publica: rascunho aprovado continua barrado na porta e no cron', () => {
  withOwnerEnv(() => {
    // Porta de publicação: exige agendado — rascunho aprovado falha.
    assert.equal(
      canPublishPost({ user_id: OWNER, status: 'rascunho', approved_at: NOW, decision: null }, OWNER).ok,
      false,
    );
    // Cron: exige agendado — rascunho aprovado não é elegível.
    assert.equal(
      isCronEligible({ user_id: OWNER, status: 'rascunho', approved_at: NOW, scheduled_at: PAST }, OWNER, NOW),
      false,
    );
    // A nuance documentada: agendado + aprovado É elegível (para a janela,
    // não na hora) — e o Jev reprovado barra mesmo aprovado.
    assert.equal(
      canPublishPost({ user_id: OWNER, status: 'agendado', approved_at: NOW, decision: null }, OWNER).ok,
      true,
    );
    assert.equal(
      canPublishPost({ user_id: OWNER, status: 'agendado', approved_at: NOW, decision: { passed: false } }, OWNER).ok,
      false,
    );
  });
});

// ─── 4. Deploy não ativa antigos sem aprovação (tarefa 6) ────────────
test('posts antigos: agendado sem aprovação nunca é elegível, mesmo vencido', () => {
  withOwnerEnv(() => {
    // Caso central: agendado antigo, vencido, approved_at NULL → fora.
    assert.equal(
      isCronEligible({ user_id: OWNER, status: 'agendado', approved_at: null, scheduled_at: PAST }, OWNER, NOW),
      false,
    );
    // O mesmo post, depois de aprovação explícita, torna-se elegível.
    assert.equal(
      isCronEligible({ user_id: OWNER, status: 'agendado', approved_at: NOW, scheduled_at: PAST }, OWNER, NOW),
      true,
    );
    // Não-dono e fora da janela continuam de fora.
    assert.equal(
      isCronEligible({ user_id: OTHER, status: 'agendado', approved_at: NOW, scheduled_at: PAST }, OWNER, NOW),
      false,
    );
    assert.equal(
      isCronEligible({ user_id: OWNER, status: 'agendado', approved_at: NOW, scheduled_at: FUTURE }, OWNER, NOW),
      false,
    );
  });
});

// ─── 5. Gate do dono no servidor ─────────────────────────────────────
test('dono: requireOwner 403 para não-dono e 503 sem env; isOwner só para o dono', () => {
  withOwnerEnv(() => {
    assert.equal(getOwnerUserId(), OWNER);
    assert.equal(isOwner({ kind: 'user', userId: OWNER, email: null }), true);
    assert.equal(isOwner({ kind: 'user', userId: OTHER, email: null }), false);
    assert.equal(isOwner({ kind: 'service' }), true);
    assert.throws(() => requireOwner({ kind: 'user', userId: OTHER, email: null }), (e) => e.status === 403);
    assert.equal(requireOwner({ kind: 'user', userId: OWNER, email: null }), OWNER);
  });
  withoutOwnerEnv(() => {
    assert.equal(getOwnerUserId(), null);
    assert.equal(isOwner({ kind: 'user', userId: OWNER, email: null }), false);
    assert.equal(isOwner({ kind: 'service' }), false);
    assert.throws(() => requireOwner({ kind: 'user', userId: OWNER, email: null }), (e) => e.status === 503);
  });
});
