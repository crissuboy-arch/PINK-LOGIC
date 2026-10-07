# 04 — Gerador de Copy, Agentes IA e Banco de Ideias

## 4.1 Gerador de Copy (prioridade nº 1)
Hoje a tela diz "Módulo em reconstrução. Copy real via AIsa".

### Entradas
- Produto (da lista de produtos) ou texto livre.
- Marca ativa: tom de voz, público, palavras proibidas (vem do Brand Kit).
- Objetivo: vender, engajar, educar, captar lead, reativar.
- Formato: legenda, headline, roteiro de Reels, e-mail, anúncio Meta (texto principal, título, descrição), página de vendas, WhatsApp.
- Idioma: PT-BR, PT-PT, EN, ES, FR (aproveitar o seletor do topo).
- Framework: AIDA, PAS, BAB, 4Ps, storytelling, prova social.

### Saídas
- 3 variações por geração; botões "Regenerar", "Mais curto", "Mais emocional", "Mais direto", "Traduzir".
- Contador de caracteres por rede e aviso de limite (Meta: 125 caracteres visíveis no texto principal; título 40).
- Hashtags sugeridas.
- Botões: "Enviar ao Editor", "Enviar ao Publicador", "Salvar na Biblioteca".

### Requisitos técnicos
- Rota `/api/copy/generate` no servidor (chave do provedor nunca no navegador).
- Provedor: AIsa (conforme já planejado) com fallback para outro modelo.
- Streaming da resposta.
- Cobrar créditos por geração (ver doc 08).
- Histórico por marca (`copies(id, brand_id, type, prompt, result, created_at)`).

### Critérios de aceite
- Gera copy coerente com o tom do Brand Kit em menos de 8 s.
- Nenhuma chave de API exposta no bundle.
- Erro do provedor mostra mensagem amigável e não consome crédito.

## 4.2 Agentes IA
Estado: 7 agentes (branding, content, campaign, analytics, automation, mining, calendar), 3 workflows, 0 execuções.

### Passo a passo
1. Definir contrato de cada agente: entrada (JSON), saída (JSON), ferramentas permitidas, custo em créditos.
2. Implementar execução real de **ContentAgent** e **BrandingAgent** primeiro.
3. Registrar cada execução: `agent_runs(id, agent, input, output, status, duration_ms, credits, created_at)`.
4. Preencher as telas já existentes: Execuções Recentes, Timeline, Logs, Confiança média.
5. Botão "Executar" com formulário simples por agente (em vez de JSON bruto).
6. Workflows prontos (3 a 5):
   - **Semana de conteúdo:** Mining → Content → Calendar (7 posts agendados em rascunho).
   - **Lançamento de produto:** Branding → Campaign → Content → Calendar.
   - **Relatório semanal:** Analytics → resumo + sugestões.
7. Aprovação humana antes de qualquer publicação (agente nunca publica sozinho por padrão).

### Painel
- O Painel deve ler `agent_runs` para "Atividade da IA" e "Agentes em execução".
- Remover contadores fixos (12 agentes, 156 tarefas).

## 4.3 Orquestrador IA (/sistema/execucao)
- Campo único: "O que você quer fazer?" → o orquestrador escolhe agentes e monta o plano.
- Mostrar o plano antes de executar, com custo estimado em créditos.
- Linha do tempo de etapas com status.

## 4.4 Banco de Ideias / Radar de Tendências
- "Gerar Ideias" a partir de produto + Brand Kit + tendências (MiningAgent).
- Cartões de ideia com: gancho, formato (Reels, carrossel, story), CTA, esforço.
- Ações: "Criar post", "Criar carrossel", "Agendar", "Salvar".
- Radar: fontes (Google Trends, TikTok Creative Center, hashtags do Instagram) — começar com 1 fonte.
- Contadores "Total de ideias / Salvas" passam a ser reais.

## 4.5 Análises e Estratégia
- Resultado da estratégia deve virar **plano de 30 dias** com um clique (cria campanha + posts em rascunho no calendário).
- Exportar PDF.
