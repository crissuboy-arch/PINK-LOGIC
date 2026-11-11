# Ligação de IA — Fase 3 (implementação)

Data: **2026-11-11**. Branch: `feat/pink-logic-2-fase-1`. Custo: **$0** (nenhuma
chamada paga executada; os testes usam fetch injectado).

## O que foi feito

Ecrã **«Ligação de IA»** dentro do Pink Logic Desktop (`/sistema/ia`, menu
Inteligência), com três modos:

| Modo | Comportamento |
|---|---|
| **Modo de teste (predefinido)** | Fluxo de carrosséis com templates locais + conteúdos de teste. Rótulo visível de demonstração no ecrã de ligação e no fluxo. Nunca finge usar os modelos da OpenAI. |
| **API da OpenAI (BYOK)** | Geração real atrás do gate: chave guardada + opt-in explícito + limites. Sem chave, o adaptador recusa com mensagem clara e o fluxo continua em modo de teste. |
| **Desligada** | Nenhuma geração de copy ou imagens. |

O indicador de estado (`IA: Modo de teste` / `IA: API ligada` / `IA: Desligada`)
vive no cabeçalho (clica para abrir o ecrã) e no topo do fluxo de carrosséis —
um só estado (`useAiConnection`), sempre coerente.

## Chave — onde vive e fallback

- **Desktop:** cifrada com `safeStorage` do Electron e guardada em
  `<userData>/ai-connection.json` (só o texto cifrado em base64; fora do repo,
  fora de ficheiros de projecto). O renderer **nunca** recebe a chave: o teste
  de ligação e a geração real correm no processo main (`packages/desktop/src/aiApi.ts`).
- **Fallback documentado:** se `safeStorage.isEncryptionAvailable()` for falso
  (ex.: Linux sem Secret Service), a chave **não** é guardada em disco — fica
  só em memória durante a sessão. No browser (sem desktop) acontece o mesmo:
  as definições vão para localStorage, a chave nunca. Guardar em texto simples
  nunca é uma opção.
- A chave nunca aparece em ficheiros de projecto, commits ou logs: só circula
  o `keyHint` (`sk-…abcd`); `redactText()` limpa-a de mensagens de erro.

## Teste de ligação e limites

- **«Testar ligação» é custo zero:** `GET /v1/models` — não gera texto nem
  imagem. Uma 401 dá erro legível («chave rejeitada»).
- Limites predefinidos conservadores: **teto $5/mês**, **máximo $0.10/chamada**,
  modelo `gpt-4o-mini`. O gate é verificado **antes** de qualquer chamada paga;
  acima do teto, a chamada é recusada e o fluxo volta ao modo de teste. O gasto
  é registado por mês (`AAAA-MM`).
- A geração real e a de teste devolvem a **mesma forma** (`GeneratedCopy` /
  imagem): o fluxo não muda quando a API for activada. Resposta da API com nº
  de slides errado é rejeitada sem aplicar nada.

## Ficheiros

- `packages/web/src/services/aiConnection.ts` — tipos, estado, gate, limites,
  redacção, adaptador (fetch injectado; testável sem rede).
- `packages/web/src/hooks/useAiConnection.ts` — estado partilhado (IPC no
  desktop, fallback em memória no browser).
- `packages/web/src/pages/Settings/AIConnection.tsx` — ecrã de ligação.
- `packages/web/src/components/AIStatusBadge.tsx` — indicador (novos rótulos).
- `packages/web/src/types/desktopApi.d.ts` — declaração única da ponte.
- `packages/desktop/src/secrets.ts` — safeStorage + ficheiro atómico.
- `packages/desktop/src/aiApi.ts` — teste + geração real no main.
- `packages/desktop/src/preload.ts`, `main.ts` — IPC `pink-logic:ai-*`.
- `tests/ai-connection.test.mjs` — 13 testes (ver abaixo).

## Testes (reais, corridos 2026-11-11)

- `tests/ai-connection.test.mjs`: **13/13 PASS** (predefinições, estado/rótulos,
  teste sem rede, recusa sem chave, gate sem opt-in, limites, teste de ligação
  GET, 401, geração API com stub, slides errados rejeitados, imagens, segredo,
  definições inválidas).
- `tests/carousel-flow.test.mjs`: **20/20 PASS** (sem regressão).
- Restantes suites corridas: template/content/render 27/27, approval/meta/security 25/25.
- Build web (`tsc -b && vite build`): **PASS**. Build desktop (`tsc`): **PASS**.

## Por fazer / não verificado

- **Electron ao vivo não verificado nesta tarefa:** o self-test do desktop
  (`test:selftest`) não foi corrido aqui — a demonstração final (outra tarefa)
  deve corrê-lo e abrir o ecrã `/sistema/ia` no app empacotado.
- **Geração real nunca executada:** o código existe atrás do gate, mas nenhuma
  chamada paga foi feita (nem com stub real). A primeira geração real exige
  chave da Cristiane + opt-in dela no ecrã.
- **Legado pré-existente (não tocado):** `packages/web/src/ai/OpenAIClient.ts`
  continua a guardar a chave em `localStorage` (`pinklogic.openai.key`) para os
  agentes antigos — o novo fluxo **não** usa esse caminho. Se se quiser
  eliminar esse risco, é trabalho à parte (migrar os agentes para este
  adaptador).
- `aiApi.ts` (main) espelha o contrato de `aiConnection.ts` (web) sem importar
  o ficheiro — manter os dois sincronizados quando os limites/preços mudarem.
