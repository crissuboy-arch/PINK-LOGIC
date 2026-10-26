import { useState, useEffect } from 'react';
import { Brain, Wifi, WifiOff } from 'lucide-react';
import { getAIStatus, type AIStatus } from '../ai/detectApiKey';

const badgeConfig: Record<AIStatus, { label: string; title: string; color: string; bg: string; icon: typeof Brain }> = {
  real: { label: 'IA REAL', title: 'Geração IA com chave OpenAI.', color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: Wifi },
  // "IA MOCK" refere-se SÓ à geração IA sem chave OpenAI — nunca aos dados:
  // projetos, posts e aprovações continuam guardados no Supabase.
  mock: { label: 'IA MOCK', title: 'Geração IA sem chave OpenAI. Os teus projetos, posts e aprovações continuam no Supabase.', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: Brain },
  offline: { label: 'IA OFFLINE', title: 'Geração IA indisponível.', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: WifiOff },
};

export default function AIStatusBadge() {
  const [status, setStatus] = useState<AIStatus>(getAIStatus());

  useEffect(() => {
    const check = () => setStatus(getAIStatus());
    window.addEventListener('storage', check);
    window.addEventListener('pinklogic:ai-key-changed', check);
    return () => { window.removeEventListener('storage', check); window.removeEventListener('pinklogic:ai-key-changed', check); };
  }, []);

  const cfg = badgeConfig[status];
  const Icon = cfg.icon;

  return (
    <span title={cfg.title} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.6rem', borderRadius: '100px', fontSize: '0.65rem', fontWeight: 700, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}20`, letterSpacing: '0.05em' }}>
      <Icon size={10} />
      {cfg.label}
    </span>
  );
}