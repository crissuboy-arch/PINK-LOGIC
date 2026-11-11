/**
 * pink-logic-mcp — entrada HTTP (Streamable HTTP, transporte atual do MCP).
 *
 * Para que serve: expor o mesmo servidor MCP por HTTP para que o
 * `tunnel-client` da OpenAI (Secure MCP Tunnel) o alcance, ou para um
 * hosting público futuro. O ChatGPT NÃO se liga a `localhost` — ver
 * docs/chatgpt-desktop-integracao.md.
 *
 * Rotas:
 *   GET  /health  — sem auth; { ok, service, transport }.
 *   POST /mcp     — JSON-RPC MCP (initialize, tools/list, tools/call, ...).
 *   GET  /mcp     — 405 (modo stateless: sem stream SSE persistente).
 *
 * Autenticação do endpoint (PINK_LOGIC_MCP_KEY, dedicada, >= 32 chars):
 *   - Se a chave está definida: `Authorization: Bearer <chave>` obrigatório.
 *   - Se NÃO está definida: só arranca em loopback (127.0.0.1 / ::1) e sem
 *     autenticação — uso local / tunnel apenas. NUNCA expor assim.
 *   - Bind não-loopback sem chave → recusa arrancar (fail closed).
 *
 * NOTA: o formulário "Add custom MCP server" do ChatGPT só oferece OAuth ou
 * "No authentication" — NÃO há opção de API key/Bearer. Esta chave Bearer
 * protege o endpoint local (tunnel-client, testes); a autenticação do lado
 * do ChatGPT faz-se pelo túnel (Secure MCP Tunnel) ou por OAuth no hosting
 * público. Não inventar que o ChatGPT envia esta chave.
 *
 * Env:
 *   MCP_HTTP_HOST            default 127.0.0.1
 *   MCP_HTTP_PORT            default 3003
 *   PINK_LOGIC_MCP_KEY       Bearer do endpoint (ver acima)
 *   PINK_LOGIC_MCP_API_KEY   chave p/ chamar a API Pink Logic (lado servidor);
 *                            sem ela, usa PINK_LOGIC_SERVICE_KEY (ver server.ts).
 *                            Para o ChatGPT, usar a chave kind `chatgpt`.
 *   PINK_LOGIC_API_URL       default http://localhost:3001
 */
import "dotenv/config";
import { createHash, timingSafeEqual } from "node:crypto";
import http from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpServer } from "./server.js";

const HOST = process.env.MCP_HTTP_HOST || "127.0.0.1";
const PORT = Number(process.env.MCP_HTTP_PORT || 3003);
const MCP_KEY = (process.env.PINK_LOGIC_MCP_KEY || "").trim();
const MAX_BODY_BYTES = 10 * 1024 * 1024;

const LOOPBACK = new Set(["127.0.0.1", "::1", "localhost"]);
const sha256 = (s: string) => createHash("sha256").update(s).digest();

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  console.error(`[pink-logic-mcp:http] MCP_HTTP_PORT inválido: ${process.env.MCP_HTTP_PORT}`);
  process.exit(1);
}
if (MCP_KEY && MCP_KEY.length < 32) {
  console.error("[pink-logic-mcp:http] PINK_LOGIC_MCP_KEY fraca (< 32 chars) — recuso arrancar.");
  process.exit(1);
}
if (!MCP_KEY && !LOOPBACK.has(HOST)) {
  console.error(
    `[pink-logic-mcp:http] Bind ${HOST} sem PINK_LOGIC_MCP_KEY — recuso arrancar. ` +
      "Define a chave ou usa loopback (127.0.0.1) para uso local/tunnel.",
  );
  process.exit(1);
}

/** true se o pedido traz o Bearer correto (ou se não há chave e é loopback). */
function isAuthorized(req: http.IncomingMessage): boolean {
  if (!MCP_KEY) return true; // loopback-only, validado no arranque
  const match = /^Bearer\s+(.+)$/i.exec(req.headers.authorization || "");
  const token = match?.[1]?.trim() || "";
  if (!token) return false;
  return timingSafeEqual(sha256(token), sha256(MCP_KEY));
}

function sendJson(res: http.ServerResponse, status: number, body: unknown): void {
  const data = JSON.stringify(body);
  res.writeHead(status, { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) });
  res.end(data);
}

async function readBody(req: http.IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > MAX_BODY_BYTES) throw new Error("Body demasiado grande (> 10 MB)");
    chunks.push(chunk as Buffer);
  }
  const raw = Buffer.concat(chunks).toString("utf-8");
  if (!raw.trim()) throw new Error("Body vazio");
  return JSON.parse(raw);
}

const server = http.createServer((req, res) => {
  void (async () => {
    try {
      const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

      if (req.method === "GET" && url.pathname === "/health") {
        sendJson(res, 200, { ok: true, service: "pink-logic-mcp", transport: "streamable-http", version: "2.0.0" });
        return;
      }

      if (url.pathname !== "/mcp") {
        sendJson(res, 404, { error: "Rota desconhecida. Usa POST /mcp (MCP) ou GET /health." });
        return;
      }

      if (req.method !== "POST") {
        sendJson(res, 405, { error: "Método não suportado neste modo (stateless). Usa POST /mcp." });
        return;
      }

      if (!isAuthorized(req)) {
        sendJson(res, 401, { error: "Não autenticado: Bearer PINK_LOGIC_MCP_KEY em falta ou inválido." });
        return;
      }

      let parsedBody: unknown;
      try {
        parsedBody = await readBody(req);
      } catch (err: any) {
        sendJson(res, 400, { error: `Body JSON inválido: ${err.message}` });
        return;
      }

      // Stateless: um transporte e um servidor novos por pedido.
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
      res.on("close", () => void transport.close().catch(() => undefined));
      const mcpServer = createMcpServer();
      await mcpServer.connect(transport);
      await transport.handleRequest(req, res, parsedBody);
    } catch (err: any) {
      console.error("[pink-logic-mcp:http] erro:", err?.message || err);
      if (!res.headersSent) sendJson(res, 500, { error: "Erro interno do servidor MCP." });
      else res.end();
    }
  })();
});

server.listen(PORT, HOST, () => {
  console.error(
    `[pink-logic-mcp:http] a ouvir em http://${HOST}:${PORT} ` +
      `(auth: ${MCP_KEY ? "bearer PINK_LOGIC_MCP_KEY" : "loopback sem auth — local/tunnel apenas"})`,
  );
  if (!process.env.PINK_LOGIC_MCP_API_KEY && !process.env.PINK_LOGIC_SERVICE_KEY) {
    console.error("[pink-logic-mcp:http] AVISO: sem PINK_LOGIC_MCP_API_KEY nem PINK_LOGIC_SERVICE_KEY — as tools que chamam a API vão dar 401.");
  }
});
