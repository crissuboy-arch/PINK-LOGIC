// ---------------------------------------------------------------------------
// Autosave do projecto de carrossel (Fase 2, passo o).
//
// Desktop (Electron): guarda o projecto como rascunho JSON atómico via
// window.pinkLogicDesktop (preload) — a ponte já existe desde a Fase 1.
// Browser (sem desktop): fallback honesto para localStorage, com o estado
// a dizer onde guardou. Nenhum dos dois finge guardar no Supabase.
// ---------------------------------------------------------------------------
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CarouselProject } from '../services/carouselFlow';
import { parseProject, serializeProject } from '../services/carouselFlow';

export type AutosaveStatus =
  | 'idle'
  | 'saving'
  | 'saved-desktop'
  | 'saved-browser'
  | 'error';

export interface AutosaveResult {
  status: AutosaveStatus;
  lastSavedAt: string | null;
  error: string | null;
  /** Onde o projecto está guardado: 'desktop' | 'browser' | null. */
  storage: 'desktop' | 'browser' | null;
  saveNow: () => Promise<void>;
  restore: () => Promise<CarouselProject | null>;
}

const BROWSER_KEY_PREFIX = 'pink-logic:carousel-project:';

function hasDesktopApi(): boolean {
  return typeof window !== 'undefined' && typeof window.pinkLogicDesktop !== 'undefined';
}

export function useCarouselAutosave(project: CarouselProject | null, delayMs = 1500): AutosaveResult {
  const [status, setStatus] = useState<AutosaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [storage, setStorage] = useState<'desktop' | 'browser' | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const projectRef = useRef(project);
  useLayoutEffect(() => { projectRef.current = project; }, [project]);

  const saveNow = useCallback(async () => {
    const current = projectRef.current;
    if (!current) return;
    setStatus('saving');
    setError(null);
    try {
      if (hasDesktopApi()) {
        await window.pinkLogicDesktop!.saveDraft({
          id: `carousel-${current.id}`,
          title: current.title || 'Carrossel sem título',
          data: JSON.parse(serializeProject(current)),
        });
        setStorage('desktop');
        setStatus('saved-desktop');
      } else {
        window.localStorage.setItem(BROWSER_KEY_PREFIX + current.id, serializeProject(current));
        setStorage('browser');
        setStatus('saved-browser');
      }
      setLastSavedAt(new Date().toISOString());
    } catch (e) {
      setStatus('error');
      setError(e instanceof Error ? e.message : 'Falha ao guardar o projecto.');
    }
  }, []);

  const restore = useCallback(async (): Promise<CarouselProject | null> => {
    const current = projectRef.current;
    if (!current) return null;
    try {
      if (hasDesktopApi()) {
        const draft = await window.pinkLogicDesktop!.loadDraft(`carousel-${current.id}`);
        if (!draft || !draft.data) return null;
        return parseProject(JSON.stringify(draft.data));
      }
      const raw = window.localStorage.getItem(BROWSER_KEY_PREFIX + current.id);
      return raw ? parseProject(raw) : null;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao recuperar o projecto.');
      return null;
    }
  }, []);

  // The close event waits for the main process to persist the latest state.
  useEffect(() => {
    const flush = (event?: BeforeUnloadEvent) => {
      const current=projectRef.current;if(!current || !window.pinkLogicDesktop?.saveDraftSync) return;
      const result=window.pinkLogicDesktop.saveDraftSync({id:`carousel-${current.id}`,title:current.title,data:JSON.parse(serializeProject(current))});
      if(!result.ok && event) {event.preventDefault();event.returnValue='';setError(result.error || 'Falha ao guardar antes de fechar.');}
    };
    window.addEventListener('beforeunload',flush);
    return () => {window.removeEventListener('beforeunload',flush);flush();};
  }, []);

  // Autosave com debounce a cada mudança do projecto.
  useEffect(() => {
    if (!project) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void saveNow(), delayMs);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [project, delayMs, saveNow]);

  return { status, lastSavedAt, error, storage, saveNow, restore };
}
