# ChatGPT ↔ Pink Logic Desktop — integração oficial

Data da pesquisa: **2026-11-11** (fontes oficiais da OpenAI, lidas nesta data).
Âmbito: o que a assinatura ChatGPT permite oficialmente, o que foi implementado
nesta fase, e o guião de teste para a Cristiane correr na conta dela.

## Resumo executivo

1. **O caminho GPT privado + Actions, construído a 11/11, tem prazo de validade.**
   A OpenAI vai aposentar os GPTs personalizados a **11 de dezembro de 2026**
   (data padrão; ver fontes). Os GPTs existentes continuam usáveis até lá, mas
   **as Actions NÃO migram** para plugins — têm de ser reconstruídas, e a
   substituição indicada pela OpenAI é um servidor MCP próprio.
2. **O caminho durável é o plugin com servidor MCP próprio.** Nesta fase foi
   implementado o transporte **Streamable HTTP** para o servidor MCP existente
   (`packages/mcp`), testado localmente com **14 tools** e uma tool de leitura
   ponta a ponta. Custo: **$0**.
3. **A ligação real no ChatGPT dela ainda NÃO foi testada** — não é possível
   daqui (precisa da conta dela e de um túnel ou URL pública). O guião de teste
   está na secção 5. Há ainda uma incógnita de plano: o artigo oficial não
   menciona o **Plus** para servidores MCP próprios (ver secção 1).

## 1. O que a assinatura ChatGPT permite (oficial)

Fontes: Help Center e guias de developers da OpenAI (URLs na secção 6).

| Capacidade | Estado oficial (2026-11-11) |
|---|---|
| GPT privado com Actions (OpenAPI + API key) | Existe, mas em fim de vida: criação de GPTs novos **fechada em contas pessoais (Free, Go, Plus, Pro)**; GPTs existentes usáveis até **11/12/2026**; **Actions não transferem** na migração para plugins |
| Servidor MCP próprio (plugin) | Suporte MCP completo só em **Business e Enterprise/Edu**, na web. **Pro**: ligar servidores próprios só com permissões de leitura/fetch. **Plus: não mencionado no artigo oficial** — por confirmar na conta dela |
| Developer Mode | O fluxo atual de Plugins **não exige ligar o Developer Mode** — adiciona-se o servidor direto em Plugins, aceitando o aviso de risco por servidor. O guia antigo de Developer Mode (`developers.openai.com/api/docs/guides/developer-mode`) devolve **404** |
| Apps SDK / plugins | Substituto oficial dos GPTs. Um plugin junta skills (instruções + ficheiros) e apps ligadas. Criação via Plugin Creator (`@plugin-creator`) |
| ChatGPT Sites a hospedar um plugin | Um Site pode hospedar um servidor MCP que dá tools ao ChatGPT através de um plugin; hosting incluído no **Plus e Pro**, sem limite fixo de Sites. Não testado nesta fase |
| Ligar a um servidor MCP local | **Não diretamente.** O ChatGPT só se liga a servidores MCP remotos (HTTPS público) ou via **Secure MCP Tunnel** (o `tunnel-client` corre junto ao servidor e abre só HTTPS de saída para a OpenAI; o servidor não precisa de porta pública) |
| Protocolos MCP suportados | SSE e streaming HTTP |
| Autenticação do servidor MCP no ChatGPT | **OAuth, "No authentication" ou misto (OAuth ou sem auth)**. **Não há opção de API key / Bearer** no formulário de ligação |
| Onde funciona | **Só na web** (chatgpt.com). Não no mobile |

### GPT privado (Actions) vs utilização nativa da assinatura

- **GPT privado + Actions** = uma configuração guardada dentro do ChatGPT que,
  durante a conversa, chama uma API externa descrita num schema OpenAPI, com
  uma API key. Só vive dentro do ChatGPT; **não pode ser chamada por código,
  API ou outro sistema**. É o que foi construído a 11/11: 14 operações
  (`docs/openapi-chatgpt.json`, OpenAPI 3.1.0, auth `ChatGPTKey`, servidor =
  preview da branch `feat/chatgpt-gpt-actions-test`), 9/20 testes ao vivo PASS.
- **Utilização nativa da assinatura** = usar o ChatGPT (web/app) com as
  funcionalidades do plano: projetos, plugins instalados, apps ligadas
  (Google Drive, GitHub, etc.), Codex. Não dá acesso programático a nada:
  a assinatura não inclui créditos nem chaves da API da OpenAI.
