# Integração Pink Logic ↔ Athena Control

Integração **somente leitura** para a Athena Control consultar indicadores
reais da Pink Logic. Mesmo padrão/contrato da integração VitrinePro ↔ Athena.

## Endpoints

Base de produção: `https://pink-logic.vercel.app` (confirmar domínio final).

### GET /api/integrations/health — público, sem autenticação

Identidade da plataforma. Sem dados de clientes, sem Supabase.

```json
{
  "platform": "PinkLogic",
  "status": "operational",
  "version": "2.0.0",
  "contract": "v1",
  "capabilities": ["integrations:health", "integrations:stats"]
}
```

### GET /api/integrations/stats — autenticado, só leitura

Agregados reais do banco. **Zero PII**: nenhum email, user_id, caption
ou texto de erro é exposto.

Autenticação: `Authorization: Bearer <PINKLOGIC_ATHENA_API_KEY>`

| Situação | Resposta |
|---|---|
| Sem header / chave errada | `401 { "error": "Não autorizado." }` |
| Chave não configurada na Vercel | `503 { "error": "Integração não configurada." }` |
| Método ≠ GET | `405` |
| OK | `200` com o JSON abaixo |

```json
{
  "platform": "PinkLogic",
  "contract": "v1",
  "users": { "total": 12 },
  "posts": {
    "total": 45,
    "draft": 8,
    "pending_review": 3,
    "scheduled": 5,
    "publishing": 0,
    "published": 27,
    "failed": 2
  },
  "subscriptions": null,
  "ai_usage": null,
  "errors": { "failed_posts": 2 },
  "unavailable": ["subscriptions", "ai_usage"],
  "notes": {
    "subscriptions": "Sem tabela de assinaturas/planos no banco.",
    "ai_usage": "Sem registo de utilização das funcionalidades de IA no banco."
  }
}
```

**Indicadores sem tabela correspondente vêm a `null`** e são listados em
`unavailable` — nunca se inventam dados, tabelas, métricas ou números.

## Configuração (passo a passo)

1. **Gerar a chave exclusiva** (NUNCA reutilizar a `ATHENA_API_KEY` da
   VitrinePro): uma string longa aleatória, ex.:
   `openssl rand -hex 32`
2. Na Vercel → projeto `pink-logic` → Settings → Environment Variables:
   adicionar `PINKLOGIC_ATHENA_API_KEY` = a chave (Production).
3. Fazer redeploy (ou o próximo push para `main` faz deploy automático).
4. Na Athena Control: criar a integração API
   `https://<dominio>/api/integrations/stats` e guardar a mesma chave
   no cofre. A Athena usa o endpoint `/health` para verificação de
   disponibilidade e `/stats` para os dados.

## Ficheiros

- `api-src/integrations/health.ts` → `GET /api/integrations/health`
- `api-src/integrations/stats.ts` → `GET /api/integrations/stats`
- `api/integrations/*.js` — bundle gerado (versionado por convenção do repo)
- `tests/integrations-athena.test.ts` — 14 testes (`npx tsx --test`)

## Segurança

- Comparação da chave em tempo constante (timing-safe).
- A chave nunca aparece em respostas, logs ou erros.
- Sem `service_role` no cliente: a função usa as env vars do servidor.
- Sem rate-limit próprio (a proteção é a chave Bearer); avaliar se
  necessário no futuro.
