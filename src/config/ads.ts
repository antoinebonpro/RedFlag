// ─── Configuration Publicités ────────────────────────────────────────────────
//
// 1. Google AdSense (WEB)
//    → Crée un compte sur https://adsense.google.com
//    → Remplace publisherId par ton ID (ex: ca-pub-1234567890123456)
//    → Crée des emplacements publicitaires et copie leurs slots
//    → Mets enabled: true
//
// 2. Google AdMob (MOBILE — iOS / Android)
//    → Crée un compte sur https://admob.google.com
//    → Ajoute expo-ads-admob ou react-native-google-mobile-ads
//    → Renseigne les IDs ci-dessous
// ─────────────────────────────────────────────────────────────────────────────

export const ADS_CONFIG = {
  // ── Activer / désactiver toutes les publicités ──────────────────────────────
  enabled: false, // ← mettre true quand les IDs sont configurés

  // ── Google AdSense (web) ────────────────────────────────────────────────────
  adsense: {
    publisherId: 'ca-pub-XXXXXXXXXXXXXXXX', // ← Ton Publisher ID AdSense
    slots: {
      // Bannière affichée après les résultats de calcul
      afterResult:  'XXXXXXXXXX',
      // Bannière affichée dans l'onglet Historique
      inHistorique: 'XXXXXXXXXX',
    },
  },

  // ── Google AdMob (mobile natif) ─────────────────────────────────────────────
  // Nécessite un build natif (expo run:ios / expo run:android)
  admob: {
    publisherId: 'ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX', // ← Ton App ID AdMob
    bannerAdUnitId: {
      ios:     'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
      android: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
    },
  },

  // ── Options d'affichage ─────────────────────────────────────────────────────
  // Afficher un placeholder visuel quand les vraies pubs ne sont pas configurées
  showPlaceholder: true,
} as const;
