import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Verifica se as credenciais do Supabase estão configuradas e são válidas
export const isSupabaseConfigured = 
  supabaseUrl.length > 0 && 
  supabaseAnonKey.length > 0 && 
  supabaseUrl.startsWith('http');

// Cria a instância do Supabase caso esteja configurado
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (isSupabaseConfigured) {
  console.log('[Supabase] Cliente configurado. A conexão será verificada ao carregar os dados.');
} else {
  console.log('[Supabase] Configuração ausente. Salvamento na nuvem indisponível.');
}
