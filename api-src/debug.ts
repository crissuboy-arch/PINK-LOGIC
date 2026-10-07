/** Diagnóstico: testa cada import e devolve o erro exato. */
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const results: Record<string, string> = {};
  const tests: [string, string][] = [
    ["shared", "@pink-logic/shared"],
    ["generate", "@pink-logic/api/services/generate.js"],
    ["aisa", "@pink-logic/api/services/aisa.js"],
    ["jev", "@pink-logic/api/services/jev-decider.js"],
  ];
  for (const [name, mod] of tests) {
    try {
      await import(mod);
      results[name] = "OK";
    } catch (e: any) {
      results[name] = "FAIL: " + (e?.message || String(e)).slice(0, 200);
    }
  }
  res.status(200).json(results);
}
