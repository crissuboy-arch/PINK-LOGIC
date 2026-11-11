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
  if(mode==='create') {
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
    await wait(`Array.from(document.querySelectorAll('input')).some(x=>x.value==='3. Organizar contactos — revisto')`);
    report.restoredCorrectedCard=true;
    report.brandKitPresent=await api(`Array.from(document.querySelectorAll('select[aria-label="Brand Kits locais"] option')).some(x=>x.textContent==='Ofensiva Criativa')`);
    if(!report.brandKitPresent) throw new Error('Brand Kit não recuperado.');
  }
  report.screenshot=path.join(out,`${mode}.png`); fs.writeFileSync(report.screenshot as string,(await win.webContents.capturePage()).toPNG());
  report.ok=true; fs.writeFileSync(path.join(out,`${mode}.json`),JSON.stringify(report,null,2));
}

