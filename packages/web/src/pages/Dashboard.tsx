import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FilePlus, 
  Package, 
  Calendar, 
  Megaphone, 
  TrendingUp, 
  Layout,
  Plus,
  Sparkles,
  Activity,
  ChevronRight,
  Bot,
  Layers,
  Award,
  Upload,
  Zap,
  Palette
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGestao } from '../contexts/GestaoContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useCentralStore } from '../store/CentralStore';
import { useBrand } from '../providers/BrandProvider';
import { PinkLogicHeroPremium } from '../components/PinkLogicHeroPremium';

const Sparkline = ({ points, color }: { points: number[]; color: string }) => {
  const width = 110;
  const height = 28;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const pointsStr = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - ((p - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible', opacity: 0.85 }}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pointsStr}
        style={{ filter: `drop-shadow(0 0 5px color-mix(in srgb, ${color} 50%, transparent))` }}
      />
    </svg>
  );
};

const Dashboard = () => {
  const { posts, metrics } = useGestao();
  const { campaigns, products, activeProjectId } = useCentralStore();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { brands, createBrand, setActiveBrand } = useBrand();

  // Onboarding Wizard States
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [onboardingName, setOnboardingName] = useState('');
  const [onboardingLogo, setOnboardingLogo] = useState('');
  const [onboardingStyle, setOnboardingStyle] = useState<'Moderno' | 'Minimalista' | 'Cyber' | 'Luxo'>('Moderno');

  // Check if onboarding is needed
  useEffect(() => {
    const isSkipped = localStorage.getItem('pink_logic_onboarding_skipped') === 'true';
    if (brands.length === 0 && !isSkipped) {
      setShowOnboarding(true);
    }
  }, [brands]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setOnboardingLogo(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSkipOnboarding = () => {
    localStorage.setItem('pink_logic_onboarding_skipped', 'true');
    setShowOnboarding(false);
  };

  const handleOnboardingComplete = () => {
    if (!onboardingName.trim()) return;
    
    const palette = {
      primary: 'var(--primary)',
      secondary: 'var(--secondary)',
      accent: onboardingStyle === 'Luxo' ? '#D4AF37' : onboardingStyle === 'Cyber' ? '#00E0FF' : '#FFD60A',
      background: '#0D0D0D',
      text: '#FFFFFF'
    };

    const newBrand = {
      id: crypto.randomUUID(),
      projectId: activeProjectId || 'default',
      name: onboardingName,
      logo: onboardingLogo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=256&auto=format&fit=crop',
      palette,
      colors: [palette.primary, palette.secondary, palette.accent, palette.background, palette.text],
      typography: {
        heading: onboardingStyle === 'Luxo' ? 'Playfair Display' : onboardingStyle === 'Cyber' ? 'Orbitron' : 'Outfit',
        body: 'Inter'
      },
      visualStyle: onboardingStyle,
      tone: onboardingStyle,
      socialLinks: { instagram: '' }
    };

    const createdBrand = createBrand(newBrand);
    setActiveBrand(createdBrand);
    setShowOnboarding(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="dashboard-page"
    >
      {/* Top Welcome Banner */}
      <PinkLogicHeroPremium />

      {/* Sparkline Metrics Grid */}
      <div className="sparklines-grid">
        {/* Metric 1 */}
        <div className="sparkline-card">
          <div className="sparkline-header">
            <span className="sparkline-label">Campanhas ativas</span>
            <div className="sparkline-icon-wrap" style={{ background: 'rgba(255, 79, 216, 0.1)' }}>
              <Megaphone size={14} style={{ color: 'var(--primary)' }} />
            </div>
          </div>
          <div className="sparkline-body">
            <span className="sparkline-value">23</span>
            <div className="sparkline-chart">
              <Sparkline points={[12, 14, 13, 17, 19, 18, 23]} color="var(--primary)" />
            </div>
          </div>
          <span className="sparkline-change text-pink">+12% desde ontem</span>
        </div>

        {/* Metric 2 */}
        <div className="sparkline-card">
          <div className="sparkline-header">
            <span className="sparkline-label">Conteúdos gerados</span>
            <div className="sparkline-icon-wrap" style={{ background: 'rgba(123, 97, 255, 0.1)' }}>
              <Layers size={14} style={{ color: '#7B61FF' }} />
            </div>
          </div>
          <div className="sparkline-body">
            <span className="sparkline-value">342</span>
            <div className="sparkline-chart">
              <Sparkline points={[190, 210, 205, 260, 310, 290, 342]} color="#7B61FF" />
            </div>
          </div>
          <span className="sparkline-change text-purple">+18% desde ontem</span>
        </div>

        {/* Metric 3 */}
        <div className="sparkline-card">
          <div className="sparkline-header">
            <span className="sparkline-label">Alcance total</span>
            <div className="sparkline-icon-wrap" style={{ background: 'rgba(77, 163, 255, 0.1)' }}>
              <TrendingUp size={14} style={{ color: '#4DA3FF' }} />
            </div>
          </div>
          <div className="sparkline-body">
            <span className="sparkline-value">2.6M</span>
            <div className="sparkline-chart">
              <Sparkline points={[1.8, 2.0, 1.9, 2.3, 2.5, 2.4, 2.6]} color="#4DA3FF" />
            </div>
          </div>
          <span className="sparkline-change text-blue">+24% desde ontem</span>
        </div>

        {/* Metric 4 */}
        <div className="sparkline-card">
          <div className="sparkline-header">
            <span className="sparkline-label">Engajamento médio</span>
            <div className="sparkline-icon-wrap" style={{ background: 'rgba(123, 97, 255, 0.1)' }}>
              <Activity size={14} style={{ color: '#7B61FF' }} />
            </div>
          </div>
          <div className="sparkline-body">
            <span className="sparkline-value">8.7%</span>
            <div className="sparkline-chart">
              <Sparkline points={[7.1, 7.5, 7.3, 7.9, 8.3, 8.1, 8.7]} color="#7B61FF" />
            </div>
          </div>
          <span className="sparkline-change text-purple">+11% desde ontem</span>
        </div>

        {/* Metric 5 */}
        <div className="sparkline-card">
          <div className="sparkline-header">
            <span className="sparkline-label">Conversões</span>
            <div className="sparkline-icon-wrap" style={{ background: 'rgba(255, 79, 216, 0.1)' }}>
              <Zap size={14} style={{ color: 'var(--primary)' }} />
            </div>
          </div>
          <div className="sparkline-body">
            <span className="sparkline-value">167</span>
            <div className="sparkline-chart">
              <Sparkline points={[95, 115, 110, 130, 155, 145, 167]} color="var(--primary)" />
            </div>
          </div>
          <span className="sparkline-change text-pink">+15% desde ontem</span>
        </div>
      </div>

      {/* Main Widgets Column Layout */}
      <div className="dashboard-layout-grid">
        {/* Left Column (Wider widgets) */}
        <div className="layout-col-left">
          
          {/* Card 1: Atividade da IA */}
          <div className="card glass-premium-card widget-activity">
            <div className="card-custom-header">
              <div className="header-title-wrap">
                <Activity size={16} className="text-pink" />
                <h3>Atividade da IA</h3>
              </div>
              <button className="btn-link-action" onClick={() => navigate('/sistema/execucao')}>
                Ver todos
              </button>
            </div>
            <div className="activity-list-container">
              <div className="activity-row">
                <span className="activity-time">10:24</span>
                <div className="agent-badge-circle" style={{ background: 'rgba(255, 79, 216, 0.1)' }}>
                  <Palette size={12} style={{ color: 'var(--primary)' }} />
                </div>
                <div className="activity-desc">
                  <span className="agent-name">Agente Designer</span>
                  <span className="agent-action">Criou 5 artes para Instagram</span>
                </div>
                <span className="status-badge concluido">Concluído</span>
              </div>

              <div className="activity-row">
                <span className="activity-time">10:18</span>
                <div className="agent-badge-circle" style={{ background: 'rgba(123, 97, 255, 0.1)' }}>
                  <FilePlus size={12} style={{ color: '#7B61FF' }} />
                </div>
                <div className="activity-desc">
                  <span className="agent-name">Agente Copywriter</span>
                  <span className="agent-action">Gerou copy para campanha de vendas</span>
                </div>
                <span className="status-badge concluido">Concluído</span>
              </div>

              <div className="activity-row">
                <span className="activity-time">10:12</span>
                <div className="agent-badge-circle" style={{ background: 'rgba(77, 163, 255, 0.1)' }}>
                  <Layers size={12} style={{ color: '#4DA3FF' }} />
                </div>
                <div className="activity-desc">
                  <span className="agent-name">Agente Estratégico</span>
                  <span className="agent-action">Analisou performance da campanha</span>
                </div>
                <span className="status-badge concluido">Concluído</span>
              </div>

              <div className="activity-row">
                <span className="activity-time">10:05</span>
                <div className="agent-badge-circle" style={{ background: 'rgba(255, 79, 216, 0.1)' }}>
                  <Bot size={12} style={{ color: 'var(--primary)' }} />
                </div>
                <div className="activity-desc">
                  <span className="agent-name">Agente de Conteúdo</span>
                  <span className="agent-action">Criou roteiro para Reels</span>
                </div>
                <span className="status-badge execucao">Em execução</span>
              </div>

              <div className="activity-row">
                <span className="activity-time">09:58</span>
                <div className="agent-badge-circle" style={{ background: 'rgba(77, 163, 255, 0.1)' }}>
                  <Megaphone size={12} style={{ color: '#4DA3FF' }} />
                </div>
                <div className="activity-desc">
                  <span className="agent-name">Agente de Mídia</span>
                  <span className="agent-action">Otimizando público da campanha</span>
                </div>
                <span className="status-badge execucao">Em execução</span>
              </div>
            </div>
          </div>

          {/* Card 2: Visão Geral das Campanhas */}
          <div className="card glass-premium-card widget-campaigns-donut">
            <div className="card-custom-header">
              <div className="header-title-wrap">
                <Megaphone size={16} className="text-purple" />
                <h3>Visão geral das campanhas</h3>
              </div>
              <select className="select-custom-filter" defaultValue="7">
                <option value="7">Últimos 7 dias</option>
                <option value="30">Últimos 30 dias</option>
                <option value="all">Todo o período</option>
              </select>
            </div>
            <div className="donut-chart-row">
              {/* SVG Donut */}
              <div className="donut-svg-wrapper">
                <svg width="150" height="150" viewBox="0 0 150 150">
                  <circle cx="75" cy="75" r="50" fill="transparent" stroke="rgba(255,255,255,0.02)" strokeWidth="14" />
                  
                  {/* Ativas segment (52%) -> Dasharray = (0.52 * 314.16 = 163.36) rest = 150.8 */}
                  <circle 
                    cx="75" cy="75" r="50" 
                    fill="transparent" 
                    stroke="var(--primary)" 
                    strokeWidth="14" 
                    strokeDasharray="163.36 150.8" 
                    strokeDashoffset="0" 
                    strokeLinecap="round" 
                    transform="rotate(-90 75 75)" 
                  />
                  {/* Finalizadas segment (26%) -> Dasharray = (0.26 * 314.16 = 81.68) rest = 232.48. Offset = -163.36 */}
                  <circle 
                    cx="75" cy="75" r="50" 
                    fill="transparent" 
                    stroke="#7B61FF" 
                    strokeWidth="14" 
                    strokeDasharray="81.68 232.48" 
                    strokeDashoffset="-163.36" 
                    strokeLinecap="round" 
                    transform="rotate(-90 75 75)" 
                  />
                  {/* Rascunhos segment (13%) -> Dasharray = (0.13 * 314.16 = 40.84) rest = 273.32. Offset = -245.04 */}
                  <circle 
                    cx="75" cy="75" r="50" 
                    fill="transparent" 
                    stroke="#4DA3FF" 
                    strokeWidth="14" 
                    strokeDasharray="40.84 273.32" 
                    strokeDashoffset="-245.04" 
                    strokeLinecap="round" 
                    transform="rotate(-90 75 75)" 
                  />
                  {/* Pausadas segment (9%) -> Dasharray = (0.09 * 314.16 = 28.28) rest = 285.88. Offset = -285.88 */}
                  <circle 
                    cx="75" cy="75" r="50" 
                    fill="transparent" 
                    stroke="#62627A" 
                    strokeWidth="14" 
                    strokeDasharray="28.28 285.88" 
                    strokeDashoffset="-285.88" 
                    strokeLinecap="round" 
                    transform="rotate(-90 75 75)" 
                  />
                  <text x="75" y="70" textAnchor="middle" fill="#FFFFFF" fontSize="24" fontWeight="800" fontFamily="var(--font-heading)">23</text>
                  <text x="75" y="90" textAnchor="middle" fill="#A1A1B5" fontSize="10" fontWeight="600" letterSpacing="0.5">Campanhas</text>
                </svg>
              </div>

              {/* Legends grid */}
              <div className="donut-legends">
                <div className="legend-item">
                  <span className="legend-dot pink" />
                  <span className="legend-name">Ativas</span>
                  <span className="legend-count">12</span>
                  <span className="legend-percentage">52%</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot purple" />
                  <span className="legend-name">Finalizadas</span>
                  <span className="legend-count">6</span>
                  <span className="legend-percentage">26%</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot blue" />
                  <span className="legend-name">Rascunhos</span>
                  <span className="legend-count">3</span>
                  <span className="legend-percentage">13%</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot grey" />
                  <span className="legend-name">Pausadas</span>
                  <span className="legend-count">2</span>
                  <span className="legend-percentage">9%</span>
                </div>
              </div>
            </div>

            {/* Donut Footer */}
            <div className="best-campaign-bar">
              <div className="best-campaign-label-wrapper">
                <Award size={14} style={{ color: 'var(--primary)' }} />
                <span className="best-campaign-label">Melhor campanha</span>
              </div>
              <span className="best-campaign-name">Promo Black Pink</span>
              <div className="best-campaign-roi-badge">
                <span>+38%</span>
                <span className="roi-text">ROI</span>
              </div>
            </div>
          </div>

          {/* Card 3: Insights para você */}
          <div className="card glass-premium-card widget-insights">
            <div className="card-custom-header" style={{ marginBottom: '16px' }}>
              <div className="header-title-wrap">
                <Sparkles size={16} className="text-pink" />
                <h3>Insights para você</h3>
              </div>
            </div>
            <div className="insights-grid">
              <div className="insight-card-item">
                <div className="insight-header">
                  <div className="insight-icon-bg pink">
                    <TrendingUp size={12} />
                  </div>
                  <span className="insight-title">Performance alta</span>
                </div>
                <p className="insight-desc">
                  Suas campanhas estão <strong className="text-pink">23%</strong> melhores que na semana passada.
                </p>
                <div className="insight-arrow">
                  <TrendingUp size={16} className="text-pink" />
                </div>
              </div>

              <div className="insight-card-item">
                <div className="insight-header">
                  <div className="insight-icon-bg yellow">
                    <Award size={12} />
                  </div>
                  <span className="insight-title">Oportunidade</span>
                </div>
                <p className="insight-desc">
                  Aumente o investimento na campanha Promo Pink, o ROI está alto.
                </p>
                <div className="insight-arrow">
                  <span className="dollar-indicator">$</span>
                </div>
              </div>

              <div className="insight-card-item">
                <div className="insight-header">
                  <div className="insight-icon-bg purple">
                    <Megaphone size={12} />
                  </div>
                  <span className="insight-title">Tendência</span>
                </div>
                <p className="insight-desc">
                  Conteúdos de bastidores estão gerando <strong className="text-purple">3x</strong> mais engajamento.
                </p>
                <div className="insight-arrow">
                  <TrendingUp size={16} className="text-purple" />
                </div>
              </div>

              <div className="insight-card-item">
                <div className="insight-header">
                  <div className="insight-icon-bg yellow">
                    <Zap size={12} />
                  </div>
                  <span className="insight-title">Automação</span>
                </div>
                <p className="insight-desc">
                  Você pode automatizar 5 tarefas repetitivas e economizar 8h por semana.
                </p>
                <div className="insight-arrow">
                  <Zap size={16} className="text-yellow" />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (Narrower widgets) */}
        <div className="layout-col-right">
          
          {/* Card 1: Agentes em execução */}
          <div className="card glass-premium-card widget-exec-agents">
            <div className="card-custom-header">
              <div className="header-title-wrap">
                <Bot size={16} className="text-pink" />
                <h3>Agentes em execução</h3>
              </div>
              <button className="btn-link-action" onClick={() => navigate('/sistema/agentes')}>
                Ver todos
              </button>
            </div>
            <div className="exec-agents-list">
              {/* Agent 1 */}
              <div className="exec-agent-row">
                <div className="exec-agent-header">
                  <div className="agent-avatar-mini" style={{ background: 'rgba(255, 79, 216, 0.1)' }}>
                    <Palette size={14} style={{ color: 'var(--primary)' }} />
                  </div>
                  <div className="agent-meta">
                    <span className="agent-row-name">Designer Pro</span>
                    <span className="agent-row-task">Criando artes para feed</span>
                  </div>
                  <span className="agent-progress-val">75%</span>
                </div>
                <div className="agent-progressbar-bg">
                  <div className="agent-progressbar-fill" style={{ width: '75%', background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)' }} />
                </div>
              </div>

              {/* Agent 2 */}
              <div className="exec-agent-row">
                <div className="exec-agent-header">
                  <div className="agent-avatar-mini" style={{ background: 'rgba(123, 97, 255, 0.1)' }}>
                    <FilePlus size={14} style={{ color: '#7B61FF' }} />
                  </div>
                  <div className="agent-meta">
                    <span className="agent-row-name">Copy Expert</span>
                    <span className="agent-row-task">Gerando headlines persuasivas</span>
                  </div>
                  <span className="agent-progress-val">60%</span>
                </div>
                <div className="agent-progressbar-bg">
                  <div className="agent-progressbar-fill" style={{ width: '60%', background: 'linear-gradient(90deg, #7B61FF 0%, var(--primary) 100%)' }} />
                </div>
              </div>

              {/* Agent 3 */}
              <div className="exec-agent-row">
                <div className="exec-agent-header">
                  <div className="agent-avatar-mini" style={{ background: 'rgba(77, 163, 255, 0.1)' }}>
                    <Layers size={14} style={{ color: '#4DA3FF' }} />
                  </div>
                  <div className="agent-meta">
                    <span className="agent-row-name">Media Buyer</span>
                    <span className="agent-row-task">Otimização de anúncios</span>
                  </div>
                  <span className="agent-progress-val">45%</span>
                </div>
                <div className="agent-progressbar-bg">
                  <div className="agent-progressbar-fill" style={{ width: '45%', background: 'linear-gradient(90deg, #4DA3FF 0%, #7B61FF 100%)' }} />
                </div>
              </div>

              {/* Agent 4 */}
              <div className="exec-agent-row">
                <div className="exec-agent-header">
                  <div className="agent-avatar-mini" style={{ background: 'rgba(255, 79, 216, 0.1)' }}>
                    <Bot size={14} style={{ color: 'var(--primary)' }} />
                  </div>
                  <div className="agent-meta">
                    <span className="agent-row-name">Content Creator</span>
                    <span className="agent-row-task">Criando ideias de conteúdo</span>
                  </div>
                  <span className="agent-progress-val">30%</span>
                </div>
                <div className="agent-progressbar-bg">
                  <div className="agent-progressbar-fill" style={{ width: '30%', background: 'linear-gradient(90deg, var(--primary) 0%, #7B61FF 100%)' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Uso da IA */}
          <div className="card glass-premium-card widget-ia-use">
            <div className="card-custom-header">
              <div className="header-title-wrap">
                <Activity size={16} className="text-pink" />
                <h3>Uso da IA</h3>
              </div>
              <button className="btn-link-action" onClick={() => navigate('/gestao/status')}>
                Detalhes
              </button>
            </div>
            <div className="ia-use-body">
              {/* Radial gauge SVG */}
              <div className="gauge-radial-wrapper">
                <svg width="84" height="84" viewBox="0 0 84 84">
                  <circle cx="42" cy="42" r="34" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="7" />
                  {/* 78% -> 2 * pi * 34 = 213.63 -> progress dasharray = 166.6 offset = 47.0 */}
                  <circle 
                    cx="42" cy="42" r="34" 
                    fill="transparent" 
                    stroke="var(--primary)" 
                    strokeWidth="7" 
                    strokeDasharray="166.6 47.0" 
                    strokeLinecap="round" 
                    transform="rotate(-90 42 42)" 
                    style={{ filter: 'drop-shadow(0 0 4px var(--primary))' }}
                  />
                  <text x="42" y="44" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="800" fontFamily="var(--font-heading)">78%</text>
                  <text x="42" y="55" textAnchor="middle" fill="#A1A1B5" fontSize="7" fontWeight="600" letterSpacing="0.3">Uso</text>
                </svg>
              </div>

              {/* Usage Stats Text */}
              <div className="ia-use-text">
                <span className="use-plan">Plano Premium</span>
                <span className="use-credits">
                  <strong>312.000</strong> / 400.000 <br />
                  <span className="credits-label">créditos utilizados</span>
                </span>
              </div>

              {/* Buy Credits Button */}
              <button className="btn-buy-credits" onClick={() => navigate('/gestao/status')}>
                Comprar mais créditos
              </button>
            </div>
          </div>

          {/* Card 3: Atalhos rápidos */}
          <div className="card glass-premium-card widget-shortcuts">
            <div className="card-custom-header" style={{ marginBottom: '14px' }}>
              <div className="header-title-wrap">
                <Layers size={16} className="text-pink" />
                <h3>Atalhos rápidos</h3>
              </div>
            </div>
            <div className="shortcuts-grid">
              <button className="shortcut-btn" onClick={() => navigate('/criacao/editor')}>
                <Plus size={16} className="text-pink" />
                <span>Novo projeto</span>
              </button>
              
              <button className="shortcut-btn" onClick={() => navigate('/criacao/editor')}>
                <Sparkles size={16} className="text-pink" />
                <span>Gerar imagem</span>
              </button>

              <button className="shortcut-btn" onClick={() => navigate('/criacao/copy')}>
                <FilePlus size={16} className="text-pink" />
                <span>Gerar copy</span>
              </button>

              <button className="shortcut-btn" onClick={() => navigate('/gestao/status')}>
                <Activity size={16} className="text-pink" />
                <span>Analisar conta</span>
              </button>

              <button className="shortcut-btn" onClick={() => navigate('/criacao/story')}>
                <Layers size={16} className="text-pink" />
                <span>Gerar vídeo</span>
              </button>

              <button className="shortcut-btn" onClick={() => navigate('/sistema/agentes')}>
                <Bot size={16} className="text-pink" />
                <span>Criar agente</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Premium Onboarding Wizard Modal */}
      {showOnboarding && (
        <div className="modal-overlay onboarding-overlay">
          <div className="modal-content onboarding-card" style={{ position: 'relative' }}>
            {/* Skip Button */}
            <button 
              type="button" 
              className="onboarding-skip-btn" 
              onClick={handleSkipOnboarding}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.5rem',
                background: 'none',
                border: 'none',
                color: '#A1A1B5',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'color 0.2s',
                zIndex: 10
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#A1A1B5'}
            >
              Pular
            </button>
            
            {/* Steps Indicator */}
            <div className="onboarding-steps-bar">
              {[1, 2, 3].map((step) => (
                <div 
                  key={step} 
                  className={`onboarding-step-dot ${onboardingStep >= step ? 'active' : ''} ${onboardingStep === step ? 'current' : ''}`}
                >
                  {step}
                </div>
              ))}
            </div>

            {onboardingStep === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="onboarding-step-content">
                <div className="onboarding-icon-wrap">
                  <Award size={36} style={{ color: 'var(--primary)' }} />
                </div>
                <h2 className="brand-font">Nome da sua Marca</h2>
                <p>Insira o nome principal do seu projeto ou negócio. A IA usará este nome para gerar cópias e personalizar os templates.</p>
                <div className="form-group">
                  <input 
                    type="text" 
                    className="input-field" 
                    value={onboardingName} 
                    onChange={e => setOnboardingName(e.target.value)} 
                    placeholder="Ex: PinkLogic Studio"
                    style={{ fontSize: '1rem', padding: '0.85rem 1.25rem' }}
                  />
                </div>
                <button 
                  className="btn-primary" 
                  disabled={!onboardingName.trim()} 
                  onClick={() => setOnboardingStep(2)}
                  style={{ width: '100%', justifyContent: 'center', height: '44px', marginTop: '1rem' }}
                >
                  Continuar
                </button>
              </motion.div>
            )}

            {onboardingStep === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="onboarding-step-content">
                <div className="onboarding-icon-wrap">
                  <Upload size={36} style={{ color: 'var(--primary)' }} />
                </div>
                <h2 className="brand-font">Envie seu Logotipo</h2>
                <p>Carregue o arquivo de logo da sua marca (PNG, SVG, WEBP) para aplicá-la dinamicamente nas suas artes e extrair a paleta de cores.</p>
                
                <div className="onboarding-upload-zone" onClick={() => document.getElementById('onboardLogoInput')?.click()}>
                  {onboardingLogo ? (
                    <img src={onboardingLogo} alt="Logo preview" style={{ maxHeight: '80px', objectFit: 'contain' }} />
                  ) : (
                    <>
                      <Upload size={24} style={{ opacity: 0.4 }} />
                      <span>Selecionar Logotipo</span>
                    </>
                  )}
                  <input 
                    id="onboardLogoInput" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleLogoUpload} 
                    style={{ display: 'none' }} 
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '10px', width: '100%', marginTop: '1rem' }}>
                  <button className="btn-secondary" onClick={() => setOnboardingStep(1)} style={{ height: '44px', justifyContent: 'center' }}>Voltar</button>
                  <button className="btn-primary" onClick={() => setOnboardingStep(3)} style={{ height: '44px', justifyContent: 'center' }}>Continuar sem Logo</button>
                </div>
              </motion.div>
            )}

            {onboardingStep === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="onboarding-step-content">
                <div className="onboarding-icon-wrap">
                  <Sparkles size={36} style={{ color: 'var(--primary)' }} />
                </div>
                <h2 className="brand-font">Estilo Visual do SaaS</h2>
                <p>Escolha a estética visual padrão da sua marca. A IA aplicará este tom nas fontes e designs gerados.</p>
                
                <div className="onboarding-style-grid">
                  {(['Moderno', 'Minimalista', 'Cyber', 'Luxo'] as const).map((style) => (
                    <div 
                      key={style}
                      onClick={() => setOnboardingStyle(style)}
                      className={`onboarding-style-card ${onboardingStyle === style ? 'active' : ''}`}
                    >
                      <span className="style-name">{style}</span>
                      <span className="style-desc">
                        {style === 'Moderno' && 'Limpo, fluido e profissional'}
                        {style === 'Minimalista' && 'Foco no essencial, cores sóbrias'}
                        {style === 'Cyber' && 'Neon, tecnológico e de alta energia'}
                        {style === 'Luxo' && 'Dourados, serifas e elegância extrema'}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '10px', width: '100%', marginTop: '1rem' }}>
                  <button className="btn-secondary" onClick={() => setOnboardingStep(2)} style={{ height: '44px', justifyContent: 'center' }}>Voltar</button>
                  <button className="btn-primary" onClick={handleOnboardingComplete} style={{ height: '44px', justifyContent: 'center' }}>Finalizar Ativação</button>
                </div>
              </motion.div>
            )}

          </div>
        </div>
      )}

      {/* Styled components block */}
      <style>{`
        .dashboard-page {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding-bottom: 40px;
          background-color: #07070A;
        }

        /* Sparkline Cards Styles */
        .sparklines-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
          width: 100%;
        }

        .sparkline-card {
          background: rgba(15, 17, 23, 0.7);
          border: 1px solid rgba(255, 79, 216, 0.12);
          border-radius: 16px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          backdrop-filter: blur(16px);
          transition: all 0.25s ease;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .sparkline-card:hover {
          transform: translateY(-3px);
          border-color: rgba(255, 79, 216, 0.3);
          box-shadow: 0 15px 35px rgba(255, 79, 216, 0.12);
        }

        .sparkline-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .sparkline-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: #A1A1B5;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .sparkline-icon-wrap {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sparkline-body {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
        }

        .sparkline-value {
          font-size: 1.65rem;
          font-weight: 800;
          color: #FFFFFF;
          font-family: var(--font-heading);
          letter-spacing: -0.5px;
        }

        .sparkline-chart {
          flex-shrink: 0;
        }

        .sparkline-change {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.3px;
        }

        .text-pink { color: var(--primary); }
        .text-purple { color: #7B61FF; }
        .text-blue { color: #4DA3FF; }
        .text-yellow { color: #F59E0B; }

        /* Dashboard Layout Grid */
        .dashboard-layout-grid {
          display: grid;
          grid-template-columns: 1.22fr 0.78fr;
          gap: 24px;
          width: 100%;
        }

        .layout-col-left, .layout-col-right {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .glass-premium-card {
          background: rgba(15, 17, 23, 0.7);
          border: 1px solid rgba(255, 79, 216, 0.12);
          border-radius: 20px;
          padding: 24px;
          backdrop-filter: blur(20px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
          display: flex;
          flex-direction: column;
        }

        .card-custom-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 14px;
          margin-bottom: 18px;
        }

        .header-title-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .header-title-wrap h3 {
          font-size: 0.95rem;
          font-weight: 800;
          color: #FFFFFF;
          margin: 0;
          font-family: var(--font-heading);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .btn-link-action {
          font-size: 0.75rem;
          font-weight: 700;
          color: #A1A1B5;
          cursor: pointer;
          background: none;
          border: none;
          transition: color 0.2s;
        }

        .btn-link-action:hover {
          color: var(--primary);
        }

        /* Widget: IA Activity */
        .activity-list-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .activity-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          transition: all 0.2s;
        }

        .activity-row:hover {
          background: rgba(255, 255, 255, 0.02);
          border-color: rgba(255, 79, 216, 0.15);
        }

        .activity-time {
          font-size: 0.75rem;
          font-weight: 700;
          color: #62627A;
          width: 38px;
        }

        .agent-badge-circle {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .activity-desc {
          display: flex;
          flex-direction: column;
          flex: 1;
          gap: 2px;
        }

        .agent-name {
          font-size: 0.8rem;
          font-weight: 700;
          color: #FFFFFF;
        }

        .agent-action {
          font-size: 0.72rem;
          color: #A1A1B5;
        }

        .status-badge {
          font-size: 0.65rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
          text-transform: uppercase;
        }

        .status-badge.concluido {
          background: #34C759;
          color: #FFFFFF;
        }

        .status-badge.execucao {
          background: var(--primary);
          color: #FFFFFF;
          animation: badgePulse 1.8s infinite ease-in-out;
        }

        .status-badge.pausado {
          background: #3A3A3A;
          color: #A0A0A0;
        }

        .status-badge.aguardando {
          background: #FF9F0A;
          color: #000000;
        }

        @keyframes badgePulse {
          0% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.03); opacity: 1; box-shadow: 0 0 6px color-mix(in srgb, var(--primary) 40%, transparent); }
          100% { transform: scale(1); opacity: 0.9; }
        }

        /* Widget: Campaigns Donut chart */
        .select-custom-filter {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          padding: 4px 8px;
          color: #A1A1B5;
          font-size: 0.72rem;
          font-weight: 700;
          outline: none;
        }

        .donut-chart-row {
          display: flex;
          align-items: center;
          justify-content: space-around;
          gap: 20px;
          margin: 10px 0 20px 0;
          flex-wrap: wrap;
        }

        .donut-svg-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .donut-legends {
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-width: 160px;
        }

        .legend-item {
          display: grid;
          grid-template-columns: 8px 1fr 20px 32px;
          align-items: center;
          gap: 8px;
          font-size: 0.75rem;
        }

        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .legend-dot.pink { background-color: var(--primary); }
        .legend-dot.purple { background-color: #7B61FF; }
        .legend-dot.blue { background-color: #4DA3FF; }
        .legend-dot.grey { background-color: #62627A; }

        .legend-name {
          color: #A1A1B5;
          font-weight: 600;
        }

        .legend-count {
          color: #FFFFFF;
          font-weight: 700;
          text-align: right;
        }

        .legend-percentage {
          color: #62627A;
          font-weight: 700;
          text-align: right;
        }

        .best-campaign-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: rgba(255, 79, 216, 0.03);
          border: 1px dashed rgba(255, 79, 216, 0.25);
          border-radius: 12px;
          font-size: 0.8rem;
          margin-top: auto;
        }

        .best-campaign-label-wrapper {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .best-campaign-label {
          color: #A1A1B5;
          font-weight: 600;
        }

        .best-campaign-name {
          color: #FFFFFF;
          font-weight: 700;
        }

        .best-campaign-roi-badge {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 6px;
          padding: 2px 6px;
          color: #10B981;
          font-weight: 800;
          font-size: 0.72rem;
          display: flex;
          gap: 3px;
        }

        .roi-text {
          font-weight: 600;
          font-size: 0.65rem;
          opacity: 0.8;
        }

        /* Widget: Insights */
        .insights-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .insight-card-item {
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 16px;
          padding: 16px;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 10px;
          transition: all 0.2s;
        }

        .insight-card-item:hover {
          background: rgba(255, 255, 255, 0.02);
          border-color: rgba(255, 79, 216, 0.15);
        }

        .insight-header {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .insight-icon-bg {
          width: 22px;
          height: 22px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
        }

        .insight-icon-bg.pink { background: rgba(255, 79, 216, 0.15); color: var(--primary); }
        .insight-icon-bg.purple { background: rgba(123, 97, 255, 0.15); color: #7B61FF; }
        .insight-icon-bg.yellow { background: rgba(245, 158, 11, 0.15); color: #F59E0B; }

        .insight-title {
          font-size: 0.72rem;
          font-weight: 800;
          color: #FFFFFF;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .insight-desc {
          font-size: 0.72rem;
          line-height: 1.4;
          color: #A1A1B5;
          margin: 0;
          padding-right: 14px;
        }

        .insight-arrow {
          position: absolute;
          bottom: 12px;
          right: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dollar-indicator {
          color: #F59E0B;
          font-weight: 800;
          font-size: 1rem;
        }

        /* Widget: Executing Agents */
        .exec-agents-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .exec-agent-row {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .exec-agent-header {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .agent-avatar-mini {
          width: 26px;
          height: 26px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .agent-meta {
          display: flex;
          flex-direction: column;
          flex: 1;
          gap: 2px;
        }

        .agent-row-name {
          font-size: 0.78rem;
          font-weight: 700;
          color: #FFFFFF;
        }

        .agent-row-task {
          font-size: 0.68rem;
          color: #A1A1B5;
        }

        .agent-progress-val {
          font-size: 0.75rem;
          font-weight: 800;
          color: #FFFFFF;
        }

        .agent-progressbar-bg {
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 10px;
          overflow: hidden;
        }

        .agent-progressbar-fill {
          height: 100%;
          border-radius: 10px;
        }

        /* Widget: IA Use */
        .ia-use-body {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 6px;
          flex-wrap: wrap;
        }

        .gauge-radial-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ia-use-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }

        .use-plan {
          font-size: 0.85rem;
          font-weight: 800;
          color: #FFFFFF;
        }

        .use-credits {
          font-size: 0.75rem;
          color: #A1A1B5;
          line-height: 1.3;
        }

        .credits-label {
          font-size: 0.68rem;
          color: #62627A;
        }

        .btn-buy-credits {
          background: var(--primary);
          border: none;
          border-radius: 8px;
          padding: 8px 14px;
          color: #FFFFFF;
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(255, 79, 216, 0.2);
        }

        .btn-buy-credits:hover {
          background: var(--secondary);
          transform: translateY(-1px);
          box-shadow: 0 6px 15px rgba(255, 79, 216, 0.3);
        }

        /* Widget: Shortcuts */
        .shortcuts-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .shortcut-btn {
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 12px;
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .shortcut-btn:hover {
          background: rgba(255, 79, 216, 0.03);
          border-color: rgba(255, 79, 216, 0.2);
          transform: translateY(-2px);
        }

        .shortcut-btn span {
          font-size: 0.75rem;
          font-weight: 700;
          color: #FFFFFF;
        }

        /* Onboarding Overlays & Cards */
        .onboarding-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
        }

        .onboarding-card {
          background: rgba(17, 17, 24, 0.9) !important;
          border: 1px solid rgba(255, 47, 191, 0.25) !important;
          max-width: 480px;
          width: 90%;
          border-radius: 20px;
          padding: 2.25rem !important;
          box-shadow: 0 0 40px rgba(255, 47, 191, 0.15);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          box-sizing: border-box;
        }

        .onboarding-steps-bar {
          display: flex;
          gap: 20px;
          margin-bottom: 0.5rem;
        }

        .onboarding-step-dot {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #A1A1B5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.72rem;
          font-weight: 700;
          transition: all 0.3s ease;
        }

        .onboarding-step-dot.active {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
          box-shadow: 0 0 10px rgba(255, 47, 191, 0.4);
        }

        .onboarding-step-dot.current {
          transform: scale(1.15);
        }

        .onboarding-step-content {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.75rem;
        }

        .onboarding-icon-wrap {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: rgba(255, 47, 191, 0.08);
          border: 1px solid rgba(255, 47, 191, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.5rem;
        }

        .onboarding-step-content h2 {
          margin: 0;
          color: white;
          font-size: 1.35rem;
        }

        .onboarding-step-content p {
          font-size: 0.8rem;
          color: #A1A1B5;
          line-height: 1.5;
          margin: 0 0 1rem 0;
        }

        .onboarding-upload-zone {
          border: 2px dashed rgba(255, 255, 255, 0.1);
          background: rgba(255,255,255,0.01);
          border-radius: 12px;
          width: 100%;
          height: 120px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .onboarding-upload-zone:hover {
          border-color: var(--primary);
          background: rgba(255, 47, 191, 0.02);
        }

        .onboarding-upload-zone span {
          font-size: 0.8rem;
          color: #A1A1B5;
        }

        .onboarding-style-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          width: 100%;
        }

        .onboarding-style-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          padding: 10px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          gap: 4px;
          transition: all 0.2s;
        }

        .onboarding-style-card:hover {
          border-color: var(--primary);
          background: rgba(255, 47, 191, 0.02);
        }

        .onboarding-style-card.active {
          border-color: var(--primary);
          background: rgba(255, 47, 191, 0.08);
          box-shadow: 0 0 12px rgba(255, 47, 191, 0.1);
        }

        .onboarding-style-card .style-name {
          font-size: 0.8rem;
          font-weight: 700;
          color: white;
        }

        .onboarding-style-card .style-desc {
          font-size: 0.62rem;
          color: #62627A;
          line-height: 1.3;
        }

        /* Form Controls */
        .form-group {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-field {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          padding: 10px 14px;
          color: #FFFFFF;
          outline: none;
          transition: all 0.2s;
        }

        .input-field:focus {
          border-color: var(--primary);
          background: rgba(255, 255, 255, 0.05);
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          border: none;
          border-radius: 8px;
          color: #FFFFFF;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          color: #FFFFFF;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .sparklines-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .dashboard-layout-grid {
            grid-template-columns: 1fr;
          }

          .insights-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .sparklines-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 580px) {
          .sparklines-grid {
            grid-template-columns: 1fr;
          }

          .insights-grid {
            grid-template-columns: 1fr;
          }

          .donut-chart-row {
            justify-content: center;
          }

          .shortcuts-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default Dashboard;
