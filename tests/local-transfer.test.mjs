import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const {startTransfer,stopTransfer}=require('../packages/desktop/dist/localTransfer.js');
test('QR local: recusa dados inválidos, token obrigatório e download de uso único',async()=>{
 await assert.rejects(()=>startTransfer(new Uint8Array([1,2,3])),/ZIP válido/);
 const payload=new Uint8Array([80,75,3,4,1,2,3]);
 try {
  const transfer=await startTransfer(payload);
  assert.ok(transfer.qrDataUrl.startsWith('data:image/png;base64,'));
  const wrong=new URL(transfer.url);wrong.pathname='/invalid';
  assert.equal((await fetch(wrong)).status,404);
  const response=await fetch(transfer.url);assert.equal(response.status,200);
  assert.deepEqual(new Uint8Array(await response.arrayBuffer()),payload);
  assert.ok(Date.parse(transfer.expiresAt)>Date.now());
  try {const second=await fetch(transfer.url);assert.equal(second.status,404);}catch(error){assert.ok(error instanceof TypeError);}
 } finally {stopTransfer();}
});
