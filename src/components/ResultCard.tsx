import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Share,
} from 'react-native';
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
    if (p >= 30) return { emoji: '😊', text: 'Profil très courant', color: C.green, bgColor: C.greenLight };
    if (p >= 10) return { emoji: '✨', text: 'Profil assez courant', color: C.green, bgColor: C.greenLight };
    if (p >= 3) return { emoji: '🦋', text: 'Profil original', color: C.yellow, bgColor: C.yellowLight };
    if (p >= 0.5) return { emoji: '💎', text: 'Profil rare', color: C.indigo, bgColor: C.indigoLight };
    if (p >= 0.05) return { emoji: '🌟', text: 'Profil très rare', color: C.indigo, bgColor: C.indigoLight };
    return { emoji: '🪐', text: 'Profil unique en France', color: C.indigo, bgColor: C.indigoLight };
  }
  if (p >= 30) return { emoji: '😎', text: 'Très courant', color: C.green, bgColor: C.greenLight };
  if (p >= 10) return { emoji: '👍', text: 'Assez courant', color: C.green, bgColor: C.greenLight };
  if (p >= 3) return { emoji: '🤔', text: 'Pas si fréquent', color: C.yellow, bgColor: C.yellowLight };
  if (p >= 0.5) return { emoji: '😬', text: 'Plutôt rare', color: C.orange, bgColor: C.orangeLight };
  if (p >= 0.05) return { emoji: '🦄', text: 'Très exigeant', color: C.red, bgColor: C.redLight };
  return { emoji: '💀', text: 'Quasi impossible', color: C.redDark, bgColor: C.redLight };
}

function getBarColor(p: number): string {
  if (p > 30) return C.green;
  if (p > 10) return C.yellow;
  return C.red;
}

const TRANCHE_CONFIG: Record<
  TrancheRarete,
  { emoji: string; label: string; color: string; bgColor: string }
> = {
  commun: { emoji: '🟢', label: 'Commun', color: C.green, bgColor: C.greenLight },
  accessible: { emoji: '👍', label: 'Accessible', color: C.green, bgColor: C.greenLight },
  selectif: { emoji: '🔍', label: 'Sélectif', color: C.yellow, bgColor: C.yellowLight },
  rare: { emoji: '💎', label: 'Rare', color: C.orange, bgColor: C.orangeLight },
  licorne: { emoji: '🦄', label: 'Licorne', color: C.indigo, bgColor: C.indigoLight },
  legendaire: { emoji: '🐉', label: 'Légendaire', color: C.red, bgColor: C.redLight },
  extraterrestre: { emoji: '👽', label: 'Extraterrestre', color: C.redDark, bgColor: C.redLight },
  hors_galaxie: { emoji: '🪐', label: 'Hors galaxie', color: C.redDark, bgColor: C.redLight },
};

