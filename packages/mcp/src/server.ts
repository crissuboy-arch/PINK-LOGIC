/**
 * pink-logic-mcp — tools para agentes (Athena / ChatGPT) operarem a máquina de conteúdo.
 *
 * Padrão "cliente fino": cada tool traduz intenção → chamada REST na API.
 *
 * Credencial para chamar a API (lado do servidor, nunca exposta ao cliente MCP):
 *   PINK_LOGIC_MCP_API_KEY (preferida) ou PINK_LOGIC_SERVICE_KEY (legado).
 * Para expor este servidor ao ChatGPT, configurar PINK_LOGIC_MCP_API_KEY com a
 * chave dedicada de âmbito mínimo (kind `chatgpt` — cria rascunhos, lê, gera;
 * a API responde 403 a aprovar/agendar/publicar/apagar). Ver
 * docs/chatgpt-desktop-integracao.md.
 *
 * Transportes (ficheiros separados, mesmo servidor):
 *   - stdio:  src/index.ts  (Athena, processo local)
 *   - HTTP:   src/http.ts   (Streamable HTTP, p/ Secure MCP Tunnel / hosting público)
 */
import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const API_URL = process.env.PINK_LOGIC_API_URL || "http://localhost:3001";
// Chave do lado do servidor para chamar a API Pink Logic. A API exige
// autenticação em todas as rotas exceto /health.
const API_KEY = process.env.PINK_LOGIC_MCP_API_KEY || process.env.PINK_LOGIC_SERVICE_KEY || "";

