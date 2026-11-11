import { BrowserWindow } from 'electron';
import * as fs from 'node:fs';
import * as path from 'node:path';

export async function runAcceptance(win: BrowserWindow): Promise<void> {
  const out = process.env.PINK_ACCEPTANCE_OUT!;
  fs.mkdirSync(out, { recursive: true });
  const api = (s: string) => win.webContents.executeJavaScript(s);
  const wait = async (expr: string, ms = 30000) => { const start=Date.now(); while(Date.now()-start<ms) { if(await api(expr)) return; await new Promise(r=>setTimeout(r,200)); } throw new Error(`Timeout: ${expr}`); };
  const click = async (text: string) => { await wait(`Array.from(document.querySelectorAll('button')).some(b=>b.textContent.trim()===${JSON.stringify(text)})`); await api(`Array.from(document.querySelectorAll('button')).find(b=>b.textContent.trim()===${JSON.stringify(text)}).click()`); };
  const downloaded: Record<string,string> = {};
  const exportsDone=()=> {const names=fs.readdirSync(out); for(const name of names.filter(n=>n.endsWith('.zip') || n==='pinklogic-cards.pdf')) downloaded[name]='completed'; return names.some(n=>n.endsWith('.zip')) && names.includes('pinklogic-cards.pdf');};
  win.webContents.session.on('will-download', (_e,item) => { const name=item.getFilename(); item.setSavePath(path.join(out,name)); item.once('done',(_event,state)=> {downloaded[name]=state;}); });
  const mode=process.env.PINK_DESKTOP_ACCEPTANCE;
  const report: Record<string,unknown>={phase:mode,startedAt:new Date().toISOString(),paidRequests:0};
  await new Promise(r=>setTimeout(r,1500));
  const setInput = async (selector: string, value: string) => { await api(`(()=>{const x=document.querySelector(${JSON.stringify(selector)});if(!x)throw new Error('Campo não encontrado');Object.getOwnPropertyDescriptor(x.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,'value').set.call(x,${JSON.stringify(value)});x.dispatchEvent(new Event('input',{bubbles:true}));})()`); };
  if(mode==='workflow') {
    await api(`document.querySelector('[data-testid="open-local-workspace"]')?.click(); location.hash='#/criacao/carrossel-fluxo'`);
    await wait(`!!document.querySelector('#interview-name')`);
    for(const [key,value] of Object.entries({name:'Ofensiva Criativa',audience:'Pequenas empresas',tone:'Direto e sem filtro',primaryColor:'#103B78',accentColor:'#D4AF37',slogan:'Marketing sem filtro. Resultados sem desculpa.',cta:'Comenta LINK'})) await setInput('#interview-'+key,value);
    await click('Aplicar entrevista');
    await wait(`document.body.innerText.includes('configurada por entrevista')`);
    if(process.env.PINK_ACCEPTANCE_LOGO) {
      const b64=fs.readFileSync(process.env.PINK_ACCEPTANCE_LOGO).toString('base64');
      await api(`(()=>{const f=new File([Uint8Array.from(atob(${JSON.stringify(b64)}),c=>c.charCodeAt(0))],'ofensiva.png',{type:'image/png'});const dt=new DataTransfer();dt.items.add(f);const x=document.querySelector('input[type="file"]');x.files=dt.files;x.dispatchEvent(new Event('change',{bubbles:true}));})()`);
      await wait(`!!document.querySelector('[data-testid="brand-logo-preview"]')`);
    }
    await click('Guardar no Brand Kit');
    await wait(`document.body.innerText.includes('Brand Kit guardado neste computador')`);
    await click('Continuar para o Radar →');
    await setInput('input[aria-label="Tema do carrossel"]','5 tarefas que a tua empresa pode automatizar com inteligência artificial');
    await click('Gerar 30 pautas (templates locais)');await click('Escolher as 10 com maior pontuação');
    await wait(`document.body.innerText.includes('Seleccionadas: 10/10')`);
    await click('Usar a 1.ª seleccionada como tema →');
    await api(`(()=>{const x=document.querySelector('select[aria-label="Quantidade de cards"]');x.value='7';x.dispatchEvent(new Event('change',{bubbles:true}));})()`);
    await click('Gerar por templates locais — sem API');
    await wait(`document.querySelectorAll('[data-testid^="card-title-"]').length===7`);
    await click('Guardar e atualizar lista');
    const previous=await api(`document.querySelector('[data-testid="card-title-2"]').value`);
    await setInput('[data-testid="card-title-2"]','3. Card revisto individualmente');await click('Guardar e atualizar lista');
    await click('Ver versões guardadas');await wait(`document.querySelector('select[aria-label="Versões do projeto"]').options.length>1`);
    await api(`(()=>{const x=document.querySelector('select[aria-label="Versões do projeto"]');x.value=x.options[1].value;x.dispatchEvent(new Event('change',{bubbles:true}));})()`);
    await wait(`document.querySelector('[data-testid="card-title-2"]')?.value===${JSON.stringify(previous)}`);
    report.versionRecovered=true;
    await setInput('[data-testid="card-title-2"]','3. Card revisto individualmente');
    await click('Continuar para os Slides →');await click('Destaque');
    await wait(`document.querySelectorAll('img[alt^="Prévia da capa"]').length===3`);
    await click('Continuar para a Entrega →');await click('Exportar PDF dos cards');await click('Exportar ZIP de entrega');
    const start=Date.now();while(Date.now()-start<60000 && !exportsDone())await new Promise(r=>setTimeout(r,200));
    if(!exportsDone())throw new Error('Exportação do fluxo completo falhou.');
    report.downloads=downloaded;report.interview=true;report.brandKit=true;report.radarIdeas=30;report.selectedIdeas=10;report.cards=7;report.cover='destaque';
    await click('Guardar projecto agora');
  } else if(mode==='create') {
    await api(`document.querySelector('[data-testid="open-local-workspace"]')?.click(); location.hash='#/criacao/carrossel-fluxo'`);
    await wait(`!!document.querySelector('[data-testid="load-ofensiva-example"]')`);
    await api(`document.querySelector('[data-testid="load-ofensiva-example"]').click()`);
    await wait(`document.body.innerText.includes('Ofensiva Criativa configurada e guardada localmente')`);
    await wait(`Array.from(document.querySelectorAll('input')).some(x=>x.value==='3. Organizar contactos e seguimentos')`);
    await api(`(()=>{const x=Array.from(document.querySelectorAll('input')).find(x=>x.value==='3. Organizar contactos e seguimentos'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(x,'3. Organizar contactos — revisto'); x.dispatchEvent(new Event('input',{bubbles:true}));})()`);
    await click('Guardar e atualizar lista');
    await click('Continuar para os Slides →');
    report.coverOptions=await api(`Array.from(document.querySelectorAll('button')).filter(b=>['Clássica','Destaque','Minimal'].includes(b.textContent.trim())).length`);
    await click('Continuar para a Entrega →');
    await click('Exportar PDF dos cards');
    await click('Exportar ZIP de entrega');
    const started=Date.now(); while(Date.now()-started<60000 && !exportsDone()) await new Promise(r=>setTimeout(r,300));
    if(!exportsDone()) { fs.writeFileSync(path.join(out,'export-error.txt'), await api('document.body.innerText')); fs.writeFileSync(path.join(out,'export-error.png'), (await win.webContents.capturePage()).toPNG()); throw new Error('Exports não concluídos.'); }
    report.downloads=downloaded;
    await click('Enviar ao telemóvel por QR');
    await wait(`!!document.querySelector('img[alt="QR de transferência local"]')`);
    report.qrVisible=true;
    await api(`location.hash='#/sistema/ia'`);
    await wait(`!!document.querySelector('[data-testid="connect-chatgpt"]')`);
    await api(`document.querySelector('[data-testid="connect-chatgpt"]').click()`);
    await wait(`document.body.innerText.includes('Acesso comercial ainda não aprovado')`);
    report.chatGPTApprovalRequired=true;
  } else {
    await api(`location.hash='#/criacao/carrossel-fluxo'`);
    await wait(`Array.from(document.querySelectorAll('select[aria-label="Recuperar projeto"] option')).length>1`);
    await api(`(()=>{const s=document.querySelector('select[aria-label="Recuperar projeto"]');s.value=s.options[1].value;s.dispatchEvent(new Event('change',{bubbles:true}));})()`);
    await wait(`Array.from(document.querySelectorAll('input')).some(x=>x.value==='3. Organizar contactos — revisto' || x.value==='3. Card revisto individualmente')`);
    report.restoredCorrectedCard=true;
    report.brandKitPresent=await api(`Array.from(document.querySelectorAll('select[aria-label="Brand Kits locais"] option')).some(x=>x.textContent==='Ofensiva Criativa')`);
    if(!report.brandKitPresent) throw new Error('Brand Kit não recuperado.');
    if(process.env.PINK_ACCEPTANCE_FULL_FLOW==='1' && mode==='restore') {
      await setInput('[data-testid="card-title-1"]','2. Guardado no fecho imediato');
      report.closeWithoutExplicitSave=true;
    }
    if(mode==='verify-close') {
      await wait(`document.querySelector('[data-testid="card-title-1"]')?.value==='2. Guardado no fecho imediato'`);
      report.closeFlushVerified=true;
    }
  }
  report.renderMode=process.env.PINK_DESKTOP_OFFSCREEN_TEST==='1'?'offscreen Windows':'Windows window';
  report.screenshot=path.join(out,`${mode}.png`); fs.writeFileSync(report.screenshot as string,(await win.webContents.capturePage()).toPNG());
  report.ok=true; fs.writeFileSync(path.join(out,`${mode}.json`),JSON.stringify(report,null,2));
}

