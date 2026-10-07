# 05 — Publicador, Calendário e Dados Reais

## 5.1 Conexão com redes
Hoje: 6 canais com botão "Conectar" sem função (Instagram, Facebook, LinkedIn, X, WordPress, Blog).

Estratégia recomendada (do mais rápido ao mais controlado):
1. **Metricool** (já integrado ao seu ambiente): agendar e publicar via API, analytics incluso. Menor esforço, bom para MVP.
2. **Meta Graph API direta** (Instagram e Facebook): maior controle, exige app Meta, revisão de permissões (`instagram_content_publish`, `pages_manage_posts`) e conta Business.
3. **LinkedIn / X / WordPress:** deixar para a Fase 4 (WordPress é simples via REST + Application Password).

Requisitos:
- OAuth com tokens guardados criptografados no servidor (nunca no navegador).
- Tela "Contas conectadas" com status, validade do token e botão de reconectar.
- Fila com tentativa automática (retry) e status: Agendado, Publicando, Publicado, Falhou (com motivo).

## 5.2 Compositor
- Pré-visualização já existe; adicionar:
  - Validação por rede (limites de caracteres, proporção de imagem, quantidade de hashtags).
  - Upload de imagem/vídeo (hoje só URL).
  - Carrossel e Reels como tipos de publicação.
  - Primeiro comentário automático (hashtags).
  - "Melhor horário" via dados da conta (Metricool `getBestTimeToPostByNetwork`).
  - Duplicar post para outras redes adaptando o texto.

## 5.3 Calendário
- Sincronizar com a fila do Publicador (um único modelo `posts`).
- Arrastar e soltar para reagendar.
- Cores por campanha e por rede.
- Visões Mensal/Semanal/Agenda/Linha do tempo já existem: garantir que todas leem a mesma fonte.
- Filtro por marca (modo agência).
- Sugerir horários vazios com base nos melhores horários.

## 5.4 Painel com dados reais
| Cartão atual | Fonte real |
|---|---|
| Campanhas ativas / Visão geral | tabela `campaigns` |
| Conteúdos gerados | contagem em `copies`, `designs` |
| Alcance, engajamento | Instagram/Facebook (Metricool ou Meta Insights) |
| Conversões, ROI | Meta Ads (Windsor.ai ou Meta Ads API) |
| Atividade da IA | `agent_runs` |
| Uso da IA / créditos | `credit_ledger` |
| Insights para você | Analytics Agent, gerados 1x ao dia com cache |

Regras: sem dado real, mostrar estado vazio com chamada para conectar a conta, nunca números inventados. Manter um **modo Demonstração** claramente identificado para vendas.

## 5.5 Campanhas
- Corrigir `campaigns.view_strategy`.
- Ligar campanha a anúncios Meta (criar sempre pausado, com revisão humana).
- Métricas por campanha: gasto, CTR, CPC, ROAS.
- Checklist operacional vinculado ao calendário.
