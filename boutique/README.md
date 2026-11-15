# Maison Nomade — boutique de dropshipping

Site e-commerce statique (HTML/CSS/JavaScript, aucune dépendance). Ouvrez `index.html` dans un navigateur.

## Fonctionnalités
- Catalogue avec filtres par catégorie, recherche et tri
- Fiche produit avec variantes (couleur, taille…)
- Panier persistant (localStorage), barre de progression vers la livraison offerte
- Codes promo (`BIENVENUE10`, `NOMADE15`)
- Tunnel de commande : adresse, choix de livraison, récapitulatif, acceptation des CGV
- Pages livraison, retours, mentions légales, CGV, confidentialité (modèles à compléter)
- Responsive mobile

## Personnaliser
- **Produits** : `products.js`. Chaque produit contient le prix de vente et des champs internes
  (`coutFournisseur`, `fournisseur`, `delai`) pour suivre votre marge — non affichés au client.
- **Livraison et codes promo** : en bas de `products.js`.
- **Couleurs / design** : variables en haut de `styles.css`.
- **Images** : les produits utilisent des emojis en attendant vos photos. Remplacez `${p.emoji}` dans `app.js`
  par `<img src="${p.image}">` et ajoutez un champ `image` à chaque produit.

## Avant la mise en ligne
1. **Paiement** : le tunnel est en mode démo. Branchez Stripe Checkout ou PayPal (nécessite un petit backend
   ou une fonction serverless pour créer la session de paiement).
2. **Transmission des commandes au fournisseur** : via l'API de votre fournisseur (CJ Dropshipping, BigBuy,
   Spocket…) ou manuellement au début.
3. **Juridique (France)** : immatriculation, mentions légales, CGV, médiateur de la consommation,
   droit de rétractation 14 jours, garantie légale de conformité 2 ans, bandeau cookies si vous ajoutez
   des traceurs (Google Analytics, pixel Meta…).
4. **Hébergement** : GitHub Pages, Netlify ou Vercel (gratuits pour un site statique) + nom de domaine.

> Alternative clé en main : Shopify ou WooCommerce intègrent paiement, gestion des commandes
> et applications de dropshipping, si vous ne souhaitez pas gérer la partie technique.