async function api(path: string, body?: unknown, method?: "GET" | "POST" | "PATCH" | "DELETE") {
  const res = await fetch(`${API_URL}/api${path}`, {
    method: method || (body ? "POST" : "GET"),
    headers: {
      "Content-Type": "application/json",
      ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return { ok: true };
  const data = await res.json();
  if (!res.ok) throw new Error((data as any).error || `HTTP ${res.status}`);
  return data;
}

/** Monta a query string para GET, ignorando campos vazios/undefined. */
function qs(params: Record<string, unknown>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") sp.set(k, String(v));
  const s = sp.toString();
  return s ? `?${s}` : "";
}

/** Cria o servidor MCP com todas as tools registadas. Sem efeitos laterais. */
export function createMcpServer(): McpServer {
  const server = new McpServer({ name: "pink-logic", version: "2.0.0" });

  server.tool(
    "generate_carousel_content",
    "Cria um rascunho estruturado de carrossel com slides, legenda e hashtags. Exige revisão; não agenda nem publica.",
    {
      topic: z.string().min(3).max(2000),
      audience: z.string().max(500).default(""),
      brand: z.string().max(200).default(""),
      tone: z.string().max(200).default("profissional"),
      objective: z.string().max(500).default("educar"),
      slideCount: z.number().int().min(3).max(10).default(5),
    },
    async ({ topic, ...brief }) => ({
      content: [{ type: "text", text: JSON.stringify(await api("/generate", {
        module: "carousel", prompt: topic, options: { ...brief, mode: "content" },
      })) }],
    }),
  );

  // ─── Geração ──────────────────────────────────────────────
  server.tool(
    "generate_logo",
    "Gera um logo via PINK-LOGIC (Pollinations, grátis). Usa antes de create_post quando precisares de identidade visual.",
    { prompt: z.string().describe("Descrição do logo pretendido") },
    async ({ prompt }) => ({
      content: [{ type: "text", text: JSON.stringify(await api("/generate", { module: "logo", prompt })) }],
    })
  );

  server.tool(
    "generate_qrcode",
    "Gera um QR code com as cores da marca.",
    { data: z.string().describe("URL ou texto do QR code") },
    async ({ data }) => ({
      content: [{ type: "text", text: JSON.stringify(await api("/generate", { module: "qrcode", prompt: data })) }],
    })
  );

  server.tool(
    "generate_sticker",
    "Gera um sticker com fundo transparente (Pollinations + remoção de fundo).",
    { prompt: z.string().describe("Descrição do sticker/mascote") },
    async ({ prompt }) => ({
      content: [{ type: "text", text: JSON.stringify(await api("/generate", { module: "sticker", prompt })) }],
    })
  );

  // ─── Jev — decisão ────────────────────────────────────────
  server.tool(
    "decide",
    "Pede ao Jev uma decisão calibrada (sim/não, escolha ou nota + confiança). Usa como porta antes de agendar/publicar. Sem chave, devolve passed=false (revisão humana).",
    {
      action: z.string().describe("Ex: approve_post, score_caption"),
      context: z.record(z.unknown()).describe("Estado a avaliar"),
      threshold: z.number().min(0).max(1).default(0.7),
    },
    async ({ action, context, threshold }) => ({
      content: [{ type: "text", text: JSON.stringify(await api("/decide", { action, context, threshold })) }],
    })
  );

  // ─── AIsa — coleta ────────────────────────────────────────
  server.tool(
    "collect_trends",
    "Coleta reels/posts/trends de um nicho via AIsa (precisa de AISA_API_KEY).",
    {
      source: z.enum(["instagram", "tiktok", "trends"]),
      query: z.string().describe("Handle, hashtag ou tópico"),
      limit: z.number().int().min(1).max(500).default(50),
    },
    async ({ source, query, limit }) => ({
      content: [{ type: "text", text: JSON.stringify(await api("/collect", { source, query, limit })) }],
    })
  );

  // ─── Posts (mesma tabela que o Calendário do site usa) ────
  const PLATFORMS = ["Instagram", "Facebook", "LinkedIn", "X/Twitter", "WordPress", "Blog"] as const;

  server.tool(
    "create_post",
    "Cria um post. Sem scheduledAt, fica rascunho. Com scheduledAt, a API passa pela porta do Jev antes de agendar: " +
      "aprovado → agendado de verdade; reprovado → continua rascunho, para revisão humana (nunca agenda sozinho algo fraco).",
    {
      title: z.string().min(1).max(200),
      caption: z.string().max(2200),
      hashtags: z.array(z.string()).default([]),
      mediaUrl: z.string().url().optional().describe("URL pública da imagem/arte do post"),
      aspectRatio: z.string().max(10).optional().describe("ex.: 4:5, 1:1, 9:16"),
      platforms: z.array(z.enum(PLATFORMS)).min(1).describe("Onde publicar: Instagram, Facebook, ..."),
      scheduledAt: z.string().datetime().optional().describe("ISO 8601; omitido = fica rascunho"),
      projectId: z.string().uuid().optional().describe("Omitido = primeiro projeto da conta"),
    },
    async (input) => ({
      content: [{ type: "text", text: JSON.stringify(await api("/posts", input)) }],
    })
  );

  server.tool(
    "list_posts",
    "Lista posts (rascunhos, agendados, publicados...). Usa antes de agendar/publicar para ver o que já existe.",
    {
      status: z.enum(["rascunho", "editando", "agendado", "publicando", "publicado", "falhou"]).optional(),
      projectId: z.string().uuid().optional(),
      from: z.string().datetime().optional(),
      to: z.string().datetime().optional(),
      limit: z.number().int().min(1).max(200).default(50),
    },
    async (input) => ({
      content: [{ type: "text", text: JSON.stringify(await api(`/posts${qs(input)}`)) }],
    })
  );

  server.tool(
    "update_post",
    "Edita um post existente (legenda, mídia, plataformas, data...). Passa só os campos que queres mudar.",
    {
      id: z.string().uuid(),
      title: z.string().min(1).max(200).optional(),
      caption: z.string().max(2200).optional(),
      hashtags: z.array(z.string()).optional(),
      mediaUrl: z.string().url().optional(),
      aspectRatio: z.string().max(10).optional(),
      platforms: z.array(z.enum(PLATFORMS)).optional(),
      scheduledAt: z.string().datetime().optional(),
    },
    async ({ id, ...patch }) => ({
      content: [{ type: "text", text: JSON.stringify(await api(`/posts/${id}`, patch, "PATCH")) }],
    })
  );

  server.tool(
    "schedule_post",
    "Agenda um post já existente para uma data/hora (não passa pelo Jev — usa create_post com scheduledAt para isso).",
    { id: z.string().uuid(), scheduledAt: z.string().datetime() },
    async ({ id, scheduledAt }) => ({
      content: [{ type: "text", text: JSON.stringify(await api(`/posts/${id}/schedule`, { scheduledAt })) }],
    })
  );

  server.tool(
    "publish_post",
    "Publica um post AGORA, de imediato, no Instagram e/ou Facebook conforme as plataformas do post. " +
      "Ação real e visível publicamente — só usa depois de confirmar com a Cristiane, nunca por iniciativa própria.",
    { id: z.string().uuid() },
    async ({ id }) => ({
      content: [{ type: "text", text: JSON.stringify(await api(`/posts/${id}/publish`, {})) }],
    })
  );

  server.tool(
    "api_health",
    "Verifica se a API está viva e que integrações estão ativas (jev, aisa). Usa primeiro quando algo falhar.",
    {},
    async () => ({
      content: [{ type: "text", text: JSON.stringify(await api("/health")) }],
    })
  );

  // ─── Carrossel híbrido ────────────────────────────────────
  server.tool(
    "render_carousel",
    "Renderiza um slide de carrossel estilo 'maestro' (@maestroprompts): papel pautado, marker azul, texto pixel-perfect em PT. Devolve PNG 1080×1080 em base64.",
    {
      title: z.string().describe("Título grande do slide"),
      items: z.array(z.string()).default([]).describe("Itens da lista"),
      footer: z.string().optional().describe("CTA / linha de destaque no rodapé"),
      handle: z.string().default("").describe("Atribuição (ex: @tumarca)"),
      counter: z.string().default("").describe("Contador (ex: 4/6)"),
    },
    async ({ title, items, footer, handle, counter }) => ({
      content: [{ type: "text", text: JSON.stringify(await api("/generate", { module: "carousel", prompt: title, options: { items, footer, handle, slideNumber: counter } })) }],
    })
  );

  // ─── Mockup Studio (backend) ──────────────────────────────
  server.tool(
    "generate_mockup",
    "Gera um mockup da identidade visual/artwork num objeto real (caneca, fachada, uniforme, caixa, smartphone, etc.). Mesmos 9 tipos do Mockup Studio web. Devolve PNG 1080×1080 em base64. Para vários mockups, chama uma vez por tipo (cada chamada é independente e idempotente nos mesmos inputs). Não publica nada.",
    {
      artworkUrl: z.string().describe("URL http(s) pública da arte/logo OU data:image/...;base64 (máx 5MB)"),
      type: z.enum(["card", "storefront", "uniform", "box", "laptop", "smartphone", "billboard", "mug", "sticker"]).describe("Tipo de mockup (ex: 'mug' para caneca)"),
      projectName: z.string().max(100).optional().describe("Nome/identificador do projeto (opcional)"),
      idempotencyKey: z.string().max(100).optional().describe("Chave de idempotência (opcional): mesmos inputs → mesmo resultado"),
    },
    async ({ artworkUrl, type, projectName, idempotencyKey }) => {
      try {
        const result = await api("/generate", {
          module: "mockup",
          prompt: projectName || type,
          options: { mockupType: type, artworkUrl, projectName, idempotencyKey },
        });
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              status: "ok",
              type,
              projectName: projectName ?? null,
              idempotencyKey: idempotencyKey ?? null,
              imageBase64: result.imageBase64,
              renderer: result.metadata?.renderer,
            }),
          }],
        };
      } catch (err: any) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              status: "error",
              type,
              error: err.message || "falha ao gerar mockup",
              code: "MOCKUP_GENERATION_FAILED",
            }),
          }],
        };
      }
    }
  );

  return server;
}
