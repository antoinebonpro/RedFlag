import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Share } from 'react-native';
import { ResultatCalcul, Ville, TrancheRarete } from '../types';
import { VILLE_LABELS } from '../constants/labels';
import { C, S } from '../constants/theme';

interface ResultCardProps {
  resultat: ResultatCalcul;
  genre: string;
  ville?: Ville;
  mode?: 'recherche' | 'profil';
  shareText?: string;
}

export function formatNombre(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.', ',')} M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)} k`;
  return n.toLocaleString('fr-FR');
}

export function formatPourcentage(p: number): string {
  if (p >= 10) return `${p.toFixed(1).replace('.', ',')}%`;
  if (p >= 1) return `${p.toFixed(2).replace('.', ',')}%`;
  if (p >= 0.01) return `${p.toFixed(3).replace('.', ',')}%`;
  if (p >= 0.0001) return `${p.toFixed(4).replace('.', ',')}%`;
  return `< 0,0001%`;
}

type Verdict = { emoji: string; text: string; color: string; bgColor: string };

function getVerdict(p: number, isProfil: boolean): Verdict {
  if (isProfil) {
    if (p >= 30) return { emoji: '😊', text: 'Profil très courant',  color: C.green,  bgColor: C.greenLight };
    if (p >= 10) return { emoji: '✨', text: 'Profil assez courant', color: C.green,  bgColor: C.greenLight };
    if (p >= 3)  return { emoji: '🦋', text: 'Profil original',      color: C.yellow, bgColor: C.yellowLight };
    if (p >= 0.5)return { emoji: '💎', text: 'Profil rare',          color: C.indigo, bgColor: C.indigoLight };
    if (p >= 0.05)return{ emoji: '🌟', text: 'Profil très rare',     color: C.indigo, bgColor: C.indigoLight };
    return           { emoji: '🪐', text: 'Profil unique en France', color: C.indigo, bgColor: C.indigoLight };
  }
  if (p >= 30) return { emoji: '😎', text: 'Très courant',      color: C.green,   bgColor: C.greenLight };
  if (p >= 10) return { emoji: '👍', text: 'Assez courant',     color: C.green,   bgColor: C.greenLight };
  if (p >= 3)  return { emoji: '🤔', text: 'Pas si fréquent',   color: C.yellow,  bgColor: C.yellowLight };
  if (p >= 0.5)return { emoji: '😬', text: 'Plutôt rare',       color: C.orange,  bgColor: C.orangeLight };
  if (p >= 0.05)return { emoji: '🦄', text: 'Très exigeant',    color: C.red,     bgColor: C.redLight };
  return           { emoji: '💀', text: 'Quasi impossible',     color: C.redDark, bgColor: C.redLight };
}

function getBarColor(p: number): string {
  if (p > 30) return C.green;
  if (p > 10) return C.yellow;
  return C.red;
}

const TRANCHE_CONFIG: Record<TrancheRarete, { emoji: string; label: string; color: string; bgColor: string }> = {
  commun:          { emoji: '🟢', label: 'Commun',          color: C.green,   bgColor: C.greenLight },
  accessible:      { emoji: '👍', label: 'Accessible',      color: C.green,   bgColor: C.greenLight },
  selectif:        { emoji: '🔍', label: 'Sélectif',        color: C.yellow,  bgColor: C.yellowLight },
  rare:            { emoji: '💎', label: 'Rare',             color: C.orange,  bgColor: C.orangeLight },
  licorne:         { emoji: '🦄', label: 'Licorne',          color: C.indigo,  bgColor: C.indigoLight },
  legendaire:      { emoji: '🐉', label: 'Légendaire',       color: C.red,     bgColor: C.redLight },
  extraterrestre:  { emoji: '👽', label: 'Extraterrestre',   color: C.redDark, bgColor: C.redLight },
  hors_galaxie:    { emoji: '🪐', label: 'Hors galaxie',     color: C.redDark, bgColor: C.redLight },
};

