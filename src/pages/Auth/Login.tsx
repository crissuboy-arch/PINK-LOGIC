import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Sparkles } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, simulate login and redirect to dashboard
    navigate('/');
  };

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
            <img src="/logo.png" alt="Pink Logic" className="login-logo-img" />
          </motion.div>
          <h1>Boas-vindas ao Pink Logic</h1>
          <p>Acesse sua central estratégica de design e dados</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-field">
            <Mail size={18} />
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div className="input-field">
            <Lock size={18} />
            <input 
              type="password" 
              placeholder="Senha" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button 
            type="submit" 
            className="btn-login"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <LogIn size={18} />
            <span>Entrar na Plataforma</span>
            <Sparkles size={16} />
          </button>
        </form>

        <div className="login-footer">
          <p>Não tem uma conta? <span className="text-primary cursor-pointer">Comece agora</span></p>
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
          width: 120px;
          height: 120px;
          margin: 0 auto 1.5rem;
          border-radius: 24px;
          padding: 10px;
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
      `}</style>
    </div>
  );
};

export default Login;
