/**
 * Tipos do renderer para a ponte do preload (window.pinkLogicDesktop).
 * Fase 2: o hook useCarouselAutosave usa esta API para guardar/recuperar
 * projectos de carrossel como rascunhos JSON no desktop; no browser o
 * fallback é localStorage (nunca Supabase sem sessão autenticada).
 * Fase 3: a ponte inclui ainda a ligação de IA — o renderer nunca recebe
 * a chave; o main guarda-a cifrada (safeStorage) e faz as chamadas à API.
 */
import type { PinkLogicDesktopApi } from './preload';

declare global {
  interface Window {
    pinkLogicDesktop?: PinkLogicDesktopApi;
  }
}

export {};
