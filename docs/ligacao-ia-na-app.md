# Ligação de IA dentro da app — Pink Logic Desktop (Fase 3)

Data da pesquisa: **2026-11-11** (fontes oficiais da OpenAI e página pública do
Carrossell, lidas nesta data). Trabalho só de leitura e pesquisa — nada foi
alterado, nenhum teste pago foi feito.

## Resposta directa

**Sim, existe uma via oficial para usar a assinatura ChatGPT Plus dentro de uma
app de terceiros — mas NÃO serve, sozinha, para o Pink Logic.**

A via chama-se **Sign in with ChatGPT** (uso do plano). Ela existe, é oficial e
está documentada pela OpenAI. Mas tem três bloqueios para o nosso caso:

1. **Só texto — sem imagens.** Nas limitações actuais da via, a geração de
   imagem está explicitamente listada como ferramenta **não suportada**. Um
   estúdio de carrosséis precisa de gerar imagens; esta via, sozinha, não chega.
2. **Acesso fechado para apps comerciais.** O uso do plano está disponível para
   projectos open-source e para parceiros comerciais seleccionados (trial
   limitado). Uma app comercial de código fechado como o Pink Logic teria de se
   candidatar (formulário de interesse) — sem garantia de aceitação.
3. **Não é um direito geral.** Só funciona em apps participantes; ligar-se não
   cria allowance novo — o consumo sai do allowance do plano do utilizador,
   com limite semanal por app.

**O caminho viável e imediato é o BYOK**: o utilizador cola a sua própria chave
da API OpenAI nas definições da app e paga pay-per-use à OpenAI. É o padrão da
indústria, é oficial, e o custo por carrossel é da ordem dos cêntimos (secção 4).

O que **não** existe: nenhuma forma oficial de a assinatura Plus alimentar
directamente a API OpenAI. Plus ($20/mês) e API são produtos e faturações
separados — a própria página do Plus diz: *"Not included: API usage is
separate and billed independently."*

## 1. A assinatura Plus inclui créditos ou chave da API? Não.

- ChatGPT Plus: **$20/mês**, acesso melhorado à app web do ChatGPT (modelos,
  voz, geração de imagem **dentro do ChatGPT**, ficheiros, Deep Research).
- **Não incluído:** *"API usage is separate and billed independently. See API
  pricing."* — Help Center, "What is ChatGPT Plus?".
- A mesma página acrescenta a excepção que muda a resposta a esta investigação:
  *"Eligible Plus subscribers can authorize participating tools to use their
  included OpenAI allowance through Sign in with ChatGPT"* — mas *"This is
  different from API usage billed to an OpenAI API account, which is not
  included in Plus."* Ou seja: a assinatura pode ser gasta **em apps
  participantes, dentro do allowance do plano** — nunca convertida em créditos
  ou chave da API.
- **Não verificado nesta investigação:** algumas fontes secundárias afirmam que
  o plano Pro inclui créditos mensais de API. A página do Plus lida não o
  afirma e não foi confirmado em fonte oficial — não usar como base de decisão.

## 2. Caminhos oficiais possíveis

