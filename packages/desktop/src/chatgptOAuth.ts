/** Original Pink Logic OAuth adapter. Never reads Codex state or credentials. */
import { randomBytes, createHash } from 'node:crypto';
import { createServer, type Server } from 'node:http';
import * as fs from 'node:fs';
import * as path from 'node:path';

const ISSUER = 'https://auth.openai.com';
const RESOURCE = 'https://api.openai.com/v1';
export interface ChatGPTStatus {
  connected: boolean; status: string; method: string; reason: string; imageGeneration: boolean;
  sessionOwnedBy: 'Pink Logic'; subscriptionAuthorized: boolean; textGenerationVerified: boolean;
  textRequestAvailable: boolean; lastTextAt: string | null;
}
interface Session { accessToken: string; subject: string; scope: string; expiresAt: number; lastTextAt: string | null; }
interface Config {
  userData: string; clientId?: string; commercialApproved: boolean; callbackPort?: number;
  encryption: { available(): boolean; encrypt(value: string): Buffer; decrypt(value: Buffer): string };
  openBrowser(url: string): Promise<void>;
  fetchFn?: typeof fetch;
  verifyIdentity?: (idToken: string, clientId: string, nonce: string, jwks: string) => Promise<string>;
}
export function hasPlanPermission(scope: string): boolean { return scope.split(/\s+/).includes('chatgpt.tokens.use.direct'); }
export async function completedResponseText(response: Response): Promise<string> {
  if(!response.ok || !response.body) throw new Error(`A geração falhou (HTTP ${response.status}).`);
  const reader=response.body.getReader(), decoder=new TextDecoder(); let buffer='', text='', completed=false;
  try {
    while(true) {
      const part=await reader.read(); buffer+=decoder.decode(part.value,{stream:!part.done});
      let end: number;
      while((end=buffer.indexOf('\n'))>=0) {
        const line=buffer.slice(0,end).trim();buffer=buffer.slice(end+1);
        if(!line.startsWith('data:')) continue;
        const payload=line.slice(5).trim(); if(!payload || payload==='[DONE]') continue;
        const event=JSON.parse(payload);
        if(['response.failed','response.incomplete','error'].includes(event.type)) throw new Error('A geração não foi concluída. Consulte os limites e permissões no ChatGPT.');
        if(event.type==='response.output_text.delta' && typeof event.delta==='string') text+=event.delta;
        if(text.length>100000) throw new Error('Resposta acima do limite do aplicativo.');
        if(event.type==='response.completed') completed=true;
      }
      if(part.done) break;
    }
  } finally { reader.releaseLock(); }
  if(!completed || !text.trim()) throw new Error('Resposta interrompida ou vazia; ligação de geração não verificada.');
  return text;
}
export async function verifySignedIdentity(idToken: string, clientId: string, nonce: string, jwksUri: string, resolver?: import('jose').JWTVerifyGetKey): Promise<string> {
  const jose=await (new Function('return import("jose")')() as Promise<typeof import('jose')>);
  const verified=await jose.jwtVerify(idToken,resolver ?? jose.createRemoteJWKSet(new URL(jwksUri)),{issuer:ISSUER,audience:clientId,algorithms:['RS256']});
  if(verified.payload.nonce!==nonce || typeof verified.payload.sub!=='string' || !verified.payload.sub) throw new Error('A identidade recebida não corresponde ao pedido.');
  return verified.payload.sub;
}
export class PinkChatGPTOAuth {
  private session: Session | null = null;
  private error: string | null = null;
  private server: Server | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private generationBusy = false;
  private readonly file: string;
  private readonly fetchFn: typeof fetch;
  constructor(private readonly config: Config) {
    this.file=path.join(config.userData,'chatgpt-pink-logic.enc');this.fetchFn=config.fetchFn ?? fetch;
  }
  private approved(): boolean { return this.config.commercialApproved && !!this.config.clientId?.trim(); }
  private load(): void {
    if(this.session || !this.config.encryption.available() || !fs.existsSync(this.file)) return;
    const parsed=JSON.parse(this.config.encryption.decrypt(fs.readFileSync(this.file))) as Session;
    if(typeof parsed.accessToken!=='string' || typeof parsed.subject!=='string' || !Number.isFinite(parsed.expiresAt) || typeof parsed.scope!=='string') throw new Error('Sessão própria inválida; volte a ligar o Pink Logic.');
    this.session=parsed;
  }
  private save(session: Session): void {
    if(!this.config.encryption.available()) throw new Error('Armazenamento seguro indisponível.');
    fs.mkdirSync(this.config.userData,{recursive:true});
    const temp=this.file+'.tmp';fs.writeFileSync(temp,this.config.encryption.encrypt(JSON.stringify(session)));fs.renameSync(temp,this.file);this.session=session;
  }
  status(): ChatGPTStatus {
    const state: ChatGPTStatus={connected:false,status:'disconnected',method:'Sign in with ChatGPT — sessão própria',reason:'O Pink Logic não tem sessão própria. Login do Codex não é utilizado.',imageGeneration:false,sessionOwnedBy:'Pink Logic',subscriptionAuthorized:false,textGenerationVerified:false,textRequestAvailable:false,lastTextAt:null};
    if(!this.approved()) return {...state,status:'approval-required',reason:'Acesso comercial ainda não aprovado/configurado. Nenhuma sessão do Codex é utilizada.'};
    if(this.server) return {...state,status:'connecting',reason:'Conclua a autorização no navegador. O callback pertence ao Pink Logic.'};
    try { this.load(); } catch { return {...state,status:'error',reason:'Não foi possível validar a sessão própria; volte a ligar.'}; }
    if(this.error) return {...state,status:'error',reason:this.error};
    if(!this.session) return state;
    if(this.session.expiresAt<=Date.now()) return {...state,status:'reauth-required',reason:'A sessão do Pink Logic expirou. É necessária nova autorização.'};
    const allowed=hasPlanPermission(this.session.scope);
    return {...state,connected:true,status:allowed?'authorized':'identity-only',subscriptionAuthorized:allowed,textRequestAvailable:allowed,lastTextAt:this.session.lastTextAt,textGenerationVerified:!!this.session.lastTextAt,reason:allowed?(this.session.lastTextAt?'Texto real concluído nesta sessão própria.':'Conta autorizada; geração real ainda não verificada.'):'Identidade autenticada sem permissão de uso do plano.'};
  }
  private async discovery(): Promise<Record<string,string>> {
    const response=await this.fetchFn(`${ISSUER}/.well-known/openid-configuration`,{signal:AbortSignal.timeout(15000)});
    if(!response.ok) throw new Error('Não foi possível obter a configuração oficial de autenticação.');
    const d=await response.json() as Record<string,string>;
    if(d.issuer!==ISSUER || ['authorization_endpoint','token_endpoint','jwks_uri'].some(k=>!d[k] || new URL(d[k]).origin!==ISSUER)) throw new Error('Configuração de autenticação rejeitada.');return d;
  }
  async begin(): Promise<ChatGPTStatus> {
    if(!this.approved()) return this.status();
    if(this.server) return this.status();
    if(!this.config.encryption.available()) throw new Error('É necessário armazenamento seguro do Windows para ligar a conta.');
    this.error=null;
    const discovery=await this.discovery(), state=randomBytes(32).toString('base64url'), nonce=randomBytes(32).toString('base64url'), verifier=randomBytes(48).toString('base64url');
    const challenge=createHash('sha256').update(verifier).digest('base64url');
    let redirect=''; let consumed=false;
    const server=createServer((req,res)=> { void (async()=>{
      res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','text/plain; charset=utf-8');
      const u=new URL(req.url || '/',redirect);
      if(req.method!=='GET' || u.pathname!=='/auth/callback' || u.searchParams.get('state')!==state || consumed) {res.writeHead(400);res.end('Callback inválido.');return;}
      consumed=true;
      try {
        if(u.searchParams.has('error')) throw new Error('A autorização do Pink Logic foi recusada.');
        const code=u.searchParams.get('code');if(!code) throw new Error('Autorização incompleta.');
        const token=await this.fetchFn(discovery.token_endpoint,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'authorization_code',client_id:this.config.clientId!,code,code_verifier:verifier,redirect_uri:redirect,resource:RESOURCE}),signal:AbortSignal.timeout(30000)});
        if(!token.ok) throw new Error('A OpenAI não autorizou a sessão própria do Pink Logic.');
        const data=await token.json() as Record<string,unknown>;
        if(typeof data.id_token!=='string' || typeof data.access_token!=='string' || typeof data.scope!=='string' || typeof data.expires_in!=='number' || data.expires_in<=0) throw new Error('A OpenAI devolveu uma autorização incompleta.');
        let subject: string;
        if(this.config.verifyIdentity) subject=await this.config.verifyIdentity(data.id_token,this.config.clientId!,nonce,discovery.jwks_uri);
        else {
          subject=await verifySignedIdentity(data.id_token,this.config.clientId!,nonce,discovery.jwks_uri);
        }
        if(!subject) throw new Error('Identidade vazia rejeitada.');
        this.save({accessToken:data.access_token,subject,scope:data.scope,expiresAt:Date.now()+data.expires_in*1000,lastTextAt:null});
        res.end('Pink Logic: autorização recebida. Volte ao aplicativo. A geração ainda precisa de ser verificada.');
      } catch(e) { this.error=e instanceof Error?e.message:'Falha na autorização.';res.writeHead(400);res.end('Não foi possível autorizar o Pink Logic. Volte ao aplicativo.'); }
      finally { this.cancel(); }
    })().catch(()=>{res.writeHead(500);res.end('Falha no callback.');this.cancel();}); });
    await new Promise<void>((resolve,reject)=>{server.once('error',reject);server.listen(this.config.callbackPort ?? 0,'127.0.0.1',()=>resolve());});
    const address=server.address();if(!address || typeof address==='string') {server.close();throw new Error('Não foi possível abrir callback local.');}
    this.server=server;redirect=`http://127.0.0.1:${address.port}/auth/callback`;
    this.timer=setTimeout(()=>{this.error='A autorização expirou. Tente novamente.';this.cancel();},180000);this.timer.unref();
    const url=new URL(discovery.authorization_endpoint);url.search=new URLSearchParams({client_id:this.config.clientId!,response_type:'code',redirect_uri:redirect,scope:'openid profile email resource.invoke chatgpt.tokens.use.direct',resource:RESOURCE,state,nonce,code_challenge_method:'S256',code_challenge:challenge}).toString();
    try {await this.config.openBrowser(url.href);} catch {this.cancel();throw new Error('Não foi possível abrir o navegador.');}
    return this.status();
  }
  cancel(): void {this.server?.close();this.server=null;if(this.timer) clearTimeout(this.timer);this.timer=null;}
  disconnect(): ChatGPTStatus {this.cancel();this.session=null;this.error=null;if(fs.existsSync(this.file)) fs.unlinkSync(this.file);return this.status();}
  async generateText(input: string, authorizePlanUse: boolean): Promise<{text:string;source:'chatgpt-plan';verified:true}> {
    if(!authorizePlanUse) throw new Error('Autorize explicitamente o consumo dos limites do plano.');
    if(typeof input!=='string' || !input.trim() || input.length>30000) throw new Error('Pedido de texto inválido.');
    if(this.generationBusy) throw new Error('Já existe uma geração em curso.');
    if(!this.status().textRequestAvailable || !this.session) throw new Error('O Pink Logic não tem sessão própria autorizada para gerar texto.');
    this.generationBusy=true;
    try {
      const current=this.session;
      const headers={Authorization:`Bearer ${current.accessToken}`};
      const catalog=await this.fetchFn(`${RESOURCE}/models`,{headers,signal:AbortSignal.timeout(15000)});
      if(!catalog.ok) throw new Error('Não foi possível obter os modelos desta conta.');
      const data=await catalog.json() as {models?:{slug:string;visibility:string}[]};
      const model=data.models?.find(m=>m.visibility==='list')?.slug;if(!model) throw new Error('Nenhum modelo disponível para esta conta.');
      const response=await this.fetchFn(`${RESOURCE}/responses`,{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({model,input:[{role:'user',content:input}],store:false,stream:true}),signal:AbortSignal.timeout(120000)});
      const text=await completedResponseText(response);
      if(this.session!==current) throw new Error('A conta mudou durante a geração.');
      this.save({...current,lastTextAt:new Date().toISOString()});return {text,source:'chatgpt-plan',verified:true};
    } finally {this.generationBusy=false;}
  }
}
