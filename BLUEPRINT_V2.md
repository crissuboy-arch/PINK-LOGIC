# PINK-LOGIC v2 — Blueprint arquitetural (estrutura OpenHive)

> Estado: PROPOSTA — aguardar aprovação da Cristiane antes de implementar.
> Regra: ideias do OpenHive, nunca código (licença Source Available proíbe derivados comerciais).

## 1. Decisões arquiteturais

| Decisão | OpenHive faz | PINK-LOGIC v2 faz | Porquê |
|---|---|---|---|
| Monorepo | turbo | **npm workspaces** (mais simples) | Menos tooling, mesmo resultado |
| Banco | Postgres + Prisma | **Manter Supabase** | Já usa; RLS conhecida; zero migração de dados |
| Fila | BullMQ + Redis | **Supabase como fila** (tabela `scheduled_posts` + pg_cron/edge function) | Regra custo-zero: sem Redis novo no MVP; migra para BullMQ se escalar |
| API | Express :3001 | **Express** (mesmo padrão) | Clientes finos (web/bot/mcp) |
| Web | Next.js :3000 | **Manter Vite atual** (migrado para `packages/web`) | Não reescrever o que funciona |
| Imagens IA | Gemini/Nano Banana (pago) | **Manter Pollinations (grátis)** + Gemini opcional | Custo mínimo primeiro |
| Decisão | nenhuma | **Jev** (middleware entre gerar e agendar) | O diferencial: porta de qualidade barata |

## 2. Estrutura alvo

```
pink-logic/
├── packages/
│   ├── api/                 # Express — cérebro (NOVO)
│   │   └── src/
│   │       ├── routes/      # posts, brands, schedule, publish, generate
│   │       ├── services/    # scheduler, instagram, jev-decider, publishers
│   │       └── jobs/        # worker de publicação
│   ├── web/                 # app Vite ATUAL (migrado, sem reescrever)
│   ├── bot/                 # Telegram — atalho móvel (NOVO, fase 5)
│   ├── mcp/                 #  tools p/ Claude/Cursor (NOVO, fase 5)
│   └── shared/              # tipos + schemas zod (NOVO)
├── supabase/
│   └── migrations/          # novas: posts, scheduled_posts, publish_results
└── (raiz) package.json      # workspaces
```

## 3. Fluxo completo

```
CRIAR (web/bot/mcp)
  → GERAR (módulos reais PINK-LOGIC: logos, QR, stickers, stories + copy real)
  → DECIDIR (Jev: aprova? score? → <0.7 vai p/ revisão humana)
  → AGENDAR (fila Supabase, jobId determinístico)
  → PUBLICAR (Instagram Graph API + espelhamento p/ allowlist Meta)
  → MÉTRICAS (guardar resultados por plataforma)
```

Estados do post: `DRAFT → PENDING_REVIEW → SCHEDULED → PUBLISHING → PUBLISHED/FAILED`

## 4. O que os módulos atuais viram

| Módulo atual | Estado | Vira |
|---|---|---|
| Estúdio de Logos | real | `POST /generate/logo` (motor de criação) |
| QR Code | real | `POST /generate/qrcode` |
| Stickers IA | real | `POST /generate/sticker` |
| Criador de Histórias | real | `POST /generate/story` |
| Gerador de Copy | mock | **Completar**: via API (Claude/Gemini) — `POST /generate/copy` |
| Mockups | parcial | **Completar**: render composto real |
| Gerador de Vídeos | mock | **Integrar MKVideos** (pipeline dela!) ou remover |
| Brand Kit | localStorage | Migrar p/ Supabase + manter cache local |

## 5. Jev — middleware de decisão

```ts
// packages/api/src/services/jev-decider.ts
decide(action, contexto) → { valor, confianca }
```
- Geração → Jev (score qualidade) → regenera se < threshold
- Agendamento → Jev (aprova sim/não) → <0.7 = `PENDING_REVIEW` (humano)
- Fila → Jev (score potencial) → ordena por melhor horário
- Custo: $0,042/1M input, saída grátis — milhares de decisões por centavos

## 6. Fases (gates)

- **Fase 1**: monorepo + `packages/api` + `packages/shared`; migrar web sem quebrar nada atual
- **Fase 2**: tabelas `posts`/`scheduled_posts`; fila + worker de agendamento
- **Fase 3**: Jev decider (aprovação + qualidade + priorização)
- **Fase 4**: publicação real Instagram (Graph API + espelhamento de imagem)
- **Fase 5**: bot Telegram + MCP server
- **Fora do escopo v2**: funis de vendas, YouTube clips (só se ela pedir)

## 7. O que NÃO copiar do OpenHive

Segredos hardcoded · rate limit em memória · URLs hardcoded do Docker · zero testes no publish · 5 containers no dia 1.

## 8. Riscos

- Instagram Graph API exige conta business + app review p/ alguns scopes
- Mudança de SPA → monorepo: migração cuidadosa p/ não quebrar o atual
- Licença OpenHive: reimplementar, nunca copiar
