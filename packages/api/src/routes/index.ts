import { Router } from "express";
import {
  GenerateRequestSchema,
  DecideRequestSchema,
  CollectRequestSchema,
  PostSchema,
} from "@pink-logic/shared";
import { generate } from "../services/generate.js";
import { decide, approvePost } from "../services/jev-decider.js";
import { collect, aisaReady } from "../services/aisa.js";
import { requireAuth } from "../services/auth.js";

export const router = Router();

// ─── Health ───────────────────────────────────────────────
router.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "pink-logic-api",
    version: "2.0.0",
    integrations: {
      jev: !!process.env.JEV_API_KEY,
      aisa: aisaReady(),
    },
  });
});

// ─── Autenticação: tudo abaixo de /health exige login ou a chave de serviço ──
router.use(async (req, res, next) => {
  if (await requireAuth(req, res)) next();
});

// ─── Geração (motores reais do PINK-LOGIC) ────────────────
router.post("/generate", async (req, res) => {
  const parsed = GenerateRequestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const result = await generate(parsed.data.module, parsed.data.prompt, parsed.data.options);
    res.json(result);
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// ─── Jev — decisão ────────────────────────────────────────
router.post("/decide", async (req, res) => {
  const parsed = DecideRequestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    res.json(await decide(parsed.data));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── AIsa — coleta ────────────────────────────────────────
router.post("/collect", async (req, res) => {
  const parsed = CollectRequestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    res.json(await collect(parsed.data));
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// ─── Posts — máquina de conteúdo ──────────────────────────
// Nota: tabelas `posts` ainda não existem no Supabase — os endpoints
// validam o contrato e devolvem 501 até a migration ser aplicada.
// A Athena (via MCP) já pode programar contra este contrato.
router.post("/posts", async (req, res) => {
  const parsed = PostSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  // Porta do Jev: DRAFT → PENDING_REVIEW | SCHEDULED
  const decision = await approvePost(parsed.data as any);
  const status = decision.passed ? "SCHEDULED" : "PENDING_REVIEW";

  res.status(501).json({
    error: "Tabela `posts` ainda não existe — aplica a migration primeiro.",
    contract: { ...parsed.data, status, decision },
  });
});

router.get("/posts", (_req, res) => {
  res.status(501).json({ error: "Tabela `posts` ainda não existe — aplica a migration primeiro." });
});
