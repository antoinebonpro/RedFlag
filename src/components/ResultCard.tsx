import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ResultatCalcul } from '../types';
import { C } from '../constants/theme';

interface ResultCardProps {
  resultat: ResultatCalcul;
  genre: string;
}

function formatNombre(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.', ',')} M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)} k`;
  return n.toLocaleString('fr-FR');
}

function formatPourcentage(p: number): string {
  if (p >= 10) return `${p.toFixed(1).replace('.', ',')}%`;
  if (p >= 1) return `${p.toFixed(2).replace('.', ',')}%`;
  if (p >= 0.01) return `${p.toFixed(3).replace('.', ',')}%`;
  if (p >= 0.0001) return `${p.toFixed(4).replace('.', ',')}%`;
  return `< 0,0001%`;
}

function getVerdict(p: number): {
  emoji: string;
  text: string;
  color: string;
  bgColor: string;
} {
  if (p >= 30)
    return { emoji: '😎', text: 'Très courant', color: C.green, bgColor: C.greenLight };
  if (p >= 10)
    return { emoji: '👍', text: 'Assez courant', color: C.green, bgColor: C.greenLight };
  if (p >= 3)
    return { emoji: '🤔', text: 'Pas si fréquent', color: C.yellow, bgColor: C.yellowLight };
  if (p >= 0.5)
    return { emoji: '😬', text: 'Plutôt rare', color: C.orange, bgColor: C.orangeLight };
  if (p >= 0.05)
    return { emoji: '🦄', text: 'Très exigeant', color: C.red, bgColor: C.redLight };
  return { emoji: '💀', text: 'Quasi impossible', color: C.redDark, bgColor: C.redLight };
}

function getBarColor(p: number): string {
  if (p > 30) return C.green;
  if (p > 10) return C.yellow;
  return C.red;
}

export function ResultCard({ resultat, genre }: ResultCardProps) {
  const { pourcentage, nombre, details } = resultat;
  const genreLabel = genre === 'homme' ? 'hommes' : 'femmes';
  const verdict = getVerdict(pourcentage);

  return (
    <View style={styles.container}>
      {/* Verdict */}
      <View style={styles.verdictSection}>
        <Text style={styles.verdictEmoji}>{verdict.emoji}</Text>
        <Text style={[styles.percentage, { color: verdict.color }]}>
          {formatPourcentage(pourcentage)}
        </Text>
        <Text style={styles.subtitle}>des {genreLabel} en France</Text>
        <View style={[styles.verdictPill, { backgroundColor: verdict.bgColor }]}>
          <Text style={[styles.verdictLabel, { color: verdict.color }]}>
            {verdict.text}
          </Text>
        </View>
      </View>

      {/* Compteur */}
      <View style={styles.countBox}>
        <Text style={styles.countNumber}>≈ {formatNombre(nombre)}</Text>
        <Text style={styles.countLabel}>personnes</Text>
      </View>

      {/* Détail */}
      {details.length > 0 && (
        <View style={styles.details}>
          <Text style={styles.detailsTitle}>Détail par critère</Text>
          {details.map((d, i) => (
            <View key={i} style={styles.row}>
              <View style={styles.rowTop}>
                <Text style={styles.rowLabel}>{d.label}</Text>
                <Text style={styles.rowValue}>
                  {d.pourcentage.toFixed(1).replace('.', ',')}%
                </Text>
              </View>
              <View style={styles.barBg}>
                <View
                  style={[
                    styles.bar,
                    {
                      width: `${Math.min(d.pourcentage, 100)}%`,
                      backgroundColor: getBarColor(d.pourcentage),
                    },
                  ]}
                />
              </View>
              <Text style={styles.rowSource}>{d.source}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: C.bg,
    borderRadius: C.r20,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
    overflow: 'hidden',
  },
  // Verdict
  verdictSection: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  verdictEmoji: {
    fontSize: 48,
    marginBottom: 4,
  },
  percentage: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -2,
  },
  subtitle: {
    fontSize: 15,
    color: C.textSecondary,
    marginTop: 2,
  },
  verdictPill: {
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: C.rFull,
  },
  verdictLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  // Count
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
  countNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: C.text,
  },
  countLabel: {
    fontSize: 14,
    color: C.textSecondary,
    fontWeight: '500',
  },
  // Details
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
  row: {
    gap: 4,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '800',
    color: C.text,
  },
  barBg: {
    height: 6,
    backgroundColor: C.bgChip,
    borderRadius: 3,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 3,
  },
  rowSource: {
    fontSize: 11,
    color: C.textTertiary,
    fontWeight: '500',
  },
});
