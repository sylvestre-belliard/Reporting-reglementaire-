(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const eur = n => n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const bg = p => `linear-gradient(135deg, ${p.couleur[0]}, ${p.couleur[1]})`;
  const byId = id => PRODUCTS.find(p => p.id === id);

  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };

  const state = {
    categorie: "Tous",
    recherche: "",
    tri: "pop",
    panier: store.get("mn_panier", []),   // [{id, variante, qte}]
    promo: store.get("mn_promo", null)     // code
  };

  /* ---------- Catalogue ---------- */
  function renderCategories() {
    const cats = ["Tous", ...new Set(PRODUCTS.map(p => p.categorie))];
    $("#categories").innerHTML = cats.map(c =>
      `<button class="chip ${c === state.categorie ? "active" : ""}" data-cat="${esc(c)}">${esc(c)}</button>`).join("");
  }

  function stars(n) { return "★".repeat(Math.round(n)) + "☆".repeat(5 - Math.round(n)); }

  function renderGrid() {
    const q = state.recherche.trim().toLowerCase();
    let list = PRODUCTS.filter(p =>
      (state.categorie === "Tous" || p.categorie === state.categorie) &&
      (!q || (p.nom + " " + p.description + " " + p.categorie).toLowerCase().includes(q)));
    const sorters = {
      pop: (a, b) => b.avis - a.avis,
      asc: (a, b) => a.prix - b.prix,
      desc: (a, b) => b.prix - a.prix,
      note: (a, b) => b.note - a.note
    };
    list.sort(sorters[state.tri]);
    $("#empty").hidden = list.length > 0;
    $("#grid").innerHTML = list.map(p => `
      <article class="card">
        <button class="card-img" style="background:${bg(p)}" data-view="${p.id}" aria-label="Voir ${esc(p.nom)}">
          ${p.prixBarre ? `<span class="tag">−${Math.round((1 - p.prix / p.prixBarre) * 100)} %</span>` : ""}
          ${p.emoji}
        </button>
        <div class="card-body">
          <span class="card-cat">${esc(p.categorie)}</span>
          <h3>${esc(p.nom)}</h3>
          <span class="stars">${stars(p.note)} <small>(${p.avis})</small></span>
          <div class="price"><b>${eur(p.prix)}</b>${p.prixBarre ? `<s>${eur(p.prixBarre)}</s>` : ""}</div>
          <button class="btn btn-primary" data-add="${p.id}">Ajouter au panier</button>
        </div>
      </article>`).join("");
  }

  /* ---------- Fiche produit ---------- */
  function openProduct(id) {
    const p = byId(id);
    openModal(`
      <div class="product-detail">
        <div class="card-img" style="background:${bg(p)}">${p.emoji}</div>
        <div>
          <span class="card-cat">${esc(p.categorie)}</span>
          <h2>${esc(p.nom)}</h2>
          <span class="stars">${stars(p.note)} <small>${p.note}/5 · ${p.avis} avis</small></span>
          <div class="price"><b>${eur(p.prix)}</b>${p.prixBarre ? `<s>${eur(p.prixBarre)}</s>` : ""}</div>
          <p>${esc(p.description)}</p>
          ${p.variantes.length ? `<div class="variants">${p.variantes.map((v, i) =>
            `<label><input type="radio" name="variante" value="${esc(v)}" ${i ? "" : "checked"}><span>${esc(v)}</span></label>`).join("")}</div>` : ""}
          <button class="btn btn-primary btn-block" data-add-detail="${p.id}">Ajouter au panier</button>
          <ul class="perks">
            <li>🚚 Expédition sous 24-48 h · livraison estimée ${esc(p.delai)}</li>
            <li>↩️ 14 jours pour changer d'avis</li>
            <li>🔒 Paiement 100 % sécurisé</li>
          </ul>
        </div>
      </div>`);
  }

  /* ---------- Panier ---------- */
  function save() { store.set("mn_panier", state.panier); store.set("mn_promo", state.promo); }

  function addToCart(id, variante = null, qte = 1) {
    const p = byId(id);
    if (!p) return;
    if (variante === null && p.variantes.length) variante = p.variantes[0];
    const line = state.panier.find(l => l.id === id && l.variante === variante);
    if (line) line.qte += qte; else state.panier.push({ id, variante, qte });
    save(); renderCart();
    const b = $("#cartCount"); b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump");
    toast(`« ${p.nom} » ajouté au panier`);
  }

  function totals(shippingId = "standard") {
    const sousTotal = state.panier.reduce((s, l) => s + byId(l.id).prix * l.qte, 0);
    const pct = state.promo ? PROMO_CODES[state.promo] || 0 : 0;
    const remise = Math.round(sousTotal * pct) / 100;
    const opt = SHIPPING.options.find(o => o.id === shippingId);
    const apresRemise = sousTotal - remise;
    let livraison = opt.prix;
    if (shippingId === "standard" && apresRemise >= SHIPPING.seuilGratuit) livraison = 0;
    if (!state.panier.length) livraison = 0;
    return { sousTotal, remise, pct, livraison, total: apresRemise + livraison };
  }

  function renderCart() {
    const count = state.panier.reduce((s, l) => s + l.qte, 0);
    $("#cartCount").textContent = count;
    const t = totals();
    const reste = SHIPPING.seuilGratuit - (t.sousTotal - t.remise);
    $("#freeShip").innerHTML = (reste > 0
      ? `Plus que <b>${eur(reste)}</b> pour la livraison offerte !`
      : `🎉 Livraison standard offerte !`) +
      `<div class="progress"><i style="width:${Math.min(100, (t.sousTotal - t.remise) / SHIPPING.seuilGratuit * 100)}%"></i></div>`;

    $("#cartItems").innerHTML = state.panier.length ? state.panier.map((l, i) => {
      const p = byId(l.id);
      return `<div class="cart-item">
        <div class="thumb" style="background:${bg(p)}">${p.emoji}</div>
        <div>
          <h4>${esc(p.nom)}</h4>
          ${l.variante ? `<small>${esc(l.variante)}</small><br>` : ""}
          <div class="qty"><button data-dec="${i}" aria-label="Moins">−</button><span>${l.qte}</span><button data-inc="${i}" aria-label="Plus">+</button></div>
        </div>
        <div style="text-align:right"><b>${eur(p.prix * l.qte)}</b><br><button class="remove" data-rm="${i}">Retirer</button></div>
      </div>`;
    }).join("") : `<div class="cart-empty">🛒<br>Votre panier est vide.</div>`;

    $("#cartTotals").innerHTML = `
      <div><span>Sous-total</span><span>${eur(t.sousTotal)}</span></div>
      ${t.remise ? `<div style="color:var(--ok)"><span>Remise ${state.promo} (−${t.pct} %)</span><span>−${eur(t.remise)}</span></div>` : ""}
      <div><span>Livraison standard</span><span>${t.livraison ? eur(t.livraison) : "Offerte"}</span></div>
      <div class="grand"><span>Total TTC</span><span>${eur(t.total)}</span></div>`;
    $("#checkoutBtn").disabled = !state.panier.length;
    $("#checkoutBtn").style.opacity = state.panier.length ? 1 : .5;
    if (state.promo) $("#promoInput").value = state.promo;
  }

  function openCart() { $("#cart").classList.add("open"); $("#cart").setAttribute("aria-hidden", "false"); $("#overlay").hidden = false; }
  function closeCart() { $("#cart").classList.remove("open"); $("#cart").setAttribute("aria-hidden", "true"); $("#overlay").hidden = true; }

  /* ---------- Commande ---------- */
  function openCheckout(shippingId = "standard") {
    closeCart();
    const t = totals(shippingId);
    const lines = state.panier.map(l => {
      const p = byId(l.id);
      return `<div class="summary-line"><span>${l.qte} × ${esc(p.nom)}${l.variante ? ` (${esc(l.variante)})` : ""}</span><span>${eur(p.prix * l.qte)}</span></div>`;
    }).join("");
    openModal(`
      <form id="checkoutForm" class="checkout">
        <div>
          <h2>Finaliser ma commande</h2>
          <h3>Mode de livraison</h3>
          ${SHIPPING.options.map(o => {
            const free = o.id === "standard" && t.sousTotal - t.remise >= SHIPPING.seuilGratuit;
            return `<label class="ship-opt"><input type="radio" name="ship" value="${o.id}" ${o.id === shippingId ? "checked" : ""}>${o.label}<b>${free ? "Offerte" : eur(o.prix)}</b></label>`;
          }).join("")}
          <ul class="perks" style="margin-top:16px">
            <li>🔒 Vous allez être redirigé vers la page de paiement sécurisée Stripe.</li>
            <li>📦 Votre adresse de livraison et votre téléphone y seront demandés.</li>
            <li>💳 Carte bancaire, Visa, Mastercard, Apple Pay, Google Pay.</li>
          </ul>
        </div>
        <div class="summary">
          <h3 style="margin-top:0">Récapitulatif</h3>
          ${lines}
          <hr style="border:0;border-top:1px solid var(--line)">
          <div class="summary-line"><span>Sous-total</span><span>${eur(t.sousTotal)}</span></div>
          ${t.remise ? `<div class="summary-line" style="color:var(--ok)"><span>Remise ${esc(state.promo)}</span><span>−${eur(t.remise)}</span></div>` : ""}
          <div class="summary-line"><span>Livraison</span><span>${t.livraison ? eur(t.livraison) : "Offerte"}</span></div>
          <div class="summary-line" style="font-weight:800;font-size:18px"><span>Total TTC</span><span>${eur(t.total)}</span></div>
          <label class="checkbox"><input type="checkbox" required><span>J'accepte les <a href="#" data-legal="cgv">conditions générales de vente</a> et reconnais mon droit de rétractation de 14 jours.</span></label>
          <button id="payBtn" class="btn btn-primary btn-block">Payer ${eur(t.total)}</button>
          <p id="payError" class="promo-msg err"></p>
        </div>
      </form>`);
    $("#checkoutForm").addEventListener("change", e => {
      if (e.target.name === "ship") openCheckout(e.target.value);
    });
    $("#checkoutForm").addEventListener("submit", async e => {
      e.preventDefault();
      const btn = $("#payBtn");
      btn.disabled = true; btn.textContent = "Redirection vers le paiement…";
      let res = null;
      try {
        res = await fetch("api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: state.panier, promo: state.promo, shipping: shippingId })
        });
      } catch { /* pas de serveur (fichier ouvert en local) : mode démo */ }
      const data = res ? await res.json().catch(() => ({})) : { demo: true };
      if (res && res.ok && data.url) { location.href = data.url; return; }
      if (!res || data.demo || res.status === 404 || res.status === 405) return demoConfirmation(t.total);
      $("#payError").textContent = data.error || "Une erreur est survenue, veuillez réessayer.";
      btn.disabled = false; btn.textContent = `Payer ${eur(t.total)}`;
    });
  }

  // Utilisé tant que Stripe n'est pas configuré : aucune somme n'est prélevée.
  function demoConfirmation(total) {
    const ref = "DEMO-" + Date.now().toString(36).toUpperCase().slice(-6);
    state.panier = []; state.promo = null; save(); renderCart();
    openModal(`<div class="success">
      <div class="big">🧪</div>
      <h2>Commande de démonstration</h2>
      <p>Référence <b>${ref}</b> · ${eur(total)}<br>Le paiement Stripe n'est pas encore configuré : aucune somme n'a été prélevée.</p>
      <button class="btn btn-primary" data-close>Continuer</button>
    </div>`);
  }

  /* ---------- Pages légales ---------- */
  const LEGAL = {
    livraison: `<h2>Livraison</h2><p>Les commandes sont préparées sous 24 à 48 h ouvrées puis expédiées depuis nos entrepôts partenaires. Délai standard : 7 à 12 jours ouvrés ; express : 4 à 7 jours ouvrés. Un numéro de suivi vous est envoyé par email dès l'expédition.</p><p>Livraison standard offerte dès ${SHIPPING.seuilGratuit} € d'achat.</p>`,
    retours: `<h2>Retours & remboursements</h2><p>Conformément à l'article L221-18 du Code de la consommation, vous disposez de 14 jours à compter de la réception pour exercer votre droit de rétractation, sans avoir à vous justifier.</p><p>Contactez-nous avec votre numéro de commande pour obtenir l'adresse de retour. Le remboursement intervient sous 14 jours après réception du produit.</p>`,
    contact: `<h2>Contact</h2><p>Email : contact@votre-domaine.fr<br>Réponse sous 24 h ouvrées, du lundi au vendredi.</p>`,
    mentions: `<h2>Mentions légales</h2><p><b>À compléter avant mise en ligne :</b></p><ul><li>Raison sociale / nom, forme juridique, capital</li><li>Adresse du siège, SIRET, numéro de TVA intracommunautaire</li><li>Directeur de la publication</li><li>Hébergeur (nom, adresse, téléphone)</li></ul>`,
    cgv: `<h2>Conditions générales de vente</h2><p><b>Modèle à compléter et à faire valider.</b> Les CGV doivent notamment préciser : identité du vendeur, caractéristiques des produits, prix TTC et frais de livraison, modalités de paiement, délais de livraison, droit de rétractation de 14 jours et formulaire type, garanties légales de conformité (2 ans) et des vices cachés, médiation de la consommation.</p>`,
    confidentialite: `<h2>Politique de confidentialité</h2><p>Les données collectées (nom, adresse, email, téléphone) servent uniquement au traitement et à la livraison des commandes. Elles sont transmises au transporteur et au fournisseur expédiant votre colis. Conformément au RGPD, vous pouvez exercer vos droits d'accès, de rectification et de suppression en nous écrivant.</p>`
  };

  /* ---------- Utilitaires UI ---------- */
  function openModal(html) { $("#modalBody").innerHTML = html; $("#modal").hidden = false; document.body.style.overflow = "hidden"; }
  function closeModal() { $("#modal").hidden = true; document.body.style.overflow = ""; }
  let toastTimer;
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.hidden = true, 2200);
  }

  /* ---------- Événements ---------- */
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-cat],[data-view],[data-add],[data-add-detail],[data-inc],[data-dec],[data-rm],[data-close],[data-legal]");
    if (!t) return;
    const d = t.dataset;
    if (d.cat) { state.categorie = d.cat; renderCategories(); renderGrid(); }
    else if (d.view) openProduct(d.view);
    else if (d.add) addToCart(d.add);
    else if (d.addDetail) {
      const v = $('input[name="variante"]:checked');
      addToCart(d.addDetail, v ? v.value : null); closeModal(); openCart();
    }
    else if (d.inc) { state.panier[+d.inc].qte++; save(); renderCart(); }
    else if (d.dec) { const l = state.panier[+d.dec]; if (--l.qte <= 0) state.panier.splice(+d.dec, 1); save(); renderCart(); }
    else if (d.rm) { state.panier.splice(+d.rm, 1); save(); renderCart(); }
    else if ("close" in d) { closeModal(); closeCart(); }
    else if (d.legal) { e.preventDefault(); openModal(`<div class="legal">${LEGAL[d.legal]}</div>`); }
  });

  $("#modal").addEventListener("click", e => { if (e.target.id === "modal") closeModal(); });
  $("#overlay").addEventListener("click", closeCart);
  $("#cartBtn").addEventListener("click", openCart);
  $("#checkoutBtn").addEventListener("click", () => state.panier.length && openCheckout());
  document.addEventListener("keydown", e => { if (e.key === "Escape") { closeModal(); closeCart(); } });

  $("#search").addEventListener("input", e => {
    state.recherche = e.target.value; renderGrid();
    if (state.recherche) $("#catalogue").scrollIntoView({ behavior: "smooth" });
  });
  $("#sort").addEventListener("change", e => { state.tri = e.target.value; renderGrid(); });

  $("#promoForm").addEventListener("submit", e => {
    e.preventDefault();
    const code = $("#promoInput").value.trim().toUpperCase();
    const msg = $("#promoMsg");
    if (PROMO_CODES[code]) { state.promo = code; msg.textContent = `Code ${code} appliqué : −${PROMO_CODES[code]} %`; msg.className = "promo-msg ok"; }
    else { state.promo = null; msg.textContent = "Code promo invalide."; msg.className = "promo-msg err"; }
    save(); renderCart();
  });

  $("#newsletterForm").addEventListener("submit", e => {
    e.preventDefault(); e.target.reset();
    toast("Merci ! Votre code BIENVENUE10 vous attend 🎁");
  });

  $("#year").textContent = new Date().getFullYear();
  renderCategories(); renderGrid(); renderCart();
  if (new URLSearchParams(location.search).get("paiement") === "annule") {
    toast("Paiement annulé : votre panier a été conservé.");
    history.replaceState(null, "", location.pathname);
  }
})();
