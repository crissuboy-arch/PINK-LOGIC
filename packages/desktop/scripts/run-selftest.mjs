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

// 1. Builds (VITE_API_URL explícita p/ o desktop apontar p/ a API Vercel;
// VITE_PINK_DESKTOP_SELFTEST=1 activa SÓ neste bundle a sessão local de
// demonstração do self-test — ver authService; o pack:win normal não a define).
run(process.execPath, [process.env.npm_execpath, 'run', 'build', '--workspace=@pink-logic/web'], {
  env: { ...process.env, VITE_API_URL: 'https://pink-logic.vercel.app', VITE_PINK_DESKTOP_SELFTEST: '1' },
});
run(process.execPath, [process.env.npm_execpath, 'run', 'build', '--workspace=@pink-logic/desktop']);
run(process.execPath, [process.env.npm_execpath, 'run', 'build:web', '--workspace=@pink-logic/desktop']);

// 2. Electron + self-test (xvfb-run se existir; senão tenta directo).
const electronBin = process.platform === 'win32' ? join(repoRoot, 'node_modules', 'electron', 'dist', 'electron.exe') : join(repoRoot, 'node_modules', '.bin', 'electron');
const proofProject = join(repoRoot, '.proof', 'fase3-primeira-prova', 'project.json');
const env = {
  ...process.env,
  PINK_DESKTOP_SELFTEST: '1',
  PINK_DESKTOP_SELFTEST_OUT: selfTestOut,
  PINK_DESKTOP_USER_DATA: userDataDir,
  PINK_DESKTOP_SELFTEST_PROJECT: existsSync(proofProject) ? proofProject : '',
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
  flowVisible: result.flowVisible === true,
  flowDemoBanner: result.flowDemoBanner === true,
  flowAiLink: result.flowAiLink === true,
  iaVisible: result.iaVisible === true,
  aiModeTeste: result.aiModeTeste === true,
  screenshotFlowBytes: result.screenshotFlowBytes,
  screenshotIaBytes: result.screenshotIaBytes,
  projectRoundTripOk: result.projectRoundTripOk === true || result.projectRoundTripOk === null,
  projectDraftFileExists: result.projectRoundTripOk === null ? true : result.projectDraftFileExists === true,
};
console.log(JSON.stringify({ checks, result }, null, 2));
const failed = Object.entries(checks).filter(([, v]) => v === false || v === 0);
if (failed.length > 0 || !result.ok) {
  console.error(`SELFTEST DESKTOP: FAIL — ${failed.map(([k]) => k).join(', ')}`);
  process.exit(1);
}
console.log('SELFTEST DESKTOP: PASS');
