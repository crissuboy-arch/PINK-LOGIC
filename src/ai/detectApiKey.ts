export type AIStatus = 'real' | 'mock' | 'offline';

export function detectHasApiKey(): boolean {
  if (typeof window === 'undefined') return false;
  const fromEnv = typeof import.meta !== 'undefined' ? import.meta.env.VITE_OPENAI_API_KEY : '';
  const fromStorage = localStorage.getItem('openai_api_key');
  const key = fromStorage || fromEnv || '';
  return key.length > 10 && key.startsWith('sk-');
}

export function getAIStatus(): AIStatus {
  try {
    if (detectHasApiKey()) return 'real';
    return 'mock';
  } catch {
    return 'offline';
  }
}