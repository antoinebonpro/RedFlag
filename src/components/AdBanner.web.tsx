import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { C } from '../constants/theme';
import { ADS_CONFIG } from '../config/ads';

type Placement = 'afterResult' | 'inHistorique';

interface AdBannerProps {
  placement: Placement;
}

// ─── Web entry point for AdBanner ─────────────────────────────────────────────
// Metro auto-resolves this file on web (`.web.tsx`) so the native AdMob module
// (which imports react-native internals) is never bundled for the browser.

export function AdBanner({ placement }: AdBannerProps) {
  if (ADS_CONFIG.enabled) {
    return <WebAdSense slotId={ADS_CONFIG.adsense.slots[placement]} />;
  }
  if (ADS_CONFIG.showPlaceholder) {
    return <AdPlaceholder />;
  }
  return null;
}

// ─── Google AdSense (web) ─────────────────────────────────────────────────────

let adCounter = 0;

function WebAdSense({ slotId }: { slotId: string }) {
  const idRef = useRef(`redflag-ad-${++adCounter}`);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const container = document.getElementById(idRef.current);
    if (!container) return;

    // replaceChildren() — safer than innerHTML='' (no parser pass).
    container.replaceChildren();

    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.setAttribute('data-ad-client', ADS_CONFIG.adsense.publisherId);
    ins.setAttribute('data-ad-slot', slotId);
    ins.setAttribute('data-ad-format', 'auto');
    ins.setAttribute('data-full-width-responsive', 'true');
    container.appendChild(ins);

    try {
      // @ts-ignore — adsbygoogle est injecté par le script Google
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense bloqué (adblock, etc.)
    }

    return () => {
      if (container) container.replaceChildren();
    };
  }, [slotId]);

  return (
    <View style={styles.adsenseContainer} accessibilityLabel="Espace publicitaire">
      <Text style={styles.adLabel} allowFontScaling>
        Publicité
      </Text>
      <View nativeID={idRef.current} style={styles.adsenseSlot} />
    </View>
  );
}

// ─── Placeholder ──────────────────────────────────────────────────────────────

function AdPlaceholder() {
  return (
    <View style={styles.placeholder} accessible accessibilityLabel="Espace publicitaire">
      <Text style={styles.placeholderLabel} allowFontScaling>
        Publicité
      </Text>
      <View style={styles.placeholderInner}>
        <View style={styles.placeholderIcon}>
          <Text style={styles.placeholderIconText} allowFontScaling={false}>
            📣
          </Text>
        </View>
        <View style={styles.placeholderText}>
          <Text style={styles.placeholderTitle} allowFontScaling>
            Votre pub ici
          </Text>
          <Text style={styles.placeholderSub} allowFontScaling>
            Espace réservé · Google AdSense
          </Text>
        </View>
        <TouchableOpacity
          style={styles.placeholderCta}
          activeOpacity={0.7}
          accessible
          accessibilityRole="button"
          accessibilityLabel="En savoir plus"
        >
          <Text style={styles.placeholderCtaText} allowFontScaling={false}>
            →
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  adsenseContainer: {
    paddingVertical: 4,
  },
  adsenseSlot: {
    minHeight: 90,
  },
  adLabel: {
    fontSize: 11,
    color: C.textTertiary,
    textAlign: 'center',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  placeholder: {
    backgroundColor: C.bg,
    borderRadius: C.r12,
    borderWidth: 1,
    borderColor: C.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  placeholderLabel: {
    fontSize: 11,
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
    fontSize: 12,
    color: C.textTertiary,
    fontWeight: '400',
  },
  placeholderCta: {
    width: 44,
    height: 44,
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
