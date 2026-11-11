/**
 * Import de imagem — POST /api/media/import (ChatGPT).
 *
 * O ChatGPT entrega imagens geradas (ou anexadas) às Actions como links
 * de download temporários (openaiFileIdRefs). Este serviço descarrega a
 * imagem desse link — com a proteção SSRF já existente (fetchPublicImage:
 * só host público, redirects revalidados, máx. 5 MB, só image/*) — e
 * guarda-a no Supabase Storage, devolvendo a URL pública que o
 * create_post aceita em `mediaUrl`.
 *
 * Bucket: PINK_LOGIC_MEDIA_BUCKET (default `pink-logic-media`). Tem de
 * existir e ser PÚBLICO no Supabase Dashboard (Storage → New bucket);
 * sem bucket, o upload falha com 503 e mensagem clara — nunca finge.
 */
import { randomUUID } from "node:crypto";
import type { AuthContext } from "./auth.js";
import type { MediaImportRequest } from "@pink-logic/shared";
import { admin, resolveOwnerId } from "./scope.js";
import { fetchPublicImage } from "./ssrf.js";

function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

const EXT_BY_CONTENT_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

/**
 * Guarda um buffer de imagem no bucket e devolve a URL pública.
 * Caminhos com UUID (não enumeráveis); só leitura pública — a escrita
 * passa sempre por esta API autenticada. O bucket tem de existir e ser
 * público; sem ele, 503 com mensagem clara.
 */
export async function storeImage(
  buffer: Buffer,
  contentType: string,
  filename: string
): Promise<{ url: string; path: string; sizeBytes: number }> {
  const ext = EXT_BY_CONTENT_TYPE[contentType] ?? null;
  if (!ext) throw httpError(400, "Só imagens JPEG, PNG, WebP ou GIF.");
  const safeName = (filename || "imagem").replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80) || "imagem";
  const d = new Date();
  const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const path = `chatgpt/${day}/${randomUUID()}-${safeName}.${ext}`;
  const bucket = (process.env.PINK_LOGIC_MEDIA_BUCKET || "pink-logic-media").trim();
  const { error } = await admin().storage.from(bucket).upload(path, buffer, { contentType, upsert: false });
  if (error) {
    throw httpError(
      503,
      `Não foi possível guardar a imagem no bucket "${bucket}" — criar o bucket público no Supabase (Storage → New bucket, público).`
    );
  }
  const { data } = admin().storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl, path, sizeBytes: buffer.length };
}

export async function importMedia(auth: AuthContext, input: MediaImportRequest) {
  // Auth + dono configurado (fail-closed); o ficheiro fica no bucket da conta.
  await resolveOwnerId(auth);

  const { contentType, buffer } = await fetchPublicImage(input.url, { maxBytes: 5 * 1024 * 1024 });
  const stored = await storeImage(buffer, contentType, input.filename || "imagem");
  return { url: stored.url, path: stored.path, contentType, sizeBytes: stored.sizeBytes };
}
