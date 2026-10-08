import test from 'node:test';
import assert from 'node:assert/strict';
import { publishToInstagram, publishToFacebookPage, publishToPlatforms, metaReady } from '../packages/api/dist/services/meta-graph.js';

function resetEnv() {
  delete process.env.META_PAGE_ACCESS_TOKEN;
  delete process.env.META_PAGE_ID;
  delete process.env.META_INSTAGRAM_ACCOUNT_ID;
}

test('sem META_PAGE_ACCESS_TOKEN, publicar falha claramente (Instagram e Facebook)', async () => {
  resetEnv();
  assert.equal(metaReady(), false);
  const ig = await publishToInstagram({ caption: 'teste', imageUrl: 'https://x/img.png' });
  assert.equal(ig.ok, false);
  assert.match(ig.error, /não configurado/);
  const fb = await publishToFacebookPage({ caption: 'teste' });
  assert.equal(fb.ok, false);
  assert.match(fb.error, /não configurado/);
});

test('Instagram: publica em dois passos (cria o container, depois media_publish)', async () => {
  resetEnv();
  process.env.META_PAGE_ACCESS_TOKEN = 'tok';
  process.env.META_INSTAGRAM_ACCOUNT_ID = 'ig123';
  const calls = [];
  globalThis.fetch = async (url) => {
    calls.push(url.toString());
    if (url.toString().includes('/media_publish')) return new Response(JSON.stringify({ id: 'media_999' }));
    return new Response(JSON.stringify({ id: 'container_1' }));
  };
  const r = await publishToInstagram({ caption: 'Legenda', imageUrl: 'https://x/img.png' });
  assert.equal(r.ok, true);
  assert.equal(r.id, 'media_999');
  assert.equal(calls.length, 2);
  assert.match(calls[0], /ig123\/media\?/);
  assert.match(calls[1], /ig123\/media_publish\?/);
  assert.match(calls[1], /creation_id=container_1/);
});

test('Instagram: sem imagem, recusa antes de chamar a Graph API', async () => {
  resetEnv();
  process.env.META_PAGE_ACCESS_TOKEN = 'tok';
  process.env.META_INSTAGRAM_ACCOUNT_ID = 'ig123';
  let called = false;
  globalThis.fetch = async () => { called = true; return new Response('{}'); };
  const r = await publishToInstagram({ caption: 'sem imagem' });
  assert.equal(r.ok, false);
  assert.match(r.error, /exige uma imagem/);
  assert.equal(called, false);
});

test('Facebook: erro da Graph API vira resultado ok:false, não exceção', async () => {
  resetEnv();
  process.env.META_PAGE_ACCESS_TOKEN = 'tok';
  process.env.META_PAGE_ID = 'page1';
  globalThis.fetch = async () => new Response(JSON.stringify({ error: { message: 'Invalid OAuth access token' } }), { status: 400 });
  const r = await publishToFacebookPage({ caption: 'oi' });
  assert.equal(r.ok, false);
  assert.match(r.error, /Invalid OAuth access token/);
});

test('publishToPlatforms: publica em várias redes e devolve um resultado por nome', async () => {
  resetEnv();
  process.env.META_PAGE_ACCESS_TOKEN = 'tok';
  process.env.META_PAGE_ID = 'page1';
  process.env.META_INSTAGRAM_ACCOUNT_ID = 'ig123';
  globalThis.fetch = async (url) => {
    if (url.toString().includes('/media_publish')) return new Response(JSON.stringify({ id: 'media_1' }));
    if (url.toString().includes('/media')) return new Response(JSON.stringify({ id: 'cont_1' }));
    return new Response(JSON.stringify({ id: 'fb_1' }));
  };
  const results = await publishToPlatforms(['Instagram', 'Facebook', 'LinkedIn'], { caption: 'oi', imageUrl: 'https://x/i.png' });
  assert.equal(results.instagram.ok, true);
  assert.equal(results.facebook.ok, true);
  assert.equal(results.linkedin.ok, false);
  assert.match(results.linkedin.error, /ainda não implementada/);
});
