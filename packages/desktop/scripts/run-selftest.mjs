/**
 * Self-test do desktop (prova real, não inventada):
 * 1. build do web + build do desktop + cópia do dist-web;
 * 2. arranca o Electron com PINK_DESKTOP_SELFTEST=1 e userData temporário;
 * 3. o main exercita o preload REAL, guarda/carrega um rascunho, tira
 *    screenshot e escreve test-evidence/selftest.json;
 * 4. verifica o JSON do rascunho em disco e o resultado.
 * Corre sob xvfb-run quando disponível (Linux sem ecrã).
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const desktopDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = join(desktopDir, '..', '..');
const evidenceDir = join(desktopDir, 'test-evidence');
const userDataDir = join(evidenceDir, 'user-data');
const selfTestOut = join(evidenceDir, 'selftest.json');

function run(cmd, args, opts = {}) {
  console.log(`$ ${cmd} ${args.join(' ')}`);
  const r = spawnSync(cmd, args, { stdio: 'inherit', cwd: repoRoot, ...opts });
  if (r.error) throw r.error;
  if (r.status !== 0) throw new Error(`Falhou (${r.status}): ${cmd} ${args.join(' ')}`);
  return r;
}

mkdirSync(evidenceDir, { recursive: true });
rmSync(userDataDir, { recursive: true, force: true });

// 1. Builds (VITE_API_URL explícita p/ o desktop apontar p/ a API Vercel).
run('npm', ['run', 'build', '--workspace=@pink-logic/web'], {
  env: { ...process.env, VITE_API_URL: 'https://pink-logic.vercel.app' },
});
run('npm', ['run', 'build', '--workspace=@pink-logic/desktop']);
run('npm', ['run', 'build:web', '--workspace=@pink-logic/desktop']);

// 2. Electron + self-test (xvfb-run se existir; senão tenta directo).
const electronBin = join(repoRoot, 'node_modules', '.bin', 'electron');
const env = {
  ...process.env,
  PINK_DESKTOP_SELFTEST: '1',
  PINK_DESKTOP_SELFTEST_OUT: selfTestOut,
  PINK_DESKTOP_USER_DATA: userDataDir,
  ELECTRON_DISABLE_SECURITY_WARNINGS: '1',
};
const xvfb = spawnSync('which', ['xvfb-run']);
const electronArgs = ['--no-sandbox', '--disable-dev-shm-usage', '.'];
const args = xvfb.status === 0
  ? ['xvfb-run', '-a', electronBin, ...electronArgs]
  : [electronBin, ...electronArgs];
const cmd = xvfb.status === 0 ? args.shift() : args.shift();
console.log(`$ ${cmd} ${args.join(' ')} (cwd=packages/desktop)`);
const el = spawnSync(cmd, args, { stdio: 'inherit', cwd: desktopDir, env, timeout: 120000 });
if (el.error) throw el.error;

// 3. Verificações em disco.
if (!existsSync(selfTestOut)) throw new Error(`Self-test não escreveu ${selfTestOut}`);
const result = JSON.parse(readFileSync(selfTestOut, 'utf8'));
const draftFile = join(userDataDir, 'drafts', 'selftest-projecto.json');
const checks = {
  electronExit0: el.status === 0,
  selftestOk: result.ok === true,
  apiPresent: result.apiPresent === true,
  roundTripOk: result.roundTripOk === true,
  draftFileExists: existsSync(draftFile),
  screenshotBytes: result.screenshotBytes,
};
console.log(JSON.stringify({ checks, result }, null, 2));
const failed = Object.entries(checks).filter(([, v]) => v === false || v === 0);
if (failed.length > 0 || !result.ok) {
  console.error(`SELFTEST DESKTOP: FAIL — ${failed.map(([k]) => k).join(', ')}`);
  process.exit(1);
}
console.log('SELFTEST DESKTOP: PASS');