- **Servidor MCP próprio (plugin)** = o ChatGPT liga-se como cliente MCP a um
  servidor nosso (neste caso, o `pink-logic-mcp`). É o único dos três que
  sobrevive à aposentação dos GPTs — e é o que esta fase implementa.

## 2. O que a assinatura NÃO permite

- **Acesso programático à API da OpenAI a partir da assinatura.** ChatGPT e
  API são produtos e faturações separados: o Plus/Pro não inclui créditos de
  API, nem dá uma chave de API. Quem quiser chamar modelos por código precisa
  de conta e faturação próprias em `platform.openai.com` (pagas).
- **Extrair cookies, tokens de sessão ou credenciais da conta** para usar
  noutro sistema. Não há mecanismo oficial para isso; fazê-lo viola os termos
  e parte a qualquer mudança da OpenAI.
- **Automatizar a interface do ChatGPT** (scripts que clicam, raspam ou
  conduzem o chat por fora). Não há automação de UI oficialmente suportada.
- **Chamar um GPT pela API.** Um GPT só corre dentro do ChatGPT.
- **Ligar o ChatGPT a `localhost`.** Sem URL pública nem túnel, não há ligação.

## 3. O que foi implementado nesta fase

### 3.1 Transporte Streamable HTTP para o servidor MCP existente

O servidor MCP já existia só em stdio (para a Athena). Foi refatorado sem
mudar nenhuma tool:

- `packages/mcp/src/server.ts` — **novo**: fábrica `createMcpServer()` com as
  **14 tools** (antes embutidas no `index.ts`). A chave para chamar a API
  passa a ser `PINK_LOGIC_MCP_API_KEY` (preferida) ou `PINK_LOGIC_SERVICE_KEY`
  (legado, comportamento do stdio inalterado).
- `packages/mcp/src/index.ts` — entrada stdio (Athena), agora fina; regressão
  testada (secção 4).
- `packages/mcp/src/http.ts` — **novo**: servidor HTTP (só `node:http`, sem
  dependências novas), transporte **Streamable HTTP stateless** do SDK MCP
  1.32.1:
  - `GET /health` — sem auth, `{ ok, service, transport, version }`.
  - `POST /mcp` — JSON-RPC MCP (`initialize`, `tools/list`, `tools/call`…).
  - `GET /mcp` — 405 (modo stateless, sem stream SSE persistente).
- `packages/mcp/package.json` — scripts `dev:http` e `start:http`.

Segurança do endpoint (fail closed):

- `PINK_LOGIC_MCP_KEY` (Bearer, ≥ 32 chars, comparação em tempo constante).
  **Chave dedicada gerada nesta fase**, guardada APENAS em
  `~/workspace/your_files/pink-logic-mcp-key.txt` (nunca no repo, no chat,
  nos commits ou nos logs).
- Sem chave + bind não-loopback → o servidor **recusa arrancar**.
- Sem chave + loopback (`127.0.0.1`, default, porta `3003`) → arranca sem auth,
  só para uso local / túnel. Nunca expor assim.

### 3.2 Âmbito mínimo (least privilege) para o ChatGPT

O servidor MCP chama a API Pink Logic com uma chave do lado do servidor.
Para a exposição ao ChatGPT, configurar `PINK_LOGIC_MCP_API_KEY` com a chave
de âmbito mínimo `kind: chatgpt` — **a mesma `PINK_LOGIC_CHATGPT_KEY` já
existente** (`~/workspace/your_files/pink-logic-chatgpt-key.txt`), nunca a
service key. A API responde **403** a aprovar/agendar/publicar/apagar com essa
chave, por isso as tools `publish_post` e `schedule_post` falham do lado da
API mesmo que o ChatGPT as invoque. Regra da casa mantida: **nada é publicado
sem aprovação humana** — o ChatGPT também pede confirmação antes de ações de
escrita, por omissão.

### 3.3 O que NÃO foi feito (e porquê)

- **Servidor OAuth próprio para o MCP**: o formulário do ChatGPT só aceita
  OAuth ou sem auth — um Bearer não chega. Implementar um authorization server
  OAuth 2.1 completo (discovery, CIMD/DCR) é trabalho de outra fase e não é
  preciso para o caminho do túnel. Não foi fingido que o Bearer funciona no
  ChatGPT.
- **Deploy público do MCP**: nada em produção sem go dela. O servidor corre
  localmente; a URL pública (preview Vercel ou outro host) é passo pendente.
