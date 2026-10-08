# Esteira de conteúdo PINK-LOGIC

Implementação própria sobre o PINK-LOGIC. Referências externas servem para orientar o fluxo, sem incorporar código do Hive ou Carrossel Pro.

## Fluxo de produto

1. Marca: identidade, público, oferta e tom.
2. Briefing: tema, objetivo, canal e quantidade de slides.
3. Rascunho: conteúdo estruturado, legenda e hashtags.
4. Design: elementos editáveis com cores, fontes e logo da marca.
5. Revisão: conferir fatos, oferta, leitura e CTA; edição humana.
6. Entrega: PNG, ZIP, PDF e legenda.
7. Agendamento: registrar conta, data e fuso no servidor.
8. Publicação: enviar para a rede e confirmar identificador externo.
9. Aprendizado: métricas reais alimentam novos briefings.

## Entrega desta branch

- `POST /api/generate`, módulo `carousel`, opção `mode: content`.
- Briefing validado; 3 a 10 slides; limites de texto e hashtags.
- Uma chamada ao gateway AIsa, sem regeneração automática neste fluxo.
- Resposta validada antes de substituir slides existentes.
- Slide editável composto em código próprio, sem executar HTML da IA.
- Identidade aplicada automaticamente; paleta neutra azul/dourado se não houver marca.
- Legenda editável e baixável em TXT.
- Tool MCP `generate_carousel_content` usa o mesmo contrato.
- Geração termina em PENDING_REVIEW; não é aprovação de conteúdo.
- Build geral ordenado por dependências.

## Critérios e pendências

| Etapa | Critério de conclusão | Estado |
|---|---|---|
| Geração e edição | API valida conteúdo e editor recebe documento | Implementado; falta prova com provedor real e QA visual |
| Banco | Reabrir slides e legenda em outro dispositivo | Implementado; round trip no banco aprovado; QA de interface com rede simulada separado |
| Isolamento | Usuário não acessa dados de outro usuário | Testado no Supabase real com duas identidades e papel anônimo |
| Revisão | Aprovação persistida vinculada à versão | Pendente |
| Publicação | ID e URL retornados pela plataforma | Pendente; simulação removida, interface informa indisponibilidade |
| Agendamento | Executa com navegador fechado, sem duplicar | Pendente |
| Automação | Athena gera, salva, pede revisão e publica versão aprovada | Tool de geração implementada; restante pendente |
| Métricas | Resultados reais por conta e publicação | Pendente |

## Validação local

`npm run build`

`npm run test:carousel`

Os testes não chamam serviços pagos. Verificar produção separadamente: env AISA_API_KEY, provedor/modelo disponível, sessão Supabase e execução real. Não inferir integração ativa pela existência do código.

## Persistência entregue

- Projetos, marcas, campanhas, produtos, tarefas e planejamento são persistidos no Supabase.
- Documento do editor inclui slides, formato, quantidade e legenda. A mesma ID é usada no projeto e no documento.
- RLS restringe cada projeto e seus filhos à conta proprietária; anônimos não têm acesso.
- Salvamento usa verificação de versão no servidor para evitar sobrescrita por outra aba.
- Falhas de salvamento mantêm o conteúdo no editor e apresentam mensagem; não há fallback silencioso.
- Biblioteca duplica e exclui registros reais. Exclusão de projeto remove filhos no banco.
- Login/carregamento e troca de conta recarregam os dados; conteúdo de uma conta não é reaproveitado em outra.
- LocalStorage legado foi preservado, mas não é importado automaticamente para uma conta autenticada. Uma migração assistida dos designs antigos ainda deve ser oferecida.
- Publicador não marca conteúdo como publicado sem resposta externa. Planejamentos são salvos, mas o envio automático está indisponível.

## Migração e verificações

`20261008113719_authenticated_editor_persistence.sql` foi aplicada pelo conector ao projeto `tpzzlyhcdfyjnxptbckl` em 08/10/2026. As sete tabelas estavam ausentes antes da aplicação. Tabelas CRM existentes não foram alteradas. Não executar migrações antigas indiscriminadamente neste projeto: o histórico remoto deve ser conciliado antes de `db push`.

`tests/persistence-rls.sql` passou no banco real: gravação/leitura, atualização de versão, rejeição de edição antiga, isolamento entre contas, recusa de acesso anônimo e exclusão em cascata. As identidades e registros de teste foram revertidos com ROLLBACK.

`tests/editor-persistence.browser.cjs` passou com Supabase simulado: salvar/reabrir, preservação após falha, nova tentativa, conflito de versão, duplicação e exclusão na biblioteca. O teste também identificou e permitiu corrigir um ciclo de renderização na tela de carrossel. Requer Playwright e Vite com URL `https://pink-test.supabase.co` e chave pública fictícia `sb_publishable_test`. Não faz chamadas pagas nem altera o banco remoto. Execute com `PINK_TEST_START_SERVER=1 node tests/editor-persistence.browser.cjs`; `PLAYWRIGHT_CHROMIUM_EXECUTABLE` permite indicar um Chromium já instalado.

Auditoria Supabase: nenhum apontamento sobre as novas tabelas/funções. Existem avisos preexistentes em funções CRM, extensões públicas e proteção contra senhas vazadas. Conferir [orientações do auditor](https://supabase.com/docs/guides/database/database-linter) e [proteção de senhas](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) sem alterar o CRM como parte desta entrega.

## Próxima etapa

Validar a versão implantada com sessão real e configuração AISA, implementar aprovação vinculada à versão e integrar OAuth/publicação real. Consolidar `scheduled_posts` e `pl_posts` antes de ativar o agendador de servidor. Nenhum deploy foi realizado nesta etapa.
