# Deploy na Vercel — PINK-LOGIC v2

## 1. Importar o repo
1. Vai a [vercel.com/new](https://vercel.com/new)
2. **Import** o repo `crissuboy-arch/PINK-LOGIC`
3. A Vercel deteta o `vercel.json` sozinha:
   - Build: `npm run build --workspace=@pink-logic/web`
   - Output: `packages/web/dist`
   - Functions: `api/*.ts` → `/api/*`
4. Clica **Deploy**

## 2. Variáveis de ambiente (Settings → Environment Variables)

| Nome | Valor | Onde arranjar |
|---|---|---|
| `SUPABASE_URL` | `https://tpzzlyhcdfyjnxptbckl.supabase.co` | já tens |
| `SUPABASE_ANON_KEY` | (a tua anon key) | Supabase → Settings → API |
| `JEV_API_KEY` | (a tua chave) | tens crédito ✅ |
| `JEV_API_URL` | `https://api.typesafe.ai/v1/decide` | (opcional — já é o default) |
| `JEV_MODEL` | `jev-latest` | (opcional — já é o default) |
| `AISA_API_KEY` | (a tua chave) | tens crédito ✅ |
| `AISA_API_URL` | `https://api.aisa.one/v1` | (opcional — já é o default) |

Marca **Production** (e Preview se quiseres testar em PRs). Depois faz **Redeploy**.

## 3. Verificar
- `https://<teu-projeto>.vercel.app/api/health` → deve mostrar `"jev": true, "aisa": true`
- Se mostrar `false`, a variável não foi aplicada — verifica o nome e faz redeploy.

## 4. O que NÃO vai para a Vercel
- **MCP** (`packages/mcp`): corre na tua máquina via `npm run dev --workspace=@pink-logic/mcp`
  e a Athena liga-se por stdio. Aponta `PINK_LOGIC_API_URL` para o URL da Vercel
  no `.env` do mcp.
- **API Express** (`packages/api`): substituída pelas serverless functions em `/api`.
  O código Express fica como referência / para uso local com `npm run dev:api`.

## 5. Migration Supabase (ainda pendente)
Aplica `supabase/migrations/20261007000001_content_machine_posts.sql`
no SQL Editor do teu Supabase para ativar `POST /api/posts` de verdade.
