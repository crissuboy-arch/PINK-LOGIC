# InstaPost AI — Briefing do projeto

## Instrução para o Claude Code (ler primeiro)

Faz uma **auditoria** do repositório atual contra este briefing. Ainda **não alteres nada**.

1. Lê a estrutura do repo, `package.json`, rotas, schema da base de dados e variáveis de ambiente.
2. Para cada requisito das secções 3 a 8, classifica como **Feito**, **Parcial** ou **Em falta**, com o caminho do ficheiro que o prova.
3. Devolve uma tabela por componente e uma lista priorizada do que falta, por ordem de implementação.
4. Aponta qualquer conflito entre o que existe e a stack da secção 2.
5. Termina com perguntas só se faltar informação que bloqueie.

Só depois da minha aprovação começas a implementar, por fases pequenas (uma fase de cada vez, para não crashar).

---

## 1. O que é

Aplicação que automatiza o ciclo completo de um post de Instagram:
**gerar imagem com IA → criar legenda → aprovar → agendar → publicar**.

Três formas de pedir um post:
- **Telegram bot** (a partir do telemóvel)
- **Dashboard web** (calendário, rascunhos, edição)
- **MCP server** ligado ao Claude/Cowork, com uma skill que escolhe temas e cria posts sozinha

Uso próprio primeiro. Se um dia for SaaS, a Meta exige revisão da app (documentação e vídeo).

## 2. Stack

O vídeo original usa VPS + Coolify + Postgres + Redis + MinIO. Eu já tenho **Vercel, GitHub e Supabase**, por isso a stack-alvo é esta:

| Camada | Escolha | Nota |
|---|---|---|
| Frontend + API | Next.js 14+, TypeScript strict, Tailwind, shadcn | Deploy na Vercel |
| Base de dados | Supabase Postgres | Substitui Postgres/Prisma do vídeo (ou manter Prisma sobre o Supabase) |
| Armazenamento de imagens | Supabase Storage | Substitui o MinIO |
| Agendamento | Vercel Cron a chamar `/api/cron/publish` a cada minuto (ou pg_cron/Supabase) | Substitui Redis + filas |
| Telegram | Webhook em route handler (`/api/telegram`) | Evita processo sempre ligado |
| IA | Nano Banana (Gemini API) para imagem e legenda | Chave no AI Studio |
| Publicação | Instagram Graph API | Conta Business/Creator |
| MCP | Servidor MCP exposto por HTTP (route handler) ou pacote separado | Para o Claude/Cowork |
| Validação | Zod em todos os endpoints | |

Atenção: a Vercel serverless não mantém processos longos. Por isso o bot usa webhook e o agendador usa Cron, nunca um loop a correr.

## 3. Fluxo de um post

1. Pedido chega por Telegram, dashboard ou MCP.
2. Backend chama o Nano Banana → imagem + legenda (proporção configurável, ex.: 4:5).
3. Imagem vai para o Storage; registo na base de dados com estado `draft`.
4. Aprovação → `scheduled` (com data/hora) ou publicação imediata.
5. O cron apanha os `scheduled` vencidos, publica via Graph API e marca `published` (ou `failed` com erro).

Estados: `draft → scheduled → publishing → published | failed`.

## 4. Modelo de dados (mínimo)

- **posts**: id, caption, image_url, aspect_ratio, status, scheduled_at, published_at, ig_media_id, error, source (`telegram|web|mcp`), created_at
- **settings** ou variáveis: conta Instagram, token e data de expiração
- Opcional: **templates/estilos** (prompts de estilo reutilizáveis) e **topics** (temas para a skill)

## 5. API (endpoints esperados)

- `POST /api/posts/generate` — gera imagem + legenda a partir de um prompt (aspect ratio opcional)
- `GET /api/posts` — lista com filtros (estado, data)
- `GET/PATCH/DELETE /api/posts/:id` — ver, editar legenda/data, apagar
- `POST /api/posts/:id/schedule` e `/publish`
- `POST /api/telegram` — webhook do bot
- `GET /api/cron/publish` — protegido por segredo (`CRON_SECRET`)
- `/api/mcp` — servidor MCP
- Todos com validação Zod, erros estruturados e logs

## 6. Telegram bot

- Criado via @BotFather (`/newbot`), token em variável de ambiente.
- Comandos: gerar (prompt + proporção), aprovar, agendar, publicar, listar próximos.
- Botões inline: Aprovar / Agendar / Publicar / Descartar.
- Só responde ao meu `chat_id` (lista de permitidos).

## 7. Dashboard

- Calendário de posts agendados e publicados.
- Lista, rascunhos, "próximos agendados", total de posts.
- Clicar num post abre o detalhe, com **edição** de legenda e data.
- Mostrar corretamente imagem e vídeo.
- Visual limpo e atual (evitar neon e o aspeto genérico de IA), coerente com a identidade PinkLogic.

## 8. MCP + skill

- Ferramentas MCP: `create_post`, `list_posts`, `schedule_post`, `publish_post`, `update_post`.
- Skill (no Cowork) que pesquisa temas do meu produto, escolhe estilo, gera o post e agenda.
- Depois de criar, o assistente pergunta: publicar agora, agendar ou manter rascunho.

## 9. Instagram (configuração externa)

- Conta Instagram **Business ou Creator** (pessoal não funciona).
- App no Meta for Developers, produto Instagram, adicionar a minha conta como utilizador de teste e aceitar o convite.
- Gerar token com permissões de publicação; **os tokens expiram**, por isso implementar renovação e alerta de expiração.
- Publicação em dois passos: criar o contentor de media e depois publicar.

## 10. Variáveis de ambiente (nunca no código)

`GEMINI_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ALLOWED_CHAT_ID`, `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_USER_ID`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, `MCP_AUTH_TOKEN`. Fornecer `.env.example` sem valores.

## 11. Segurança e qualidade

- Segredos só em variáveis da Vercel; service role nunca no cliente.
- Endpoint de cron e MCP autenticados.
- Rate limit na geração (cada imagem custa na API do Google) e limite diário configurável.
- Testes para a lógica crítica: agendamento, transições de estado, publicação com falha e retry.
- Health check simples e logs úteis.

## 12. Fases de implementação sugeridas

1. Setup: estrutura, TypeScript strict, ESLint/Prettier, `.env.example`
2. Base de dados + API de posts
3. Integração Nano Banana (imagem + legenda)
4. Telegram webhook
5. Publicação no Instagram + cron de agendamento
6. Dashboard (calendário, detalhe, edição)
7. Servidor MCP + skill
8. Segurança, testes e polimento visual

## 13. Já feito no vídeo original (referência)

Gerar post pelo Telegram, aparecer no painel, agendar, publicar no Instagram, e criar/agendar pelo Cowork via MCP com skill. Ficaram por fazer: ver o calendário com clique no post, edição de posts, ícone de vídeo e melhorar a skill (carrosséis, logótipo, legendas melhores).
