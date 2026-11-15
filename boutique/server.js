// Serveur local (ou VPS) : sert le site et l'API de paiement.
// Usage : STRIPE_SECRET_KEY=sk_test_... node server.js   puis http://localhost:3000
const http = require("http");
const fs = require("fs");
const path = require("path");
const { createCheckoutSession } = require("./api/checkout.js");

const ROOT = __dirname;
const PORT = process.env.PORT || 3000;
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".ico": "image/x-icon" };
const PUBLIC = /^\/(index\.html|success\.html|styles\.css|app\.js|products\.js|images\/[\w.-]+)$/;

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === "/api/checkout" && req.method === "POST") {
    let raw = "";
    for await (const chunk of req) { raw += chunk; if (raw.length > 1e5) return res.writeHead(413).end(); }
    let body; try { body = JSON.parse(raw); } catch { body = null; }
    const siteUrl = process.env.SITE_URL || `http://${req.headers.host}`;
    const { status, json } = await createCheckoutSession(body, siteUrl);
    res.writeHead(status, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(json));
  }

  const p = url.pathname === "/" ? "/index.html" : url.pathname;
  if (!PUBLIC.test(p)) return res.writeHead(404).end("Page introuvable");
  fs.readFile(path.join(ROOT, p), (err, data) => {
    if (err) return res.writeHead(404).end("Page introuvable");
    res.writeHead(200, { "Content-Type": TYPES[path.extname(p)] || "application/octet-stream" });
    res.end(data);
  });
}).listen(PORT, () => {
  console.log(`Boutique : http://localhost:${PORT}`);
  if (!process.env.STRIPE_SECRET_KEY) console.log("⚠️  STRIPE_SECRET_KEY absente : le paiement reste en mode démo.");
});