| Caminho | O que é (direcção) | Serve o Pink Logic? | Custo para o utilizador |
|---|---|---|---|
| **Sign in with ChatGPT — uso do plano** | OAuth oficial ("Continue with ChatGPT"). A app pede autorização; os pedidos elegíveis contam para o allowance ChatGPT Work/Codex do plano do utilizador. Sem chave de API partilhada; login e uso do plano são autorizações separadas; limite semanal por app em Settings > Usage. Planos elegíveis: Go, Plus, Pro, Business. | **Parcialmente — e hoje insuficiente.** Texto apenas: geração de imagem, file search, Code Interpreter e conectores alojados estão nas limitações do preview. E o acesso para apps comerciais pagas/alojadas remotamente é por trial limitado + formulário de interesse; o uso do plano está aberto a projectos open-source e clientes privados seleccionados. O Pink Logic (comercial, código fechado) não se enquadra na via open-source. | $0 extra (usa o Plus que já paga), mas consome o allowance do plano; se esgotar, a app pára, salvo créditos ChatGPT activados por opção. |
| **Apps SDK / apps dentro do ChatGPT** | Kit oficial (preview, sobre MCP) para construir apps que correm **dentro** do ChatGPT. Direcção inversa: o Pink Logic viveria dentro do ChatGPT, não o ChatGPT dentro do Pink Logic. Suportado no preview: Business e Enterprise/Edu. | **Não é o que foi pedido.** Não dá à app desktop acesso à assinatura; é outro produto (o plugin MCP da Fase 2 já segue esta direcção). | — |
| **Servidor MCP próprio (plugin no ChatGPT)** | O ChatGPT liga-se como cliente MCP ao servidor do Pink Logic. É o que a Fase 2 implementou (transporte Streamable HTTP, 14 tools). | **Complementar, não substituto.** O utilizador trabalha dentro do ChatGPT; a app desktop continua sem IA própria. | $0 (servidor nosso). |
| **BYOK — chave própria da API** | O utilizador cria a sua chave na OpenAI Platform, com faturação própria, e cola-a nas definições da app. A app chama a API directamente. Padrão da indústria, suportado pela facturação separada da API. | **Sim — caminho recomendado.** Funciona hoje, sem aprovação da OpenAI, para texto **e** imagem. A chave é do utilizador e revogável por ele. | Pay-per-use: cêntimos por carrossel (secção 4). |
| **GPT privado + Actions** | GPT guardado dentro do ChatGPT que chama uma API externa. | **Não.** Em fim de vida: criação fechada em contas pessoais; GPTs existentes usáveis só até **11/12/2026**; Actions não migram. (Detalhe na doc da Fase 2.) | — |
| **Agente no computador do utilizador (Codex / Claude Code)** | O utilizador já tem um agente instalado que usa a conta dele; a app pede-lhe trabalho em linguagem natural. É o que o Carrossell menciona publicamente (secção 3). | **Não verificado como via.** A página pública do Carrossell não explica o mecanismo; as limitações oficiais do SIWC aplicam-se também "directly and through Codex app-server". Não assumir que funciona para imagens. | Depende do agente/plano do utilizador. |

**O que continua proibido** (sem via oficial): extrair cookies/tokens de sessão
da conta ChatGPT; automatizar a interface do ChatGPT (cliques/raspagem);
revender o acesso da conta; fingir que o Plus alimenta a API.

### Parceiros actuais do Sign in with ChatGPT (directório oficial)

O directório oficial (learn.chatgpt.com) **não foi aberto directamente nesta
investigação**. Segundo verificações secundárias de outubro de 2026 desse
directório, a lista era: uso do plano — Amp Code, Conductor, Dactyl, Devin,
Hermes Agent, Hyperagent, Kilo Code, Notion, Vercel, Vorflux, Warp (Lovable:
"coming soon"); só login — Airtable, Canva, GitLab, HubSpot, Supabase;
open-source — OpenClaw, OpenCode, Pi, T3. **O Carrossell não aparece em nenhum
dos grupos.** Reconfirmar no directório antes de qualquer decisão.

## 3. O que o Carrossell diz publicamente

Fonte única lida: a página pública de vendas
`https://carrosseisquevendem.com.br/app/` (lida a 2026-11-11). Não foi lido
código, não foi consultada nenhuma central de ajuda pública (não foi encontrada
uma nesta investigação) — só esta página.

**O que a página diz, textualmente:**

- Requisitos (rodapé): *"sua própria conta do ChatGPT · as imagens usam os
  limites do seu plano ChatGPT · sem mensalidade."*
- FAQ — *"Qual conta de IA eu preciso?"*: *"Sua própria conta do ChatGPT. O app
  gera textos e imagens por ela, usando os limites do seu plano."*
- FAQ — *"Tem mensalidade?"*: *"Não. São R$47 uma vez. O uso de IA segue o seu
  plano do ChatGPT."*
- *"Usa o Codex ou o Claude Code? Peça, e ele faz."* — *"cria os carrosséis,
  gera as artes com a sua conta, posta e agenda. O app nem precisa estar
  aberto."*
- *"7 estilos em um clique. … Os estilos prontos nem gastam o limite da sua
  conta."*
- *"Onde ficam os dados da minha marca? No seu computador. O app manda para a
  sua conta do ChatGPT só o que é preciso para cada geração."*
- Preço: **R$47, pagamento único**; Windows 10/11 e macOS 12+; publicar no
  Instagram via conta gratuita no Composio (aula 10).

**O que a página NÃO diz:**

- Não menciona "Sign in with ChatGPT", OAuth, partilha de tokens, chave de API
  ou estatuto de parceiro OpenAI — nenhuma destas palavras aparece.
