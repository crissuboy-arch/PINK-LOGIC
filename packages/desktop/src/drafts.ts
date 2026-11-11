import { randomUUID } from 'node:crypto';
/**
 * Rascunhos de projecto guardados como JSON em <userData>/drafts/<id>.json.
 * Lógica pura (fs) para o processo main; o renderer só chega aqui via
 * preload (contextBridge) — nunca com acesso directo a fs.
 */
import * as fs from 'fs';
import * as path from 'path';

export interface DraftMeta {
  id: string;
  title: string;
  updatedAt: string;
}

export interface Draft extends DraftMeta {
  /** Conteúdo livre do projecto/rascunho (o editor decide o formato). */
  data: unknown;
}

export function draftsDir(userDataPath: string): string {
  return path.join(userDataPath, 'drafts');
}

/** Só [a-z0-9-_], para o id nunca escapar da pasta de rascunhos. */
export function sanitizeDraftId(id: string): string {
  const clean = id.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-').replace(/-+/g, '-');
  if (!clean) throw new Error('ID de rascunho inválido.');
  return clean.slice(0, 64);
}

function draftPath(userDataPath: string, id: string): string {
  return path.join(draftsDir(userDataPath), `${sanitizeDraftId(id)}.json`);
}

export function saveDraft(userDataPath: string, draft: Draft): DraftMeta {
  const dir = draftsDir(userDataPath);
  fs.mkdirSync(dir, { recursive: true });
  const meta: DraftMeta = {
    id: sanitizeDraftId(draft.id),
    title: typeof draft.title === 'string' && draft.title.trim() ? draft.title.trim() : 'Sem título',
    updatedAt: new Date().toISOString(),
  };
  const payload: Draft = { ...meta, data: draft.data ?? null };
  const previous=loadDraft(userDataPath,meta.id);
  const comparable=(v: unknown)=>JSON.stringify(v && typeof v==='object' && !Array.isArray(v)?{...v,updatedAt:undefined}:v);
  if(previous && (previous.title!==payload.title || comparable(previous.data)!==comparable(payload.data))) {
    const history=path.join(userDataPath,'draft-versions',meta.id);fs.mkdirSync(history,{recursive:true});
    fs.writeFileSync(path.join(history,`${Date.now()}-${randomUUID()}.json`),JSON.stringify(previous),'utf8');
    const versions=fs.readdirSync(history).filter(n=>n.endsWith('.json')).sort().reverse();
    for(const name of versions.slice(10)) fs.unlinkSync(path.join(history,name));
  }

  // Escrita atómica: ficheiro temporário + rename (não deixar JSON a meio).
  const tmp = `${draftPath(userDataPath, meta.id)}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, JSON.stringify(payload, null, 2), 'utf8');
  fs.renameSync(tmp, draftPath(userDataPath, meta.id));
  return meta;
}

export function loadDraft(userDataPath: string, id: string): Draft | null {
  const file = draftPath(userDataPath, id);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8')) as Draft;
}

export function listDrafts(userDataPath: string): DraftMeta[] {
  const dir = draftsDir(userDataPath);
  if (!fs.existsSync(dir)) return [];
  const out: DraftMeta[] = [];
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith('.json')) continue;
    try {
      const parsed = JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8')) as Draft;
      out.push({ id: parsed.id, title: parsed.title, updatedAt: parsed.updatedAt });
    } catch {
      // Ficheiro corrompido: ignora-o na listagem em vez de rebentar.
    }
  }
  return out.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function deleteDraft(userDataPath: string, id: string): boolean {
  const file = draftPath(userDataPath, id);
  if (!fs.existsSync(file)) return false;
  fs.unlinkSync(file);
  return true;
}

export function listDraftVersions(userDataPath: string, id: string): {id:string;updatedAt:string}[] {
  const dir=path.join(userDataPath,'draft-versions',sanitizeDraftId(id));if(!fs.existsSync(dir))return [];
  return fs.readdirSync(dir).filter(n=>/^\d{13}-[0-9a-f-]{36}\.json$/.test(n)).sort().reverse().map(name=>({id:name.slice(0,-5),updatedAt:(JSON.parse(fs.readFileSync(path.join(dir,name),'utf8')) as Draft).updatedAt}));
}
export function restoreDraftVersion(userDataPath: string, id: string, version: string): DraftMeta {
  if(!/^\d{13}-[0-9a-f-]{36}$/.test(version))throw new Error('Versão inválida.');
  const file=path.join(userDataPath,'draft-versions',sanitizeDraftId(id),version+'.json');
  if(!fs.existsSync(file))throw new Error('Versão não encontrada.');
  const saved=JSON.parse(fs.readFileSync(file,'utf8')) as Draft;
  return saveDraft(userDataPath,{...saved,id:sanitizeDraftId(id)});
}
