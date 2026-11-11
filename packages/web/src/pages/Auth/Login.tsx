import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Sparkles, Eye, EyeOff, User, UserPlus, KeyRound } from 'lucide-react';
import { authService } from '../../services/authService';
import logoUrl from '../../assets/logo.png';

type Mode = 'login' | 'signup' | 'forgot' | 'reset';

const COPY: Record<Mode, { title: string; subtitle: string; cta: string }> = {
  login: { title: 'Boas-vindas ao', subtitle: 'Acesse sua central estratégica de design e dados', cta: 'Entrar na Plataforma' },
  signup: { title: 'Crie sua conta no', subtitle: 'Comece a criar com a sua marca em minutos', cta: 'Criar conta' },
  forgot: { title: 'Recuperar acesso ao', subtitle: 'Enviaremos um link para você criar uma nova senha', cta: 'Enviar link' },
  reset: { title: 'Nova senha no', subtitle: 'Escolha uma nova senha para a sua conta', cta: 'Salvar nova senha' },
};

const Login = ({ initialMode = 'login' }: { initialMode?: Mode }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Já logado com sessão válida → vai direto para a plataforma
  // (exceto na redefinição de senha: o link do e-mail abre uma sessão de recuperação)
  useEffect(() => {
    if (initialMode === 'reset') return;
    authService.syncSession().then(valid => {
      if (valid) navigate('/', { replace: true });
    });
  }, [navigate, initialMode]);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setInfo(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        const result = await authService.login(email, password);
        if (result.success) navigate('/');
        else setError(result.error || 'Erro ao autenticar.');
      } else if (mode === 'signup') {
        const result = await authService.signUp(name, email, password);
        if (!result.success) setError(result.error || 'Erro ao criar conta.');
        else if (result.needsConfirmation) {
          setInfo('Conta criada! Enviamos um e-mail de confirmação. Confirme e depois entre.');
          setMode('login');
        } else navigate('/');
      } else if (mode === 'reset') {
        const result = await authService.updatePassword(password);
        if (result.success) navigate('/', { replace: true });
        else setError(result.error || 'Erro ao salvar a nova senha. Peça um novo link.');
      } else {
        const result = await authService.requestPasswordReset(email);
        if (result.success) setInfo('Se existir uma conta com este e-mail, você receberá o link em instantes.');
        else setError(result.error || 'Erro ao enviar o link.');
      }
    } finally {
      setLoading(false);
    }
  };

  const copy = COPY[mode];

  return (
    <div className="login-page">
      <div className="login-glow"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="login-container"
      >
        <div className="login-branding">
          <motion.div 
            className="login-logo-wrapper"
            animate={{ 
              boxShadow: isHovered ? "0 0 50px rgba(255, 45, 141, 0.4)" : "0 0 30px rgba(255, 45, 141, 0.2)"
            }}
          >
            <img src={logoUrl} alt="PinkLogic" className="login-logo-img" />
          </motion.div>
          <h1>{copy.title} <span className="notranslate" translate="no">PinkLogic</span></h1>
          <p>{copy.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {info && (
            <div className="login-info-message" role="status">
              {info}
            </div>
          )}
          {error && (
            <div className="login-error-message" style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '8px',
              padding: '0.75rem',
              color: '#ef4444',
              fontSize: '0.825rem',
              textAlign: 'center',
              fontWeight: 500
            }}>
              {error}
            </div>
          )}

          {mode === 'signup' && (
            <div className="input-field">
              <User size={18} />
              <input
                type="text"
                placeholder="Seu nome"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          {mode !== 'reset' && (
            <div className="input-field">
              <Mail size={18} />
              <input
                type="email"
                placeholder="Email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}

          {mode !== 'forgot' && (
          <div className="input-field">
            <Lock size={18} />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder={mode === 'reset' ? 'Nova senha' : mode === 'signup' ? 'Crie uma senha' : 'Senha'}
              autoComplete={mode === 'signup' || mode === 'reset' ? 'new-password' : 'current-password'}
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          )}

          {mode === 'login' && (
            <button type="button" className="login-link login-forgot" onClick={() => switchMode('forgot')}>
              Esqueci minha senha
            </button>
          )}

          <button
            type="submit"
            className="btn-login"
            disabled={loading}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {mode === 'login' ? <LogIn size={18} /> : mode === 'signup' ? <UserPlus size={18} /> : <KeyRound size={18} />}
            <span>{loading ? 'Aguarde...' : copy.cta}</span>
            <Sparkles size={16} />
          </button>
        </form>

        <div className="login-footer" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {mode === 'login' ? (
            <p>Não tem uma conta? <button type="button" className="login-link" onClick={() => switchMode('signup')}>Comece agora</button></p>
          ) : (
            <p>Já tem uma conta? <button type="button" className="login-link" onClick={() => switchMode('login')}>Entrar</button></p>
          )}
        </div>
      </motion.div>

      <style>{`
        .login-page {
          width: 100vw;
          height: 100vh;
          background: #050508;
          display: flex;
          align-items: center;
          justify-content: center;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 1000;
          overflow: hidden;
        }

        .login-glow {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(255, 45, 141, 0.15) 0%, rgba(112, 0, 255, 0.05) 50%, transparent 70%);
          filter: blur(60px);
          z-index: 0;
        }

        .login-container {
          width: 100%;
          max-width: 480px;
          background: rgba(13, 13, 18, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 24px;
          padding: 3rem;
          position: relative;
          z-index: 1;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .login-branding {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .login-logo-wrapper {
          width: 220px;
          height: 60px;
          margin: 0 auto 1.5rem;
          border-radius: 12px;
          padding: 8px 16px;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: 0.3s;
        }

        .login-logo-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .login-branding h1 {
          font-size: 1.75rem;
          font-weight: 800;
          color: white;
          margin-bottom: 0.5rem;
        }

        .login-branding p {
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .input-field {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: var(--input);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 0 1rem;
          height: 54px;
          color: var(--text-secondary);
          transition: 0.3s;
        }

        .input-field:focus-within {
          border-color: var(--primary);
          box-shadow: 0 0 15px rgba(255, 45, 141, 0.1);
          color: white;
        }

        .input-field input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          color: white;
          font-size: 1rem;
        }

        .btn-login {
          height: 54px;
          background: var(--gradient);
          color: white;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          transition: 0.3s;
          margin-top: 1rem;
          box-shadow: 0 10px 20px rgba(255, 45, 141, 0.2);
          border: none;
          cursor: pointer;
        }

        .btn-login:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px rgba(255, 45, 141, 0.3);
          filter: brightness(1.1);
        }

        .login-footer {
          margin-top: 2rem;
          text-align: center;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .text-primary { color: var(--primary); font-weight: 600; }
        .cursor-pointer { cursor: pointer; }

        .btn-login:disabled {
          opacity: 0.7;
          cursor: wait;
          transform: none;
        }

        .login-info-message {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.25);
          border-radius: 8px;
          padding: 0.75rem;
          color: #4ade80;
          font-size: 0.825rem;
          text-align: center;
          font-weight: 500;
        }

        .login-link {
          background: none;
          border: none;
          padding: 0.25rem;
          color: var(--primary);
          font-weight: 600;
          font-size: inherit;
          cursor: pointer;
        }

        .login-forgot {
          align-self: flex-end;
          margin-top: -0.5rem;
          font-size: 0.82rem;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .login-page {
            align-items: flex-start;
            overflow-y: auto;
            padding: 1.5rem 1rem;
          }
          .login-container {
            padding: 2rem 1.25rem;
            border-radius: 18px;
          }
          .login-branding {
            margin-bottom: 1.75rem;
          }
          .login-branding h1 {
            font-size: 1.4rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