- **Nada tocado**: `packages/api/src/services/aisa.ts`, código/docs do collect
  (AIsa em PAUSA por decisão dela) e `docs/openapi-chatgpt.json` (tem uma
  alteração não commitada do coordenador — deixada como está).

## 4. Testes executados (reais, locais, $0)

Ambiente: API local em `:3002` (sem chaves — só `/health` responde sem auth),
MCP HTTP em `127.0.0.1:3003` com a chave dedicada. Nenhuma chamada paga.

| # | Teste | Resultado |
|---|---|---|
| 1 | Build MCP (`tsc`) | **PASS** |
| 2 | Bind `0.0.0.0` sem chave | **PASS** — recusa arrancar, exit 1 |
| 3 | `GET /health` sem auth | **PASS** — 200 `{ ok: true, service: "pink-logic-mcp", transport: "streamable-http", version: "2.0.0" }` |
| 4 | `POST /mcp` sem auth | **PASS** — 401 |
| 5 | `POST /mcp` com chave errada | **PASS** — 401 |
| 6 | `POST /mcp` `initialize` com chave | **PASS** — 200, `protocolVersion 2025-03-26`, `serverInfo pink-logic 2.0.0` |
| 7 | `POST /mcp` `tools/list` | **PASS** — **14 tools**: `generate_carousel_content`, `generate_logo`, `generate_qrcode`, `generate_sticker`, `decide`, `collect_trends`, `create_post`, `list_posts`, `update_post`, `schedule_post`, `publish_post`, `api_health`, `render_carousel`, `generate_mockup` |
| 8 | `POST /mcp` `tools/call api_health` | **PASS** — ponta a ponta: devolveu `{ ok: true, service: "pink-logic-api", version: "2.0.0", integrations: { jev: false, aisa: false } }` da API local |
| 9 | `POST /mcp` `tools/call list_posts` sem chave de API | **PASS** (controlo negativo) — erro propagado da API: `Não autenticado: faça login.` |
| 10 | `GET /mcp` | **PASS** — 405 (stateless) |
| 11 | Regressão stdio (`node dist/index.js`, `initialize` + `tools/list`) | **PASS** — 14 tools, comportamento igual ao anterior |

**Não testado** (fora do alcance desta fase): ligação real dentro da conta
ChatGPT dela; `tunnel-client`; deploy público; `collect_trends` ao vivo
(AIsa em pausa — a tool existe, a API devolve erro por o endpoint AIsa não
existir; não mexido por decisão dela).

## 5. Guião de teste — para a Cristiane correr na conta dela

Pré-requisito: plano ChatGPT **Plus** (é o dela). Atenção: o artigo oficial
não menciona o Plus para servidores MCP próprios — o passo 1 diz logo se a
opção aparece ou não.

### Passo 0 — Preparar o servidor (eu)

1. Eu deixo o MCP HTTP a correr em `127.0.0.1:3003` nesta VM com
   `PINK_LOGIC_MCP_API_KEY` = chave `kind: chatgpt` (âmbito mínimo).
2. Preciso dela: **criar o túnel na OpenAI Platform** (ver passo 1) e entregar
   o `tunnel_id` + uma **chave restrita de API com permissões Tunnels Read +
   Use** pelo fluxo seguro (nunca no chat). Sem isto, o ChatGPT não alcança
   o servidor local.

### Passo 1 — Criar o Secure MCP Tunnel (ela, na Platform)

1. Abrir `platform.openai.com` → Settings → Organization → **Tunnels**.
2. Criar um túnel, associar a organização pessoal dela **e** ao workspace do
   ChatGPT dela.
3. Copiar o `tunnel_id` (formato `tunnel_...`).
4. Criar uma chave de API **restrita** só com Tunnels **Read + Use**.

### Passo 2 — Ligar o túnel ao MCP local (eu)

Com o `tunnel_id` e a chave restrita, eu corro o `tunnel-client` da OpenAI
nesta VM apontado a `http://127.0.0.1:3003/mcp` e confirmo com
`tunnel-client doctor` que está saudável e a escutar. O `tunnel-client` tem
de ficar a correr durante todo o teste no ChatGPT.

### Passo 3 — Adicionar o servidor no ChatGPT (ela, na web)

1. Em `chatgpt.com` (web, não mobile), abrir **Plugins** → botão **+** →
   **Add custom MCP server**.
   - Se esta opção **não aparecer** na conta Plus dela: o Plus não permite
     servidores MCP próprios. Registar isso e parar aqui — o caminho passa a
     ser o GPT (até 11/12/2026) ou subir de plano, decisão dela.
