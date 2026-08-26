# Guia de Configuração do Banco de Dados: Supabase & PinkLogic

Este documento orienta sobre a configuração do banco de dados relacional **Supabase** no projeto **PinkLogic** (Fase 2), detalhando as tabelas necessárias, os procedimentos locais de migração e o funcionamento da redundância em localStorage (fallback).

---

## 1. Funcionamento Híbrido (Fallback Local)
A plataforma possui uma camada de dados híbrida inteligente em [api.ts](file:///c:/Users/Evand/Documents/PINK%20LOGIC/src/services/api.ts). 
- **Sem configuração**: Caso as chaves do Supabase estejam ausentes no arquivo `.env` local, o sistema funcionará silenciosamente salvando todas as alterações locais no `localStorage` do navegador.
- **Com configuração**: Ao preencher as credenciais, o sistema passará a ler e salvar as informações diretamente nas tabelas em nuvem do Supabase, salvando uma cópia em cache local de forma redundante.

---

## 2. Configurando o Supabase (Nuvem ou Local)

### Passo 1: Obter Credenciais
1. Acesse o painel do [Supabase](https://supabase.com) e crie um novo projeto.
2. Vá em **Project Settings > API** e copie os valores de:
   - `Project URL`
   - `anon public` key

### Passo 2: Configurar Variáveis de Ambiente
1. Duplique o arquivo [.env.example](file:///c:/Users/Evand/Documents/PINK%20LOGIC/.env.example) e renomeie-o para `.env`.
2. Preencha as chaves:
   ```env
   VITE_SUPABASE_URL=https://sua-url-do-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=seu-token-anon-public-jwt
   VITE_OPENAI_API_KEY=sua-chave-openai-opcional
   ```

### Passo 3: Executar as Migrations do Banco de Dados
Para que as chamadas funcionem sem erro, o banco precisa ter as tabelas criadas. Vá no menu **SQL Editor** do Supabase, crie uma nova consulta (New Query) e copie e cole o conteúdo dos seguintes arquivos na ordem:

1. **Criador das tabelas de publicações**: [20260525000000_create_publisher_tables.sql](file:///c:/Users/Evand/Documents/PINK%20LOGIC/supabase/migrations/20260525000000_create_publisher_tables.sql)
2. **Criador das tabelas de núcleo (Projetos/Brand Kit/etc)**: [20260607000000_create_core_tables.sql](file:///c:/Users/Evand/Documents/PINK%20LOGIC/supabase/migrations/20260607000000_create_core_tables.sql)

*Clique em **Run** no console do editor do Supabase para criar as tabelas.*

---

## 3. Tabelas Criadas & Estrutura de Schema

O banco de dados do PinkLogic consiste nas seguintes tabelas:

1. **`projects`**: Guarda os dados de projetos ativos (nome, fuso horário, descrição).
2. **`brands`**: Kit de marca (Brand Kit Pro) vinculado por chave estrangeira a `projects`. Armazena paleta de cores (JSONB), tipografia (JSONB), caminhos de imagem de logo e detalhes estéticos de marca.
3. **`campaigns`**: Metadados de campanhas e metas de marketing de cada projeto.
4. **`products`**: Cadastro de produtos para vinculação estratégica e vendas de afiliados ou infoprodutos.
5. **`checklist_items`**: Tarefas e fluxos de trabalho gerenciais.
6. **`scheduled_posts`**: Armazena as artes, legendas, hashtags, tipo de formato e o horário agendado de publicação.

---

## 4. Configurando o Supabase Auth (Opcional)
Para cadastrar novos usuários e logins reais:
1. Vá em **Authentication > Providers** no painel do Supabase.
2. Certifique-se de que o provedor **Email** está ativado.
3. Cadastre novos usuários em **Authentication > Users > Add User** para que eles consigam efetuar login.
4. *Dica*: O login demonstrativo (`admin@pinklogic.com` / `pinklogic123`) sempre funcionará como fallback local caso o banco de dados remoto não contenha esta conta cadastrada.

---

## 5. Próximos Passos para Produção (Fase 3/4)
Para comercialização real do SaaS:
- **Segurança RLS**: Habilitar Row Level Security (RLS) nas tabelas para que os usuários só consigam ler e editar linhas correspondentes ao seu próprio `user_id`.
- **Backend Server-Side**: Substituir o client-side direto por rotas de servidor seguras para chaves confidenciais.
- **Assinaturas**: Conectar webhooks do Stripe com o campo `role` da tabela de perfis de usuário do Supabase.
