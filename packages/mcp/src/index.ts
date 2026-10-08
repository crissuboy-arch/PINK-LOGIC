/**
 * pink-logic-mcp — tools para agentes (Athena) operarem a máquina de conteúdo.
 *
 * Padrão "cliente fino": cada tool traduz intenção → chamada REST na API.
 * A Athena liga-se via MCP e pode: gerar, decidir, coletar, criar posts.
 */
import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API_URL = process.env.PINK_LOGIC_API_URL || "http://localhost:3001";
// Chave de serviço da Athena: a API exige autenticação em todas as rotas exceto /health.
const SERVICE_KEY = process.env.PINK_LOGIC_SERVICE_KEY || "";

async function api(path: string, body?: unknown) {
  const res = await fetch(`${API_URL}/api${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json",
      ...(SERVICE_KEY ? { Authorization: `Bearer ${SERVICE_KEY}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data as any).error || `HTTP ${res.status}`);
  return data;
}

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

// ─── Posts ────────────────────────────────────────────────
server.tool(
  "create_post",
  "Cria um post (rascunho). A API passa automaticamente pela porta do Jev: aprovado → SCHEDULED, senão → PENDING_REVIEW.",
  {
    caption: z.string(),
    imageUrl: z.string().url().optional(),
    hashtags: z.array(z.string()).default([]),
  },
  async (input) => ({
    content: [{ type: "text", text: JSON.stringify(await api("/posts", input)) }],
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

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("[pink-logic-mcp] pronto — à espera da Athena via stdio");
