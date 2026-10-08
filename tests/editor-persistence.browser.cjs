// Run against Vite with VITE_SUPABASE_URL=https://pink-test.supabase.co
// and VITE_SUPABASE_ANON_KEY=sb_publishable_test. Network fixtures only;
// actual database/RLS is covered independently by persistence-rls.sql.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
let server;
process.on('exit', () => server?.kill());
(async () => {
  if (process.env.PINK_TEST_START_SERVER) {
    server = spawn(process.execPath, ['packages/web/node_modules/vite/bin/vite.js', 'packages/web', '--host', '127.0.0.1', '--port', '4173', '--strictPort'], {
      env: { ...process.env, VITE_SUPABASE_URL: 'https://pink-test.supabase.co', VITE_SUPABASE_ANON_KEY: 'sb_publishable_test' }, stdio: ['ignore', 'pipe', 'pipe'],
    });
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Vite startup timeout')), 15000);
      server.stdout.on('data', chunk => { if (chunk.toString().includes('127.0.0.1:4173')) { clearTimeout(timeout); resolve(); } });
      server.stderr.on('data', chunk => process.stderr.write(chunk));
      server.on('exit', code => reject(new Error('Vite exited '+code)));
    });
  }
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE, headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ locale: 'pt-BR', viewport: { width: 1440, height: 1000 } });
  const owner = '10000000-0000-4000-8000-000000000001';
  const user = { id: owner, email: 'test@example.invalid', role: 'authenticated', user_metadata: { name: 'Teste' } };
  await context.addInitScript(({ user }) => {
    localStorage.setItem('sb-pink-test-auth-token', JSON.stringify({ access_token: 'test-token', refresh_token: 'test-refresh', token_type: 'bearer', expires_at: Math.floor(Date.now()/1000)+3600, expires_in: 3600, user }));
    localStorage.setItem('pinklogic.auth.session', JSON.stringify({ email: user.email, name: 'Teste', role: 'Premium User' }));
  }, { user });
  const tables = { projects: [], brands: [], campaigns: [], products: [], checklist_items: [], scheduled_posts: [] };
  const documents = new Map();
  let failSave = false;
  await context.route('https://pink-test.supabase.co/**', async route => {
    const request = route.request(), url = new URL(request.url());
    const respond = (body, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
    if (url.pathname.startsWith('/auth/')) return respond(user);
    if (url.pathname.endsWith('/rpc/pl_save_editor_document')) {
      const body = request.postDataJSON();
      if (failSave) return respond({ message: 'Falha de teste: rede indisponível', code: 'test_error' }, 503);
      const previous = documents.get(body.p_project_id);
      if ((previous?.version || 0) !== body.p_expected_version) return respond({ message: 'Conflito de versão', code: '40001' }, 409);
      const version = body.p_expected_version + 1;
      documents.set(body.p_project_id, { document: body.p_document, version });
      return respond(version);
    }
    const table = url.pathname.split('/').pop();
    if (table === 'pl_editor_documents') {
      const id = url.searchParams.get('project_id')?.replace('eq.', '');
      return respond(documents.get(id) || null);
    }
    if (!(table in tables)) throw new Error('Unexpected request: '+url);
    if (request.method() === 'POST') {
      const body = request.postDataJSON();
      for (const row of (Array.isArray(body) ? body : [body])) {
        const index = tables[table].findIndex(item => item.id === row.id);
        if (index < 0) tables[table].push(row); else tables[table][index] = row;
      }
      return respond(null, 201);
    }
    if (request.method() === 'DELETE') {
      const id = url.searchParams.get('id')?.replace('eq.', '');
      tables[table] = tables[table].filter(item => item.id !== id);
      if (table === 'projects') documents.delete(id);
      return respond([{ id }]);
    }
    if (url.searchParams.has('id')) return respond(tables[table].find(item => item.id === url.searchParams.get('id').replace('eq.', '')) || null);
    return respond(tables[table]);
  });
  const page = await context.newPage();
  const errors = []; page.on('pageerror', err => errors.push(err.message));
  page.on('console', message => { if (message.text().includes('Maximum update depth')) errors.push(message.text()); });
  await page.goto('http://127.0.0.1:4173/criacao/carrossel');
  await page.getByText('Rascunho para revisão — legenda e hashtags', { exact: true }).click();
  await page.getByLabel('Legenda do carrossel').fill('Legenda que precisa sobreviver à recarga. #teste');
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();
  await page.getByText('Design e legenda salvos na sua conta.', { exact: true }).waitFor();
  const id = new URL(page.url()).searchParams.get('id');
  assert.ok(id); assert.equal(tables.projects[0].id, id); assert.ok(documents.has(id));
  assert.equal(documents.get(id).document.canvasFormat.id, 'carousel');
  await page.reload();
  await page.getByText('Rascunho para revisão — legenda e hashtags', { exact: true }).click();
  await page.getByLabel('Legenda do carrossel').waitFor();
  assert.equal(await page.getByLabel('Legenda do carrossel').inputValue(), 'Legenda que precisa sobreviver à recarga. #teste');
  failSave = true;
  await page.getByLabel('Legenda do carrossel').fill('Conteúdo preservado após erro');
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();
  await page.getByRole('alert').filter({ hasText: 'Falha de teste' }).waitFor();
  assert.equal(await page.getByLabel('Legenda do carrossel').inputValue(), 'Conteúdo preservado após erro');
  assert.equal(documents.get(id).version, 1);
  failSave = false;
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();
  await page.getByText('Design e legenda salvos na sua conta.', { exact: true }).waitFor();
  assert.equal(documents.get(id).version, 2);
  // A second tab increments the server version; the old tab must not overwrite it.
  documents.get(id).version = 3;
  await page.getByLabel('Legenda do carrossel').fill('Alteração da aba antiga');
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();
  await page.getByRole('alert').filter({ hasText: 'Conflito de versão' }).waitFor();
  assert.equal(documents.get(id).document.caption, 'Conteúdo preservado após erro');
  await page.screenshot({ path: '/tmp/pink-editor-persistence.png', fullPage: true });
  await page.goto('http://127.0.0.1:4173/biblioteca');
  await page.locator('.project-card').first().waitFor();
  await page.locator('.dropdown').first().hover();
  await page.getByRole('button', { name: 'Duplicar', exact: true }).first().click();
  await page.waitForFunction(() => document.querySelectorAll('.project-card').length === 2);
  assert.equal(documents.size, 2);
  const copied = tables.projects.find(project => project.id !== id);
  assert.deepEqual(documents.get(copied.id).document, documents.get(id).document);
  page.on('dialog', dialog => dialog.accept());
  await page.locator('.dropdown').last().hover();
  await page.getByRole('button', { name: 'Excluir', exact: true }).last().click();
  await page.waitForFunction(() => document.querySelectorAll('.project-card').length === 1);
  assert.equal(tables.projects.length, 1);
  assert.equal(documents.size, 1);
  assert.deepEqual(errors, []);
  await browser.close();
  server?.kill();
  console.log('PASS browser: stable project ID, save/reload slides and caption, failed save preserves edits, retry, concurrent-tab conflict, library duplication and deletion. Network mocked.');
})().catch(error => { console.error(error); process.exit(1); });
