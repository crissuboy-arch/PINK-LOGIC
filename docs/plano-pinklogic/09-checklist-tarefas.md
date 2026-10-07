# 09 — Checklist de tarefas (ordem de execução)

## Fase 0 — Higiene
- [ ] Corrigir `campaigns.view_strategy` e outras chaves i18n expostas
- [ ] Limpar fila fictícia do Publicador
- [ ] Padronizar PT-BR no menu
- [ ] Nomes automáticos de projeto sem data/hora crua
- [ ] Seed único de dados de exemplo
- [ ] Rótulos acessíveis nos botões com apenas ícone

## Fase 1 — Núcleo
- [ ] Rota de servidor para IA + chaves em variáveis de ambiente
- [ ] Gerador de Copy (formatos, frameworks, 3 variações, limites por rede)
- [ ] Salvar histórico de copy por marca
- [ ] Marca ativa global (contexto compartilhado)
- [ ] ContentAgent e BrandingAgent executando + tabela `agent_runs`
- [ ] Banco de Ideias com geração real
- [ ] QR: SVG/PDF, correção de erro, alerta de contraste
- [ ] QR: estilos de módulo/olhos, degradê, moldura com texto
- [ ] QR: Wi-Fi, vCard, e-mail, SMS, evento, app stores
- [ ] QR: validação de Pix (BR Code) e máscara de WhatsApp

## Fase 2 — Dados reais
- [ ] Supabase: auth, marcas, designs, posts, campanhas
- [ ] Conectar Instagram/Facebook (Metricool ou Meta API)
- [ ] Fila de publicação com retry e status reais
- [ ] Unificar Calendário e Publicador no mesmo modelo
- [ ] Painel lendo dados reais; estados vazios; modo Demonstração
- [ ] Upload de imagem/vídeo no compositor

## Fase 3 — Produto vendável
- [ ] Créditos (ledger + custos por ação)
- [ ] Planos e Stripe (teste → produção)
- [ ] Onboarding com leitura de site/Instagram
- [ ] Kit de campanha em 1 clique
- [ ] Modo agência + aprovação por link
- [ ] QR dinâmico + estatísticas de scan
- [ ] Relatório PDF de marca/cliente
- [ ] Termos, privacidade, página de preços

## Fase 4 — Escala
- [ ] Gerador de vídeo/Reels curto
- [ ] Radar de tendências com fonte externa
- [ ] Redimensionar design com 1 clique
- [ ] PWA / mobile
- [ ] White-label

## Verificação final de cada entrega
- [ ] Testado em desktop e celular
- [ ] Sem erro no console
- [ ] Idiomas BR/US/ES revisados
- [ ] Chaves e tokens fora do navegador
- [ ] Deploy na Vercel conferido
