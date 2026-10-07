# 07 — UX, Onboarding e Marca

## 7.1 Onboarding
Hoje: modal "Pular / 1-2-3" pedindo apenas o nome da marca.

Novo fluxo (3 passos, 2 minutos):
1. Nome + site ou @Instagram → a plataforma lê cores, logo, descrição e tom.
2. Confirmar/ajustar Brand Kit gerado.
3. "Gerar meu primeiro kit": 1 post, 1 carrossel, 1 QR Code e 7 dias de calendário em rascunho.
- Checklist de ativação no Painel: marca criada, 1 design, 1 copy, rede conectada, 1 post agendado.

## 7.2 Marca ativa global
- Seletor no topo ("PinkLogic SaaS") passa a controlar: Editor, Logo, QR, Mockups, Copy, Calendário, Biblioteca.
- Tudo herda cores, fontes, logo, tom de voz e redes da marca ativa.
- Dados de exemplo vêm de um único seed editável; nenhum e-mail/telefone fixo no código.

## 7.3 Estados vazios
Toda tela vazia ganha: ilustração simples, explicação em 1 linha e botão principal ("Gerar ideias com IA", "Criar primeira campanha", "Conectar Instagram").
Telas a corrigir: Banco de Ideias, Biblioteca, Campanhas, Agentes, Calendário, Estratégia.

## 7.3 Busca global
- Campo "Buscar na plataforma..." pesquisa módulos, designs, campanhas, ativos, copies.
- Atalho Ctrl/Cmd+K com paleta de comandos ("Novo post", "Gerar copy", "Criar QR").

## 7.4 Idiomas
- Garantir tradução completa (BR/US/ES; avaliar FR e PT-PT).
- Nenhuma chave crua na interface (teste automático que falha se encontrar `\w+\.\w+_\w+` na tela).
- Menu: usar um único vocabulário por idioma (hoje mistura "Logótipos/Maquetes/Código QR" com PT-BR).
- Conteúdo gerado pela IA no idioma escolhido.

## 7.5 Navegação e visual
- Sidebar: agrupar e destacar os 5 módulos mais usados; permitir fixar favoritos.
- Botão "Gerar" do topo vira menu rápido (post, copy, QR, imagem, vídeo).
- Breadcrumb e título claros em cada página.
- Responsivo: o QR Studio perde a pré-visualização em telas estreitas; empilhar em coluna no mobile.
- Acessibilidade: foco visível, rótulos nos botões só com ícone (hoje vários botões sem nome), contraste do texto cinza sobre fundo escuro.
- Remover o selo MOCK MODE quando houver dados reais; manter só em modo Demonstração.

## 7.6 Desempenho
- Carregar módulos sob demanda (lazy loading) — o editor é pesado.
- Salvar projetos no banco e não só no navegador.
- Lighthouse > 85 em desempenho e acessibilidade nas telas principais.

## 7.7 Segurança e conta
- Login real (Supabase Auth: e-mail, Google), recuperação de senha.
- Hoje aparece "Admin / Administrator" fixo: substituir pelo usuário logado.
- Chaves de IA e tokens de redes só no servidor.
- Limite de uso por usuário e proteção contra abuso (rate limit).
- Política de privacidade e termos (necessário para o OAuth da Meta).
