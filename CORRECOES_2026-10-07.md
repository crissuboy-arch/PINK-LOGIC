# Correções — 07/10/2026

## Por que a API dava erro
1. **AIsa chamava `/v1/v1/chat/completions`** (a URL base já terminava em `/v1` e o código acrescentava `/v1` de novo) → 404 do provedor → 500 em `/api/generate` (módulo `copy`). Corrigido em `packages/api/src/services/aisa.ts`: aceita a URL com ou sem `/v1`; modelo configurável por `AISA_MODEL`; erros do provedor agora mostram o status e o motivo (502) em vez de 500 mudo.
2. **`/api/carousel/render` dava 404**: o ficheiro era `api/carousel-render.ts` (rota `/api/carousel-render`). Movido para `api/carousel/render.ts`.
3. **Fontes e prompt não iam para a função na Vercel** (`readFileSync` com caminho dinâmico não é rastreado): `vercel.json` ganhou `functions.includeFiles` e o código procura em vários caminhos.
4. **Build das funções sem TypeScript "NodeNext"** (o `api/` importa pacotes ESM do monorepo): adicionados `tsconfig.json` na raiz, `"type": "module"` e `engines.node = 22.x`. Isto é o que costuma fazer o deploy falhar e manter a versão antiga no ar ("erro antigo").
5. **Jev**: se a chave/endpoint falhar, `/api/decide` já não devolve 500; devolve `passed:false` (revisão humana) com o campo `error` explicando.
6. Porta: a API local passa a usar 3002 (a 3001 era da web) e o Vite faz proxy de `/api`.
7. Removidos ficheiros lixo da raiz (`console.log(e.message))`, `dev_err.txt`, `dev_out.txt`).

## Paleta "sempre rosa"
- O Painel, o CSS global (`index.css`), o Publicador, o Hero e o indicador de marca tinham `#FF2D9B`/`#FF2D8D` fixos. Agora usam `var(--primary)`/`var(--secondary)`, que o `CentralStore` já atualiza com a marca ativa.
- O canvas do Hero resolve as cores em tempo de execução (canvas não aceita `var()`).
- QR Studio e Logo Studio só liam a cor da marca na 1.ª renderização; agora acompanham a marca ativa.
- Fica rosa de propósito: o logo PINK LOGIC e os templates prontos (têm paleta própria; o Editor recolore quando o "Auto-Brand" está ligado).

## Skill / Gerador de Copy
- `pages/Criacao/SubPages.tsx` tinha sido commitado corrompido; o Gerador de Copy era só um placeholder e por isso a skill nunca chegava ao ecrã.
- Novo `pages/Criacao/CopyGenerator.tsx` liga o ecrã a `POST /api/generate` (módulo `copy`), que usa `copy-system.md` (a skill) + checagem anti-IA + reescrita 1×.
- Novo `lib/apiClient.ts` com mensagens de erro claras.

## Como aplicar
Substitui os ficheiros no repositório por estes e faz push (o Claude Code só para `git push`). Na Vercel: Deployments → Redeploy (sem cache). Depois testa:
- `/api/health` → `jev: true, aisa: true`
- `POST /api/generate` com `{"module":"qrcode","prompt":"x"}` → 200
- `POST /api/generate` com `{"module":"copy","prompt":"teste"}` → 200 (se 502, lê a mensagem: normalmente é o nome do modelo em `AISA_MODEL`)
- `POST /api/carousel/render` com `{"title":"TESTE"}` → PNG
Se o deploy ainda falhar, copia as linhas vermelhas do Build Log.

## Estúdio de Stickers (novo)
- `pages/Criacao/StickerStudio.tsx` + módulo `sticker` do `/api/generate` reescrito.
- 8 estilos (Kawaii, Retrô 90s, Neon, 3D, Meme, Aquarela, Pixel 8-bit, Grafite), cores da marca ativa, 1–8 figurinhas por vez, botão "Surpreenda-me", confete, cartões que balançam, download PNG 512×512 (tamanho WhatsApp).
- Usa Pollinations (grátis, sem chave). Fundo transparente real exige remoção de fundo (próximo passo).

## Legendas Animadas (novo módulo)
- `pages/Criacao/CaptionStudio.tsx` — rota `/criacao/legendas`, entrada no menu "Criação".
- 10 animações: Karaokê, Pop (viral), Máquina de escrever, Pulinho, Neon pulsante, Tremida, Sobe e aparece, Caixa de destaque, Onda, Arco-íris.
- Cores: 24 cores (círculo cromático completo + neutros) para texto e destaque, mais seletor livre, contorno, "Cores da marca" e "Surpreenda-me".
- Formatos: 9:16 (Reels/TikTok/Shorts), 1:1, 4:5, 16:9. Fundo: transparente, cor, degradê, verde chroma key ou imagem.
- Exporta vídeo (MP4 quando o navegador suporta, senão WebM), PNG do quadro e arquivo .srt. Cada linha do texto vira uma legenda.
- Não exporta GIF (próximo passo, se quiser).
