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
  enabled: true,

  // ── Google AdSense (web) ────────────────────────────────────────────────────
  adsense: {
    publisherId: 'ca-pub-5590126308756985',
    slots: {
      // Bannière affichée après les résultats de calcul
      afterResult:  'XXXXXXXXXX', // ← Remplace par ton slot AdSense
      // Bannière affichée dans l'onglet Historique
      inHistorique: 'XXXXXXXXXX', // ← Remplace par ton slot AdSense
    },
  },

  // ── Google AdMob (mobile natif) ─────────────────────────────────────────────
  admob: {
    appId: 'ca-app-pub-5590126308756985~7687756310',
    bannerAdUnitId: {
      afterResult: {
        android: 'ca-app-pub-5590126308756985/8820874584',
      },
      inHistorique: {
        android: 'ca-app-pub-5590126308756985/4162939694',
      },
    },
  },

  // ── Options d'affichage ─────────────────────────────────────────────────────
  // Afficher un placeholder visuel quand les vraies pubs ne sont pas configurées
  showPlaceholder: false,
} as const;
