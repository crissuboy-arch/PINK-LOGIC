# Pink Logic — Desktop (Electron) — Esqueleto Fase 1

Empacota a SPA `packages/web` numa janela Electron. **Sem backend local**:
a API continua a ser a já hospedada (`https://pink-logic.vercel.app`, via
`VITE_API_URL` ou o default em `packages/web/src/lib/apiClient.ts`).

## Estrutura

- `src/main.ts` — processo main: janela (`contextIsolation: true`,
  `nodeIntegration: false`), IPC de rascunhos/diálogos, self-test.
- `src/preload.ts` — única ponte p/ o renderer (`window.pinkLogicDesktop`):
  versão, caminho userData, guardar/carregar/listar/apagar rascunhos,
  diálogos guardar/abrir, ler/escrever ficheiro de projecto.
- `src/drafts.ts` — rascunhos como JSON em `<userData>/drafts/<id>.json`
  (escrita atómica tmp+rename; ids saneados p/ não escapar da pasta).
- `electron-builder.yml` — `com.pinklogic.app`; Windows NSIS x64 + portable;
  macOS dmg arm64+x64; `publish: never` (sem distribuição, sem assinatura).
- `electron-updater` está instalado como dependência mas **não activado**
  (sem updates nesta fase).

## Comandos (a partir da raiz do repo)

```bash
npm install                                    # regista o workspace (packages/*)
npm run build --workspace=@pink-logic/web       # build da SPA
npm run build --workspace=@pink-logic/desktop   # tsc do main/preload
npm run build:web --workspace=@pink-logic/desktop  # copia web/dist → dist-web

# Dev: terminal 1 = web dev server; terminal 2 = Electron a apontar p/ ele
npm run dev --workspace=@pink-logic/web
npm run dev --workspace=@pink-logic/desktop     # ELECTRON_WEB_URL=http://localhost:3001 por omissão

# Self-test real (builds + Electron headless + preload + rascunho + screenshot)
npm run test:selftest --workspace=@pink-logic/desktop

# Build Windows de desenvolvimento (precisa de Wine ou Docker builder:wine em Linux)
npm run dist:win --workspace=@pink-logic/desktop
```

## Notas / o que falta (Fase 1)

- **macOS não pode ser construído nesta VM Linux** — fazer num Mac ou em CI.
- **Build Windows em Linux** precisa de Wine (`builder:wine` via Docker ou
  Wine instalado); sem isso o `electron-builder --win` falha (ver relatório).
- **Autosave no editor**: a API `saveDraft` está pronta; a ligação ao editor
  web (guardar ao editar) é Fase 2 — o web ainda não chama `pinkLogicDesktop`.
- **Updates**: `electron-updater` instalado, não configurado nem activado.
- **Fontes Google**: o `index.html` do web carrega fontes do Google Fonts por
  CDN — offline, a app cai p/ fontes do sistema (nada parte, só o aspecto).
- **Assinatura**: sem certificado de assinatura de código — o instalador
  Windows vai mostrar o aviso SmartScreen até haver assinatura.
