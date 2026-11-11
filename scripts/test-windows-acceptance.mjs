import {spawnSync} from 'node:child_process';
import {mkdirSync,readFileSync,existsSync} from 'node:fs';
import {join,dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const desktop=join(root,'packages','desktop');
const runId=new Date().toISOString().replace(/[:.]/g,'-');
const out=join(root,'.proof',`windows-acceptance-${runId}`);
const profile=join(desktop,'test-evidence',`acceptance-${runId}`);
mkdirSync(out,{recursive:true});
const executable=process.env.PINK_ACCEPTANCE_EXECUTABLE || join(root,'node_modules','electron','dist','electron.exe');
if(!existsSync(executable)) throw new Error('Compile/instale Electron antes do teste.');
for(const phase of (process.env.PINK_ACCEPTANCE_FULL_FLOW==='1'?['workflow','restore','verify-close']:['create','restore'])) {
 const env={...process.env,PINK_DESKTOP_ACCEPTANCE:phase,PINK_ACCEPTANCE_OUT:out,PINK_DESKTOP_USER_DATA:profile,PINK_DESKTOP_OFFSCREEN_TEST:process.env.PINK_ACCEPTANCE_OFFSCREEN || '0',PINK_ACCEPTANCE_LOGO:join(root,'packages','web','src','assets','ofensiva-criativa-logo.png')};
 delete env.ELECTRON_RUN_AS_NODE;
 const result=spawnSync(executable,process.env.PINK_ACCEPTANCE_EXECUTABLE?[]:['.'],{cwd:desktop,env,windowsHide:true,stdio:'inherit',timeout:180000});
 if(result.error) throw result.error;
 if(result.status!==0) throw new Error(`Aceitação ${phase}: exit ${result.status}. Provas: ${out}`);
 const report=JSON.parse(readFileSync(join(out,`${phase}.json`),'utf8'));
 if(report.ok!==true) throw new Error(`Aceitação ${phase}: relatório não aprovado.`);
 console.log(JSON.stringify(report));
}
console.log(`PROVA WINDOWS: ${out}`);
