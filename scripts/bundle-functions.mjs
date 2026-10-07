#!/usr/bin/env node
/**
 * Bundle das serverless functions com esbuild.
 * O nft da Vercel não segue symlinks de workspaces npm, por isso o código
 * de @pink-logic/* é bundled PARA DENTRO de cada função.
 * Deps nativas (resvg) ficam external — o nft rastreia pacotes npm reais.
 */
import { buildSync } from "esbuild";
import { readdirSync, statSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const SRC = new URL("../api-src/", import.meta.url).pathname;
const OUT = new URL("../api/", import.meta.url).pathname;

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

function collect(dir, base = "") {
  const out = [];
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    const rel = base ? `${base}/${e}` : e;
    if (statSync(full).isDirectory()) out.push(...collect(full, rel));
    else if (e.endsWith(".ts")) out.push(rel);
  }
  return out;
}

const files = collect(SRC);
console.log("bundling:", files.join(", "));

for (const f of files) {
  const entry = join(SRC, f);
  const outfile = join(OUT, f.replace(/\.ts$/, ".js"));
  mkdirSync(join(OUT, f.split("/").slice(0, -1).join("/")), { recursive: true });
  buildSync({
    entryPoints: [entry],
    bundle: true,
    platform: "node",
    format: "esm",
    target: "node22",
    outfile,
    logLevel: "warning",
    // nativas: ficam como import, resolvidas de node_modules no runtime.
    // @vercel/node é só tipos (apagado na compilação) — external por segurança.
    external: ["@resvg/resvg-js", "@resvg/resvg-js-*", "@vercel/node"],
  });
}
console.log("ok —", files.length, "functions em api/");