2. Nome: `Pink Logic`. Em **Connection**, escolher **Tunnel** e selecionar o
   túnel do passo 1 (ou colar o `tunnel_id`).
3. Em **Authentication**, escolher **No authentication** (o acesso é controlado
   pelo túnel; o servidor só existe atrás dele).
4. Aceitar o aviso de risco (**I understand and want to continue**) →
   **Create as a plugin**. Rever as tools descobertas (devem ser as 14).
5. Instalar o plugin.

### Passo 4 — Testar numa conversa (ela)

1. Nova conversa, escrever `@` e escolher o plugin **Pink Logic**.
2. Testes de leitura (devem passar):
   - «Usa a app Pink Logic para verificar se a API está viva.» →
     esperado: tool `api_health`, resposta com `ok: true`.
   - «Usa a app Pink Logic para listar os meus posts.» →
     esperado: tool `list_posts` (lista vazia ou os rascunhos dela).
3. Teste de escrita com confirmação (rascunho apenas, nada publicado):
   - «Usa a app Pink Logic para criar um rascunho de post com o título
     "Teste MCP" e a legenda "teste de integração, não publicar".» →
     esperado: o ChatGPT pede confirmação, depois chama `create_post`;
     confirmar no site que ficou **rascunho**.
4. Teste de limite (deve FALHAR com 403 da API — é o comportamento certo):
   - «Usa a app Pink Logic para publicar esse post agora.» →
     esperado: erro / recusa, porque a chave `chatgpt` não pode publicar.
     Se publicar, parar e avisar — é um problema de permissões.

### Passo 5 — Migrar o GPT (quando a opção chegar à conta dela)

1. Em **My GPTs** → selecionar o GPT Pink Logic → **Migrate to plugin**.
2. Rever as instruções migradas (viram uma skill) e testar com os mesmos
   pedidos do passo 4.
3. **As Actions não migram**: o plugin MCP agora implementado é o substituto
   delas — comparar os resultados antes de deixar de usar o GPT.
4. O GPT original fica só de leitura após a migração e desaparece a
   **11/12/2026**.

## 6. Fontes oficiais (consultadas 2026-11-11)

- Ligar servidores MCP próprios no ChatGPT (disponibilidade por plano,
  Pro só leitura/fetch, local só via túnel, só web):
  `https://help.openai.com/en/articles/12584461-connecting-custom-mcp-servers-in-chatgpt`
- Adicionar servidor MCP próprio (protocolos SSE/streaming HTTP; auth OAuth,
  sem auth ou mista; sem opção de API key):
  `https://developers.openai.com/api/docs/guides/custom-mcp-server`
- Secure MCP Tunnel (túnel de saída, `tunnel-client`, permissões Tunnels
  Read + Use, limites 600 req/min, 10 MiB, 120 s):
  `https://developers.openai.com/api/docs/guides/secure-mcp-tunnels`
- Configurar Actions em GPTs (auth API key/Bearer/OAuth; aviso de aposentação;
  Actions não transferem):
  `https://help.openai.com/en/articles/9442513-configuring-actions-in-gpts`
- Aposentação e migração de GPTs (11/12/2026; criação fechada em contas
  pessoais; migração em My GPTs → Migrate to plugin):
  `https://help.openai.com/en/articles/20001519-custom-gpt-retirement-and-migration-faq`
- Sites do ChatGPT a hospedar plugins (Plus/Pro incluído):
  `https://help.openai.com/en/articles/20001339-creating-and-using-chatgpt-sites`

## 7. Pendentes / próximo passo

1. **Ela**: dizer se a opção **Add custom MCP server** aparece na conta Plus
   dela (passo 3.1 do guião) — é a incógnita que decide o caminho.
2. **Ela**: criar o túnel + chave restrita (passo 1) quando quiser o teste real.
3. **Eu** (depois do 1+2): correr o `tunnel-client` e acompanhar o teste ao
   vivo no ChatGPT dela.
4. **Decisão dela**: URL pública para o MCP (preview Vercel ou outro host) e
   servidor OAuth próprio, se quiser dispensar o túnel — trabalho de outra
   fase, com go explícito.
5. **Prazo**: o GPT privado com Actions deixa de existir a **11/12/2026** —
   o plugin MCP deve estar testado antes dessa data.
