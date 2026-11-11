# Verificação objetiva — Carrossell, callback Codex e Pink Logic

Data: 11/11/2026. Branch mantida: codex/pink-logic-windows.

## Factos observados

1. O executável original C:\Users\crist\Downloads\Carrossell-Windows.exe continua acessível: 224840445 bytes, versão 0.10.1, sem assinatura. SHA256 anteriormente confirmado: 59162C30E41287A94D10D838CAC7CF0D4ACA275E3EB8E7BE28D66786B4554BF1.
2. Não foi executado numa VM/Windows Sandbox. Foi observada a aplicação já instalada e em execução na sessão normal da proprietária, utilizando apenas a interface normal e metadados de processos.
3. Relação de processos observada: Carrossell.exe PID 12040 iniciou codex.exe PID 17740. O codex.exe está dentro de Carrossell/resources/app.asar.unpacked/node_modules/@openai/codex-win32-x64/vendor/x86_64-pc-windows-msvc/bin/codex.exe. Não foram lidos código proprietário, argumentos de processo, tokens, cookies, senhas, auth.json ou sessões.
4. Interface observada: Conta ChatGPT; Desconectar ChatGPT · plus. Projeto existente Ofensiva Criativa: “5 tarefas para tirar do manual com IA”, Salvo · Arte com IA · 7 cards. Foram vistos imagem de capa, legenda, etapas Texto/Capa/Carrossel/Publicar e ações de envio/Instagram.
5. Não foram iniciados login, geração, exportação, integração de conta, publicação ou agendamento no Carrossell. O funcionamento da geração não foi repetido. O rótulo “Arte com IA” é uma indicação do aplicativo, não rastreamento independente da origem de cada imagem.
6. Não havia listener na porta 1455 no momento da inspeção. Não é possível atribuir com certeza o callback passado a um PID. A mensagem relatada “Signed in to Codex” identifica conclusão do fluxo Codex; não prova uma sessão do Pink Logic. A cadeia de processos é consistente com cliente Codex incorporado no Carrossell, mas não comprova o protocolo exato nem uma autorização comercial contratual.

## Documentação oficial consultada

- https://learn.chatgpt.com/docs/app-server#auth-endpoints : clientes locais/open-source podem utilizar a autenticação app-server; a documentação exclui explicitamente serviços comerciais/hospedados e encaminha-os para Sign in with ChatGPT.
- https://learn.chatgpt.com/docs/auth : login pelo navegador devolve a autenticação ao cliente Codex que iniciou o fluxo.
- https://learn.chatgpt.com/docs/image-generation : Codex tem geração integrada de imagens. Isso é distinto do contrato Responses/Sign in with ChatGPT.
- https://developers.openai.com/siwc/token-sharing-open-source/preview-limitations : a rota de uso do plano via Responses não suporta geração de imagens na prévia.
- https://developers.openai.com/siwc/request-client-id : acesso comercial selecionado; formulário https://openai.com/form/sign-in-with-chatgpt-interest/.
- https://developers.openai.com/siwc/website : cliente OAuth emitido, callback registado, PKCE/OIDC e validação de identidade; clientes públicos e confidenciais distintos.

A avaliação anterior estava incompleta ao não distinguir geração de imagens do Codex e limitações da rota Sign in with ChatGPT. Não existe prova de aprovação contratual do Carrossell; a observação não permite afirmar que tem ou não tem um acordo especial.

## Respostas sobre o Pink Logic

- Qual aplicação recebeu o login relatado? Cliente Codex; instância exata retrospectivamente não atribuível. Há uma instância Codex filha do Carrossell observada. O Pink Logic não iniciou esse login.
- Sessão própria autorizada do Pink Logic? Não.
- Texto real por essa ligação no Pink Logic? Não demonstrado; não há sessão própria ativa.
- Imagens reais por essa ligação no Pink Logic? Não. A geração Codex observável/documentada não foi ligada nem reaproveitada no produto comercial.

## Continuidade implementada

Adaptador original em packages/desktop/src/chatgptOAuth.ts, sem copiar SDK não comercial ou concorrente. Cliente e aprovação comerciais têm de ser configurados pela operadora depois da aprovação. Nenhum client ID do Codex/dynamic_agent_client é utilizado.

- Callback próprio /auth/callback em loopback; PKCE S256, state aleatório, nonce e verificação RS256/issuer/audience/sub.
- Identidade, scope de uso do plano e conclusão de inferência são estados separados.
- Sessão exclusiva chatgpt-pink-logic.enc em userData, cifrada pelo safeStorage do Windows; nenhuma procura/importação de sessões externas.
- Geração de texto por Responses só com cliente aprovado, scope de plano, consentimento explícito e evento response.completed. Nada é marcado como geração verificada por login ou catálogo de modelos.
- Sem aprovação/configuração: não abre navegador, não chama inferência e mantém desconectado.
- Imagens ficam indisponíveis nesta rota. Não existe fallback para credenciais Codex ou API paga.
- Sessão expirada exige nova autorização. Não há renovação automática nesta fase. Remoção local não revoga remotamente o acesso; UI explica a diferença.

Configuração de operação, apenas depois de aprovação:
PINK_CHATGPT_COMMERCIAL_CLIENT_ID = client ID público emitido especificamente para Pink Logic.
PINK_CHATGPT_COMMERCIAL_APPROVED = 1 somente após aprovação efetiva.
PINK_CHATGPT_CALLBACK_PORT = porta registada para o cliente nativo (default de implementação 1456).
O suporte a callback nativo e aos scopes de plano deve ser confirmado no onboarding do parceiro antes da ativação. Um client ID de identidade sem scope de plano não habilita inferência.

Procedimento: preencher o formulário de interesse; aguardar seleção/aprovação; solicitar e registar o cliente/callback do Pink Logic e a permissão de uso do plano; configurar apenas os dados emitidos; realizar consentimento próprio; comprovar texto com resposta completa; confirmar separadamente uma oferta oficial de imagens ou manter templates/API opt-in. Não há prazo ou aprovação garantidos.

## Validação e limites

Seis testes do adaptador passaram: bloqueio sem aprovação/sem cifra, scopes exatos, callback state, PKCE, armazenamento/reabertura, verificação JWT real com RSA temporária, recusa de audience/nonce/issuer incorretos e distinção de resposta completa/interrompida. São testes locais de protocolo com tokens fictícios, não autenticação real OpenAI. Os 39 testes anteriores de fluxo/QR/renderização passaram novamente.
A tentativa completa de aceitação desktop desta corrida chegou às ações, mas falhou na captura com “Current display surface not available for capture”; não é marcada como prova visual aprovada. O diagnóstico dedicado da sessão própria é registado separadamente, sem captura nem login.
Não houve inferência real, consumo de créditos pagos, alteração de produção, envio de formulário ou extração de segredos.

Diagnóstico real no Electron, via preload/IPC: packages/desktop/test-evidence/chatgpt-own-session.json, exit 0. connected=false; subscriptionAuthorized=false; textGenerationVerified=false; textRequestAvailable=false; status=approval-required; sessionOwnedBy=Pink Logic. A versão instalada observada do Carrossell é 0.10.1 (ProductVersion 0.10.1.0). Lint da tela AIConnection passou.
