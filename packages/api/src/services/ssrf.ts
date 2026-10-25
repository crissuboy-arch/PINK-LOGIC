/**
 * Proteção SSRF para URLs fornecidas pelo utilizador (ex.: artwork de mockup).
 *
 * Antes: `fetch(url, { redirect: "follow" })` sem qualquer validação de
 * destino — o servidor fazia GET a pedido do utilizador, incluindo
 * loopback, rede privada e link-local (169.254.169.254, metadados cloud),
 * e seguia redirects sem revalidar.
 *
 * Agora: antes de cada pedido (e após cada redirect) o host é validado —
 * nomes bloqueados (localhost), IPs literais privados/reservados e TODOS
 * os IPs resolvidos por DNS têm de ser públicos. Redirects são seguidos
 * manualmente (máx. 5), revalidando cada destino — isto fecha também o
 * ataque de DNS rebinding na janela entre validar e pedir (a validação
 * acontece imediatamente antes de cada pedido).
 */
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

/** IPv4 privado/reservado/especial (RFC 1918, loopback, link-local, CGNAT, documentação, etc.). */
function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p) || p < 0 || p > 255)) return false;
  const [a, b] = parts;
  if (a === 10) return true; // 10/8
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16/12
  if (a === 192 && b === 168) return true; // 192.168/16
  if (a === 127) return true; // 127/8 loopback
  if (a === 169 && b === 254) return true; // 169.254/16 link-local (metadados cloud)
  if (a === 0) return true; // 0/8 "este host"
  if (a === 100 && b >= 64 && b <= 127) return true; // 100.64/10 CGNAT
  if (a === 192 && b === 0) return true; // 192.0.0/24 e 192.0.2/24 (NAT64, documentação)
  if (a === 198 && (b === 18 || b === 19)) return true; // 198.18/15 benchmark
  if (a === 198 && b === 51 && parts[2] === 100) return true; // 198.51.100/24 documentação
  if (a === 203 && b === 0 && parts[2] === 113) return true; // 203.0.113/24 documentação
  if (a >= 240) return true; // 240/4 reservado
  return false;
}

/** IPv6 privado/reservado: loopback, não especificado, link-local, único-local, mapeado-IPv4 privado. */
function isPrivateIPv6(ip: string): boolean {
  const h = ip.toLowerCase();
  if (h === "::1" || h === "::") return true;
  if (h.startsWith("fe8") || h.startsWith("fe9") || h.startsWith("fea") || h.startsWith("feb")) return true; // fe80::/10
  if (h.startsWith("fc") || h.startsWith("fd")) return true; // fc00::/7 único-local
  if (h.startsWith("::ffff:")) {
    // IPv4 mapeado: valida o IPv4 embutido.
    const v4 = h.slice("::ffff:".length);
    if (isIP(v4) === 4) return isPrivateIPv4(v4);
  }
  return false;
}

/** Verdadeiro se o IP literal for privado/reservado/especial. Não-IP → falso. */
export function isBlockedIp(ip: string): boolean {
  const v = isIP(ip);
  if (v === 4) return isPrivateIPv4(ip);
  if (v === 6) return isPrivateIPv6(ip);
  return false;
}

/** Verdadeiro se o hostname for bloqueado sem precisar de DNS (localhost ou IP privado). */
export function isBlockedHostname(host: string): boolean {
  const h = host.toLowerCase();
  if (h === "localhost" || h.endsWith(".localhost")) return true;
  if (isIP(h)) return isBlockedIp(h);
  return false;
}

/** Garante que o host resolve só para IPs públicos. Lança 400 se bloqueado ou irresolúvel. */
export async function assertPublicHost(host: string): Promise<void> {
  if (isBlockedHostname(host)) {
    throw httpError(400, "URL bloqueada: o destino não é um endereço público.");
  }
  let addrs: { address: string }[];
  try {
    addrs = await lookup(host, { all: true });
  } catch {
    throw httpError(400, "Não foi possível resolver o host da URL.");
  }
  if (addrs.length === 0 || addrs.some((a) => isBlockedIp(a.address))) {
    throw httpError(400, "URL bloqueada: o destino não é um endereço público.");
  }
}

export interface FetchedImage {
  contentType: string;
  buffer: Buffer;
}

/**
 * Obtém uma imagem pública por URL, com redirects manuais validados.
 * Devolve o buffer; nunca devolve detalhe interno (sem código HTTP, sem
 * host) nas mensagens — o estado HTTP anterior servia de oráculo para
 * varrer serviços internos.
 */
export async function fetchPublicImage(
  url: string,
  opts: { timeoutMs?: number; maxRedirects?: number; maxBytes?: number } = {}
): Promise<FetchedImage> {
  const timeoutMs = opts.timeoutMs ?? 15_000;
  const maxRedirects = opts.maxRedirects ?? 5;
  const maxBytes = opts.maxBytes ?? 5 * 1024 * 1024;

  let current = url;
  for (let hop = 0; hop <= maxRedirects; hop++) {
    let u: URL;
    try {
      u = new URL(current);
    } catch {
      throw httpError(400, "URL inválida.");
    }
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      throw httpError(400, "Só URLs http(s) são permitidas.");
    }
    await assertPublicHost(u.hostname);

    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    let r: Response;
    try {
      r = await fetch(current, { signal: ctrl.signal, redirect: "manual" });
    } catch {
      throw httpError(400, "Não foi possível obter a imagem.");
    } finally {
      clearTimeout(t);
    }

    if ([301, 302, 303, 307, 308].includes(r.status)) {
      const loc = r.headers.get("location");
      if (!loc) throw httpError(400, "Redirect sem destino.");
      if (hop === maxRedirects) throw httpError(400, "Demasiados redirects.");
      current = new URL(loc, current).toString();
      continue;
    }
    if (!r.ok) throw httpError(400, "Não foi possível obter a imagem.");
    const ct = r.headers.get("content-type") || "";
    if (!ct.startsWith("image/")) throw httpError(400, "A URL não é uma imagem.");
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length > maxBytes) throw httpError(400, "A imagem excede 5MB.");
    return { contentType: ct.split(";")[0], buffer: buf };
  }
  throw httpError(400, "Demasiados redirects.");
}
