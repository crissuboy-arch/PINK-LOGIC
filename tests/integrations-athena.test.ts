/**
 * tests/integrations-athena.test.ts — Integração Pink Logic ↔ Athena Control
 *
 * - health: público, contrato v1, sem segredos.
 * - stats: autenticação (401/503), respostas com agregados reais,
 *   indicadores inexistentes a null (nunca inventados), zero PII.
 */
import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import healthHandler from "../api-src/_handlers/integrations/health.ts";
import {
  createHandler,
  collectStats,
  bearerMatches,
  API_KEY_ENV,
} from "../api-src/_handlers/integrations/stats.ts";

// ── fakes ──────────────────────────────────────────────────────────────
function fakeReq(method = "GET", headers: Record<string, string> = {}): any {
  return { method, headers };
}
function fakeRes(): any {
  const r: any = { statusCode: 0, body: null };
  r.status = (c: number) => ((r.statusCode = c), r);
  r.json = (b: any) => ((r.body = b), r);
  return r;
}

/** Cliente Supabase falso: 3 users, 6 posts (2 PUBLISHED, 1 FAILED, ...). */
function fakeSupabase() {
  const statuses = ["PUBLISHED", "PUBLISHED", "FAILED", "SCHEDULED", "DRAFT", "PENDING_REVIEW"];
  return {
    auth: {
      admin: {
        listUsers: async ({ page }: any) =>
          page === 1
            ? { data: { users: [{ id: "u1" }, { id: "u2" }, { id: "u3" }] }, error: null }
            : { data: { users: [] }, error: null },
      },
    },
    from: (_t: string) => ({
      select: (_c: string, _o: any) => ({
        eq: async (_k: string, s: string) => ({
          count: statuses.filter((x) => x === s).length,
          error: null,
        }),
      }),
    }),
  };
}

const GOOD_ENV = {
  [API_KEY_ENV]: "CHAVE-TESTE-123",
  SUPABASE_URL: "https://x.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "SRV",
};
const handler = (env: any, client: any = fakeSupabase()) =>
  createHandler({ env, makeClient: (_u: string, _k: string) => client });

// ── health ─────────────────────────────────────────────────────────────
describe("GET /api/integrations/health", () => {
  it("responde 200 com a identidade da plataforma (sem auth)", async () => {
    const res = fakeRes();
    await healthHandler(fakeReq(), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.platform, "PinkLogic");
    assert.equal(res.body.status, "operational");
    assert.equal(res.body.contract, "v1");
    assert.ok(Array.isArray(res.body.capabilities));
    assert.ok(res.body.capabilities.includes("integrations:stats"));
  });

  it("não expõe segredos nem dados de clientes", async () => {
    const res = fakeRes();
    await healthHandler(fakeReq(), res);
    const raw = JSON.stringify(res.body).toLowerCase();
    assert.ok(!raw.includes("key") || raw.includes("capabilities"));
    assert.ok(!raw.includes("secret"));
    assert.ok(!raw.includes("supabase"));
  });
});

