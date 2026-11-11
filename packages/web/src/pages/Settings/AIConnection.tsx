import type { ChatGPTConnectionStatus } from '../../types/desktopApi';
// ---------------------------------------------------------------------------
// Ecrã «Ligação de IA» — Fase 3 (Sistema → Ligação de IA).
//
// - MODO DE TESTE (predefinido): templates locais + conteúdos de teste, com
//   rótulo visível de demonstração. Nunca finge usar os modelos da OpenAI.
// - ADAPTADOR OpenAI (BYOK): campo para a chave do utilizador, guardada
//   localmente de forma segura (safeStorage no Desktop; só em memória no
//   browser — ver useAiConnection). Botão «Testar ligação» de custo zero
//   (GET /v1/models, sem gerar texto/imagem). Limites de custo configuráveis.
// - A geração real fica DESACTIVADA por predefinição e só é chamada com
//   chave + opt-in explícito + dentro dos limites.
// ---------------------------------------------------------------------------
import { useEffect, useState } from 'react';
import { useAiConnection } from '../../hooks/useAiConnection';
import {
  AI_STATUS_DESCRIPTIONS, apiNotReadyReason, redactText,
  type AiConnectionTest, type AiMode,
} from '../../services/aiConnection';

const label = { fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4, display: 'block' } as const;
const inputStyle = { width: '100%', padding: '0.6rem', borderRadius: 8, border: '1px solid var(--border, #ddd)', fontSize: '0.9rem' } as const;

const MODE_OPTIONS: { id: AiMode; label: string; hint: string }[] = [
  { id: 'teste', label: 'Modo de teste (predefinido)', hint: 'Templates locais + conteúdos de teste. Custo $0. Não usa os modelos da OpenAI.' },
  { id: 'api', label: 'API da OpenAI (BYOK)', hint: 'Geração real com a tua chave. Só funciona com chave guardada + activação explícita abaixo.' },
  { id: 'desligada', label: 'Desligada', hint: 'Nenhuma geração de copy ou imagens — o fluxo só edita o que já existe.' },
];

