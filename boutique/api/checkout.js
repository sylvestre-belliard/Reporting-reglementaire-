// Création d'une session de paiement Stripe Checkout.
// Les prix sont recalculés ici à partir du catalogue : on ne fait jamais confiance aux montants envoyés par le navigateur.
const { PRODUCTS, PROMO_CODES, SHIPPING } = require("../products.js");

const STRIPE_API = process.env.STRIPE_API_BASE || "https://api.stripe.com";
const PAYS_LIVRES = (process.env.PAYS_LIVRES || "FR,BE,LU,CH,MC").split(",");

const cents = n => Math.round(n * 100);

function validate(body) {
  if (!body || !Array.isArray(body.items) || !body.items.length || body.items.length > 50) {
    throw new Error("Panier invalide.");
  }
  const items = body.items.map(l => {
    const p = PRODUCTS.find(x => x.id === l.id);
    const qte = Number(l.qte);
    if (!p) throw new Error("Produit inconnu.");
    if (!Number.isInteger(qte) || qte < 1 || qte > 20) throw new Error("Quantité invalide.");
    const variante = p.variantes.length ? l.variante : null;
    if (p.variantes.length && !p.variantes.includes(variante)) throw new Error("Variante invalide.");
    return { p, qte, variante };
  });
  const shipping = SHIPPING.options.find(o => o.id === body.shipping) || SHIPPING.options[0];
  const promo = typeof body.promo === "string" && PROMO_CODES[body.promo.toUpperCase()] ? body.promo.toUpperCase() : null;
  return { items, shipping, promo };
}

function buildParams({ items, shipping, promo }, siteUrl) {
  const pct = promo ? PROMO_CODES[promo] : 0;
  const f = new URLSearchParams();
  f.append("mode", "payment");
  f.append("locale", "fr");
  f.append("success_url", `${siteUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`);
  f.append("cancel_url", `${siteUrl}/index.html?paiement=annule`);
  PAYS_LIVRES.forEach((c, i) => f.append(`shipping_address_collection[allowed_countries][${i}]`, c.trim()));
  f.append("phone_number_collection[enabled]", "true");

  let sousTotalRemise = 0;
  items.forEach(({ p, qte, variante }, i) => {
    const unit = cents(p.prix * (1 - pct / 100));
    sousTotalRemise += unit * qte;
    const k = `line_items[${i}]`;
    f.append(`${k}[quantity]`, String(qte));
    f.append(`${k}[price_data][currency]`, "eur");
    f.append(`${k}[price_data][unit_amount]`, String(unit));
    f.append(`${k}[price_data][product_data][name]`, variante ? `${p.nom} — ${variante}` : p.nom);
    if (pct) f.append(`${k}[price_data][product_data][description]`, `Remise ${promo} (−${pct} %) incluse`);
    f.append(`${k}[price_data][product_data][metadata][produit_id]`, p.id);
  });

  const gratuit = shipping.id === "standard" && sousTotalRemise >= cents(SHIPPING.seuilGratuit);
  const s = "shipping_options[0][shipping_rate_data]";
  f.append(`${s}[type]`, "fixed_amount");
  f.append(`${s}[display_name]`, shipping.label);
  f.append(`${s}[fixed_amount][amount]`, String(gratuit ? 0 : cents(shipping.prix)));
  f.append(`${s}[fixed_amount][currency]`, "eur");

  // Résumé de la commande pour la transmettre au fournisseur (visible dans le tableau de bord Stripe).
  const resume = items.map(({ p, qte, variante }) =>
    `${qte}x ${p.id}${variante ? ` (${variante})` : ""} [${p.fournisseur}]`).join(" | ");
  f.append("metadata[commande]", resume.slice(0, 500));
  if (promo) f.append("metadata[code_promo]", promo);
  f.append("metadata[livraison]", shipping.id);
  return f;
}

async function createCheckoutSession(body, siteUrl) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return { status: 501, json: { error: "Paiement non configuré (STRIPE_SECRET_KEY manquante).", demo: true } };
  let data;
  try { data = validate(body); } catch (e) { return { status: 400, json: { error: e.message } }; }

  const res = await fetch(`${STRIPE_API}/v1/checkout/sessions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: buildParams(data, siteUrl.replace(/\/$/, ""))
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("Erreur Stripe :", json.error && json.error.message);
    return { status: 502, json: { error: "Le paiement est momentanément indisponible." } };
  }
  return { status: 200, json: { url: json.url } };
}

module.exports = { createCheckoutSession, buildParams, validate };
