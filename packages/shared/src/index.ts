/**
 * @pink-logic/shared — tipos e schemas partilhados entre
 * api, web, mcp e bot. Fonte única de verdade dos contratos.
 */
import { z } from "zod";

// ─── Brand ────────────────────────────────────────────────
export const BrandSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
    background: z.string(),
    text: z.string(),
    muted: z.string(),
  }),
  fonts: z.object({
    family: z.string(),
    heading: z.string(),
    body: z.string(),
  }),
  voiceTone: z.string().optional(),
  logoUrl: z.string().url().optional(),
  defaultHashtags: z.array(z.string()).default([]),
});
export type Brand = z.infer<typeof BrandSchema>;

// ─── Geração ──────────────────────────────────────────────
export const GenerateModuleSchema = z.enum(["logo", "qrcode", "sticker", "story", "copy", "carousel", "mockup"]);
export const MockupTypeSchema = z.enum(["card", "storefront", "uniform", "box", "laptop", "smartphone", "billboard", "mug", "sticker"]);
export type MockupType = z.infer<typeof MockupTypeSchema>;
export const MockupRequestSchema = z.object({
  type: MockupTypeSchema,
  artworkUrl: z.string().min(1).max(2000),
  projectId: z.string().max(100).optional(),
  projectName: z.string().max(100).optional(),
  idempotencyKey: z.string().max(100).optional(),
});
export type MockupRequest = z.infer<typeof MockupRequestSchema>;
// Render de carrossel (Achado 3): antes sem schema nenhum — título e itens
// sem limite. Agora com tetos iguais aos do documento de carrossel.
export const CarouselRenderSchema = z.object({
  title: z.string().min(1).max(200),
  items: z
    .array(z.object({ title: z.string().max(110).optional(), body: z.string().max(350).optional() }).passthrough())
    .max(10)
    .default([]),
  footer: z.string().max(200).optional(),
  handle: z.string().max(200).optional(),
  counter: z.string().max(200).optional(),
});
export type CarouselRender = z.infer<typeof CarouselRenderSchema>;
export const CarouselStyleSchema = z.enum(["maestro", "clean", "bold"]);
export type CarouselStyle = z.infer<typeof CarouselStyleSchema>;
export type GenerateModule = z.infer<typeof GenerateModuleSchema>;

export const GenerateRequestSchema = z.object({
  module: GenerateModuleSchema,
  // Achado 3: antes min(1) sem máximo — um prompt gigante era aceite.
  prompt: z.string().min(1).max(2000),
  brandId: z.string().uuid().optional(),
  options: z.record(z.unknown()).default({}),
});
export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;

export const GenerateResultSchema = z.object({
  module: GenerateModuleSchema,
  imageUrl: z.string().optional(),
  text: z.string().optional(),
  metadata: z.record(z.unknown()).default({}),
});
export type GenerateResult = z.infer<typeof GenerateResultSchema>;

