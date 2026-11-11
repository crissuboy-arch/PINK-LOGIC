import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,mkdirSync,readFileSync,readdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
const require=createRequire(import.meta.url);
const {PinkChatGPTOAuth,completedResponseText,hasPlanPermission}=require('../packages/desktop/dist/chatgptOAuth.js');
const root=resolve('packages/desktop/test-evidence');mkdirSync(root,{recursive:true});
const directory=()=>mkdtempSync(join(root,'oauth-contract-'));
const encryption={available:()=>true,encrypt:s=>Buffer.from(Buffer.from(s).toString('base64')),decrypt:b=>Buffer.from(b.toString(),'base64').toString()}; // Test-only storage double; production uses OS safeStorage.
const discovery={issuer:'https://auth.openai.com',authorization_endpoint:'https://auth.openai.com/api/accounts/authorize',token_endpoint:'https://auth.openai.com/api/accounts/oauth/token',jwks_uri:'https://auth.openai.com/.well-known/jwks.json'};
const stream=(events)=>new Response(events.map(e=>'data: '+JSON.stringify(e)+'\n\n').join(''),{headers:{'Content-Type':'text/event-stream'}});
const completed=()=>stream([{type:'response.output_text.delta',delta:'Pink Logic ligado.'},{type:'response.completed'}]);

test('sem aprovação: não abre navegador, não lê Codex e não chama rede ou geração',async()=>{
 let calls=0;const client=new PinkChatGPTOAuth({userData:directory(),commercialApproved:false,clientId:'test-only',encryption,openBrowser:async()=>{calls++;},fetchFn:async()=>{calls++;throw Error('rede proibida');}});
 assert.equal((await client.begin()).status,'approval-required');assert.equal(client.status().connected,false);assert.equal(client.status().sessionOwnedBy,'Pink Logic');
 await assert.rejects(()=>client.generateText('teste',true),/sessão própria/);assert.equal(calls,0);
});
test('permissão exige scope exato, não simples identidade nem nome semelhante',()=>{
 assert.equal(hasPlanPermission('openid email'),false);assert.equal(hasPlanPermission('chatgpt.tokens.use.direct.fake'),false);assert.equal(hasPlanPermission('openid chatgpt.tokens.use.direct'),true);
});
test('SSE: só resposta completa e não vazia verifica geração',async()=>{
 assert.equal(await completedResponseText(completed()),'Pink Logic ligado.');
 await assert.rejects(()=>completedResponseText(stream([{type:'response.output_text.delta',delta:'parcial'}])),/interrompida/);
 await assert.rejects(()=>completedResponseText(stream([{type:'response.completed'}])),/vazia/);
 await assert.rejects(()=>completedResponseText(stream([{type:'response.output_text.delta',delta:'parcial'},{type:'response.failed'}])),/não foi concluída/);
});
test('OAuth próprio: PKCE, callback state, scope, cifra, reinício e inferência separada',async()=>{
 const userData=directory();let auth;let tokenCalls=0;let responseCalls=0;
 const options={userData,clientId:'pink-approved-test-client',commercialApproved:true,encryption,openBrowser:async url=>{auth=new URL(url);},verifyIdentity:async(_token,clientId,nonce)=>{assert.equal(clientId,'pink-approved-test-client');assert.equal(nonce,auth.searchParams.get('nonce'));return 'test-subject';},fetchFn:async(url,init)=>{
  if(url.endsWith('openid-configuration'))return Response.json(discovery);
  if(url.endsWith('/oauth/token')) {tokenCalls++;assert.equal(init.body.get('redirect_uri'),auth.searchParams.get('redirect_uri'));assert.equal(init.body.get('client_id'),'pink-approved-test-client');assert.ok(init.body.get('code_verifier'));return Response.json({id_token:'test-id-token',access_token:'test-access-token',scope:'openid chatgpt.tokens.use.direct',expires_in:3600});}
  if(url.endsWith('/models')) return Response.json({models:[{slug:'test-model',visibility:'list'}]});
  if(url.endsWith('/responses')) {responseCalls++;const body=JSON.parse(init.body);assert.equal(body.store,false);assert.equal(body.stream,true);assert.equal(body.model,'test-model');return completed();}
  throw Error('endpoint não esperado');
 }};
 const client=new PinkChatGPTOAuth(options);
 try {
  assert.equal((await client.begin()).status,'connecting');assert.equal(auth.origin,'https://auth.openai.com');assert.equal(auth.searchParams.get('code_challenge_method'),'S256');
  const bad=new URL(auth.searchParams.get('redirect_uri'));bad.search=new URLSearchParams({code:'test-code',state:'wrong'}).toString();assert.equal((await fetch(bad)).status,400);assert.equal(tokenCalls,0);
  const callback=new URL(auth.searchParams.get('redirect_uri'));callback.search=new URLSearchParams({code:'test-code',state:auth.searchParams.get('state')}).toString();assert.equal((await fetch(callback)).status,200);
  assert.equal(client.status().connected,true);assert.equal(client.status().subscriptionAuthorized,true);assert.equal(client.status().textGenerationVerified,false);assert.equal(client.status().imageGeneration,false);
  await assert.rejects(()=>client.generateText('teste',false),/Autorize explicitamente/);assert.equal(responseCalls,0);
  const result=await client.generateText('teste',true);assert.equal(result.verified,true);assert.equal(client.status().textGenerationVerified,true);
  const file=readFileSync(join(userData,'chatgpt-pink-logic.enc'),'utf8');assert.ok(!file.includes('test-access-token'));
  assert.equal(new PinkChatGPTOAuth(options).status().textGenerationVerified,true);assert.deepEqual(readdirSync(userData),['chatgpt-pink-logic.enc']);
  assert.equal(client.disconnect().connected,false);
 } finally {client.cancel();}
});
test('sem cifra do sistema: recusa antes do navegador e da rede',async()=>{
 let called=false;const client=new PinkChatGPTOAuth({userData:directory(),clientId:'test',commercialApproved:true,encryption:{...encryption,available:()=>false},openBrowser:async()=>{called=true;},fetchFn:async()=>{called=true;return Response.json(discovery);}});
 await assert.rejects(()=>client.begin(),/armazenamento seguro/);assert.equal(called,false);
});

