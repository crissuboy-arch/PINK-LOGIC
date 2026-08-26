# PinkLogic - Sua Central Estratégica de Design & Agentes IA

O **PinkLogic** é uma plataforma SaaS premium para criação, automação e orquestração de campanhas de design e marketing estratégico baseada em inteligência artificial.

---

## 🚀 Principais Módulos

1. **Designer Social Profissional (Editor)**: Editor baseado em HTML5 Canvas para montagem de posts e carrosséis com suporte a Google Fonts, paletas Brand Kit automáticas, stickers e simulações de mockups realistas.
2. **Estúdio de Logotipos IA**: Geração automática de símbolos e logotipos personalizados através da API Pollinations AI com download PNG/SVG e inserção no kit de marca.
3. **Orquestrador IA**: Dashboard interativa para executar agentes autônomos (Content Agent, Campaign Agent, Branding Agent) conectados à API OpenAI.
4. **Publicador Automático & Calendário**: Planejador visual e publicador de postagens integrado com as principais redes.
5. **Biblioteca de Projetos**: Sistema centralizado de projetos, manual de identidade visual e ativos criados.

---

## 🛠️ Arquitetura Técnica & Banco de Dados Híbrido

O PinkLogic utiliza uma arquitetura híbrida de persistência de dados:
- **Fallback Local (localStorage)**: Por padrão, caso as credenciais do Supabase não estejam preenchidas, a aplicação salva os projetos, manual de marca, tarefas e publicações inteiramente no lado do cliente.
- **Banco em Nuvem (Supabase)**: Ao configurar a URL e chave anon nas variáveis de ambiente, o sistema efetua o sincronismo em tempo real com as tabelas relacionais do Supabase (Postgres).

---

## 📦 Como Rodar Localmente

### Passo 1: Instalar Dependências
```bash
npm install
```

### Passo 2: Configurar Variáveis de Ambiente
1. Duplique o arquivo `.env.example` e salve como `.env`.
2. Preencha os campos para ativar a persistência em banco e autenticação com Supabase:
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=seu-token-anon
   VITE_OPENAI_API_KEY=sk-sua-chave-secreta
   ```

### Passo 3: Executar Migrations do Supabase
Caso tenha configurado o banco de dados remoto, copie e execute as consultas SQL na ordem correta dentro do painel do Supabase SQL Editor:
1. `supabase/migrations/20260525000000_create_publisher_tables.sql`
2. `supabase/migrations/20260607000000_create_core_tables.sql`

*Consulte o guia detalhado [supabase_setup.md](file:///c:/Users/Evand/Documents/PINK%20LOGIC/supabase_setup.md) para mais instruções.*

### Passo 4: Executar Servidor de Desenvolvimento
```bash
npm run dev
```

---

## 🛠️ Scripts do Projeto
- `npm run dev`: Inicia o servidor local de desenvolvimento (Vite).
- `npm run build`: Valida tipagens do TypeScript e compila o bundle de produção.
- `npm run lint`: Executa a verificação estática do ESLint.
- `npm run preview`: Executa localmente o bundle gerado pelo build.