// Documento editável: geração termina em revisão, nunca em publicação.
export const CarouselBriefSchema = z.object({
  topic: z.string().trim().min(3).max(2000),
  audience: z.string().max(500).default(""),
  brand: z.string().max(200).default(""),
  tone: z.string().max(200).default("profissional"),
  objective: z.string().max(500).default("educar"),
  slideCount: z.number().int().min(3).max(10).default(5),
});
export const CarouselDocumentSchema = z.object({
  slides: z.array(z.object({
    title: z.string().trim().min(1).max(110),
    body: z.string().trim().min(1).max(350),
  })).min(3).max(10),
  caption: z.string().trim().min(1).max(2200),
  hashtags: z.array(z.string().regex(/^#[\p{L}\p{N}_]+$/u).max(80)).max(10),
});
export type CarouselDocument = z.infer<typeof CarouselDocumentSchema>;

// ─── Posts (máquina de conteúdo) ──────────────────────────
export const PostStatusSchema = z.enum([
  "DRAFT",
  "PENDING_REVIEW",
  "SCHEDULED",
  "PUBLISHING",
  "PUBLISHED",
  "FAILED",
]);
export type PostStatus = z.infer<typeof PostStatusSchema>;

export const PostSchema = z.object({
  id: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  caption: z.string(),
  imageUrl: z.string().url().optional(),
  hashtags: z.array(z.string()).default([]),
  status: PostStatusSchema.default("DRAFT"),
  scheduledAt: z.string().datetime().optional(),
  publishedAt: z.string().datetime().optional(),
  decision: z
    .object({
      approved: z.boolean(),
      confidence: z.number().min(0).max(1),
      reason: z.string().optional(),
    })
    .optional(),
});
export type Post = z.infer<typeof PostSchema>;

// ─── Jev — decisão ────────────────────────────────────────
// O Jev não escreve: devolve escolha / nota / sim-não + confiança calibrada.
export const DecideRequestSchema = z.object({
  action: z.string().min(1), // ex: "approve_post", "score_caption"
  context: z.record(z.unknown()), // estado que o Jev avalia
  options: z.array(z.string()).optional(), // para choice; omitido = yes/no
  threshold: z.number().min(0).max(1).default(0.7),
});
export type DecideRequest = z.infer<typeof DecideRequestSchema>;

export const DecideResultSchema = z.object({
  value: z.union([z.string(), z.number(), z.boolean()]),
  confidence: z.number().min(0).max(1),
  passed: z.boolean(), // confidence >= threshold
  provider: z.string(), // "jev" | "manual" (sem chave)
  error: z.string().optional(), // motivo quando caiu para revisão manual
});
export type DecideResult = z.infer<typeof DecideResultSchema>;

// ─── AIsa — coleta ────────────────────────────────────────
export const CollectRequestSchema = z.object({
  source: z.enum(["instagram", "tiktok", "trends"]),
  query: z.string().min(1), // handle, hashtag ou tópico
  limit: z.number().int().min(1).max(500).default(50),
});
export type CollectRequest = z.infer<typeof CollectRequestSchema>;

// ─── Posts (scheduled_posts) — API /api/posts + MCP ───────────────────────
// Opera sobre a mesma tabela que o site usa (Fase 2): um post criado pela
// Athena aparece no Calendário, e vice-versa.
export const PublisherPlatformSchema = z.enum(["Instagram", "Facebook", "LinkedIn", "X/Twitter", "WordPress", "Blog"]);
export const ScheduledPostStatusSchema = z.enum(["rascunho", "editando", "agendado", "publicando", "publicado", "falhou"]);

export const ScheduledPostCreateSchema = z.object({
  projectId: z.string().uuid().optional(), // omitido → primeiro projeto do dono
  brandId: z.string().uuid().optional(),
  campaignId: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  caption: z.string().max(2200),
  hashtags: z.array(z.string()).default([]),
  mediaUrl: z.string().url().optional(),
  aspectRatio: z.string().max(10).optional(), // ex.: "4:5", "1:1", "9:16"
  platforms: z.array(PublisherPlatformSchema).min(1),
  scheduledAt: z.string().datetime().optional(), // omitido → rascunho (não agendado)
  decision: z
    .object({ approved: z.boolean(), confidence: z.number().min(0).max(1), reason: z.string().optional() })
    .optional(),
});
export type ScheduledPostCreate = z.infer<typeof ScheduledPostCreateSchema>;

export const ScheduledPostUpdateSchema = ScheduledPostCreateSchema.partial().extend({
  status: ScheduledPostStatusSchema.optional(),
});
export type ScheduledPostUpdate = z.infer<typeof ScheduledPostUpdateSchema>;

export const ScheduledPostListQuerySchema = z.object({
  status: ScheduledPostStatusSchema.optional(),
  projectId: z.string().uuid().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});
export type ScheduledPostListQuery = z.infer<typeof ScheduledPostListQuerySchema>;

// ─── Brand Kit / campanhas — API /api/brands + /api/campaigns (ChatGPT) ──
// Estes schemas espelham as COLUNAS das tabelas `brands` e `campaigns`
// (supabase/migrations/20260607000000 + 20261008113719). NÃO confundir
// com o BrandSchema do web (forma da UI, com `muted`/`voiceTone`/etc.).
export const BrandCreateSchema = z.object({
  projectId: z.string().uuid().optional(), // omitido → primeiro projeto do dono
  name: z.string().min(1).max(100),
  colors: z
    .object({
      primary: z.string().max(20).optional(),
      secondary: z.string().max(20).optional(),
      accent: z.string().max(20).optional(),
      background: z.string().max(20).optional(),
      text: z.string().max(20).optional(),
      glow: z.string().max(20).optional(),
    })
    .optional(),
  fonts: z
    .object({ heading: z.string().max(100).optional(), body: z.string().max(100).optional() })
    .optional(),
  hashtags: z.array(z.string().max(80)).max(30).default([]),
  cta: z.string().max(200).default(""),
  tone: z.string().max(200).default(""),
  style: z.string().max(200).default(""),
  overlays: z.array(z.string().max(200)).max(20).default([]),
  logo: z.string().url().max(2000).optional(),
  avatar: z.string().max(2000).optional(),
  secondary_colors: z.array(z.string().max(20)).max(10).default([]),
  social_links: z.record(z.string().max(500)).default({}),
  brand_dna: z.record(z.unknown()).default({}),
});
export type BrandCreate = z.infer<typeof BrandCreateSchema>;

export const BrandUpdateSchema = BrandCreateSchema.partial().omit({ projectId: true });
export type BrandUpdate = z.infer<typeof BrandUpdateSchema>;

export const BrandListQuerySchema = z.object({
  projectId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});
export type BrandListQuery = z.infer<typeof BrandListQuerySchema>;

export const CampaignCreateSchema = z.object({
  projectId: z.string().uuid().optional(), // omitido → primeiro projeto do dono
  name: z.string().min(1).max(200),
  main_product: z.string().max(200).optional(),
  secondary_product: z.string().max(200).optional(),
  message: z.string().max(2000).optional(),
  status: z.string().max(30).default("draft"),
  goal: z.string().max(500).optional(),
  cta: z.string().max(200).optional(),
  start_date: z.string().datetime().optional(),
  linked_post_ids: z.array(z.string().uuid()).max(500).default([]),
});
export type CampaignCreate = z.infer<typeof CampaignCreateSchema>;

export const CampaignListQuerySchema = z.object({
  projectId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});
export type CampaignListQuery = z.infer<typeof CampaignListQuerySchema>;

// ─── Import de imagem — POST /api/media/import (ChatGPT) ────────────────
export const MediaImportRequestSchema = z.object({
  url: z.string().url().max(2000), // link público (ex.: openaiFileIdRefs do ChatGPT)
  filename: z.string().max(100).optional(),
});
export type MediaImportRequest = z.infer<typeof MediaImportRequestSchema>;

// Resultado da publicação na Meta Graph API (Instagram e/ou Facebook).
export const PlatformPublishResultSchema = z.object({
  ok: z.boolean(),
  id: z.string().optional(), // ig_media_id ou fb_post_id
  error: z.string().optional(),
});
export type PlatformPublishResult = z.infer<typeof PlatformPublishResultSchema>;
