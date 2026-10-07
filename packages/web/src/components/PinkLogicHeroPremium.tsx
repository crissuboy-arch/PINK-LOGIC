import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Sparkles, Plus, Download, Cpu, CheckCircle, Clock, TrendingUp, Upload } from 'lucide-react';
import { useBrand } from '../providers/BrandProvider';

interface MetricCardProps {
  label: string;
  value: string;
  change: string;
  changeColor?: string;
  icon: React.ComponentType<any>;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, change, changeColor = 'var(--primary)', icon: Icon }) => {
  return (
    <div className="premium-metric-card">
      <div className="metric-header">
        <span className="metric-label">{label}</span>
        <div className="metric-icon-wrapper">
          <Icon size={14} className="metric-icon" />
        </div>
      </div>
      <div className="metric-body">
        <span className="metric-value">{value}</span>
        <span className="metric-change" style={{ color: changeColor }}>{change}</span>
      </div>
    </div>
  );
};

export const PinkLogicHeroPremium: React.FC = () => {
  const navigate = useNavigate();
  const { activeBrand } = useBrand();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize Canvas Particle Wave
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 400);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 320);

    // Neural grid flow configuration
    const linesCount = 5;
    const pointsPerLine = 45;
    let time = 0;

    // Handle resize
    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth || 400;
      height = canvas.height = canvas.parentElement.clientHeight || 320;
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      // Canvas não entende var(): resolve as cores da marca ativa 1× por frame.
      const cssVars = getComputedStyle(document.documentElement);
      const brandPrimary = cssVars.getPropertyValue('--primary').trim() || '#FF2D9B';
      const brandSecondary = cssVars.getPropertyValue('--secondary').trim() || '#BF5AF2';
      const dotColors = [brandPrimary, brandSecondary, '#FFD60A', '#4DA3FF', '#34C759'];
      time += 0.008;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw smooth neon background glow centered on the floating logo
      const radialGlow = ctx.createRadialGradient(
        width * 0.75, height * 0.45, 10,
        width * 0.75, height * 0.45, width * 0.65
      );
      radialGlow.addColorStop(0, 'rgba(107, 33, 168, 0.45)');
      radialGlow.addColorStop(0.5, 'rgba(191, 90, 242, 0.08)');
      radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, width, height);

      // 2. Draw organic neural wave flow (dense glowing particles on sine lines)
      for (let l = 0; l < linesCount; l++) {
        const lineOffset = l * (height * 0.08) - (height * 0.16);
        const speedFactor = 0.5 + l * 0.12;
        const amplitude = 18 + l * 4;

        ctx.beginPath();
        // Set styling for connections (subtle purple/pink stroke)
        ctx.strokeStyle = `rgba(191, 90, 242, ${0.015 - l * 0.002})`;
        ctx.lineWidth = 1;

        for (let i = 0; i < pointsPerLine; i++) {
          const progress = i / (pointsPerLine - 1);
          const x = progress * width;
          
          // Undulating wave heights centered on logo height (0.45)
          const wave1 = Math.sin(progress * 4.5 + time * speedFactor) * amplitude;
          const wave2 = Math.cos(progress * 2.0 - time * 0.7 * speedFactor) * (amplitude * 0.6);
          const y = height * 0.45 + lineOffset + wave1 + wave2;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);

          // Draw neon particle at this point
          ctx.save();
          // Fade out towards the left (progress -> 0) to simulate dots flowing from the right icon
          const opacity = (0.2 + Math.abs(Math.sin(time + progress * 8))) * (0.6 - l * 0.08) * (0.15 + progress * 0.85);
          ctx.globalAlpha = Math.max(0.08, Math.min(opacity, 0.85));
          ctx.beginPath();
          
          // Select colors: rosa (var(--primary)), roxo (var(--secondary)), amarelo (#FFD60A), azul (#4DA3FF), verde (#34C759)
          const colorIndex = (i + l) % dotColors.length;
          ctx.fillStyle = dotColors[colorIndex];
          
          const dotSize = 1.2 + (l % 2 === 0 ? 0.8 : 0) + (i % 5 === 0 ? 0.6 : 0);
          ctx.arc(x, y, dotSize, 0, Math.PI * 2);
          
          // Glow effect on particles
          ctx.shadowBlur = 6;
          ctx.shadowColor = dotColors[colorIndex];
          ctx.fill();
          ctx.restore();
        }
        ctx.stroke();
      }

      // 3. Draw secondary light floating dust particles
      for (let i = 0; i < 20; i++) {
        const x = ((Math.sin(time * 0.1 + i) + 1) / 2) * width;
        const y = ((Math.cos(time * 0.15 + i * 2) + 1) / 2) * height;
        const opacity = (Math.sin(time * 0.5 + i) + 1) / 2 * 0.25;
        
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#FFFFFF';
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="pink-hero-premium-container">
      {/* Styles Injection */}
      <style>{`
        .pink-hero-premium-container {
          position: relative;
          width: 100%;
          min-height: 400px;
          background: radial-gradient(circle at 80% 50%, #1e0936 0%, #0d0617 60%, #07070a 100%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 40px 40px 110px 40px; /* space for overlapping metric cards */
          display: grid;
          grid-template-columns: 1.25fr 0.75fr;
          gap: 20px;
          overflow: visible;
          margin-bottom: 95px; /* space for cards overlap - adjusted to prevent clipping content below */
          box-shadow: 
            0 20px 50px rgba(0, 0, 0, 0.5),
            inset 0 0 30px rgba(255, 255, 255, 0.02);
        }

        .hero-left-section {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 16px;
          z-index: 5;
        }

        .welcome-badge {
          align-self: flex-start;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: color-mix(in srgb, var(--primary) 5%, transparent);
          border: 1px solid color-mix(in srgb, var(--primary) 30%, transparent);
          border-radius: 100px;
          color: var(--primary);
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .hero-main-title {
          font-family: var(--font-heading, 'Plus Jakarta Sans', sans-serif);
          font-size: 44px;
          font-weight: 700;
          line-height: 1.2;
          color: #FFFFFF;
          margin: 0;
        }

        .neon-pink-text {
          color: var(--primary);
          text-shadow: 
            0 0 10px color-mix(in srgb, var(--primary) 60%, transparent),
            0 0 25px color-mix(in srgb, var(--primary) 30%, transparent);
        }

        .hero-desc {
          font-size: 0.92rem;
          line-height: 1.5;
          color: var(--text-secondary, #A0A0A0);
          margin: 0;
          max-width: 580px;
        }

        .hero-buttons-row {
          display: flex;
          gap: 12px;
          margin-top: 10px;
          flex-wrap: wrap;
        }

        .btn-premium-cta {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: #6B21A8;
          border: 1px solid color-mix(in srgb, var(--primary) 40%, transparent);
          border-radius: 10px;
          color: #FFFFFF;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 15px rgba(107, 33, 168, 0.35);
        }

        .btn-premium-cta:hover {
          transform: translateY(-2px);
          box-shadow: 
            0 6px 20px rgba(107, 33, 168, 0.45),
            0 0 15px color-mix(in srgb, var(--primary) 25%, transparent);
          background: #7c2d9a;
        }

        .btn-premium-secondary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 10px;
          color: #FFFFFF;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(10px);
        }

        .btn-premium-secondary:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .hero-right-section {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 240px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pink-nebula-wrapper {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .particle-canvas {
          width: 100%;
          height: 100%;
          display: block;
        }

        .floating-brand-logo-card {
          position: absolute;
          right: 20%;
          top: 32%;
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: floatingLogo 6s infinite ease-in-out;
          z-index: 10;
        }

        /* Metrics Grid overlapping container base */
        .premium-metrics-bar {
          position: absolute;
          bottom: -36px;
          left: 40px;
          right: 40px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          z-index: 20;
        }

        .premium-metric-card {
          background: rgba(26, 26, 26, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 16px 20px;
          box-shadow: none;
          backdrop-filter: blur(20px);
          transition: all 0.25s ease;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .premium-metric-card:hover {
          transform: translateY(-4px);
          border-color: color-mix(in srgb, var(--primary) 30%, transparent);
          background: rgba(26, 26, 26, 0.75);
        }

        .metric-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .metric-label {
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--text-secondary, #A0A0A0);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .metric-icon-wrapper {
          width: 22px;
          height: 22px;
          border-radius: 6px;
          background: color-mix(in srgb, var(--primary) 6%, transparent);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .metric-icon {
          color: var(--primary);
        }

        .metric-body {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }

        .metric-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: #FFFFFF;
          font-family: var(--font-heading, sans-serif);
        }

        .metric-change {
          font-size: 0.72rem;
          font-weight: 700;
        }

        /* Animations */
        @keyframes floatingLogo {
          0% {
            transform: translateY(0px) rotate(0deg) scale(1);
          }
          50% {
            transform: translateY(-12px) rotate(3deg) scale(1.05);
          }
          100% {
            transform: translateY(0px) rotate(0deg) scale(1);
          }
        }

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .pink-hero-premium-container {
            grid-template-columns: 1fr;
            padding: 30px 30px 150px 30px;
            min-height: auto;
            margin-bottom: 140px;
            overflow: visible;
          }

          .hero-right-section {
            min-height: 180px;
          }

          .floating-brand-logo-card {
            right: 15%;
            top: 20%;
          }

          .premium-metrics-bar {
            grid-template-columns: repeat(2, 1fr);
            bottom: -90px;
            left: 30px;
            right: 30px;
          }
        }

        @media (max-width: 640px) {
          .pink-hero-premium-container {
            padding: 24px 24px 360px 24px;
            margin-bottom: 340px;
            overflow: visible;
          }

          .hero-main-title {
            font-size: 1.8rem;
          }

          .hero-right-section {
            position: absolute;
            inset: 0;
            opacity: 0.45;
            z-index: 1;
            pointer-events: none;
          }

          .floating-brand-logo-card {
            display: none;
          }

          .premium-metrics-bar {
            grid-template-columns: 1fr;
            bottom: -290px;
            left: 20px;
            right: 20px;
            gap: 12px;
          }
        }
      `}</style>

      {/* Hero Left Content */}
      <div className="hero-left-section">
        <span className="welcome-badge">
          <Plus size={10} style={{ color: 'var(--primary)', marginRight: '2px' }} />
          BEM-VINDO DE VOLTA
        </span>
        <h1 className="hero-main-title">
          Seu ecossistema de criação <br />
          movido por <span className="neon-pink-text">IA.</span>
        </h1>
        <p className="hero-desc">
          Automatize design, conteúdo, branding e campanhas em uma única central inteligente.
        </p>
        
        <div className="hero-buttons-row">
          <button 
            className="btn-premium-cta"
            onClick={() => navigate('/criacao/editor')}
          >
            <Plus size={16} /> Criar novo projeto
          </button>
          
          <button 
            className="btn-premium-secondary"
            onClick={() => navigate('/criacao/editor?generate=true')}
          >
            <Sparkles size={14} style={{ color: 'var(--primary)', marginRight: '2px' }} /> Gerar com IA
          </button>

          <button 
            className="btn-premium-secondary"
            onClick={() => navigate('/gestao/produtos')}
          >
            <Upload size={14} style={{ color: 'var(--primary)', marginRight: '2px' }} /> Importar conteúdo
          </button>
        </div>
      </div>

      {/* Hero Right Nebula Cloud */}
      <div className="hero-right-section">
        <div className="pink-nebula-wrapper">
          <canvas ref={canvasRef} className="particle-canvas" />
        </div>
        <div className="floating-brand-logo-card">
          <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 0 25px color-mix(in srgb, var(--primary) 95%, transparent))' }}>
            <defs>
              <linearGradient id="heroLogoBubbleGrad" x1="0" y1="0" x2="24" y2="24">
                <stop offset="0%" stop-color="var(--primary)" />
                <stop offset="100%" stop-color="var(--secondary)" />
              </linearGradient>
            </defs>
            <path 
              d="M 6 2 C 3.8 2 2 3.8 2 6 V 15 C 2 16.5 2.8 17.8 4 18.5 L 2 21 L 7 19.5 H 18 C 20.2 19.5 22 17.7 22 15.5 V 6 C 22 3.8 20.2 2 18 2 H 6 Z" 
              fill="url(#heroLogoBubbleGrad)" 
            />
            <path 
              d="M 14.5 5.5 L 8.5 12.5 H 12 L 9.5 18.5 L 15.5 11.5 H 12 L 14.5 5.5 Z" 
              fill="#FFFFFF" 
            />
          </svg>
        </div>
      </div>

      {/* Overlapping Metric Cards */}
      <div className="premium-metrics-bar">
        <MetricCard 
          label="Agentes ativos" 
          value="12" 
          change="+2 hoje" 
          changeColor="var(--primary)"
          icon={Cpu} 
        />
        <MetricCard 
          label="Tarefas concluídas" 
          value="156" 
          change="+18%" 
          changeColor="var(--primary)"
          icon={CheckCircle} 
        />
        <MetricCard 
          label="Tempo economizado" 
          value="24h" 
          change="+32%" 
          changeColor="var(--primary)"
          icon={Clock} 
        />
        <MetricCard 
          label="Performance geral" 
          value="94%" 
          change="Excelente" 
          changeColor="#34C759"
          icon={TrendingUp} 
        />
      </div>
    </div>
  );
};
