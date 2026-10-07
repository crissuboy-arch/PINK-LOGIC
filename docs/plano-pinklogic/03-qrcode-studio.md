# 03 — QR Code Studio v2

Hoje: 8 tipos (Website, WhatsApp, Pix, Instagram, Contato, Local, Ebook PDF, Cardápio), cor do QR, fundo, logo central, export PNG.

## 3.1 Qualidade e exportação
| Item | Descrição | Esforço | Impacto |
|---|---|---|---|
| Exportar SVG e PDF | Vetor para gráfica; manter PNG com opção de 512/1024/2048/4096 px | P | ★★★ |
| Correção de erro | Seletor L/M/Q/H; forçar H quando tem logo central | P | ★★ |
| Alerta de contraste | Calcular contraste cor/fundo; avisar < 4:1 e bloquear inversão ilegível | P | ★★★ |
| Zona de silêncio | Margem configurável (quiet zone) | P | ★ |
| Teste de leitura | Botão "Testar" que decodifica o QR gerado (jsQR) e confirma o destino | M | ★★ |

## 3.2 Estilo visual
- Formatos de módulos: quadrado, arredondado, pontos, losango, "líquido".
- Formatos dos olhos (cantos): quadrado, arredondado, circular, folha; cor própria.
- Degradê linear/radial no QR.
- Moldura com texto ("Escaneie aqui", "Peça pelo WhatsApp") e CTA, em 6 modelos.
- Presets por marca: "Usar cores do Brand Kit ativo" com um clique.
- Biblioteca de presets salvos.

## 3.3 Novos tipos
Wi-Fi (SSID/senha/segurança), vCard completo (foto, empresa, redes), e-mail, SMS, telefone, evento/agenda (.ics), App Store/Google Play (detecção por dispositivo), texto livre, PIX estático e copia-e-cola com valor, link de avaliação Google, página de links ("link na bio").

## 3.4 Validação por tipo
- WhatsApp: máscara internacional, mensagem pré-preenchida opcional.
- Pix: validar chave (CPF/CNPJ/e-mail/telefone/aleatória), nome e cidade; gerar payload BR Code correto com CRC16.
- Instagram: aceitar @usuario e normalizar para URL.
- Local: busca de endereço, gerar link do Google Maps/Waze.

## 3.5 QR dinâmico (diferencial que justifica cobrança)
- Cada QR aponta para `go.seudominio/q/{id}`; o destino pode ser editado depois sem trocar o QR impresso.
- Contagem de scans, por dia, dispositivo, país/cidade (aproximado), horário.
- Data de expiração, senha opcional, limite de scans.
- Painel "Meus QR Codes" com busca, pastas e status.
- Tabelas sugeridas (Supabase):
  - `qr_codes(id, user_id, brand_id, type, payload, style_json, short_code, destination_url, is_dynamic, created_at)`
  - `qr_scans(id, qr_id, scanned_at, device, os, country, city, referrer)`

## 3.6 Operação em lote
- Upload CSV (nome, URL) → gera N QR Codes → ZIP com SVG/PNG nomeados.
- Casos de uso: mesas de restaurante, produtos, crachás, lojas.
- Impressão: folha A4 com grade de QR Codes e etiquetas.

## 3.7 Integrações
- Salvar no Brand Kit / Central de Ativos.
- "Inserir no editor" como elemento arrastável.
- Cardápio: ligar ao MenuFlow PRO (QR do cardápio digital da própria Cris).

## 3.8 Critérios de aceite
- Todo QR gerado é lido corretamente em iOS e Android (teste manual com 3 dispositivos).
- SVG abre sem perda no Illustrator/Canva.
- Contraste ruim exibe aviso visível.
- 30 QR Codes em lote geram em menos de 10 s.
