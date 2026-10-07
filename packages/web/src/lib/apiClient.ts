/**
 * Cliente da API serverless (/api/*). Devolve erros legíveis em PT.
 */
export interface ApiResult<T> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
}

export async function apiPost<T = any>(path: string, body: unknown): Promise<ApiResult<T>> {
  try {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    let json: any = null;
    try { json = text ? JSON.parse(text) : null; } catch { /* resposta não-JSON */ }
    if (!res.ok) {
      const msg =
        res.status === 503 ? 'IA não configurada no servidor (falta AISA_API_KEY na Vercel).'
        : res.status === 404 ? `Rota ${path} não encontrada — o último deploy da API pode ter falhado.`
        : (typeof json?.error === 'string' ? json.error : json?.error ? 'Pedido inválido.' : `Erro ${res.status}`);
      return { ok: false, status: res.status, error: msg };
    }
    return { ok: true, status: res.status, data: json as T };
  } catch (e: any) {
    return { ok: false, status: 0, error: `Sem ligação à API: ${e?.message || e}` };
  }
}
