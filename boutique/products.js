// Catalogue produits.
// prix        : prix de vente TTC affiché au client (€)
// prixBarre   : ancien prix (optionnel, pour afficher une promo)
// coutFournisseur / fournisseur / delai : infos internes dropshipping (non affichées au client)
const PRODUCTS = [
  {
    id: "lampe-coucher-soleil",
    nom: "Lampe coucher de soleil",
    categorie: "Maison",
    prix: 29.9, prixBarre: 44.9,
    emoji: "🌅", couleur: ["#ff9a5a", "#ff5e7e"],
    description: "Projette un halo chaleureux façon golden hour sur vos murs. 16 couleurs, tête orientable à 180°, alimentation USB.",
    variantes: ["Coucher de soleil", "Arc-en-ciel", "Lune"],
    note: 4.7, avis: 312,
    coutFournisseur: 6.8, fournisseur: "Fournisseur A", delai: "6-10 jours"
  },
  {
    id: "mini-projecteur",
    nom: "Mini projecteur HD portable",
    categorie: "High-tech",
    prix: 89.9, prixBarre: 129.9,
    emoji: "📽️", couleur: ["#5b7cfa", "#8f5bfa"],
    description: "Projecteur compact 1080p compatible smartphone, Wi-Fi et HDMI. Image jusqu'à 120 pouces, haut-parleur intégré.",
    variantes: ["Blanc", "Noir"],
    note: 4.5, avis: 187,
    coutFournisseur: 31.5, fournisseur: "Fournisseur B", delai: "7-12 jours"
  },
  {
    id: "brosse-anti-poils",
    nom: "Brosse anti-poils réutilisable",
    categorie: "Animaux",
    prix: 14.9,
    emoji: "🐾", couleur: ["#37c4a0", "#2a9d8f"],
    description: "Retire les poils d'animaux des canapés, vêtements et tapis en quelques passages. Sans recharge, auto-nettoyante.",
    variantes: [],
    note: 4.8, avis: 1024,
    coutFournisseur: 2.1, fournisseur: "Fournisseur A", delai: "5-9 jours"
  },
  {
    id: "gourde-isotherme",
    nom: "Gourde isotherme 750 ml",
    categorie: "Sport",
    prix: 24.9,
    emoji: "🥤", couleur: ["#4fb3ff", "#2f6bff"],
    description: "Acier inoxydable double paroi : 24 h au froid, 12 h au chaud. Sans BPA, bouchon anti-fuite.",
    variantes: ["Bleu glacier", "Vert sauge", "Noir mat"],
    note: 4.6, avis: 421,
    coutFournisseur: 4.9, fournisseur: "Fournisseur C", delai: "6-10 jours"
  },
  {
    id: "masseur-cervical",
    nom: "Masseur cervical chauffant",
    categorie: "Bien-être",
    prix: 49.9, prixBarre: 69.9,
    emoji: "💆", couleur: ["#f6a6c1", "#c56cf0"],
    description: "Massage par impulsions avec chaleur douce à 42 °C. 6 modes, 15 intensités, batterie rechargeable.",
    variantes: [],
    note: 4.4, avis: 256,
    coutFournisseur: 12.4, fournisseur: "Fournisseur B", delai: "7-12 jours"
  },
  {
    id: "organiseur-cables",
    nom: "Kit organiseur de câbles",
    categorie: "Maison",
    prix: 12.9,
    emoji: "🔌", couleur: ["#a3b1c6", "#5f6f86"],
    description: "Lot de 30 pièces : clips adhésifs, gaines et attaches velcro pour un bureau enfin rangé.",
    variantes: ["Blanc", "Noir"],
    note: 4.6, avis: 538,
    coutFournisseur: 1.9, fournisseur: "Fournisseur C", delai: "5-9 jours"
  },
  {
    id: "ecouteurs-sans-fil",
    nom: "Écouteurs sans fil à réduction de bruit",
    categorie: "High-tech",
    prix: 39.9, prixBarre: 59.9,
    emoji: "🎧", couleur: ["#2d3142", "#4f5d75"],
    description: "Bluetooth 5.3, réduction active du bruit, 30 h d'autonomie avec le boîtier. Résistants à la sueur (IPX5).",
    variantes: ["Noir", "Blanc"],
    note: 4.3, avis: 645,
    coutFournisseur: 9.7, fournisseur: "Fournisseur B", delai: "6-11 jours"
  },
  {
    id: "tapis-yoga",
    nom: "Tapis de yoga antidérapant",
    categorie: "Sport",
    prix: 34.9,
    emoji: "🧘", couleur: ["#9be15d", "#00b894"],
    description: "Épaisseur 6 mm, matière TPE écologique, lignes d'alignement gravées. Sangle de transport incluse.",
    variantes: ["Vert", "Lavande", "Gris"],
    note: 4.7, avis: 298,
    coutFournisseur: 8.2, fournisseur: "Fournisseur C", delai: "6-10 jours"
  },
  {
    id: "diffuseur-huiles",
    nom: "Diffuseur d'huiles essentielles",
    categorie: "Bien-être",
    prix: 27.9,
    emoji: "🌿", couleur: ["#c7e9b0", "#6bb38a"],
    description: "Diffuseur ultrasonique 300 ml effet bois, lumière d'ambiance 7 couleurs, arrêt automatique.",
    variantes: [],
    note: 4.6, avis: 377,
    coutFournisseur: 6.1, fournisseur: "Fournisseur A", delai: "6-10 jours"
  },
  {
    id: "gamelle-lente",
    nom: "Gamelle anti-glouton",
    categorie: "Animaux",
    prix: 16.9,
    emoji: "🦴", couleur: ["#ffd166", "#f4a261"],
    description: "Labyrinthe qui ralentit la prise alimentaire et réduit les ballonnements. Base antidérapante, passe au lave-vaisselle.",
    variantes: ["S", "M", "L"],
    note: 4.5, avis: 189,
    coutFournisseur: 2.6, fournisseur: "Fournisseur A", delai: "5-9 jours"
  },
  {
    id: "support-telephone",
    nom: "Support magnétique voiture",
    categorie: "High-tech",
    prix: 19.9,
    emoji: "🚗", couleur: ["#74b9ff", "#0984e3"],
    description: "Fixation magnétique ultra-forte sur grille d'aération, rotation 360°, compatible tous smartphones.",
    variantes: [],
    note: 4.4, avis: 712,
    coutFournisseur: 2.9, fournisseur: "Fournisseur C", delai: "5-9 jours"
  },
  {
    id: "plaid-sherpa",
    nom: "Plaid sherpa ultra-doux",
    categorie: "Maison",
    prix: 39.9, prixBarre: 54.9,
    emoji: "🛋️", couleur: ["#e8d5c4", "#b08968"],
    description: "Double face flanelle et sherpa, 150 × 200 cm. Lavable en machine, ne bouloche pas.",
    variantes: ["Crème", "Taupe", "Gris anthracite"],
    note: 4.8, avis: 466,
    coutFournisseur: 10.3, fournisseur: "Fournisseur B", delai: "7-12 jours"
  }
];

// Codes promo : code -> pourcentage de remise
const PROMO_CODES = { BIENVENUE10: 10, NOMADE15: 15 };

// Livraison
const SHIPPING = {
  seuilGratuit: 49,
  options: [
    { id: "standard", label: "Standard suivie (7-12 jours ouvrés)", prix: 4.9 },
    { id: "express", label: "Express prioritaire (4-7 jours ouvrés)", prix: 9.9 }
  ]
};
