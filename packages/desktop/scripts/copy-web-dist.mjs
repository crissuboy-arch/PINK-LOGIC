/**
 * Copia packages/web/dist → packages/desktop/dist-web para o electron-builder
 * empacotar a SPA. Corre antes do `electron-builder` (script build:web).
 * Usa VITE_API_URL=https://pink-logic.vercel.app por omissão no build do web
 * quando se corre `npm run build:web` a partir daqui? NÃO — o build do web
 * é feito à parte; este script só copia o dist já existente.
 */
import { cpSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const src = join(root, 'packages', 'web', 'dist');
const dest = join(root, 'packages', 'desktop', 'dist-web');

if (!existsSync(src)) {
  console.error(`[desktop] FALTA o dist do web em ${src} — corre primeiro: npm run build --workspace=@pink-logic/web`);
  process.exit(1);
}
cpSync(src, dest, { recursive: true });
console.log(`[desktop] web/dist copiado para packages/desktop/dist-web`);
