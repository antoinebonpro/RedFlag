// ─── Configuration Publicités ────────────────────────────────────────────────
//
// 🚨 BLOCKERS PRODUCTION — À RÉSOUDRE AVANT TOUTE PUBLICATION 🚨
//
//   1. Slots AdSense web (`afterResult`, `inHistorique`) actuellement en
//      placeholder 'XXXXXXXXXX' → aucune pub ne s'affichera sur le web.
//      → https://adsense.google.com → créer 2 emplacements → coller les Slot IDs.
//
//   2. iOS App ID identique à Android (cas actuel) =
//      ⚠️ violation des règles AdMob → suspension de compte garantie.
//      → https://admob.google.com → créer une app iOS séparée → coller son App ID.
//
//   3. Ad Unit IDs iOS identiques à Android (cas actuel) =
//      ⚠️ bannissement définitif AdMob.
//      → Pour CHAQUE placement (`afterResult`, `inHistorique`), créer un
//        Ad Unit Android ET un Ad Unit iOS distincts.
//
// 4. Google AdMob (MOBILE — iOS / Android) — règles générales :
//    → Crée un compte sur https://admob.google.com
//    → DEUX apps distinctes (iOS + Android), App ID différents.
//    → Ad Units séparés par plateforme. Jamais d'Ad Unit Android sur iOS et
//      vice-versa.
//    → Configurer les restrictions du compte AdMob (bundle ID + domaine
//      autorisés) pour éviter la fraude par usurpation d'app ID.
// ─────────────────────────────────────────────────────────────────────────────

export const ADS_CONFIG = {
  // ── Activer / désactiver toutes les publicités ──────────────────────────────
  enabled: true,

  // ── Google AdSense (web) ────────────────────────────────────────────────────
  adsense: {
    publisherId: 'ca-pub-5590126308756985',
    slots: {
      // ⚠️ BLOCKER: remplacer par les vrais Slot IDs depuis adsense.google.com
      afterResult: 'XXXXXXXXXX',
      // ⚠️ BLOCKER: remplacer par les vrais Slot IDs depuis adsense.google.com
      inHistorique: 'XXXXXXXXXX',
    },
  },

  // ── Google AdMob (mobile natif) ─────────────────────────────────────────────
  admob: {
    androidAppId: 'ca-app-pub-5590126308756985~7687756310',
    // ⚠️ BLOCKER: doit être DIFFÉRENT de androidAppId. Créer une app iOS dans AdMob.
    iosAppId: 'ca-app-pub-5590126308756985~7687756310',
    bannerAdUnitId: {
      afterResult: {
        android: 'ca-app-pub-5590126308756985/8820874584',
        // ⚠️ BLOCKER: doit être DIFFÉRENT de l'Android Ad Unit. Créer un Ad Unit iOS dédié.
        ios: 'ca-app-pub-5590126308756985/8820874584',
      },
      inHistorique: {
        android: 'ca-app-pub-5590126308756985/4162939694',
        // ⚠️ BLOCKER: doit être DIFFÉRENT de l'Android Ad Unit. Créer un Ad Unit iOS dédié.
        ios: 'ca-app-pub-5590126308756985/4162939694',
      },
    },
  },

  // ── Options d'affichage ─────────────────────────────────────────────────────
  showPlaceholder: false,
} as const;

// ── Auto-check : warn loud en dev si la config est en placeholder ────────────
if (__DEV__) {
  const slots = ADS_CONFIG.adsense.slots;
  if (slots.afterResult === 'XXXXXXXXXX' || slots.inHistorique === 'XXXXXXXXXX') {
    // eslint-disable-next-line no-console
    console.warn(
      '[ADS] AdSense slots still in placeholder. Web ads will not display in production.',
    );
  }
  if (ADS_CONFIG.admob.iosAppId === ADS_CONFIG.admob.androidAppId) {
    // eslint-disable-next-line no-console
    console.warn(
      '[ADS] iOS App ID equals Android App ID. AdMob will suspend the account if shipped.',
    );
  }
  const ar = ADS_CONFIG.admob.bannerAdUnitId.afterResult;
  const ih = ADS_CONFIG.admob.bannerAdUnitId.inHistorique;
  if (ar.ios === ar.android || ih.ios === ih.android) {
    // eslint-disable-next-line no-console
    console.warn(
      '[ADS] iOS Ad Unit IDs equal Android Ad Unit IDs. AdMob will ban the account if shipped.',
    );
  }
}
