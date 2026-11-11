# Fase 1 — Motor de templates 4:5 + fluxo de carrossel + demo (provas)

Branch: `feat/pink-logic-2-fase-1`. Nada em produção, main, ATHENA ou ScalaFlow.
Sem chamadas à AIsa nem a nenhuma API paga. Sem credenciais no código.

## Testes executados

| Teste | Comando | Resultado |
|---|---|---|
| Build web (tsc + vite) | `npm run build --workspace=@pink-logic/web` | **PASS** (build em ~3,6 s; só o aviso pré-existente de chunk > 500 kB) |
| Unidade/integração do motor | `./node_modules/.bin/tsx --test tests/carousel-template.test.mjs` | **PASS 7/7** (formato 1080×1350; 5 slides com cores da Ofensiva; 3 capas distintas; capa só toca o slide 1; correção só toca o card 3; revisão por card; caption.txt) |
| Export (ZIP real) | `node scripts/zip-carousel-demo.mjs` (após render PIL) | **PASS** — ZIP com `slide-1..5.png`, `slide-1..5.jpg` e `caption.txt`; assinaturas PNG/JPEG e dimensões 1080×1350 verificadas ao reler o ZIP; `caption.txt` igual ao ficheiro |
| Demo end-to-end (script) | `./node_modules/.bin/tsx scripts/demo-carousel-ofensiva.mjs` | **11 passos, 8 OK + 3 PARCIAL** (ver abaixo) |
| Renderização real dos slides | `python3 scripts/render-carousel-pil.py` | **PASS** — 5 slides + 3 capas em PNG/JPG 1080×1350; verificado visualmente (slide-1 e slide-3) |

## Demo — «Como a inteligência artificial está a transformar o marketing das pequenas empresas»

Ficheiros em `.proof/fase1-motor/demo-ofensiva/`:
`demo-log.json` (passo a passo), `slides.json`, `project-document.json`,
`caption.txt`, `correction-card-3.json`, `cover-variants.json`,
`carousel-ofensiva-demo.zip` (682 857 bytes),
`exports/slide-{1..5}.png|jpg`, `exports/cover-{classica,destaque,minimal}.png|jpg`.

Passos: marca → pauta → roteiro → rever textos → escolher capa (destaque)
→ produzir 5 cards → corrigir o card 3 → legenda → exportar 5 cards →
guardar projeto → fechar e reabrir → confirmar persistência.

## Honestidade — o que NÃO foi verificado / está parcial

1. **Marca no preview NÃO verificada.** `GET /api/brands` no preview devolveu
   401 sem autenticação; a demo usa um fixture local com os valores do
   briefing (nome, slogan, cores, sem logótipo). A existência da marca
   semeada depende do agente do seed — a demo NÃO prova a seleção da marca
   real no preview.
2. **Pauta/roteiro/copy/legenda são CONTEÚDO DE DEMONSTRAÇÃO** escrito
   localmente a partir de templates — não gerados por IA. Dito no
   `demo-log.json`, no `caption.txt` e neste relatório.
3. **Persistência no Supabase NÃO executada.** O round-trip local do
   documento JSON (guardar → reler → deepEqual PASS) prova o formato do
   documento; a gravação em `pl_editor_documents` requer sessão autenticada
   e continua por verificar.
4. **Renderização PIL ≠ canvas do browser.** Os PNG/JPG foram renderizados
   com PIL a partir do modelo de slides do motor (mesma geometria/cores/
   textos). O `drawSlideToCanvas` do Editor não foi executado aqui (sem
   browser nesta sessão); o fluxo de export do Editor (JPG/ZIP/caption.txt)
   está implementado mas só validado pelo build, não por clique real.
5. **Limitação pré-existente (não alterada):** o `drawSlideToCanvas` do
   Editor não faz quebra de linha em textos — títulos muito compridos podem
   sair do canvas no export do browser. O renderizador PIL usado na demo
   faz wrap; o do Editor continua sem wrap.