// Real signature verification with a temporary RSA key; no OpenAI requests.
test('identidade: valida assinatura, issuer, audience e nonce antes de criar sessão',async()=>{
 const jose=await import('jose');const {verifySignedIdentity}=require('../packages/desktop/dist/chatgptOAuth.js');
 const {privateKey,publicKey}=await jose.generateKeyPair('RS256');const jwk=await jose.exportJWK(publicKey);jwk.kid='test-key';
 const keys=jose.createLocalJWKSet({keys:[jwk]});
 const token=await new jose.SignJWT({nonce:'expected-nonce'}).setProtectedHeader({alg:'RS256',kid:'test-key'}).setIssuer('https://auth.openai.com').setAudience('pink-client').setSubject('verified-subject').setExpirationTime('5m').sign(privateKey);
 assert.equal(await verifySignedIdentity(token,'pink-client','expected-nonce',discovery.jwks_uri,keys),'verified-subject');
 await assert.rejects(()=>verifySignedIdentity(token,'pink-client','wrong-nonce',discovery.jwks_uri,keys),/identidade/);
 await assert.rejects(()=>verifySignedIdentity(token,'wrong-client','expected-nonce',discovery.jwks_uri,keys));
 const badIssuer=await new jose.SignJWT({nonce:'expected-nonce'}).setProtectedHeader({alg:'RS256',kid:'test-key'}).setIssuer('https://example.invalid').setAudience('pink-client').setSubject('verified-subject').setExpirationTime('5m').sign(privateKey);
 await assert.rejects(()=>verifySignedIdentity(badIssuer,'pink-client','expected-nonce',discovery.jwks_uri,keys));
});
