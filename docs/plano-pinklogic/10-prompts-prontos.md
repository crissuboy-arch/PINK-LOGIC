# 10 — Prompts prontos por fase

Cole cada prompt numa conversa com o repositório do PinkLogic aberto. Peça sempre para editar os arquivos diretamente e deixe o Claude Code apenas para o git push / deploy.

## Fase 0 — Higiene
"No projeto PinkLogic (Next.js, TypeScript, Tailwind, shadcn): 1) encontre e corrija chaves de tradução cruas na interface, começando por `campaigns.view_strategy`, e crie um teste que falhe se aparecer uma chave no formato `palavra.palavra_palavra` na tela; 2) remova os posts fictícios de março/2026 da fila do Publicador; 3) padronize o menu em PT-BR; 4) troque os nomes automáticos 'Design <data/hora>' por 'Novo design'; 5) concentre todos os dados de exemplo em um arquivo seed único."

## Gerador de Copy
"Implemente o Gerador de Copy em /criacao/copy. Entradas: produto ou texto livre, objetivo, formato (legenda, headline, roteiro de Reels, anúncio Meta, e-mail, WhatsApp), framework (AIDA, PAS, BAB), idioma. Use a marca ativa (tom de voz do Brand Kit). Crie a rota /api/copy/generate que chama o provedor de IA com a chave só no servidor, gera 3 variações com streaming, mostra contador de caracteres por rede e botões Regenerar / Mais curto / Mais emocional / Traduzir / Enviar ao Editor / Salvar. Salve o histórico por marca no Supabase. Trate erros sem consumir crédito."

## Marca ativa global
"Crie um contexto React `ActiveBrand` alimentado pelo Brand Kit e pelo seletor do topo. Faça Editor, Logo Studio, QR Code Studio, Mockups, Copy e Calendário lerem cores, fontes, logo, tom e redes dessa marca. Remova e-mails/telefones fixos do código."

## QR Code Studio v2
"Evolua /criacao/qrcode: exportar PNG (512–4096), SVG e PDF; seletor de correção de erro (forçar H com logo); alerta de contraste (aviso abaixo de 4:1); estilos de módulo e de olhos; degradê; moldura com texto; botão 'usar cores da marca'; novos tipos (Wi-Fi, vCard completo, e-mail, SMS, evento .ics, App Store/Play); validação de Pix com BR Code e CRC16; máscara de WhatsApp; geração em lote por CSV com ZIP; botão de testar leitura. Layout empilhado no mobile."

## QR dinâmico
"Crie QR dinâmico: tabelas qr_codes e qr_scans no Supabase, rota /q/[code] que registra o scan (dispositivo, país, data) e redireciona, painel 'Meus QR Codes' com edição do destino, expiração e gráfico de scans por dia."

## Agentes
"Torne ContentAgent e BrandingAgent executáveis: contrato JSON de entrada/saída, execução no servidor, tabela agent_runs, formulário simples de execução na tela /sistema/agentes, e preencha Execuções Recentes, Timeline, Logs e Confiança média com dados reais. Crie o workflow 'Semana de conteúdo' que gera 7 posts em rascunho no calendário, sempre exigindo aprovação humana antes de publicar."

## Publicador real
"Integre o Publicador a Instagram e Facebook via [Metricool | Meta Graph API]. OAuth no servidor, tokens criptografados, tela Contas Conectadas, fila com retry e status (Agendado, Publicando, Publicado, Falhou com motivo), upload de imagem/vídeo, validação por rede e sincronização com o Calendário."

## Painel real
"Substitua os números fixos do Painel por dados reais: campanhas e conteúdos do banco, atividade da IA de agent_runs, créditos de credit_ledger, alcance/engajamento do Instagram. Sem dados, mostre estado vazio com botão de conectar. Adicione um 'Modo Demonstração' explícito com dados de exemplo."

## Créditos e cobrança
"Implemente credit_ledger e tabela de custos por ação, exiba custo antes de executar e saldo no topo, devolva crédito em falha. Depois integre Stripe Checkout + Customer Portal + webhooks para os planos Grátis/Criador/Pro/Agência, primeiro só em modo de teste."

## Modo Agência
"Adicione espaços de trabalho com várias marcas, papéis (Dono, Designer, Redator, Cliente) e página pública de aprovação por link onde o cliente aprova ou pede ajuste com comentário. Inclua relatório PDF mensal por marca."
