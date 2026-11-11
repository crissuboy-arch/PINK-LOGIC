/**
 * Tipos do renderer para a ponte do preload (window.pinkLogicDesktop).
 * Fase 2: o hook useCarouselAutosave usa esta API para guardar/recuperar
 * projectos de carrossel como rascunhos JSON no desktop; no browser o
 * fallback é localStorage (nunca Supabase sem sessão autenticada).
 */
import type { PinkLogicDesktopApi } from './preload';

declare global {
  interface Window {
    pinkLogicDesktop?: PinkLogicDesktopApi;
  }
}

export {};
