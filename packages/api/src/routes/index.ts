import { Router } from "express";
import {
  GenerateRequestSchema,
  DecideRequestSchema,
  CollectRequestSchema,
  ScheduledPostCreateSchema,
  ScheduledPostUpdateSchema,
  ScheduledPostListQuerySchema,
} from "@pink-logic/shared";
import { generate } from "../services/generate.js";
import { decide } from "../services/jev-decider.js";
import { collect, aisaReady } from "../services/aisa.js";
import { requireAuth } from "../services/auth.js";
import { createPost, listPosts, getPost, updatePost, deletePost, schedulePost, publishPostNow, publishDuePosts } from "../services/posts.js";

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

// ─── Posts — máquina de conteúdo (mesma tabela que o site usa) ───
router.post("/posts", async (req, res) => {
  const auth = await requireAuth(req, res);
  if (!auth) return;
  const parsed = ScheduledPostCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    res.status(201).json({ post: await createPost(auth, parsed.data) });
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.get("/posts", async (req, res) => {
  const auth = await requireAuth(req, res);
  if (!auth) return;
  const parsed = ScheduledPostListQuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    res.json({ posts: await listPosts(auth, parsed.data) });
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.get("/posts/:id", async (req, res) => {
  const auth = await requireAuth(req, res);
  if (!auth) return;
  try {
    res.json({ post: await getPost(auth, req.params.id) });
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.patch("/posts/:id", async (req, res) => {
  const auth = await requireAuth(req, res);
  if (!auth) return;
  const parsed = ScheduledPostUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    res.json({ post: await updatePost(auth, req.params.id, parsed.data) });
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.delete("/posts/:id", async (req, res) => {
  const auth = await requireAuth(req, res);
  if (!auth) return;
  try {
    await deletePost(auth, req.params.id);
    res.status(204).end();
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.post("/posts/:id/schedule", async (req, res) => {
  const auth = await requireAuth(req, res);
  if (!auth) return;
  try {
    res.json({ post: await schedulePost(auth, req.params.id, req.body?.scheduledAt) });
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.post("/posts/:id/publish", async (req, res) => {
  const auth = await requireAuth(req, res);
  if (!auth) return;
  try {
    res.json({ post: await publishPostNow(auth, req.params.id) });
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// ─── Cron (produção: /api/cron/publish, protegido por CRON_SECRET) ───
router.get("/cron/publish", async (req, res) => {
  const secret = process.env.CRON_SECRET;
  if (!secret) return res.status(503).json({ error: "CRON_SECRET não configurado." });
  if (req.headers.authorization !== `Bearer ${secret}`) return res.status(401).json({ error: "Não autorizado." });
  try {
    const outcomes = await publishDuePosts();
    res.json({ ok: true, processed: outcomes.length, outcomes });
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message });
  }
});
