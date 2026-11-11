/** OpenAI text adapter: original implementation, no Electron or session dependencies. */
export interface CopyRequest {
  topic: string; architectureId: string; slideCount?: number | 'auto'; brandName: string; tone: string;
  defaultCta: string; pains: string[]; goals: string[]; avoid: string[];
}
export interface BudgetState {
  settings: {mode: string; apiEnabled: boolean; model: string; monthlyCapUsd: number; maxPerCallUsd: number};
  spend: {month: string; spentUsd: number; reservedUsd?: number};
}
export const TEXT_PRICES: Record<string,{input:number;output:number}> = {
  'gpt-4o-mini': {input:0.15,output:0.6}, 'gpt-4o':{input:2.5,output:10},
  'gpt-4.1-mini':{input:0.4,output:1.6}, 'gpt-5.4-mini':{input:0.75,output:4.5},
};
const COUNTS: Record<string,number> = {lista:5,'antes-depois':5,'passo-a-passo':6,historia:5,'mito-verdade':5};
export function copyCount(input: CopyRequest): number {
  if(!COUNTS[input.architectureId]) throw new Error('Arquitetura desconhecida.');
  const count = input.slideCount === undefined || input.slideCount === 'auto' ? COUNTS[input.architectureId] : input.slideCount;
  if(![4,5,6,7,8,10].includes(count)) throw new Error('Quantidade de cards inválida.'); return count;
}
export function parseCopyResponse(data: unknown, count: number): {slides:{title:string;body:string}[];caption:string;hashtags:string[]} {
  if(!data || typeof data!=='object') throw new Error('Copy inválida — nada foi aplicado.');
  const d=data as {slides?:{title:string;body:string}[];caption?:string;hashtags?:string[]};
  if(!Array.isArray(d.slides) || d.slides.length!==count || typeof d.caption!=='string' || !d.caption.trim() || !Array.isArray(d.hashtags) || !d.hashtags.every(h=>typeof h==='string')) throw new Error(`Esperados ${count} cards, legenda e hashtags — nada foi aplicado.`);
  if(d.slides.some(s=>!s || typeof s.title!=='string' || !s.title.trim() || s.title.length>240 || typeof s.body!=='string' || !s.body.trim() || s.body.length>1800)) throw new Error('Cards incompletos ou acima dos limites — nada foi aplicado.');
  return {slides:d.slides.map(s=>({title:s.title.trim(),body:s.body.trim()})),caption:d.caption.trim(),hashtags:d.hashtags};
}
export interface PaidDependencies {
  read(): BudgetState; key(): string | null;
  reserve(amount: number): void; settle(reserved: number, actual: number): void;
  fetch(url: string, init: RequestInit): Promise<Response>;
}
export function createPaidCopyAdapter(deps: PaidDependencies) {
  let busy=false;
  return async (input: CopyRequest) => {
    if(busy) throw new Error('Já existe uma geração paga em curso. Aguarda a conclusão.');
    busy=true;
    try {
      const state=deps.read(), settings=state.settings;
      if(settings.mode!=='api' || settings.apiEnabled!==true) throw new Error('Geração paga desativada. Os templates locais continuam disponíveis.');
      const key=deps.key(); if(!key) throw new Error('Sem chave OpenAI configurada.');
      const price=TEXT_PRICES[settings.model];if(!price) throw new Error('Modelo sem preço configurado; chamada recusada.');
      const count=copyCount(input);
      if(!input.topic?.trim() || !input.brandName?.trim() || ![input.pains,input.goals,input.avoid].every(a=>Array.isArray(a) && a.every(x=>typeof x==='string'))) throw new Error('Contexto inválido.');
      const messages=[{role:settings.model.startsWith('gpt-5')?'developer':'system',content:'Escreve copy original para um carrossel em português. Devolve apenas JSON com slides [{title,body}], caption e hashtags. Não inventes provas, estatísticas ou casos reais.'},{role:'user',content:JSON.stringify({...input,slideCount:count,instruction:`Exatamente ${count} cards: capa, desenvolvimento e fecho com CTA. Limite de 240 caracteres por título e 1800 por corpo.`})}];
      const encoded=JSON.stringify(messages);if(encoded.length>30000) throw new Error('Contexto acima de 30000 caracteres; reduz o pedido.');
      const maxOutput=8192;
      // UTF-8 byte bound + framing, rounded upward; 10% regional uplift included.
      const reservation=Math.ceil(((new TextEncoder().encode(encoded).length+1024)*price.input+maxOutput*price.output)/1e6*1.1*1e6)/1e6;
      const month=new Date().toISOString().slice(0,7);
      const used=state.spend.month===month ? state.spend.spentUsd+(state.spend.reservedUsd||0) : 0;
      if(!Number.isFinite(settings.maxPerCallUsd) || settings.maxPerCallUsd<=0 || !Number.isFinite(settings.monthlyCapUsd) || settings.monthlyCapUsd<=0 || !Number.isFinite(used) || used<0) throw new Error('Limites de custo inválidos.');
      if(reservation>settings.maxPerCallUsd) throw new Error(`Reserva estimada $${reservation.toFixed(4)} acima do máximo por chamada.`);
      if(used+reservation>settings.monthlyCapUsd) throw new Error('Limite mensal atingido, incluindo reservas por confirmar.');
      deps.reserve(reservation);
      // No automatic retries: a timeout may still have incurred provider charges.
      const response=await deps.fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${key}`},body:JSON.stringify({model:settings.model,messages,max_completion_tokens:maxOutput,response_format:{type:'json_object'},store:false})});
      if(!response.ok) throw new Error(`OpenAI respondeu HTTP ${response.status}. A reserva foi mantida até confirmação da cobrança.`);
      const body=await response.json() as {usage?:{prompt_tokens?:number;completion_tokens?:number};choices?:{finish_reason?:string;message?:{content?:string}}[]};
      const usage=body.usage;
      let costUsd=reservation, costEstimated=true;
      if(usage && Number.isFinite(usage.prompt_tokens) && Number.isFinite(usage.completion_tokens) && usage.prompt_tokens!>=0 && usage.completion_tokens!>=0) {
        costUsd=Math.ceil((usage.prompt_tokens!*price.input+usage.completion_tokens!*price.output)/1e6*1.1*1e6)/1e6;
        deps.settle(reservation,costUsd);costEstimated=false;
      }
      if(body.choices?.[0]?.finish_reason==='length') throw new Error('A resposta atingiu o limite de tokens. O consumo informado foi registado; nada foi aplicado.');
      let json: unknown; try {json=JSON.parse(body.choices?.[0]?.message?.content || '');} catch {throw new Error('Formato da copy inválido. O consumo/reserva foi registado; nada foi aplicado.');}
      const copy=parseCopyResponse(json,count);
      return {copy,source:'api' as const,demo:false as const,costUsd,costEstimated};
    } finally {busy=false;}
  };
}
