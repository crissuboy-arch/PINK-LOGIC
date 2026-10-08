/**
 * Publicação real no Instagram e no Facebook via Meta Graph API.
 *
 * As duas usam o MESMO token: um Page Access Token da página do Facebook,
 * com as permissões pages_manage_posts, pages_read_engagement,
 * instagram_basic e instagram_content_publish. A conta do Instagram tem de
 * ser Business/Creator e estar ligada a essa página.
 *
 * Variáveis de ambiente (nenhuma delas tem valor por omissão — sem elas,
 * publicar falha com um erro claro em vez de fingir sucesso):
 *   META_PAGE_ACCESS_TOKEN      — token de página (serve para as duas redes)
 *   META_PAGE_ID                — id da página do Facebook
 *   META_INSTAGRAM_ACCOUNT_ID   — id da conta Business do Instagram (ig_user_id)
 */
const GRAPH_VERSION = process.env.META_GRAPH_VERSION || "v21.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

function creds() {
  const token = process.env.META_PAGE_ACCESS_TOKEN || "";
  const pageId = process.env.META_PAGE_ID || "";
  const igAccountId = process.env.META_INSTAGRAM_ACCOUNT_ID || "";
  return { token, pageId, igAccountId, ready: token.length > 0 };
}

export function metaReady() {
  return creds().ready;
}

async function graphCall(path: string, params: Record<string, string>) {
  const url = new URL(`${GRAPH_BASE}/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, { method: "POST" });
  const data = (await res.json().catch(() => ({}))) as any;
  if (!res.ok || data.error) {
    const msg = data.error?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export interface PublishInput {
  imageUrl?: string;
  caption: string;
}
export interface PublishOutcome {
  ok: boolean;
  id?: string;
  error?: string;
}

/** Instagram: publicação em dois passos — cria o contentor de media e depois publica-o. */
export async function publishToInstagram(input: PublishInput): Promise<PublishOutcome> {
  const { token, igAccountId, ready } = creds();
  if (!ready) return { ok: false, error: "Meta (Instagram) não configurado: falta META_PAGE_ACCESS_TOKEN." };
  if (!igAccountId) return { ok: false, error: "Falta META_INSTAGRAM_ACCOUNT_ID." };
  if (!input.imageUrl) return { ok: false, error: "O Instagram exige uma imagem (URL pública)." };
  try {
    const container = await graphCall(`${igAccountId}/media`, {
      image_url: input.imageUrl,
      caption: input.caption,
      access_token: token,
    });
    const published = await graphCall(`${igAccountId}/media_publish`, {
      creation_id: container.id,
      access_token: token,
    });
    return { ok: true, id: published.id };
  } catch (e: any) {
    return { ok: false, error: `Instagram: ${e.message}` };
  }
}

/** Facebook: publica na timeline da página (foto, se houver imagem; senão texto). */
export async function publishToFacebookPage(input: PublishInput): Promise<PublishOutcome> {
  const { token, pageId, ready } = creds();
  if (!ready) return { ok: false, error: "Meta (Facebook) não configurado: falta META_PAGE_ACCESS_TOKEN." };
  if (!pageId) return { ok: false, error: "Falta META_PAGE_ID." };
  try {
    const result = input.imageUrl
      ? await graphCall(`${pageId}/photos`, { url: input.imageUrl, caption: input.caption, access_token: token })
      : await graphCall(`${pageId}/feed`, { message: input.caption, access_token: token });
    return { ok: true, id: result.post_id || result.id };
  } catch (e: any) {
    return { ok: false, error: `Facebook: ${e.message}` };
  }
}

/**
 * Publica num conjunto de plataformas. Nunca lança — cada rede falha/passa
 * de forma independente, e quem chama decide o que fazer com o resultado.
 */
export async function publishToPlatforms(
  platforms: string[],
  input: PublishInput
): Promise<Record<string, PlatformOutcomeNamed>> {
  const results: Record<string, PlatformOutcomeNamed> = {};
  for (const platform of platforms) {
    if (platform === "Instagram") results.instagram = await publishToInstagram(input);
    else if (platform === "Facebook") results.facebook = await publishToFacebookPage(input);
    else results[platform.toLowerCase()] = { ok: false, error: `Publicação em "${platform}" ainda não implementada.` };
  }
  return results;
}
type PlatformOutcomeNamed = PublishOutcome;
