import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { SOURCES } from '../constants/sources';
import { C } from '../constants/theme';

async function openUrl(url: string) {
  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert('Lien indisponible', 'Impossible d’ouvrir ce lien sur cet appareil.');
      return;
    }
    await Linking.openURL(url);
  } catch {
    Alert.alert('Lien indisponible', 'Une erreur est survenue lors de l’ouverture du lien.');
  }
}

export function SourcesPanel() {
  const handleOpen = useCallback((url: string) => {
    openUrl(url);
  }, []);

  return (
    <View style={styles.container}>
      <Text
        style={styles.title}
        accessibilityRole="header"
        allowFontScaling
      >
        Sources des données
      </Text>
      <Text style={styles.intro} allowFontScaling>
        Toutes les statistiques proviennent de sources publiques françaises.
        Le calcul multiplie les probabilités en supposant l'indépendance
        statistique des critères.
      </Text>

      {SOURCES.map((s) => (
        <View key={`${s.critere}-${s.url}`} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.critere} allowFontScaling>
              {s.critere}
            </Text>
            <View style={styles.anneePill}>
              <Text style={styles.annee} allowFontScaling>
                {s.annee}
              </Text>
            </View>
          </View>
          <Text style={styles.sourceName} allowFontScaling>
            {s.source}
          </Text>
          <Text style={styles.note} allowFontScaling>
            {s.note}
          </Text>
          <TouchableOpacity
            onPress={() => handleOpen(s.url)}
            activeOpacity={0.6}
            style={styles.linkWrap}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessible
            accessibilityRole="link"
            accessibilityLabel={`Consulter la source ${s.source}, ouvre dans le navigateur`}
          >
            <Text style={styles.link} allowFontScaling>
              Consulter →
            </Text>
          </TouchableOpacity>
        </View>
      ))}

      <View
        style={styles.disclaimer}
        accessible
        accessibilityLabel="Avertissement sur les données"
      >
        <Text style={styles.disclaimerTitle} allowFontScaling>
          ⚠️ Avertissement
        </Text>
        <Text style={styles.disclaimerText} allowFontScaling>
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
  container: { gap: 12 },
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
    paddingVertical: 4,
  },
  annee: {
    fontSize: 12,
    fontWeight: '700',
    color: C.red,
  },
  sourceName: {
    fontSize: 13,
    color: C.textSecondary,
    fontWeight: '500',
  },
  note: {
    fontSize: 13,
    color: C.textTertiary,
    lineHeight: 18,
  },
  linkWrap: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingVertical: 10,
    paddingHorizontal: 4,
    minHeight: 44,
    justifyContent: 'center',
  },
  link: {
    fontSize: 14,
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
