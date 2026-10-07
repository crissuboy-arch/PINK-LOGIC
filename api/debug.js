// api-src/debug.ts
async function handler(_req, res) {
  const results = {};
  const tests = [
    ["shared", "@pink-logic/shared"],
    ["generate", "@pink-logic/api/services/generate.js"],
    ["aisa", "@pink-logic/api/services/aisa.js"],
    ["jev", "@pink-logic/api/services/jev-decider.js"]
  ];
  for (const [name, mod] of tests) {
    try {
      await import(mod);
      results[name] = "OK";
    } catch (e) {
      results[name] = "FAIL: " + (e?.message || String(e)).slice(0, 200);
    }
  }
  res.status(200).json(results);
}
export {
  handler as default
};
