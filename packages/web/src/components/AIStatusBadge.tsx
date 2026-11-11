// Indicador de estado da ligação de IA — Fase 3.
// Um só estado para toda a app (useAiConnection): o rótulo aqui é sempre o
// mesmo que o do ecrã «Ligação de IA» e o do fluxo de carrosséis.
// Rótulos: «IA: Modo de teste» / «IA: API ligada» / «IA: Desligada».
// «Modo de teste» significa conteúdo de demonstração (templates locais) —
// nunca finge usar os modelos da OpenAI.
import { Brain, Wifi, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAiConnection } from '../hooks/useAiConnection';
import { AI_STATUS_DESCRIPTIONS, type AiEffectiveStatus } from '../services/aiConnection';

const badgeConfig: Record<AiEffectiveStatus, { color: string; bg: string; icon: typeof Brain }> = {
  teste: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: Brain },
  api: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: Wifi },
  desligada: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: WifiOff },
};

export default function AIStatusBadge() {
  const { label, status } = useAiConnection();
  const navigate = useNavigate();
  const cfg = badgeConfig[status];
  const Icon = cfg.icon;

  return (
    <button
      type="button"
      onClick={() => navigate('/sistema/ia')}
      title={`${AI_STATUS_DESCRIPTIONS[status]} Clique para abrir «Ligação de IA».`}
      aria-label={label}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.6rem', borderRadius: '100px', fontSize: '0.65rem', fontWeight: 700, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}20`, letterSpacing: '0.05em', cursor: 'pointer' }}
    >
      <Icon size={10} />
      {label}
    </button>
  );
}
