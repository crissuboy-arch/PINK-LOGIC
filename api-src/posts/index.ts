/**
 * Rota base exata /api/posts (GET/POST) — função própria.
 *
 * CORREÇÃO FINAL (limite Hobby: 12 funções): o router opcional
 * posts/[[...all]] NÃO casa 0 segmentos no router de funções da
 * Vercel (provado ao vivo: /api/posts → 404), por isso a base volta
 * a ser uma função exata (index.ts) e as rotas 1+ segmentos vivem no
 * catch-all OBRIGATÓRIO posts/[...all].ts. O handler original NÃO
 * mudou — vive em ./_handlers/index.ts (o script de bundle ignora
 * diretórios com prefixo `_`) e esta função só delega, preservando
 * método, auth, rate limit e códigos de erro da rota base.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import indexHandler from "./_handlers/index.js";

export default function handler(req: VercelRequest, res: VercelResponse) {
  return indexHandler(req, res);
}
