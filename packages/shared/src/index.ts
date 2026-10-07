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
export const GenerateModuleSchema = z.enum(["logo", "qrcode", "sticker", "story", "copy"]);
export type GenerateModule = z.infer<typeof GenerateModuleSchema>;

export const GenerateRequestSchema = z.object({
  module: GenerateModuleSchema,
  prompt: z.string().min(1),
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
});
export type DecideResult = z.infer<typeof DecideResultSchema>;

// ─── AIsa — coleta ────────────────────────────────────────
export const CollectRequestSchema = z.object({
  source: z.enum(["instagram", "tiktok", "trends"]),
  query: z.string().min(1), // handle, hashtag ou tópico
  limit: z.number().int().min(1).max(500).default(50),
});
export type CollectRequest = z.infer<typeof CollectRequestSchema>;
