// Fonction serverless Netlify : POST /api/checkout
const { createCheckoutSession } = require("../../api/checkout.js");

exports.handler = async event => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Méthode non autorisée" };
  let body;
  try { body = JSON.parse(event.body || "{}"); } catch { body = null; }
  const siteUrl = process.env.SITE_URL || process.env.URL || `https://${event.headers.host}`;
  const { status, json } = await createCheckoutSession(body, siteUrl);
  return { statusCode: status, headers: { "Content-Type": "application/json" }, body: JSON.stringify(json) };
};
