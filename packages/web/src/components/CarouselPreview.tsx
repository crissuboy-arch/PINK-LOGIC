import {useEffect,useState} from 'react';
import type {Slide} from '../contexts/EditorContext';
import {renderSlideToBlob} from '../services/carouselRender';
export default function CarouselPreview({slide,label,width=160}:{slide:Slide;label:string;width?:number}) {
  const [result,setResult]=useState<{slide:Slide|null;url:string;error:string}>({slide:null,url:'',error:''});
  useEffect(()=>{let cancelled=false,objectUrl='';
    void renderSlideToBlob(slide,'png').then(blob=>{if(cancelled)return;objectUrl=URL.createObjectURL(blob);setResult({slide,url:objectUrl,error:''});}).catch(()=>{if(!cancelled)setResult({slide,url:'',error:'Pré-visualização indisponível.'});});
    return()=>{cancelled=true;if(objectUrl)URL.revokeObjectURL(objectUrl);};
  },[slide]);
  if(result.slide!==slide) return <span role="status">A preparar prévia…</span>;
  return result.error?<span role="status">{result.error}</span>:<img src={result.url} alt={label} style={{width,maxWidth:'100%',height:'auto',borderRadius:8,display:'block'}}/>;
}
