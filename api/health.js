// api-src/health.ts
async function handler(_req, res) {
  res.status(200).json({
    ok: true,
    service: "pink-logic-api",
    version: "2.0.0",
    runtime: "vercel-serverless",
    integrations: {
      jev: !!process.env.JEV_API_KEY,
      aisa: !!process.env.AISA_API_KEY
    }
  });
}
export {
  handler as default
};
