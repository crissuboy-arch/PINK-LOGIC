# 02 — Roadmap

## Fase 0 — Higiene (1–2 dias)
Corrigir bugs visíveis antes de mostrar a plataforma a qualquer cliente.
- Corrigir chave `campaigns.view_strategy` e varrer outras chaves i18n sem tradução.
- Remover posts fictícios da fila do Publicador (ou marcar como "exemplo").
- Padronizar PT-BR (ou criar variante PT-PT real pelo seletor).
- Nomes automáticos de projeto: "Novo design — {marca}" em vez de data/hora.
- Dados de exemplo únicos e editáveis (um arquivo de seed).

## Fase 1 — Núcleo de valor (2–3 semanas)
1. **Gerador de Copy real** (maior impacto, alimenta todo o resto).
2. **Agentes IA executando** de verdade (ao menos ContentAgent e BrandingAgent).
3. **Banco de Ideias** gerando ideias a partir de produto + Brand Kit.
4. **QR Code Studio v2** (SVG/PDF, estilos, contraste, mais tipos).
5. **Marca ativa global** (Brand Kit herdado por todos os módulos).

## Fase 2 — Dados reais e publicação (2–3 semanas)
1. Autenticação e banco (Supabase) para projetos, marcas, posts, créditos.
2. Conectar Instagram/Facebook (Meta API ou Metricool) no Publicador.
3. Painel com métricas reais (Meta Ads + Instagram) e atividade real dos agentes.
4. Calendário sincronizado com o Publicador.

## Fase 3 — Produto vendável (3–4 semanas)
1. Planos, créditos reais e cobrança (Stripe; Hotmart/Kiwify opcional para BR).
2. Modo Agência: várias marcas, pastas por cliente, aprovação por link.
3. Kit de campanha em um clique.
4. QR dinâmico com estatísticas de scan.
5. Relatório PDF de marca para entregar ao cliente.

## Fase 4 — Escala (contínuo)
- Gerador de vídeo/Reels curto.
- Radar de tendências com dados externos (MiningAgent).
- Biblioteca de templates por nicho com marketplace.
- App/PWA mobile.

## Ordem sugerida por retorno
Fase 0 → Copy → Marca ativa → Agentes → Publicador real → Planos/cobrança → Modo Agência → QR dinâmico.
