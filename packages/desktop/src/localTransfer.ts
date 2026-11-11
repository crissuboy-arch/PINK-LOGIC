import { createServer, type Server } from 'node:http';
import { randomBytes } from 'node:crypto';
import { networkInterfaces } from 'node:os';
import QRCode from 'qrcode';

let active: Server | null = null;
let expiry: ReturnType<typeof setTimeout> | null = null;
export function stopTransfer(): void { active?.close(); active = null; if (expiry) clearTimeout(expiry); expiry = null; }
export async function startTransfer(bytes: Uint8Array): Promise<{ url: string; qrDataUrl: string; expiresAt: string }> {
  if (!(bytes instanceof Uint8Array) || bytes.length < 4 || bytes.length > 50 * 1024 * 1024 || bytes[0] !== 80 || bytes[1] !== 75) throw new Error('Selecione um ZIP válido de até 50 MB.');
  stopTransfer();
  const address = Object.values(networkInterfaces()).flat().find(i => i && i.family === 'IPv4' && !i.internal)?.address;
  if (!address) throw new Error('Ligue o computador e o telemóvel à mesma rede Wi-Fi.');
  const token = randomBytes(32).toString('hex');
  const deadline = Date.now() + 5 * 60_000;
  let used = false;
  const server = createServer((req, res) => {
    res.setHeader('Cache-Control', 'no-store'); res.setHeader('X-Content-Type-Options', 'nosniff');
    if (Date.now() >= deadline || used || req.method !== 'GET' || req.url !== `/${token}`) { res.writeHead(404); res.end(); return; }
    used = true;
    res.writeHead(200, { 'Content-Type': 'application/zip', 'Content-Disposition': 'attachment; filename="pinklogic-carrossel.zip"', 'Content-Length': bytes.length });
    res.end(Buffer.from(bytes)); server.close();
  });
  await new Promise<void>((resolve, reject) => { server.once('error', reject); server.listen(0, '0.0.0.0', () => resolve()); });
  active = server;
  expiry = setTimeout(stopTransfer, 5 * 60_000); expiry.unref();
  const info = server.address(); if (!info || typeof info === 'string') { stopTransfer(); throw new Error('Falha ao iniciar transferência.'); }
  const url = `http://${address}:${info.port}/${token}`;
  return { url, qrDataUrl: await QRCode.toDataURL(url, {width: 280}), expiresAt: new Date(deadline).toISOString() };
}
