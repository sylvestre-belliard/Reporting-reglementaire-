# Maison Nomade — boutique de dropshipping

Site e-commerce (HTML/CSS/JavaScript) avec paiement **Stripe Checkout**.

## Fonctionnalités
- Catalogue avec filtres par catégorie, recherche et tri
- Fiche produit avec variantes (couleur, taille…)
- Panier persistant, barre de progression vers la livraison offerte
- Codes promo (`BIENVENUE10`, `NOMADE15`)
- Paiement par carte, Apple Pay et Google Pay sur la page sécurisée de Stripe,
  avec collecte de l'adresse de livraison et du téléphone
- Prix, remises et frais de port **recalculés côté serveur** : un client ne peut pas modifier les montants
- Page de confirmation (`success.html`) et retour au panier si le paiement est annulé
- Pages livraison, retours, mentions légales, CGV, confidentialité (modèles à compléter)
- Responsive mobile

Sans clé Stripe (ou en ouvrant simplement `index.html`), le site fonctionne en **mode démo** :
les commandes sont simulées et rien n'est prélevé.

## Mettre en ligne avec le paiement (Netlify, gratuit)
1. Créez un compte sur [stripe.com](https://stripe.com) et récupérez votre **clé secrète de test**
   (Développeurs → Clés API, elle commence par `sk_test_`).
2. Sur [netlify.com](https://netlify.com) : *Add new site → Import from Git*, choisissez ce dépôt et indiquez
   `boutique` comme **Base directory**. Le fichier `netlify.toml` configure le reste.
3. Dans Netlify → *Site configuration → Environment variables*, ajoutez :
   - `STRIPE_SECRET_KEY` = votre clé `sk_test_...`
   - `SITE_URL` = l'adresse du site (ex. `https://ma-boutique.netlify.app`)
4. Redéployez, puis passez une commande test avec la carte `4242 4242 4242 4242`
   (date future quelconque, CVC quelconque).
5. Quand tout est prêt : activez votre compte Stripe (identité, IBAN) et remplacez la clé par `sk_live_...`.

**Ne mettez jamais la clé secrète dans le code ni dans Git** : uniquement dans les variables d'environnement.

## Tester en local
```bash
cd boutique
STRIPE_SECRET_KEY=sk_test_... node server.js
# puis ouvrez http://localhost:3000
```
`server.js` peut aussi servir à héberger la boutique sur un VPS (Node 18 ou plus).

## Traiter une commande (dropshipping)
Chaque paiement apparaît dans **Stripe → Paiements** avec l'adresse du client. Le champ de métadonnées
`commande` résume les articles, les variantes et le fournisseur à contacter,
par exemple `2x plaid-sherpa (Taupe) [Fournisseur B]`.
Passez ensuite la commande chez le fournisseur avec l'adresse du client, puis envoyez-lui le numéro de suivi.
Stripe peut vous notifier par email à chaque paiement (Paramètres → Notifications).

Prochaine étape possible : un webhook Stripe qui transmet automatiquement la commande à l'API du
fournisseur (CJ Dropshipping, BigBuy…).

## Personnaliser
- **Produits** : `products.js`. Chaque produit contient le prix de vente et des champs internes
  (`coutFournisseur`, `fournisseur`, `delai`) pour suivre votre marge. Ils ne sont pas affichés au client.
- **Livraison et codes promo** : en bas de `products.js` (le serveur relit ce même fichier).
- **Pays livrés** : variable `PAYS_LIVRES` (par défaut FR, BE, LU, CH, MC).
- **Couleurs / design** : variables en haut de `styles.css`.
- **Images** : remplacez `${p.emoji}` dans `app.js` par `<img src="${p.image}">`, ajoutez un champ `image`
  à chaque produit et placez les fichiers dans un dossier `images/`.

## Avant l'ouverture au public (France)
Immatriculation (micro-entreprise ou société), mentions légales, CGV, médiateur de la consommation,
droit de rétractation de 14 jours, garantie légale de conformité de 2 ans, et bandeau cookies si vous
ajoutez des outils de mesure (Google Analytics, pixel Meta…).