// ── stats: autenticação/autorização ─────────────────────────────────────
describe("GET /api/integrations/stats — auth", () => {
  it("401 sem Authorization", async () => {
    const res = fakeRes();
    await handler(GOOD_ENV)(fakeReq(), res);
    assert.equal(res.statusCode, 401);
  });

  it("401 com chave errada", async () => {
    const res = fakeRes();
    await handler(GOOD_ENV)(fakeReq("GET", { authorization: "Bearer ERRADA" }), res);
    assert.equal(res.statusCode, 401);
  });

  it("401 com header malformado", async () => {
    const res = fakeRes();
    await handler(GOOD_ENV)(fakeReq("GET", { authorization: "CHAVE-TESTE-123" }), res);
    assert.equal(res.statusCode, 401);
  });

  it("503 se a chave não está configurada (sem vazar nada)", async () => {
    const res = fakeRes();
    await handler({})(fakeReq("GET", { authorization: "Bearer x" }), res);
    assert.equal(res.statusCode, 503);
  });

  it("200 com a chave correta", async () => {
    const res = fakeRes();
    await handler(GOOD_ENV)(fakeReq("GET", { authorization: "Bearer CHAVE-TESTE-123" }), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.platform, "PinkLogic");
    assert.equal(res.body.contract, "v1");
  });

  it("usa VITE_SUPABASE_URL quando SUPABASE_URL não existe (fallback)", async () => {
    const res = fakeRes();
    let usedUrl = "";
    const h = createHandler({
      env: {
        [API_KEY_ENV]: "CHAVE-TESTE-123",
        VITE_SUPABASE_URL: "https://x.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY: "SRV",
      },
      makeClient: (u: string, _k: string) => { usedUrl = u; return fakeSupabase(); },
    });
    await h(fakeReq("GET", { authorization: "Bearer CHAVE-TESTE-123" }), res);
    assert.equal(res.statusCode, 200);
    assert.equal(usedUrl, "https://x.supabase.co");
  });

  it("ignora SUPABASE_URL malformada e usa o fallback VITE_", async () => {
    const res = fakeRes();
    let usedUrl = "";
    const h = createHandler({
      env: {
        [API_KEY_ENV]: "CHAVE-TESTE-123",
        SUPABASE_URL: "tpzzlyhcdfyjnxptbckl.supabase.co",
        VITE_SUPABASE_URL: "https://x.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY: "SRV",
      },
      makeClient: (u: string, _k: string) => { usedUrl = u; return fakeSupabase(); },
    });
    await h(fakeReq("GET", { authorization: "Bearer CHAVE-TESTE-123" }), res);
    assert.equal(res.statusCode, 200);
    assert.equal(usedUrl, "https://x.supabase.co");
  });

  it("503 sem service key (VITE_ sozinho não basta)", async () => {
    const res = fakeRes();
    const h = createHandler({
      env: { [API_KEY_ENV]: "CHAVE-TESTE-123", VITE_SUPABASE_URL: "https://x.supabase.co" },
      makeClient: (_u: string, _k: string) => fakeSupabase(),
    });
    await h(fakeReq("GET", { authorization: "Bearer CHAVE-TESTE-123" }), res);
    assert.equal(res.statusCode, 503);
    assert.equal(res.body.error, "Banco de dados não configurado.");
  });

  it("405 para método diferente de GET", async () => {
    const res = fakeRes();
    await handler(GOOD_ENV)(fakeReq("POST", { authorization: "Bearer CHAVE-TESTE-123" }), res);
    assert.equal(res.statusCode, 405);
  });

  it("bearerMatches: comparação exata, sem timing leak óbvio", () => {
    assert.equal(bearerMatches("Bearer CHAVE-TESTE-123", "CHAVE-TESTE-123"), true);
    assert.equal(bearerMatches("Bearer errada", "CHAVE-TESTE-123"), false);
    assert.equal(bearerMatches(undefined, "CHAVE-TESTE-123"), false);
    assert.equal(bearerMatches("Bearer x", ""), false);
  });
});

// ── stats: dados ───────────────────────────────────────────────────────
describe("GET /api/integrations/stats — dados", () => {
  it("devolve agregados reais (contagens corretas)", async () => {
    const stats = await collectStats(fakeSupabase());
    assert.equal(stats.users?.total, 3);
    assert.equal(stats.posts?.total, 6);
    assert.equal(stats.posts?.published, 2);
    assert.equal(stats.posts?.failed, 1);
    assert.equal(stats.posts?.scheduled, 1);
    assert.equal(stats.posts?.draft, 1);
    assert.equal(stats.posts?.pending_review, 1);
    assert.equal(stats.errors?.failed_posts, 1);
  });

  it("indicadores sem tabela vêm a null e listados em unavailable (não inventados)", async () => {
    const stats = await collectStats(fakeSupabase());
    assert.equal(stats.subscriptions, null);
    assert.equal(stats.ai_usage, null);
    assert.ok(stats.unavailable.includes("subscriptions"));
    assert.ok(stats.unavailable.includes("ai_usage"));
  });

  it("zero PII na resposta", async () => {
    const res = fakeRes();
    await handler(GOOD_ENV)(fakeReq("GET", { authorization: "Bearer CHAVE-TESTE-123" }), res);
    const raw = JSON.stringify(res.body);
    for (const pii of ["u1", "caption", "last_error", "@", "email"]) {
      assert.ok(!raw.includes(pii), `PII vazado: ${pii}`);
    }
  });

  it("resposta nunca contém a chave", async () => {
    const res = fakeRes();
    await handler(GOOD_ENV)(fakeReq("GET", { authorization: "Bearer CHAVE-TESTE-123" }), res);
    assert.ok(!JSON.stringify(res.body).includes("CHAVE-TESTE-123"));
  });

  it("falha do banco → null gracioso, sem inventar", async () => {
    const broken = {
      auth: { admin: { listUsers: async () => ({ data: null, error: { message: "x" } }) } },
      from: () => ({ select: () => ({ eq: async () => ({ count: null, error: { message: "x" } }) }) }),
    };
    const stats = await collectStats(broken);
    assert.equal(stats.users, null);
    assert.equal(stats.posts, null);
  });
});
