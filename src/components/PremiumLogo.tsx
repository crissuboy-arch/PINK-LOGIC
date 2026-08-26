import React from 'react';

interface PremiumLogoProps {
  compact?: boolean;
  sizeMultiplier?: number;
}

export const PremiumLogo: React.FC<PremiumLogoProps> = ({ compact = false, sizeMultiplier = 1.0 }) => {
  return (
    <div className={`premium-logo ${compact ? 'compact' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
      <div className="logo-icon-wrap" style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${34 * sizeMultiplier}px`,
        height: `${34 * sizeMultiplier}px`,
        flexShrink: 0
      }}>
        {/* Official speech bubble with thunderbolt logo replica */}
        <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 2px 8px rgba(255, 79, 216, 0.45))' }}>
          <defs>
            <linearGradient id="logoBubbleGrad" x1="0" y1="0" x2="24" y2="24">
              <stop offset="0%" stop-color="#FF2D9B" />
              <stop offset="100%" stop-color="#BF5AF2" />
            </linearGradient>
          </defs>
          {/* Rounded square-ish speech bubble with bottom-left tail pointing down-left */}
          <path 
            d="M 6 2 C 3.8 2 2 3.8 2 6 V 15 C 2 16.5 2.8 17.8 4 18.5 L 2 21 L 7 19.5 H 18 C 20.2 19.5 22 17.7 22 15.5 V 6 C 22 3.8 20.2 2 18 2 H 6 Z" 
            fill="url(#logoBubbleGrad)" 
          />
          {/* Sharp centered white thunderbolt/lightning bolt */}
          <path 
            d="M 14.5 5.5 L 8.5 12.5 H 12 L 9.5 18.5 L 15.5 11.5 H 12 L 14.5 5.5 Z" 
            fill="#FFFFFF" 
          />
        </svg>
      </div>

      {!compact && (
        <span className="logo-text notranslate" translate="no" style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: `${1.15 * sizeMultiplier}rem`,
          fontWeight: 800,
          letterSpacing: '0.04em',
          color: '#FFFFFF',
          filter: 'drop-shadow(0 0 8px rgba(255, 45, 155, 0.2))',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          whiteSpace: 'nowrap',
          textTransform: 'uppercase'
        }}>
          PINK<span style={{ color: '#FF2D9B', textShadow: '0 0 12px rgba(255, 45, 155, 0.5)' }}>LOGIC</span>
        </span>
      )}
    </div>
  );
};

export default PremiumLogo;
