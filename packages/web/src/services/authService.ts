import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export interface UserSession {
  email: string;
  name: string;
  role: string;
  token?: string;
}

const SESSION_KEY = 'pinklogic.auth.session';

class AuthService {
  /**
   * Tenta fazer login via Supabase Auth.
   * Se não estiver configurado ou se falhar pelas credenciais do admin demo local, realiza fallback local.
   */
  async login(emailRaw: string, passwordRaw: string): Promise<{ success: boolean; error?: string }> {
    const email = (emailRaw || '').trim();
    const password = (passwordRaw || '').trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Formato de e-mail inválido.' };
    }

    if (password.length < 6) {
      return { success: false, error: 'A senha deve ter pelo menos 6 caracteres.' };
    }

    // Se o Supabase estiver ativo, tentamos autenticar por ele
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (!error && data.user) {
          const name = data.user.email?.split('@')[0] || 'User';
          const userSession: UserSession = {
            email: data.user.email || email,
            name: name.charAt(0).toUpperCase() + name.slice(1),
            role: 'Premium User',
            token: data.session?.access_token
          };
          localStorage.setItem(SESSION_KEY, JSON.stringify(userSession));
          window.dispatchEvent(new Event('pinklogic:auth-changed'));
          return { success: true };
        }

        // Se o erro for de credenciais incorretas e for a conta admin demo local, 
        // permitimos o desvio/fallback local para facilitar desenvolvimento.
        const isDemoAdmin = email === 'admin@pinklogic.com' && password === 'pinklogic123';
        if (!isDemoAdmin && error) {
          return { success: false, error: error.message || 'Credenciais inválidas.' };
        }
      } catch (e) {
        console.warn('[Supabase Auth] Falha ao contatar servidor de autenticação, usando fallback local.');
      }
    }

    // Fallback Local Provisório (Sempre ativado caso Supabase não esteja ativo ou se for o admin demo)
    if (email === 'admin@pinklogic.com' && password !== 'pinklogic123') {
      return { success: false, error: 'Senha incorreta para a conta de administrador (Senha demo: pinklogic123).' };
    }

    const name = email.split('@')[0];
    const userSession: UserSession = {
      email,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      role: email === 'admin@pinklogic.com' ? 'Administrator' : 'Premium User',
    };

    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(userSession));
      window.dispatchEvent(new Event('pinklogic:auth-changed'));
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Falha ao salvar sessão local.' };
    }
  }

  /**
   * Efetua o logout do usuário (Supabase e local)
   */
  async logout(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('[Supabase Auth] Erro ao efetuar signOut remoto');
      }
    }

    try {
      localStorage.removeItem(SESSION_KEY);
      window.dispatchEvent(new Event('pinklogic:auth-changed'));
    } catch (e) {
      console.warn('Erro ao remover sessão de autenticação local');
    }
  }

  /**
   * Retorna o usuário logado atualmente
   */
  getCurrentUser(): UserSession | null {
    try {
      const data = localStorage.getItem(SESSION_KEY);
      if (!data) return null;
      return JSON.parse(data) as UserSession;
    } catch {
      return null;
    }
  }

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
}

export const authService = new AuthService();