function ResultCardInner({
  resultat,
  genre,
  ville = 'france',
  mode = 'recherche',
  shareText,
}: ResultCardProps) {
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup any pending timer on unmount
  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const { pourcentage, nombre, details } = resultat;
  const genreLabel = genre === 'homme' ? 'hommes' : 'femmes';
  const isProfil = mode === 'profil';
  const verdict = useMemo(() => getVerdict(pourcentage, isProfil), [pourcentage, isProfil]);

  const villeLabel = useMemo(
    () =>
      ville === 'france'
        ? 'en France'
        : `à ${VILLE_LABELS[ville].replace(/^[^\s]+\s/, '')}`,
    [ville],
  );

  const subtitleText = isProfil
    ? `des ${genreLabel} ${villeLabel} te ressemblent`
    : `des ${genreLabel} ${villeLabel}`;

  const defaultShareText = useMemo(
    () =>
      `🚩 RedFlag\n` +
        `${isProfil ? 'Mon profil' : 'Mes critères'} : ${details.map((d) => d.label).join(', ')}\n` +
        `→ ${formatPourcentage(pourcentage)} des ${genreLabel} ${villeLabel} ${verdict.emoji}`,
    [details, isProfil, pourcentage, genreLabel, villeLabel, verdict.emoji],
  );

  const handleShare = useCallback(async () => {
    if (sharing) return;
    setSharing(true);
    const text = shareText ?? defaultShareText;
    try {
      if (Platform.OS !== 'web') {
        await Share.share({ message: text });
      } else if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ text });
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
        copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // user cancelled or feature unsupported — silent
    } finally {
      setSharing(false);
    }
  }, [sharing, shareText, defaultShareText]);

  return (
    <View
      style={[styles.container, S.card]}
      accessible
      accessibilityRole="summary"
      accessibilityLabel={`${verdict.text}, ${formatPourcentage(pourcentage)} des ${genreLabel} ${villeLabel}, environ ${formatNombre(nombre)} personnes`}
    >
      {/* Verdict */}
      <View style={styles.verdictSection}>
        <Text
          style={styles.verdictEmoji}
          allowFontScaling={false}
          accessibilityElementsHidden
          importantForAccessibility="no"
        >
          {verdict.emoji}
        </Text>
        <Text
          style={[styles.percentage, { color: verdict.color }]}
          allowFontScaling
          maxFontSizeMultiplier={1.4}
        >
          {formatPourcentage(pourcentage)}
        </Text>
        <Text style={styles.subtitle} allowFontScaling>
          {subtitleText}
        </Text>
        <View style={[styles.verdictPill, { backgroundColor: verdict.bgColor }]}>
          <Text
            style={[styles.verdictLabel, { color: verdict.color }]}
            allowFontScaling
          >
            {verdict.text}
          </Text>
        </View>
      </View>

      {/* Compteur */}
      <View style={styles.countBox}>
        <Text style={styles.countNumber} allowFontScaling maxFontSizeMultiplier={1.3}>
          ≈ {formatNombre(nombre)}
        </Text>
        <Text style={styles.countLabel} allowFontScaling>
          personnes
        </Text>
      </View>

      {/* Tranche de rareté */}
      {resultat.tranche && (
        <View style={styles.trancheSection}>
          <Text style={styles.trancheSectionTitle} allowFontScaling>
            NIVEAU DE RARETÉ
          </Text>
          <View
            style={[
              styles.trancheBadge,
              { backgroundColor: TRANCHE_CONFIG[resultat.tranche].bgColor },
            ]}
          >
            <Text style={styles.trancheEmoji} allowFontScaling={false}>
              {TRANCHE_CONFIG[resultat.tranche].emoji}
            </Text>
            <Text
              style={[
                styles.trancheLabel,
                { color: TRANCHE_CONFIG[resultat.tranche].color },
              ]}
              allowFontScaling
            >
              {TRANCHE_CONFIG[resultat.tranche].label}
            </Text>
          </View>
        </View>
      )}

      {/* Répartition Homme / Femme */}
      {typeof resultat.pourcentageHomme === 'number' &&
        typeof resultat.pourcentageFemme === 'number' && (
          <View style={styles.genderSection}>
            <Text style={styles.genderSectionTitle} allowFontScaling>
              PROBABILITÉ PAR GENRE
            </Text>
            <View style={styles.genderRow}>
              <View
                style={styles.genderCard}
                accessible
                accessibilityLabel={`Hommes, ${formatPourcentage(resultat.pourcentageHomme)}, environ ${formatNombre(resultat.nombreHomme ?? 0)}`}
              >
                <Text style={styles.genderEmoji} allowFontScaling={false}>
                  👨
                </Text>
                <Text style={styles.genderPct} allowFontScaling>
                  {formatPourcentage(resultat.pourcentageHomme)}
                </Text>
                <Text style={styles.genderCount} allowFontScaling>
                  ≈ {formatNombre(resultat.nombreHomme ?? 0)}
                </Text>
                <Text style={styles.genderLabel} allowFontScaling>
                  hommes
                </Text>
              </View>
              <View style={styles.genderDivider} />
              <View
                style={styles.genderCard}
                accessible
                accessibilityLabel={`Femmes, ${formatPourcentage(resultat.pourcentageFemme)}, environ ${formatNombre(resultat.nombreFemme ?? 0)}`}
              >
                <Text style={styles.genderEmoji} allowFontScaling={false}>
                  👩
                </Text>
                <Text style={styles.genderPct} allowFontScaling>
                  {formatPourcentage(resultat.pourcentageFemme)}
                </Text>
                <Text style={styles.genderCount} allowFontScaling>
                  ≈ {formatNombre(resultat.nombreFemme ?? 0)}
                </Text>
                <Text style={styles.genderLabel} allowFontScaling>
                  femmes
                </Text>
              </View>
            </View>
          </View>
        )}

      {/* Détail par critère */}
      {details.length > 0 && (
        <View style={styles.details}>
          <Text style={styles.detailsTitle} allowFontScaling>
            {isProfil ? 'Tes traits' : 'Détail par critère'}
          </Text>
          {details.map((d) => (
            <View
              key={d.label}
              style={styles.row}
              accessible
              accessibilityRole="progressbar"
              accessibilityLabel={`${d.label}, ${d.pourcentage.toFixed(1).replace('.', ',')}%`}
              accessibilityValue={{
                min: 0,
                max: 100,
                now: Math.round(d.pourcentage),
              }}
            >
              <View style={styles.rowTop}>
                <View style={styles.rowLabelWrap}>
                  {isProfil && d.isRedFlag && (
                    <Text
                      style={styles.redFlagIcon}
                      allowFontScaling={false}
                      accessibilityElementsHidden
                      importantForAccessibility="no"
                    >
                      🚩{' '}
                    </Text>
                  )}
                  <Text
                    style={styles.rowLabel}
                    numberOfLines={2}
                    allowFontScaling
                  >
                    {d.label}
                  </Text>
                </View>
                <Text style={styles.rowValue} allowFontScaling>
                  {d.pourcentage.toFixed(1).replace('.', ',')}%
                </Text>
              </View>
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
              <Text style={styles.rowSource} allowFontScaling>
                {d.source}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Share */}
      <TouchableOpacity
        style={styles.shareBtn}
        onPress={handleShare}
        disabled={sharing}
        activeOpacity={0.7}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Partager ce résultat"
        accessibilityState={{ disabled: sharing }}
      >
        <Text style={styles.shareBtnText} allowFontScaling>
          {copied ? '✓ Copié !' : sharing ? '…' : '🔗 Partager ce résultat'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export const ResultCard = React.memo(ResultCardInner);

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
    fontSize: 12,
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
    fontSize: 12,
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
  genderCount: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textSecondary,
    marginTop: 2,
  },
  genderLabel: {
    fontSize: 12,
    color: C.textTertiary,
    fontWeight: '500',
    marginTop: 2,
  },
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
  rowSource: { fontSize: 12, color: C.textTertiary, fontWeight: '500' },
  shareBtn: {
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingVertical: 16,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtnText: { fontSize: 14, color: C.indigo, fontWeight: '700' },
});
