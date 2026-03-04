import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { SOURCES } from '../constants/sources';
import { C } from '../constants/theme';

export function SourcesPanel() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sources des données</Text>
      <Text style={styles.intro}>
        Toutes les statistiques proviennent de sources publiques françaises.
        Le calcul multiplie les probabilités en supposant l'indépendance
        statistique des critères.
      </Text>

      {SOURCES.map((s, i) => (
        <View key={i} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.critere}>{s.critere}</Text>
            <View style={styles.anneePill}>
              <Text style={styles.annee}>{s.annee}</Text>
            </View>
          </View>
          <Text style={styles.sourceName}>{s.source}</Text>
          <Text style={styles.note}>{s.note}</Text>
          <TouchableOpacity
            onPress={() => Linking.openURL(s.url)}
            activeOpacity={0.6}
            style={styles.linkWrap}
          >
            <Text style={styles.link}>Consulter →</Text>
          </TouchableOpacity>
        </View>
      ))}

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerTitle}>⚠️ Avertissement</Text>
        <Text style={styles.disclaimerText}>
          Ces données sont des estimations statistiques. Le calcul par
          indépendance est une simplification — en réalité certains critères
          sont corrélés (ex : diplôme et salaire). Les résultats sont
          indicatifs.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: C.text,
  },
  intro: {
    fontSize: 14,
    color: C.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  card: {
    backgroundColor: C.bg,
    borderRadius: C.r16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  critere: {
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
  },
  anneePill: {
    backgroundColor: C.redLight,
    borderRadius: C.rFull,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  annee: {
    fontSize: 11,
    fontWeight: '700',
    color: C.red,
  },
  sourceName: {
    fontSize: 13,
    color: C.textSecondary,
    fontWeight: '500',
  },
  note: {
    fontSize: 12,
    color: C.textTertiary,
    lineHeight: 17,
  },
  linkWrap: {
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  link: {
    fontSize: 13,
    color: C.indigo,
    fontWeight: '600',
  },
  disclaimer: {
    backgroundColor: C.warningBg,
    borderRadius: C.r12,
    padding: 16,
    borderWidth: 1,
    borderColor: C.warningBorder,
    gap: 6,
    marginTop: 4,
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: C.warningTitle,
  },
  disclaimerText: {
    fontSize: 13,
    color: C.warningText,
    lineHeight: 19,
  },
});
