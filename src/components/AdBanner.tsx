import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { C } from '../constants/theme';
import { ADS_CONFIG } from '../config/ads';

type Placement = 'afterResult' | 'inHistorique';

interface AdBannerProps {
  placement: Placement;
}

// ─── Helper : récupère l'Ad Unit ID selon la plateforme et le placement ──────

function getAdUnitId(placement: Placement): string {
  if (__DEV__) {
    // En développement, toujours utiliser les IDs de test
    return TestIds.ADAPTIVE_BANNER;
  }
  return ADS_CONFIG.admob.bannerAdUnitId[placement].android;
}

// ─── Export principal ─────────────────────────────────────────────────────────

export function AdBanner({ placement }: AdBannerProps) {
  // Pub réelle AdMob (mobile natif)
  if (Platform.OS !== 'web' && ADS_CONFIG.enabled) {
    return <MobileAdMob placement={placement} />;
  }

  // Pub réelle AdSense (web uniquement)
  if (Platform.OS === 'web' && ADS_CONFIG.enabled) {
    return <WebAdSense slotId={ADS_CONFIG.adsense.slots[placement]} />;
  }

  // Placeholder visible (dev)
  if (ADS_CONFIG.showPlaceholder) {
    return <AdPlaceholder />;
  }

  return null;
}

// ─── Google AdMob (mobile natif) ──────────────────────────────────────────────

function MobileAdMob({ placement }: { placement: Placement }) {
  const adUnitId = getAdUnitId(placement);

  return (
    <View style={styles.admobContainer}>
      <Text style={styles.adLabel}>Publicité</Text>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
}

// ─── Google AdSense (web) ─────────────────────────────────────────────────────

let adCounter = 0;

function WebAdSense({ slotId }: { slotId: string }) {
  const idRef = useRef(`redflag-ad-${++adCounter}`);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const container = document.getElementById(idRef.current);
    if (!container) return;

    // Créer l'élément AdSense
    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.setAttribute('data-ad-client', ADS_CONFIG.adsense.publisherId);
    ins.setAttribute('data-ad-slot', slotId);
    ins.setAttribute('data-ad-format', 'auto');
    ins.setAttribute('data-full-width-responsive', 'true');
    container.appendChild(ins);

    // Déclencher l'affichage de la pub
    try {
      // @ts-ignore — adsbygoogle est injecté par le script Google
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense non chargé (bloqueur de pubs, etc.)
    }
  }, [slotId]);

  return (
    <View style={styles.adsenseContainer}>
      <Text style={styles.adLabel}>Publicité</Text>
      {/* nativeID → id DOM en React Native Web */}
      <View nativeID={idRef.current} style={styles.adsenseSlot} />
    </View>
  );
}

// ─── Placeholder (dev / native) ───────────────────────────────────────────────

function AdPlaceholder() {
  return (
    <View style={styles.placeholder} accessibilityLabel="Espace publicitaire">
      {/* Label discret */}
      <Text style={styles.placeholderLabel}>Publicité</Text>

      {/* Contenu de la bannière */}
      <View style={styles.placeholderInner}>
        <View style={styles.placeholderIcon}>
          <Text style={styles.placeholderIconText}>📣</Text>
        </View>
        <View style={styles.placeholderText}>
          <Text style={styles.placeholderTitle}>Votre pub ici</Text>
          <Text style={styles.placeholderSub}>
            Espace réservé · Google AdSense
          </Text>
        </View>
        <TouchableOpacity
          style={styles.placeholderCta}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="En savoir plus"
        >
          <Text style={styles.placeholderCtaText}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // AdSense web
  adsenseContainer: {
    paddingVertical: 4,
  },
  adsenseSlot: {
    minHeight: 90,
  },
  // AdMob mobile
  admobContainer: {
    paddingVertical: 4,
    alignItems: 'center',
  },
  adLabel: {
    fontSize: 9,
    color: C.textTertiary,
    textAlign: 'center',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Placeholder
  placeholder: {
    backgroundColor: C.bg,
    borderRadius: C.r12,
    borderWidth: 1,
    borderColor: C.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  placeholderLabel: {
    fontSize: 9,
    color: C.textTertiary,
    textAlign: 'center',
    paddingTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  placeholderInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  placeholderIcon: {
    width: 40,
    height: 40,
    borderRadius: C.r8,
    backgroundColor: C.bgChip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIconText: { fontSize: 20 },
  placeholderText: { flex: 1, gap: 3 },
  placeholderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: C.textSecondary,
  },
  placeholderSub: {
    fontSize: 11,
    color: C.textTertiary,
    fontWeight: '400',
  },
  placeholderCta: {
    width: 32,
    height: 32,
    borderRadius: C.rFull,
    backgroundColor: C.bgChip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderCtaText: {
    fontSize: 14,
    color: C.textSecondary,
    fontWeight: '700',
  },
});
