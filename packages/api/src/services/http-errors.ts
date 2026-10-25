/**
 * Erros seguros para o cliente.
 *
 * Antes desta correção, handlers devolviam `err.message` cru — incluindo
 * mensagens de drivers de base de dados e de upstreams. Agora:
 * - 4xx e 503 intencionais (mensagens estáticas do código): mantêm-se, pois
 *   não contêm valores de infra nem dados de terceiros;
 * - 500: mensagem genérica; o detalhe vai só para o log do servidor.
 */
export function toPublicError(err: any): { status: number; message: string } {
  const status = typeof err?.status === "number" ? err.status : 500;
  if (status >= 400 && status < 500) {
    return { status, message: err?.message || "Pedido inválido." };
  }
  if (status === 503) {
    return { status, message: err?.message || "Serviço indisponível." };
  }
  // 500 ou outro: nunca vazar detalhe interno para o cliente.
  console.error("[pink-logic] erro interno:", err?.message || err);
  return { status: 500, message: "Erro interno. Tente novamente." };
}
