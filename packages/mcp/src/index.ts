/**
 * pink-logic-mcp — entrada stdio (Athena).
 * Tools em ./server.ts; transporte HTTP em ./http.ts.
 */
import "dotenv/config";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMcpServer } from "./server.js";

const server = createMcpServer();
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("[pink-logic-mcp] pronto — à espera da Athena via stdio");
