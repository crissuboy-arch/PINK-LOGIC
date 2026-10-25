// api-src/ping.ts
function handler(_req, res) {
  res.status(200).json({ ping: "pong" });
}
export {
  handler as default
};