export default function AIConnectionPage() {
  const ai = useAiConnection();
  const [chatGPTMessage, setChatGPTMessage] = useState("");
  const [chatGPTState, setChatGPTState] = useState<ChatGPTConnectionStatus | null>(null);
  const [planConsent, setPlanConsent] = useState(false);
  const [realText, setRealText] = useState('');
  const [generatingPlan, setGeneratingPlan] = useState(false);
  useEffect(() => {
    let active = true;
    const refresh = () => { void window.pinkLogicDesktop?.getChatGPTStatus().then(s => {if(active) setChatGPTState(s);}).catch(() => {if(active) setChatGPTMessage('Não foi possível verificar a sessão própria.');}); };
    refresh(); const timer = setInterval(refresh, 3000);
    return () => { active = false; clearInterval(timer); };
  }, []);

  const { state, label: statusLabel, status } = ai;
  const [keyInput, setKeyInput] = useState('');
  const [monthlyCap, setMonthlyCap] = useState('');
  const [maxPerCall, setMaxPerCall] = useState('');
  const [model, setModel] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<AiConnectionTest | null>(null);

  const run = async (fn: () => Promise<void>) => {
    setError(null);
    setNotice(null);
    try {
      await fn();
    } catch (e) {
      setError(redactText(e instanceof Error ? e.message : String(e)));
    }
  };

  const saveKey = () => run(async () => {
    const result = await ai.saveKey(keyInput);
    setKeyInput('');
    setNotice(result.message);
  });

  const saveLimits = () => run(async () => {
    const patch: Partial<typeof state.settings> = {};
    if (monthlyCap.trim()) patch.monthlyCapUsd = Number(monthlyCap);
    if (maxPerCall.trim()) patch.maxPerCallUsd = Number(maxPerCall);
    if (model.trim()) patch.model = model.trim();
    if (!Object.keys(patch).length) throw new Error('Indica pelo menos um valor para guardar.');
    await ai.saveSettings(patch);
    setMonthlyCap('');
    setMaxPerCall('');
    setModel('');
    setNotice('Limites guardados.');
  });

  const runTest = () => run(async () => {
    setTesting(true);
    try {
      const result = await ai.testConnection();
      setTestResult(result);
      if (result.ok) {
        setNotice(`Ligação OK — a chave funciona (${result.modelCount} modelos listados, sem gerar nada, custo $0).`);
      } else {
        setError(result.error ?? 'O teste falhou.');
      }
    } finally {
      setTesting(false);
    }
  });

  const notReady = apiNotReadyReason(state);

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '1rem' }}>
      <h2 className="brand-font" style={{ fontSize: '1.6rem', margin: '0 0 4px' }}>Ligação de IA</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 1rem' }}>
        Estado actual: <strong>{statusLabel}</strong> — {AI_STATUS_DESCRIPTIONS[status]}
      </p>

      {status === 'teste' && (
        <p data-testid="ai-demo-banner" style={{ background: '#FFF7E0', border: '1px solid #D4AF37', borderRadius: 8, padding: '0.7rem', fontSize: '0.85rem', color: '#4a3600' }}>
          <strong>Conteúdo de demonstração — modo de teste.</strong> O fluxo de carrosséis gera copy
          com templates locais. Não usa os modelos da OpenAI nem gasta nada.
        </p>
      )}
      {error && <p style={{ color: '#b00020', fontSize: '0.85rem' }}>{error}</p>}
      {notice && <p style={{ color: '#0a6b2d', fontSize: '0.85rem' }}>{notice}</p>}

      <section className="card" style={{ padding: 20, marginBottom: 16 }}>
        <h3>Conectar ChatGPT</h3>
        <p>Sessão: {chatGPTState?.connected ? 'identidade autorizada no Pink Logic' : 'não conectado no Pink Logic'}. Login do Codex não liga esta aplicação. Identidade, permissão do plano e geração concluída são estados diferentes.</p>
        <button data-testid="connect-chatgpt" onClick={() => void run(async () => { const s = await window.pinkLogicDesktop?.beginChatGPTLogin(); if(s) setChatGPTState(s); setChatGPTMessage(s?.reason || 'Abra o aplicativo desktop.'); })}>CONECTAR CHATGPT</button>
        <p role="status">{chatGPTMessage || chatGPTState?.reason}</p>
        <p>Uso do plano: {chatGPTState?.subscriptionAuthorized ? 'autorizado' : 'não autorizado'}. Texto real: {chatGPTState?.textGenerationVerified ? 'verificado por resposta concluída' : 'não verificado'}. Imagens por esta rota: indisponíveis.</p>
        {chatGPTState?.status === 'connecting' && <button onClick={() => void run(async () => { setChatGPTState(await window.pinkLogicDesktop!.cancelChatGPTLogin()); })}>Cancelar autorização</button>}
        {chatGPTState?.connected && <button onClick={() => void run(async () => { setChatGPTState(await window.pinkLogicDesktop!.disconnectChatGPT()); setRealText(''); setPlanConsent(false); })}>Remover sessão deste computador</button>}
        <label><input type="checkbox" checked={planConsent} onChange={e => setPlanConsent(e.target.checked)} disabled={!chatGPTState?.textRequestAvailable}/> Autorizar um teste que utiliza os limites e as definições de uso do meu plano ChatGPT. Não ativa a API paga.</label>
        <button disabled={!chatGPTState?.textRequestAvailable || !planConsent || generatingPlan} onClick={() => void run(async () => { setGeneratingPlan(true); try { const r = await window.pinkLogicDesktop!.generateChatGPTText('Responde apenas: Pink Logic ligado.', planConsent); setRealText(r.text); setChatGPTState(await window.pinkLogicDesktop!.getChatGPTStatus()); } finally { setGeneratingPlan(false); } })}>{generatingPlan ? 'A gerar texto real…' : 'Verificar geração de texto real'}</button>
        {realText && <pre aria-label="Resposta real do plano ChatGPT">{realText}</pre>}
        <p>A remoção local não revoga o acesso no ChatGPT; utilize as definições de uso/acesso do ChatGPT para revogação. Esta versão requer nova autorização após a sessão expirar.</p>
        <p>O callback de uma ligação própria identifica Pink Logic. Uma página “Signed in to Codex” não é uma prova desta ligação.</p>
        <button onClick={() => void window.pinkLogicDesktop?.requestChatGPTAccess()}>Solicitar acesso oficial</button>
        <p>Alternativa disponível: no Fluxo de Carrosséis, copie o pedido e abra o ChatGPT no navegador; depois importe a resposta JSON. É transferência manual, sem verificação da assinatura e sem API.</p>
        <p>Esta rota Sign in with ChatGPT pode suportar texto em apps elegíveis; a prévia não suporta geração de imagens. A geração integrada no Codex é outra rota e não foi ligada a este produto comercial. A arte local tem custo de API zero. API paga permanece desativada.</p>
        <a href="https://developers.openai.com/siwc/quickstart" target="_blank" rel="noreferrer">Mecanismo oficial e elegibilidade</a>
      </section>
      <div className="card" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>1. Modo</h3>
        {MODE_OPTIONS.map((m) => (
          <label key={m.id} style={{ border: state.settings.mode === m.id ? '2px solid #103B78' : '1px solid #ddd', borderRadius: 8, padding: '0.6rem', cursor: 'pointer' }}>
            <input type="radio" name="ai-mode" checked={state.settings.mode === m.id} onChange={() => void run(() => ai.setMode(m.id))} />{' '}
            <strong>{m.label}</strong>
            <br /><span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{m.hint}</span>
          </label>
        ))}
        {notReady && <p style={{ fontSize: '0.85rem', color: '#b00020', margin: 0 }}>{notReady}</p>}
      </div>

      <div className="card" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>2. Chave da API OpenAI (tua — BYOK)</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
          Obtém a chave em <strong>platform.openai.com → API keys → Create new secret key</strong> (precisas
          de uma conta OpenAI com pagamento activo; a chave é tua e só tu pagas o uso).
          No Desktop a chave fica cifrada com a encriptação do sistema (safeStorage) e nunca sai do
          teu computador; no browser fica só em memória nesta sessão.
          A chave nunca aparece em ficheiros de projecto, commits ou logs.
        </p>
        <p style={{ fontSize: '0.85rem', margin: 0 }}>
          {state.hasKey
            ? <>Chave guardada: <strong>{state.keyHint}</strong> (armazenamento: {state.storage === 'safeStorage' ? 'encriptação do sistema' : state.storage === 'memory-only' ? 'só em memória nesta sessão' : 'nenhum'}).</>
            : 'Nenhuma chave guardada.'}
        </p>
        <label style={label}>Nova chave (começa por «sk-»)</label>
        <input
          style={inputStyle} type="password" autoComplete="off" value={keyInput}
          placeholder="sk-…" onChange={(e) => setKeyInput(e.target.value)}
        />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={saveKey} disabled={!keyInput.trim()}>Guardar chave</button>
          <button onClick={() => void run(() => ai.clearKey())} disabled={!state.hasKey}>Apagar chave</button>
          <button onClick={runTest} disabled={!state.hasKey || testing}>
            {testing ? 'A testar…' : 'Testar ligação (custo $0)'}
          </button>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
          «Testar ligação» só lista os modelos (GET /v1/models) — não gera texto nem imagem, não gasta nada.
          {state.lastTestedAt && (
            <> Último teste: {state.lastTestedAt.slice(0, 19).replace('T', ' ')} — {state.lastTestOk ? 'OK' : 'falhou'}.</>
          )}
        </p>
        {testResult?.ok && (
          <p style={{ fontSize: '0.85rem', margin: 0 }}>
            Modelos disponíveis: {testResult.modelCount}. Amostra: {testResult.models.join(', ') || '—'}.
          </p>
        )}
      </div>

      <div className="card" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>3. Geração real e limites de custo</h3>
        <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', cursor: 'pointer' }}>
          <input
            type="checkbox" checked={state.settings.apiEnabled}
            onChange={(e) => void run(() => ai.saveSettings({ apiEnabled: e.target.checked }))}
          />
          <span style={{ fontSize: '0.85rem' }}>
            <strong>Activar a geração real via API</strong> (opt-in explícito). Sem isto, mesmo com chave,
            o fluxo continua em modo de teste e nada é gasto.
          </span>
        </label>
        <p style={{ fontSize: '0.85rem', margin: 0 }}>
          Gasto este mês ({state.spend.month}): <strong>${state.spend.spentUsd.toFixed(4)}</strong> de ${state.settings.monthlyCapUsd.toFixed(2)}.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 180px' }}>
            <label style={label}>Teto por mês (USD) — actual: ${state.settings.monthlyCapUsd.toFixed(2)}</label>
            <input style={inputStyle} type="number" min="0.1" step="0.5" value={monthlyCap} placeholder="5" onChange={(e) => setMonthlyCap(e.target.value)} />
          </div>
          <div style={{ flex: '1 1 180px' }}>
            <label style={label}>Máximo por chamada (USD) — actual: ${state.settings.maxPerCallUsd.toFixed(2)}</label>
            <input style={inputStyle} type="number" min="0.01" step="0.01" value={maxPerCall} placeholder="0.10" onChange={(e) => setMaxPerCall(e.target.value)} />
          </div>
          <div style={{ flex: '1 1 180px' }}>
            <label style={label}>Modelo de texto — actual: {state.settings.model}</label>
            <input style={inputStyle} value={model} placeholder="gpt-4o-mini" onChange={(e) => setModel(e.target.value)} />
          </div>
        </div>
        <div>
          <button className="btn-primary" onClick={saveLimits}>Guardar limites</button>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
          Valores predefinidos conservadores: teto $5/mês, máximo $0.10 por chamada, modelo gpt-4o-mini.
          Acima do teto, o adaptador recusa a chamada antes de gastar — e o fluxo volta ao modo de teste.
        </p>
      </div>
    </div>
  );
}
