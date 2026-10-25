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
import { createPost, listPosts, getPost, updatePost, deletePost, schedulePost, publishPostNow, publishDuePosts, approvePostHuman } from "../services/posts.js";
import { toPublicError } from "../services/http-errors.js";
import { isCronSecretValid } from "../services/cron-auth.js";
import { generalLimiter, generationLimiter, dailyQuota, rateLimitKey, enforceRateLimit } from "../services/rate-limit.js";

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
  const auth = await requireAuth(req, res);
  if (!auth) return;
  if (!enforceRateLimit(generationLimiter, rateLimitKey(auth), res)) return;
  if (!enforceRateLimit(dailyQuota, rateLimitKey(auth), res)) return;
  const parsed = GenerateRequestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const result = await generate(parsed.data.module, parsed.data.prompt, parsed.data.options);
    res.json(result);
  } catch (err: any) {
    const pub = toPublicError(err); res.status(pub.status).json({ error: pub.message });
  }
});

// ─── Jev — decisão ────────────────────────────────────────
router.post("/decide", async (req, res) => {
  const auth = await requireAuth(req, res);
  if (!auth) return;
  if (!enforceRateLimit(generationLimiter, rateLimitKey(auth), res)) return;
  if (!enforceRateLimit(dailyQuota, rateLimitKey(auth), res)) return;
  const parsed = DecideRequestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const result = await decide(parsed.data);
    res.json({ ...result, error: result.error ? "Decisão indisponível; revisão manual necessária." : undefined });
  } catch (err: any) {
    const pub = toPublicError(err); res.status(pub.status).json({ error: pub.message });
  }
});

// ─── AIsa — coleta ────────────────────────────────────────
router.post("/collect", async (req, res) => {
  const auth = await requireAuth(req, res);
  if (!auth) return;
  if (!enforceRateLimit(generationLimiter, rateLimitKey(auth), res)) return;
  if (!enforceRateLimit(dailyQuota, rateLimitKey(auth), res)) return;
  const parsed = CollectRequestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    res.json(await collect(parsed.data));
  } catch (err: any) {
    const pub = toPublicError(err); res.status(pub.status).json({ error: pub.message });
  }
});

// ─── Posts — máquina de conteúdo (mesma tabela que o site usa) ───
router.post("/posts", async (req, res) => {
  const auth = await requireAuth(req, res);
  if (!auth) return;
  if (!enforceRateLimit(generalLimiter, rateLimitKey(auth), res)) return;
  const parsed = ScheduledPostCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    res.status(201).json({ post: await createPost(auth, parsed.data) });
  } catch (err: any) {
    const pub = toPublicError(err); res.status(pub.status).json({ error: pub.message });
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
    const pub = toPublicError(err); res.status(pub.status).json({ error: pub.message });
  }
});

router.get("/posts/:id", async (req, res) => {
  const auth = await requireAuth(req, res);
  if (!auth) return;
  try {
    res.json({ post: await getPost(auth, req.params.id) });
  } catch (err: any) {
    const pub = toPublicError(err); res.status(pub.status).json({ error: pub.message });
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
    const pub = toPublicError(err); res.status(pub.status).json({ error: pub.message });
  }
});

router.delete("/posts/:id", async (req, res) => {
  const auth = await requireAuth(req, res);
  if (!auth) return;
  try {
    await deletePost(auth, req.params.id);
    res.status(204).end();
  } catch (err: any) {
    const pub = toPublicError(err); res.status(pub.status).json({ error: pub.message });
  }
});

router.post("/posts/:id/schedule", async (req, res) => {
  const auth = await requireAuth(req, res);
  if (!auth) return;
  try {
    res.json({ post: await schedulePost(auth, req.params.id, req.body?.scheduledAt) });
  } catch (err: any) {
    const pub = toPublicError(err); res.status(pub.status).json({ error: pub.message });
  }
});

router.post("/posts/:id/publish", async (req, res) => {
  const auth = await requireAuth(req, res);
  if (!auth) return;
  try {
    res.json({ post: await publishPostNow(auth, req.params.id) });
  } catch (err: any) {
    const pub = toPublicError(err); res.status(pub.status).json({ error: pub.message });
  }
});

router.post("/posts/:id/approve", async (req, res) => {
  const auth = await requireAuth(req, res);
  if (!auth) return;
  try {
    res.json({ post: await approvePostHuman(auth, req.params.id) });
  } catch (err: any) {
    const pub = toPublicError(err); res.status(pub.status).json({ error: pub.message });
  }
});

// ─── Cron (produção: /api/cron/publish, protegido por CRON_SECRET) ───
router.get("/cron/publish", async (req, res) => {
  const secret = process.env.CRON_SECRET;
  if (!secret) return res.status(503).json({ error: "CRON_SECRET não configurado." });
  if (!isCronSecretValid(req.headers.authorization, secret)) return res.status(401).json({ error: "Não autorizado." });
  try {
    const outcomes = await publishDuePosts();
    res.json({ ok: true, processed: outcomes.length, outcomes });
  } catch (err: any) {
    const pub = toPublicError(err); res.status(pub.status).json({ error: pub.message });
  }
});
