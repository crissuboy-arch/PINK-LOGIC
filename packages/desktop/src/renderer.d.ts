/**
 * Tipos do renderer para a ponte do preload (window.pinkLogicDesktop).
 * O web ainda NÃO usa esta API — a ligação ao editor (autosave) é Fase 2.
 * Este ficheiro só existe para o TypeScript do renderer a reconhecer quando
 * for usada.
 */
import type { PinkLogicDesktopApi } from './preload';

declare global {
  interface Window {
    pinkLogicDesktop?: PinkLogicDesktopApi;
  }
}

export {};