- Não explica **como** tecnicamente as imagens são geradas pela conta do
  utilizador, que modelos são usados, nem o que acontece quando o limite do
  plano esgota.
- Não há números de limites, nem documentação técnica pública.

**Leitura honesta:** a página afirma o *resultado* ("usa a sua conta, usa os
limites do seu plano") mas não documenta o *mecanismo*. Isso é compatível com
mais do que uma implementação — incluindo o agente Codex/Claude Code no
computador do utilizador, que a própria página menciona. **Não é possível
concluir, a partir da página pública, que o Carrossell usa o Sign in with
ChatGPT** — e, se usasse, a limitação oficial actual (imagem não suportada)
contradiria a afirmação de que as imagens usam os limites do plano. O
mecanismo real do Carrossell é **não verificado** e, por regra da casa, nunca
deve ser copiado nem inferido a partir do produto dele: só a estrutura da
experiência (marca, contexto, Design Kit, estúdio) é referência.

## 4. Diferença de custo (linguagem simples)

**Plus $20/mês ≠ API.** O Plus paga o uso *dentro* do ChatGPT (chat, imagens
lá dentro, voz, etc., sujeito aos limites do plano). A API cobra-se à parte,
por uso: cada pedido paga-se pelos tokens que entram e saem. São duas contas,
dois extractos. Pagar o Plus não põe saldo na API; pôr saldo na API não dá o
Plus.

**Preços da API lidos hoje na página oficial de preços** (por 1 milhão de
tokens; mudam com frequência — reconfirmar antes de orçamentar):

| Modelo (API, 2026-11-11) | Entrada | Saída |
|---|---|---|
| gpt-6-luna (mais barato) | $0,10 | $0,50 |
| gpt-6.1-terra | $1,00 | $5,00 |
| gpt-6.1-sol | $2,00 | $10,00 |
| gpt-image-2.6 (imagem, saída) | — | $30,00 / 1M tokens de imagem |

Nota: o `gpt-5-mini` (exemplo do briefing, $0,25/$2,00 em fontes secundárias de
outubro) **já não aparece na página oficial de preços lida hoje** — a gama
actual é a GPT-6. Não basear preços no gpt-5-mini.

**Quanto custa um carrossel via BYOK (ordem de grandeza, cálculo nosso a
partir dos preços oficiais acima):**

- **Copy** (5 cards + legenda; hipótese: ~2.000 tokens de entrada com o contexto
  da marca + ~1.500 tokens de saída): gpt-6-luna ≈ **$0,001**; gpt-6.1-sol ≈
  **$0,02**. Ou seja: a escrita custa décimos de cêntimo a dois cêntimos.
- **Imagem** (guia oficial de geração de imagem): gpt-image-2, qualidade
  média, 1024×1024 = **$0,053 por imagem** (só saída; baixa $0,006, alta
  $0,211). A calculadora oficial para gpt-image-2.6 dá o exemplo de 823 tokens
  de saída → **$0,02469 por imagem**. As imagens dominam o custo.
- **Total por carrossel:** com 1 imagem ≈ **$0,03–$0,07**; com 5 imagens ≈
  **$0,13–$0,29**. Um carrossel por dia, durante um mês: **ordem de $1–$9/mês**
  de API — muito abaixo dos $20 do Plus, mas **a somar** a ele, não incluído
  nele. (Valores de saída; prompts e imagens de referência somam tokens de
  entrada. O valor exacto lê-se no `usage` de cada resposta da API.)

**Em resumo:** no BYOK, a IA de um carrossel custa cêntimos; o Plus continua a
ser preciso (ou não) pelo uso dentro do ChatGPT — são despesas separadas.

## 5. Conclusão para o Pink Logic

1. **Implementar primeiro o BYOK** (chave própria da API nas definições, com
   modo de teste local sem chamadas pagas e adaptador preparado para activação
   posterior). É o único caminho oficial que hoje gera texto **e** imagem
   dentro da app desktop, sem depender de aprovação da OpenAI.
2. **Manter o plugin MCP da Fase 2** como via complementar (trabalhar com o
   Pink Logic *dentro* do ChatGPT), sem o vender como "IA dentro da app".
3. **Sign in with ChatGPT fica como investigação futura, não como plano:**
   candidatar-se exigiria o formulário de interesse, a aceitação não é
   garantida, e mesmo aceite só cobriria texto enquanto a geração de imagem
   estiver excluída do preview. Reavaliar quando as limitações mudarem.
4. **Não prometer à utilizadora** que o Plus dela alimenta a app, nem que o
   Carrossell prova que isso funciona para imagens — a página pública dele não
   prova o mecanismo, e a documentação oficial actual contradiz essa leitura
   para a via SIWC.

## 6. Não verificado / limites desta investigação

- O directório oficial de parceiros (learn.chatgpt.com) não foi aberto
  directamente; a lista da secção 2 vem de verificações secundárias de outubro
  de 2026 e pode ter mudado.
- O mecanismo interno do Carrossell não foi (nem deve ser) investigado além da
  página pública; nenhuma conta, sessão ou teste do Carrossell foi feita.
- Nenhuma chamada paga à API foi feita; os custos da secção 4 são cálculos a
  partir das tabelas oficiais, não facturas reais.
- Preços e modelos da OpenAI mudam depressa (a página de preços lida hoje já
  lista a família GPT-6 e o gpt-image-1 foi encerrado a 23/10/2026): reconfirmar
  na página oficial antes de orçamentar ou comunicar preços.

## Fontes (todas lidas a 2026-11-11, salvo indicação)

1. What is ChatGPT Plus? (Help Center) — $20/mês; "Not included: API usage
   is separate and billed independently"; uso do Plus em ferramentas
   participantes via Sign in with ChatGPT.
   `https://help.openai.com/en/articles/6950777-what-is-chatgpt-plus`
2. Using your ChatGPT plan in other apps and sites (Help Center) — Sign in
   with ChatGPT; planos Go/Plus/Pro/Business; sem partilha de chave de API;
   login e uso do plano são escolhas separadas; limite semanal por app;
   "We've launched with a limited set of partners".
   `https://help.openai.com/en/articles/20001542-using-your-chatgpt-plan-in-other-apps-and-sites`
3. Sign in with ChatGPT — token sharing, open-source (OpenAI Developers) —
   uso do plano para apps open-source e locais; apps comerciais pagas/remotas:
   formulário de interesse; "ChatGPT plan usage is available to all
   open-source partners and selected private clients".
   `https://developers.openai.com/siwc/token-sharing-open-source`
4. Preview limitations — Sign in with ChatGPT (OpenAI Developers) — pedidos
   Responses API com `store: false` e `stream: true`; ferramentas não
   suportadas: **image generation**, file search, Code Interpreter, hosted
   MCP/connectors; limites aplicam-se "both directly and through Codex
   app-server".
   `https://developers.openai.com/siwc/token-sharing-open-source/preview-limitations`
5. Building with the Apps SDK (Help Center) — "lets developers design both
   the logic and the interface of an app that runs inside ChatGPT"; preview;
   Business e Enterprise/Edu suportados.
   `https://help-lb.openai.com/en/articles/12515353-building-with-the-apps-sdk`
6. OpenAI API Pricing (OpenAI Developers) — preços por 1M de tokens lidos
   hoje: gpt-6-luna $0,10/$0,50; gpt-6.1-terra $1,00/$5,00; gpt-6.1-sol
   $2,00/$10,00; gpt-image-2.6 imagem $8,00 entrada / $30,00 saída.
   `https://developers.openai.com/api/docs/pricing`
7. Image generation (OpenAI Developers) — gpt-image-2 média 1024×1024
   $0,053/imagem (baixa $0,006; alta $0,211); calculadora gpt-image-2.6:
   823 tokens → $0,02469; gpt-image-1 encerrado a 23/10/2026.
   `https://developers.openai.com/api/docs/guides/image-generation?gallery=open&galleryItem=interior-design`
8. Carrossell — página pública de vendas (lida a 2026-11-11) — citações na
   secção 3; R$47 pagamento único; "sua própria conta do ChatGPT".
   `https://carrosseisquevendem.com.br/app/`
9. Directório de parceiros Sign in with ChatGPT — **não aberto directamente**;
   lista da secção 2 segundo verificações secundárias de outubro de 2026 do
   directório oficial em `https://learn.chatgpt.com/docs/sign-in-with-chatgpt`
   (ex.: eesel.ai, medium.com/@theaitill, aitoolslist.tools — Out/2026).
10. Doc interno da Fase 2: `docs/chatgpt-desktop-integracao.md` (aposentação
    dos GPTs a 11/12/2026; servidor MCP próprio; guião de teste).
