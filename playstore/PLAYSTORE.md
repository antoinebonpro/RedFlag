# RedFlag — Kit Play Console

Package: `com.antoine.bon.redflag` · Version: 1.0.0 (versionCode 1)

---

## 1. Main store listing

**App name** (max 30)
```
RedFlag — Tes critères 🚩
```

**Short description** (max 80)
```
Combien de personnes correspondent à tes critères ? Calcul stats sur la France.
```

**Full description** (max 4000)
```
RedFlag te dit, en quelques tapes, combien de personnes en France correspondent réellement à tes critères. Tu coches : âge, taille, salaire, ville, fumeur, sport, enfants, animaux, situation, niveau d'études, couleur des cheveux/yeux, tatouage, véhicule… RedFlag croise tout ça avec les données INSEE et te sort un pourcentage et un nombre de personnes.

🚩 TROIS MODES
• Recherche : tu décris la personne idéale → tu vois si tu es réaliste ou si tu cherches une licorne.
• Mon profil : tu décris qui tu es → tu vois ce qui te rend rare (ou commun).
• Couple : chacun décrit son profil → tu compares.

📊 BASÉ SUR DES SOURCES PUBLIQUES
• Données INSEE : population, démographie, salaires médians, niveau de diplôme.
• Études publiques sur la taille, le tabagisme, la pratique sportive, les animaux de compagnie, les tatouages, les véhicules.
• Toutes les sources sont visibles dans l'app (bouton 📊).

✨ INTERFACE SIMPLE
• Pas de questionnaire à rallonge.
• Pas de compte, pas d'inscription.
• Le calcul est instantané.

🔒 100 % LOCAL, 0 SERVEUR
RedFlag ne crée pas de compte. Aucune donnée personnelle n'est envoyée à un serveur. Tout est calculé sur ton téléphone et ton historique reste local. Tu peux tout effacer en un tap dans Confidentialité.

🎯 PARFAIT POUR
• Réaliser que tes critères trient peut-être 0,01 % de la population.
• Découvrir si tu es plus rare que tu ne le pensais.
• Comparer ton profil à celui de ton/ta partenaire pour le fun.
• Démarrer une discussion légère entre amis.

⚠️ À LIRE
RedFlag est une app de divertissement statistique. Les calculs s'appuient sur des moyennes nationales et des données publiques agrégées : ce sont des ordres de grandeur, pas des certitudes. L'app n'est pas un service de rencontre, ni un test psychologique, ni un outil médical.

📍 DONNÉES
France métropolitaine + déclinaisons par grandes villes (Paris, Lyon, Marseille, Toulouse, Bordeaux, Lille, Nantes, Strasbourg, Montpellier, Nice…).

Télécharge RedFlag, coche tes critères, et regarde la réalité statistique.
```

**App icon** : `assets/icon.png` (512×512)

**Feature graphic** (1024×500) : **À CRÉER** — fond blanc, drapeau rouge 🚩 + tagline « Combien tu en trouves en France ? »

**Phone screenshots** : **À CAPTURER** — 5 écrans recommandés :
1. Écran d'accueil mode Recherche (critères vides)
2. Critères remplis avec sliders (taille, salaire, âge)
3. Résultat : pourcentage + verdict + tranche de rareté
4. Mode Couple comparé
5. Historique des recherches

**Category** : Lifestyle

**Tags** : Statistiques, Démographie, Lifestyle, Divertissement, Insee

**Contact** : antoinebon88@gmail.com

**Privacy Policy URL** : voir `privacy-policy.html` — **À HÉBERGER** (GitHub Pages, redflag.app, ou autre HTTPS)

---

## 2. App content

### App access
☑ All functionality available without special access

### Ads
☑ **Oui** (AdMob bannière, 2 placements : après résultat + dans historique)

### Content rating (IARC)
- Thématiques matures : Non
- Violence : Non
- Sexuel : Non
- Langage : Non
- Drogues : Non
- Données utilisateur : Identifiant publicitaire uniquement (AdMob)
→ Classification attendue : **PEGI 3 / Everyone** (app de calcul statistique)

### Target audience
- **13+** (l'app n'attire pas spécifiquement les enfants, mais le contenu est entièrement informatif)
- Pas de mécanisme social, pas de chat, pas d'UGC

### News app
☑ Non

### Health / Government / Financial
☑ Non

---

## 3. Data safety

**Données collectées :**

| Type | Collectée | Partagée | Optionnelle | Usage |
|---|---|---|---|---|
| Identifiant publicitaire (AD_ID) | ✅ | ✅ Google AdMob | Oui (révocable via paramètres système) | Publicité |
| Données SKAdNetwork (iOS) | ✅ | ✅ Réseaux pub | Oui (ATT) | Attribution publicitaire anonyme |

**Aucune autre donnée n'est collectée ni partagée.** Pas de PII (nom, email, téléphone, géolocalisation précise).

**Données stockées localement (sur l'appareil uniquement) :**
- Historique des 20 dernières recherches (critères saisis + résultats)
- Aucune synchronisation cloud

**Chiffrement en transit** : ☑ Oui (toutes les requêtes AdMob/AdSense sont en HTTPS/TLS)
**Suppression sur demande** : ☑ Oui (bouton « Supprimer mes données » dans Confidentialité)

---

## 4. Pricing & distribution

- **Prix** : Gratuit
- **Countries** : Tous (contenu en français → cibler prioritairement FR + Belgique + Suisse + Canada FR + Maghreb FR)
- **Contient des pubs** : Oui

---

## 5. Checklist publication

### 🔴 BLOCKERS — à faire AVANT soumission
- [ ] **Créer une app iOS séparée dans AdMob** → récupérer iOS App ID
- [ ] **Créer 2 Ad Units bannière iOS dédiés** dans AdMob → coller dans `src/config/ads.ts`
- [ ] **Créer 2 emplacements AdSense web** → coller les Slot IDs dans `src/config/ads.ts` (remplacer `XXXXXXXXXX`)
- [ ] **Héberger `privacy-policy.html`** sur HTTPS (GitHub Pages, Vercel, redflag.app…) et mettre l'URL dans `src/components/PrivacyPanel.tsx` (`PRIVACY_POLICY_URL`)
- [ ] **Vérifier que `play-store-key.json` n'est pas commité** (`git log -- play-store-key.json` → vide ✓)

### 🟡 Avant publication
- [ ] Icon 512×512
- [ ] Feature graphic 1024×500
- [ ] 2+ screenshots phone (idéalement 5)
- [ ] Descriptions (faites ci-dessus)
- [ ] Privacy policy hébergée + URL renseignée dans Play Console
- [ ] Content rating rempli (PEGI 3/Everyone)
- [ ] Target audience défini (13+)
- [ ] Data safety rempli (cf. tableau § 3)
- [ ] Declaration ads = Oui (AdMob bannière)
- [ ] .aab uploadé via `eas submit --platform android --profile production`
- [ ] `play-store-key.json` en place (jamais commité)
- [ ] Compléter `adaptiveIcon` avec `backgroundImage` + `monochromeImage` (actuellement juste `foregroundImage`)

### 🟢 Recommandé pour stabilité
- [ ] Brancher Sentry/Crashlytics dans `ErrorBoundary`
- [ ] Activer EAS Updates (hotfix sans repasser en review)
- [ ] Ajouter tests unitaires sur `src/services/calculator.ts`
- [ ] Implémenter une vraie CMP UMP (Google fournie gratuitement) au lieu de `requestNonPersonalizedAdsOnly: true` en dur
