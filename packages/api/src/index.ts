/**
 * pink-logic-api — cérebro da máquina de conteúdo.
 * Clientes finos (web, bot, mcp, Athena) falam REST com esta API.
 */
import "dotenv/config";
import express from "express";
import cors from "cors";
import { router } from "./routes/index.js";

const app = express();
const PORT = Number(process.env.API_PORT || 3002);

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use("/api", router);

app.listen(PORT, () => {
  console.log(`[pink-logic-api] a ouvir em :${PORT}`);
  console.log(`[pink-logic-api] jev: ${process.env.JEV_API_KEY ? "ON" : "manual (sem chave)"}`);
  console.log(`[pink-logic-api] aisa: ${process.env.AISA_API_KEY ? "ON" : "OFF (sem chave)"}`);
});
