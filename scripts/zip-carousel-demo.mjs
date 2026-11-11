// Monta e verifica o ZIP de exportação da demo (mesma lista de ficheiros
// que o handleExportZip do Editor produz: slide-N.png + slide-N.jpg + caption.txt).
// Correr: node scripts/zip-carousel-demo.mjs
// Usa a JSZip do repo (dependência real do workspace web).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import JSZip from 'jszip';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const demo = join(root, '.proof', 'fase1-motor', 'demo-ofensiva');
const exp = join(demo, 'exports');
const zipPath = join(demo, 'carousel-ofensiva-demo.zip');

const zip = new JSZip();
for (let i = 1; i <= 5; i++) {
  zip.file(`slide-${i}.png`, readFileSync(join(exp, `slide-${i}.png`)));
  zip.file(`slide-${i}.jpg`, readFileSync(join(exp, `slide-${i}.jpg`)));
}
zip.file('caption.txt', readFileSync(join(demo, 'caption.txt')));
const buffer = await zip.generateAsync({ type: 'nodebuffer' });
writeFileSync(zipPath, buffer);

// Verificação: reler o ZIP e confirmar nomes, magia de ficheiro e legenda.
const loaded = await JSZip.loadAsync(buffer);
const names = Object.keys(loaded.files).sort();
const expected = [
  'caption.txt',
  ...Array.from({ length: 5 }, (_, i) => `slide-${i + 1}.jpg`),
  ...Array.from({ length: 5 }, (_, i) => `slide-${i + 1}.png`),
].sort();
assert.deepEqual(names, expected, `ficheiros no ZIP: ${names.join(', ')}`);
for (let i = 1; i <= 5; i++) {
  const png = await loaded.file(`slide-${i}.png`).async('nodebuffer');
  assert.ok(png.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), `slide-${i}.png sem assinatura PNG`);
  assert.equal(png.readUInt32BE(16), 1080, `slide-${i}.png largura`);
  assert.equal(png.readUInt32BE(20), 1350, `slide-${i}.png altura`);
  const jpg = await loaded.file(`slide-${i}.jpg`).async('nodebuffer');
  assert.ok(jpg.subarray(0, 2).equals(Buffer.from([0xff, 0xd8])), `slide-${i}.jpg sem assinatura JPEG`);
}
const caption = await loaded.file('caption.txt').async('string');
assert.ok(caption.includes('#OfensivaCriativa'), 'caption.txt sem hashtags');
assert.ok(caption.includes('sem IA'), 'caption.txt sem aviso de demonstração');
assert.equal(caption, readFileSync(join(demo, 'caption.txt'), 'utf-8'), 'caption.txt no ZIP difere do ficheiro');
console.log(`ZIP OK: ${zipPath} (${buffer.length} bytes)`);
console.log(`ficheiros: ${names.join(', ')}`);
