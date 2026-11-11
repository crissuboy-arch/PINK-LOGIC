#!/usr/bin/env node
/**
 * Seed do Brand Kit «Ofensiva Criativa» — POST /api/brands (nunca SQL direto).
 *
 * Porquê script + JSON em vez de migration SQL:
 *   - Não há acesso SQL direto ao Supabase a partir daqui (só a chave
 *     dedicada de API); a API é o caminho documentado e resolve o
 *     project_id do lado do servidor (primeiro projeto do dono quando
 *     projectId é omitido — ver services/scope.ts resolveProjectId).
 *   - Idempotente: faz GET /api/brands primeiro; se já existir uma marca
 *     com o nome «Ofensiva Criativa», não cria nada e sai com 0.
 *   - O JSON é a fonte única dos valores; o script só transporta.
 *
 * Uso (a chave NUNCA vai para o código nem para o chat):
 *   PINK_LOGIC_CHATGPT_KEY="$(cat ~/workspace/your_files/pink-logic-chatgpt-key.txt)" \
 *     node scripts/seed-ofensiva-criativa.mjs \
 *     --base-url https://pink-logic-git-feat-chatgpt-gpt-b3d0d0-crissuboy-9102s-projects.vercel.app
 *
 *   --dry-run   valida o JSON e mostra o payload, sem chamar a API.
 *   --base-url  base do preview (default: a do preview de teste acima).
 *   --key-file  caminho do ficheiro com a chave (alternativa à env var).
 *
 * LOGO: o JSON traz logo=null de propósito — não existe ficheiro oficial
 * de logótipo da Ofensiva Criativa no repo (o logo.png do repo é do
 * PinkLogic). O script omite o campo; quando a Cristiane fornecer o
 * ficheiro oficial, actualizar o JSON e correr de novo (a idempotência
 * por nome impede duplicados, mas NÃO actualiza — nesse caso apagar a
 * marca antiga ou usar PATCH /api/brands/:id).
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BRAND_NAME = "Ofensiva Criativa";
const DEFAULT_BASE_URL =
  "https://pink-logic-git-feat-chatgpt-gpt-b3d0d0-crissuboy-9102s-projects.vercel.app";

function arg(name, fallback = undefined) {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const dryRun = process.argv.includes("--dry-run");
const baseUrl = (arg("--base-url", DEFAULT_BASE_URL) || "").replace(/\/$/, "");
const keyFile = arg("--key-file");
const key = (process.env.PINK_LOGIC_CHATGPT_KEY || (keyFile ? readFileSync(keyFile, "utf8") : "")).trim();

const brand = JSON.parse(readFileSync(join(__dirname, "ofensiva-criativa-brand.json"), "utf8"));

// Validação mínima local (a validação autoritativa é o BrandCreateSchema
// no servidor): nome + cores hexadecimais no formato esperado.
if (brand.name !== BRAND_NAME) throw new Error(`JSON: name esperado «${BRAND_NAME}», veio «${brand.name}».`);
for (const [k, v] of Object.entries(brand.colors ?? {})) {
  if (!/^#[0-9A-Fa-f]{6}$/.test(v)) throw new Error(`JSON: colors.${k} inválido: ${v}`);
}
if (brand.logo !== null && brand.logo !== undefined) {
  throw new Error("JSON: logo tem de ser null até existir ficheiro oficial (ver cabeçalho).");
}

// O schema da API rejeita logo=null (só aceita URL ou ausência): omitir nulos.
// brand_dna vai inteiro (record livre) — inclui logo_missing/logo_note.
const payload = Object.fromEntries(
  Object.entries(brand).filter(([, v]) => v !== null && v !== undefined),
);

if (dryRun) {
  console.log(JSON.stringify({ baseUrl, payload }, null, 2));
  console.log("DRY-RUN: nada enviado. Logo omitido (null no JSON) — falta o ficheiro oficial.");
  process.exit(0);
}
if (!key) {
  console.error("Falta a chave: define PINK_LOGIC_CHATGPT_KEY ou passa --key-file <ficheiro>.");
  process.exit(2);
}

// Header 'authorization' em minúsculas: o proxy de saída desta VM retém
// pedidos com 'Authorization' (A maiúsculo) para os hosts do preview.
const headers = { authorization: `Bearer ${key}`, "content-type": "application/json" };

const getRes = await fetch(`${baseUrl}/api/brands`, { headers });
if (!getRes.ok) {
  console.error(`GET /api/brands → HTTP ${getRes.status}: ${(await getRes.text()).slice(0, 300)}`);
  process.exit(1);
}
const existing = (await getRes.json()).brands ?? [];
const found = existing.find((b) => b.name === BRAND_NAME);
if (found) {
  console.log(`Já existe «${BRAND_NAME}» (id ${found.id}) — nada criado (idempotente).`);
  console.log(JSON.stringify(found, null, 2));
  process.exit(0);
}

const postRes = await fetch(`${baseUrl}/api/brands`, {
  method: "POST",
  headers,
  body: JSON.stringify(payload),
});
if (postRes.status !== 201) {
  console.error(`POST /api/brands → HTTP ${postRes.status}: ${(await postRes.text()).slice(0, 300)}`);
  process.exit(1);
}
const created = (await postRes.json()).brand;
console.log(`Criada «${BRAND_NAME}» (id ${created.id}).`);
console.log(JSON.stringify(created, null, 2));
