# Pink Logic Desktop — continuidade funcional

Branch: codex/pink-logic-windows. Investigação e autenticação preparadas preservadas. MCP sem alterações (14 ferramentas).

## Utilização sem API

1. Abrir o aplicativo e escolher “Abrir espaço local — sem conta e sem API”.
2. Preencher entrevista e contexto; carregar logótipo; guardar Brand Kit.
3. Gerar pautas locais (não são tendências verificadas), selecionar até 10 e escolher tema.
4. Escolher arquitetura e 4, 5, 6, 7, 8 ou 10 cards (ou automático).
5. Gerar por templates locais ou editar/importar os próprios textos.
6. Rever e aprovar copy; escolher uma das três capas com prévia real.
7. Corrigir cards preservando a arte; exportar PNG individual, ZIP e PDF dos cards. QR temporário continua disponível na rede local.
8. Recuperar projetos, capa, estados de revisão e versões anteriores. Há até 10 versões anteriores por rascunho. A última edição é gravada sincronamente antes de fechar.

## API preparada, desativada

A API permanece desativada por padrão e sem chave nos testes. Adaptador no processo main: chave cifrada, modelos com preço conhecido, limite mensal e por chamada, reserva antes da rede, limite de tokens e recusa de chamadas simultâneas. Não há retries automáticos. Respostas inválidas não apagam o conteúdo anterior nem escondem consumo já informado; timeout sem cobrança confirmada mantém reserva conservadora.

Preços são estimativas locais, com margem de 10% para processamento regional. Também é preciso configurar limites na conta OpenAI. GPT-5.4 Mini foi acrescentado com base na documentação oficial consultada em 11/11/2026: https://developers.openai.com/api/docs/models/gpt-5.4-mini . Modelos legados já configurados foram preservados. Nenhuma geração real foi executada.

Sign in with ChatGPT continua sem sessão autorizada: aprovação comercial pendente. Nenhuma credencial ou sessão externa do Codex é importada.

## Verificação

57 testes direcionados passaram (fluxo, renderização, quantidades, preservação de arte, versões, orçamento, OAuth preparado e QR). Builds desktop/web e lint dos arquivos alterados passaram.

Percurso completo em Electron/Windows com renderização offscreen: .proof/windows-acceptance-2026-11-11T21-52-24-341Z/ . Entrevista, upload local do logo, Brand Kit, 30 pautas, 10 selecionadas, sete cards, versão anterior recuperada, capa Destaque e exports reais. ZIP: 20 entradas; sete PNGs 1080x1350; PDF: sete páginas. Dois novos processos confirmaram recuperação e edição gravada no fecho sem clicar Guardar.

Para reproduzir: compilar web/desktop, executar build:web no desktop; definir PINK_ACCEPTANCE_FULL_FLOW=1 e PINK_ACCEPTANCE_OFFSCREEN=1; executar node scripts/test-windows-acceptance.mjs. Sem offscreen, a captura depende da sessão gráfica disponível. Com PINK_ACCEPTANCE_EXECUTABLE é possível executar o mesmo teste no aplicativo instalado.

Sem deploy, publicação, alteração de base de produção ou consumo de créditos pagos. A aprovação comercial e um teste real de inferência continuam pendentes; publicação/Drive não foram ativados.

## Instalador — 12/11/2026

Instalação silenciosa, desinstalação e reinstalação: saída 0. Os hashes dos ficheiros do perfil de teste foram preservados na desinstalação. O aplicativo instalado passou o percurso completo e duas reaberturas, incluindo gravação no fecho: .proof/windows-acceptance-2026-11-12T07-09-34-406Z/installer-validation.json . PDF de sete páginas e ZIP gerados pelo executável instalado. A verificação interativa foi interrompida após o diálogo de idioma; restantes páginas do assistente não foram validadas interativamente. Instalador sem assinatura digital.
