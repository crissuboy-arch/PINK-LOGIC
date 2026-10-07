/**
 * pages/Criacao/SubPages.tsx — RECONSTRUÍDO em 2026-10-07.
 *
 * O ficheiro original foi commitado corrompido (109KB de bytes nulos)
 * no "initial push". Estes 5 componentes eram importados pelo App.tsx
 * mas o código perdeu-se. Reconstruídos como placeholders até serem
 * reimplementados como deve ser.
 */
const ModulePlaceholder = ({ title, hint }: { title: string; hint?: string }) => (
  <div className="card">
    <h2 className="brand-font" style={{ fontSize: "2rem", marginBottom: "1rem" }}>{title}</h2>
    <p style={{ color: "var(--text-secondary)" }}>
      Módulo em reconstrução. {hint || "Em breve disponível na máquina de conteúdo."}
    </p>
  </div>
);

export const StoryCreator = () => (
  <ModulePlaceholder title="Criador de Histórias" hint="Geração de stories em PNG — será ligado ao POST /api/generate." />
);
export const CopyGenerator = () => (
  <ModulePlaceholder title="Gerador de Copy" hint="Copy real via AIsa — o mock de templates foi removido." />
);
export const StrategicVision = () => (
  <ModulePlaceholder title="Visão Estratégica" hint="Análise de nicho — será ligado à coleta AIsa + Jev." />
);
export const StickerStudio = () => (
  <ModulePlaceholder title="Estúdio de Stickers" hint="Stickers com fundo transparente — será ligado ao POST /api/generate." />
);
export const HubModels = () => (
  <ModulePlaceholder title="Hub de Modelos" hint="Central de modelos IA via AIsa." />
);
