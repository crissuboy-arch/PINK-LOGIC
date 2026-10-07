import type { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export interface UserSession {
  email: string;
  name: string;
  role: string;
  token?: string;
}

type AuthResult = { success: boolean; error?: string };

const SESSION_KEY = 'pinklogic.auth.session';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Sessão local só em desenvolvimento e sem Supabase configurado. Em produção, login é sempre Supabase Auth.
const devLocalAuth = import.meta.env.DEV && !isSupabaseConfigured;

/** Traduz as mensagens do Supabase Auth mais comuns para PT. */
function translateAuthError(message?: string): string {
  const m = (message || '').toLowerCase();
  if (m.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (m.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar (veja sua caixa de entrada).';
  if (m.includes('already registered')) return 'Já existe uma conta com este e-mail.';
  if (m.includes('rate limit') || m.includes('too many')) return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
  if (m.includes('password')) return 'Senha inválida: use pelo menos 6 caracteres.';
  return message || 'Não foi possível concluir. Tente novamente.';
}

function displayName(session: Session): string {
  const meta = session.user.user_metadata || {};
  const raw = (meta.name as string) || session.user.email?.split('@')[0] || 'Usuário';
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

class AuthService {
  constructor() {
    // Mantém o cache local (nome/e-mail no header) em sincronia com a sessão real do Supabase.
    supabase?.auth.onAuthStateChange((_event, session) => this.cacheSession(session));
  }

  private cacheSession(session: Session | null) {
    try {
      if (session) {
        const userSession: UserSession = {
          email: session.user.email || '',
          name: displayName(session),
          role: 'Premium User',
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(userSession));
      } else {
        localStorage.removeItem(SESSION_KEY);
      }
    } catch {
      /* storage indisponível */
    }
    window.dispatchEvent(new Event('pinklogic:auth-changed'));
  }

  private validate(email: string, password: string): string | null {
    if (!EMAIL_RE.test(email)) return 'Formato de e-mail inválido.';
    if (password.length < 6) return 'A senha deve ter pelo menos 6 caracteres.';
    return null;
  }

  async login(emailRaw: string, passwordRaw: string): Promise<AuthResult> {
    const email = (emailRaw || '').trim();
    const password = passwordRaw || '';
    const invalid = this.validate(email, password);
    if (invalid) return { success: false, error: invalid };

    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.session) return { success: false, error: translateAuthError(error?.message) };
      this.cacheSession(data.session);
      return { success: true };
    }

    if (devLocalAuth) {
      const name = email.split('@')[0];
      localStorage.setItem(SESSION_KEY, JSON.stringify({ email, name, role: 'Dev Local' }));
      window.dispatchEvent(new Event('pinklogic:auth-changed'));
      return { success: true };
    }

    return { success: false, error: 'Login indisponível: autenticação não configurada.' };
  }

  /** Cria conta. Se o projeto exigir confirmação de e-mail, needsConfirmation = true. */
  async signUp(nameRaw: string, emailRaw: string, passwordRaw: string): Promise<AuthResult & { needsConfirmation?: boolean }> {
    const name = (nameRaw || '').trim();
    const email = (emailRaw || '').trim();
    const password = passwordRaw || '';
    const invalid = this.validate(email, password);
    if (invalid) return { success: false, error: invalid };
    if (!supabase) return { success: false, error: 'Cadastro indisponível: autenticação não configurada.' };

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name }, emailRedirectTo: `${window.location.origin}/login` },
    });
    if (error) return { success: false, error: translateAuthError(error.message) };
    if (data.session) {
      this.cacheSession(data.session);
      return { success: true };
    }
    return { success: true, needsConfirmation: true };
  }

  async requestPasswordReset(emailRaw: string): Promise<AuthResult> {
    const email = (emailRaw || '').trim();
    if (!EMAIL_RE.test(email)) return { success: false, error: 'Formato de e-mail inválido.' };
    if (!supabase) return { success: false, error: 'Recuperação indisponível: autenticação não configurada.' };
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    return error ? { success: false, error: translateAuthError(error.message) } : { success: true };
  }

  /** Define a nova senha (sessão de recuperação aberta pelo link do e-mail). */
  async updatePassword(password: string): Promise<AuthResult> {
    if (password.length < 6) return { success: false, error: 'A senha deve ter pelo menos 6 caracteres.' };
    if (!supabase) return { success: false, error: 'Autenticação não configurada.' };
    const { error } = await supabase.auth.updateUser({ password });
    return error ? { success: false, error: translateAuthError(error.message) } : { success: true };
  }

  async logout(): Promise<void> {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        console.warn('[Supabase Auth] Erro ao efetuar signOut remoto');
      }
    }
    this.cacheSession(null);
  }

  /** Confirma a sessão real (Supabase) e atualiza o cache. Devolve se há sessão válida. */
  async syncSession(): Promise<boolean> {
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      const hadCache = this.isAuthenticated();
      if (data.session || hadCache) this.cacheSession(data.session);
      return !!data.session;
    }
    return devLocalAuth && this.isAuthenticated();
  }

  /** Token de acesso atual (renovado automaticamente pelo Supabase) para chamar a API. */
  async getAccessToken(): Promise<string | null> {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }

  getCurrentUser(): UserSession | null {
    try {
      const data = localStorage.getItem(SESSION_KEY);
      if (!data) return null;
      return JSON.parse(data) as UserSession;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
}

export const authService = new AuthService();
