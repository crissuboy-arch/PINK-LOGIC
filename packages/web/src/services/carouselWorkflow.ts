import type { Slide } from '../contexts/EditorContext';
import type { BrandLike } from './carouselFlow';
import type { GeneratedCopy } from './carouselRadar';
export function validateCopy(copy: GeneratedCopy, expectedCount: number): void {
  if(copy.slides.length !== expectedCount || !copy.caption.trim() || copy.slides.some(s=>!s.title.trim() || !s.body.trim())) throw new Error(`Revê os ${expectedCount} cards e a legenda antes de aprovar.`);
}
export function packSlideDocument(slides: Slide[], brand: BrandLike): Slide[] {
  return structuredClone(slides).map(s=>({...s,elements:s.elements.map(e=>e.type==='image' && e.content===brand.logo ? {...e,content:'pinklogic:brand-logo'} : e)}));
}
export function unpackSlideDocument(value: unknown, brand: BrandLike, expectedCount: number): Slide[] | null {
  if(!Array.isArray(value) || value.length!==expectedCount) return null;
  const slides=structuredClone(value) as Slide[];
  if(slides.some(s=>!s || typeof s.id!=='string' || !s.background || !Array.isArray(s.elements) || s.elements.some(e=>!e || !['text','shape','image'].includes(e.type) || typeof e.content!=='string' || ![e.x,e.y,e.width,e.height].every(Number.isFinite)))) return null;
  return slides.map(s=>({...s,elements:s.elements.map(e=>e.content==='pinklogic:brand-logo' ? {...e,content:brand.logo || ''} : e)}));
}
export function replaceSlideText(slides: Slide[], index: number, patch: {title?:string;body?:string}): Slide[] {
  const original=slides[index]; if(!original) throw new Error('Card não encontrado.');
  const texts=original.elements.filter(e=>e.type==='text').slice().sort((a,b)=>(b.fontSize||0)-(a.fontSize||0));
  const title=texts[0], body=texts[1];
  if(!title || !body) throw new Error('O card não possui campos de texto editáveis.');
  return slides.map((s,i)=>i!==index?s:{...s,reviewStatus:'corrigido',correctedAt:new Date().toISOString(),elements:s.elements.map(e=>e.id===title.id && patch.title!==undefined?{...e,content:patch.title}:e.id===body.id && patch.body!==undefined?{...e,content:patch.body}:e)});
}

/** Bound local logo decoding/storage; preserve original aspect ratio and transparency. */
export async function prepareLogo(data: string): Promise<string> {
  const image=new Image();
  await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(new Error('Imagem de logótipo inválida.'));image.src=data;});
  const ratio=Math.min(1,1024/Math.max(image.naturalWidth,image.naturalHeight));
  const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*ratio));canvas.height=Math.max(1,Math.round(image.naturalHeight*ratio));
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Não foi possível preparar o logótipo.');ctx.drawImage(image,0,0,canvas.width,canvas.height);return canvas.toDataURL('image/png');
}