async function doShare(text: string, setCopied: (v: boolean) => void) {
  if (Platform.OS !== 'web') {
    // Native: use React Native Share sheet
    try {
      await Share.share({ message: text });
    } catch {
      // User cancelled — no feedback needed
    }
    return;
  }
  // Web: try Web Share API, fall back to clipboard
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ text });
      return;
    } catch {
      // Cancelled or unsupported — fall through
    }
  }
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable (non-HTTPS, etc.)
    }
  }
}

export function ResultCard({
  resultat,
  genre,
  ville = 'france',
  mode = 'recherche',
  shareText,
}: ResultCardProps) {
  const [copied, setCopied] = useState(false);
  const { pourcentage, nombre, details } = resultat;
  const genreLabel = genre === 'homme' ? 'hommes' : 'femmes';
  const isProfil = mode === 'profil';
  const verdict = getVerdict(pourcentage, isProfil);
  const villeLabel =
    ville === 'france'
      ? 'en France'
      : `à ${VILLE_LABELS[ville].replace(/^[^\s]+\s/, '')}`;

  const subtitleText = isProfil
    ? `des ${genreLabel} ${villeLabel} te ressemblent`
    : `des ${genreLabel} ${villeLabel}`;

  const defaultShareText =
    `🚩 RedFlag\n` +
    `${isProfil ? 'Mon profil' : 'Mes critères'} : ${details.map((d) => d.label).join(', ')}\n` +
    `→ ${formatPourcentage(pourcentage)} des ${genreLabel} ${villeLabel} ${verdict.emoji}`;

  return (
    <View style={[styles.container, S.card]} accessibilityRole="summary">
      {/* Verdict */}
      <View style={styles.verdictSection}>
        <Text style={styles.verdictEmoji} accessibilityLabel={verdict.text}>
          {verdict.emoji}
        </Text>
        <Text
          style={[styles.percentage, { color: verdict.color }]}
          accessibilityLabel={`${formatPourcentage(pourcentage)} des ${genreLabel}`}
        >
          {formatPourcentage(pourcentage)}
        </Text>
        <Text style={styles.subtitle}>{subtitleText}</Text>
        <View style={[styles.verdictPill, { backgroundColor: verdict.bgColor }]}>
          <Text style={[styles.verdictLabel, { color: verdict.color }]}>
            {verdict.text}
          </Text>
        </View>
      </View>

      {/* Compteur */}
      <View
        style={styles.countBox}
        accessibilityLabel={`Environ ${formatNombre(nombre)} personnes`}
      >
        <Text style={styles.countNumber}>≈ {formatNombre(nombre)}</Text>
        <Text style={styles.countLabel}>personnes</Text>
      </View>

      {/* Tranche de rareté */}
      {resultat.tranche && (
        <View style={styles.trancheSection}>
          <Text style={styles.trancheSectionTitle}>NIVEAU DE RARETÉ</Text>
          <View style={[styles.trancheBadge, { backgroundColor: TRANCHE_CONFIG[resultat.tranche].bgColor }]}>
            <Text style={styles.trancheEmoji}>{TRANCHE_CONFIG[resultat.tranche].emoji}</Text>
            <Text style={[styles.trancheLabel, { color: TRANCHE_CONFIG[resultat.tranche].color }]}>
              {TRANCHE_CONFIG[resultat.tranche].label}
            </Text>
          </View>
        </View>
      )}

      {/* Répartition Homme / Femme */}
      <View style={styles.genderSection}>
        <Text style={styles.genderSectionTitle}>PROBABILITÉ PAR GENRE</Text>
        <View style={styles.genderRow}>
          <View style={styles.genderCard}>
            <Text style={styles.genderEmoji}>👨</Text>
            <Text style={styles.genderPct}>{formatPourcentage(resultat.pourcentageHomme)}</Text>
            <Text style={styles.genderCount}>≈ {formatNombre(resultat.nombreHomme)}</Text>
            <Text style={styles.genderLabel}>hommes</Text>
          </View>
          <View style={styles.genderDivider} />
          <View style={styles.genderCard}>
            <Text style={styles.genderEmoji}>👩</Text>
            <Text style={styles.genderPct}>{formatPourcentage(resultat.pourcentageFemme)}</Text>
            <Text style={styles.genderCount}>≈ {formatNombre(resultat.nombreFemme)}</Text>
            <Text style={styles.genderLabel}>femmes</Text>
          </View>
        </View>
      </View>

      {/* Détail par critère */}
      {details.length > 0 && (
        <View style={styles.details}>
          <Text style={styles.detailsTitle}>
            {isProfil ? 'Tes traits' : 'Détail par critère'}
          </Text>
          {details.map((d, i) => (
            <View key={i} style={styles.row}>
              <View style={styles.rowTop}>
                <View style={styles.rowLabelWrap}>
                  {isProfil && d.isRedFlag && (
                    <Text style={styles.redFlagIcon} accessibilityLabel="red flag">
                      🚩{' '}
                    </Text>
                  )}
                  <Text style={styles.rowLabel}>{d.label}</Text>
                </View>
                <Text style={styles.rowValue}>
                  {d.pourcentage.toFixed(1).replace('.', ',')}%
                </Text>
              </View>
              {/* Flex-based bar — works on both web and native */}
              <View style={styles.barBg}>
                <View
                  style={[
                    styles.barFill,
                    {
                      flex: Math.min(d.pourcentage, 100),
                      backgroundColor: getBarColor(d.pourcentage),
                    },
                  ]}
                />
                <View style={{ flex: Math.max(0, 100 - d.pourcentage) }} />
              </View>
              <Text style={styles.rowSource}>{d.source}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Share */}
      <TouchableOpacity
        style={styles.shareBtn}
        onPress={() => doShare(shareText ?? defaultShareText, setCopied)}
        activeOpacity={0.7}
        accessibilityLabel="Partager ce résultat"
        accessibilityRole="button"
      >
        <Text style={styles.shareBtnText}>
          {copied ? '✓ Copié !' : '🔗 Partager ce résultat'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: C.bg,
    borderRadius: C.r20,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  verdictSection: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  verdictEmoji: { fontSize: 48, marginBottom: 4 },
  percentage: { fontSize: 48, fontWeight: '900', letterSpacing: -2 },
  subtitle: {
    fontSize: 15,
    color: C.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  verdictPill: {
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: C.rFull,
  },
  verdictLabel: { fontSize: 14, fontWeight: '700' },
  countBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    backgroundColor: C.bgCard,
    marginHorizontal: 16,
    borderRadius: C.r12,
    paddingVertical: 14,
    gap: 6,
    marginBottom: 20,
  },
  countNumber: { fontSize: 24, fontWeight: '900', color: C.text },
  countLabel: { fontSize: 14, color: C.textSecondary, fontWeight: '500' },
  trancheSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  trancheSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  trancheBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: C.rFull,
    gap: 8,
  },
  trancheEmoji: { fontSize: 22 },
  trancheLabel: { fontSize: 18, fontWeight: '800' },
  genderSection: {
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  genderSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    textAlign: 'center',
  },
  genderRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 0,
  },
  genderCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  genderDivider: {
    width: 1,
    backgroundColor: C.border,
    alignSelf: 'stretch',
    marginVertical: 4,
  },
  genderEmoji: { fontSize: 28, marginBottom: 4 },
  genderPct: { fontSize: 20, fontWeight: '900', color: C.text },
  genderCount: { fontSize: 13, fontWeight: '600', color: C.textSecondary, marginTop: 2 },
  genderLabel: { fontSize: 12, color: C.textTertiary, fontWeight: '500', marginTop: 2 },
  details: {
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    gap: 16,
  },
  detailsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: C.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  row: { gap: 4 },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabelWrap: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  redFlagIcon: { fontSize: 12 },
  rowLabel: { fontSize: 14, fontWeight: '600', color: C.text, flex: 1 },
  rowValue: { fontSize: 14, fontWeight: '800', color: C.text },
  barBg: {
    height: 6,
    flexDirection: 'row',
    backgroundColor: C.bgChip,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 3 },
  rowSource: { fontSize: 11, color: C.textTertiary, fontWeight: '500' },
  shareBtn: {
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingVertical: 16,
    alignItems: 'center',
  },
  shareBtnText: { fontSize: 14, color: C.indigo, fontWeight: '700' },
});
