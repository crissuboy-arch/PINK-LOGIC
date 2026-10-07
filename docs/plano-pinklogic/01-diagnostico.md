# 01 — Diagnóstico

Toda a plataforma exibe o selo **MOCK MODE**. Os números do Painel (12 agentes, 2,6M de alcance, 94% de performance, 312.000/400.000 créditos) são fictícios.

| Módulo | Rota | Estado | Observação |
|---|---|---|---|
| Painel | / | Mock | KPIs, atividade da IA e insights são estáticos. Onboarding 1-2-3 pede só o nome da marca |
| Designer Social | /criacao/editor | Funcional (parcial) | 5 formatos, 12 templates, camadas, slides. Templates com descrição genérica idêntica |
| Carrossel | /criacao/carrossel | Funcional (parcial) | 3/5/8/10 slides via IA; exporta PNG, PDF, ZIP |
| Modelos Premium | /criacao/templates | A auditar | |
| Criador de Histórias | /criacao/story | A auditar | |
| Logo Studio IA | /criacao/logo | Funcional (parcial) | 10 estilos; e-mail/site de exemplo fixos (comercial@pinklogic.com.br) |
| Maquetes | /criacao/mockups | A auditar | |
| QR Code Studio | /criacao/qrcode | Funcional | 8 tipos, cor, fundo, logo central, export PNG apenas |
| Stickers IA | /criacao/stickers | A auditar | |
| Gerador de Copy | /criacao/copy | **Vazio** | "Módulo em reconstrução. Copy real via AIsa" |
| Central de Ativos | /criacao/manual | A auditar | |
| Brand Kit Pro | /criacao/brandkit | Funcional | Fontes, paleta, aplicações (cartão, fachada, uniforme...). Dados de exemplo misturam "Cristiane Silva / Ofensiva Criativa" |
| Biblioteca | /biblioteca | Funcional (vazia) | 2 itens |
| Calendário | /gestao/calendario | Funcional (vazio) | Grade com 3 horários/dia; sem posts |
| Fluxos de Trabalho | /gestao/checklists | A auditar | |
| Orquestrador IA | /sistema/execucao | A auditar | |
| Agentes IA | /sistema/agentes | Estrutura pronta, **0 execuções** | 7 agentes, 3 workflows, sistema ocioso |
| Campanhas | /gestao/campanhas | Funcional (1 campanha) | Chave de tradução vazando: `campaigns.view_strategy` |
| Publicador Automático | /publicador-automatico | **Mock** | Nenhuma conta conectada; fila com posts de 26/03/2026 "Publicado" |
| Radar de Tendências / Banco de Ideias | /gestao/ideias | Vazio | 0 ideias; produtos de exemplo fixos |
| Visão Estratégica | /criacao/vision | A auditar | |
| Análise IA e Status | /gestao/status | A auditar | |
| Análises e Estratégia | /estrategia | Funcional (parcial) | Gerador de Produto/Conteúdo; estado vazio sem ação |

## Bugs e inconsistências encontrados
1. Texto de tradução vazando na tela de Campanhas: `campaigns.view_strategy`.
2. Fila do Publicador mostra posts de março/2026 como "PUBLICADO" sem nenhuma conta conectada.
3. Descrição idêntica ("Design premium completo.") nos 12 templates.
4. Dados de exemplo divergentes entre módulos (marca Pink Logic, Ofensiva Criativa, telefone (11) 98765-4321).
5. Calendário sem nenhum post, mas campanha ativa com 100% de progresso.
6. Brand Kit e Biblioteca mostram "Design 07/10/2026 09:43:22" como nome (nome automático sem sentido).
7. Menu alterna "Logótipos / Código QR / Maquetes" (PT-PT) com restante em PT-BR. Definir um padrão por idioma.

## Pontos fortes a manter
- Identidade visual consistente (rosa neon/escuro).
- Menu bem organizado em 4 grupos: Criação, Ativos, Automação, Inteligência.
- Seletor de idioma BR/US/ES já no topo.
- Exportação em ZIP/PDF no carrossel.
- Arquitetura de agentes (7 agentes + workflows) pronta para receber execuções reais.
