import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import { C } from '../constants/theme';
import { clearAllUserData } from '../services/history';

// FIX: App Store 2023+ requires an in-app account/data deletion path AND a
// privacy policy URL. The app stores zero server-side data (100% local calc)
// so "delete my data" is a full AsyncStorage wipe, not a backend call.

// ⚠️ BLOCKER PRODUCTION:
// L'URL ci-dessous DOIT être remplacée par une URL HTTPS qui sert
// `playstore/privacy-policy.html`. Sans elle, App Store et Google Play
// refusent l'app (politique de confidentialité requise et accessible).
// Options rapides :
//   - GitHub Pages : https://<user>.github.io/<repo>/privacy-policy.html
//   - Vercel/Netlify : déployer playstore/ comme un mini-site
//   - Domaine dédié : https://redflag.app/privacy
// Le UI gère gracieusement l'erreur si l'URL n'est pas joignable.
const PRIVACY_POLICY_URL = 'https://redflag.app/privacy';

interface PrivacyPanelProps {
  onDataCleared?: () => void;
}

export function PrivacyPanel({ onDataCleared }: PrivacyPanelProps) {
  const [clearing, setClearing] = useState(false);

  const handleOpenPolicy = useCallback(async () => {
    try {
      const supported = await Linking.canOpenURL(PRIVACY_POLICY_URL);
      if (!supported) {
        Alert.alert(
          'Lien indisponible',
          'Impossible d’ouvrir la politique de confidentialité sur cet appareil.',
        );
        return;
      }
      await Linking.openURL(PRIVACY_POLICY_URL);
    } catch {
      Alert.alert(
        'Lien indisponible',
        'Une erreur est survenue lors de l’ouverture du lien.',
      );
    }
  }, []);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Supprimer mes données',
      'Toute ta recherche sauvegardée sera définitivement effacée. Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Tout supprimer',
          style: 'destructive',
          onPress: async () => {
            if (clearing) return;
            setClearing(true);
            try {
              await clearAllUserData();
              onDataCleared?.();
              Alert.alert(
                'Données supprimées',
                'Tes données locales ont été effacées avec succès.',
              );
            } catch {
              Alert.alert(
                'Erreur',
                'Impossible de supprimer les données. Réessaie.',
              );
            } finally {
              setClearing(false);
            }
          },
        },
      ],
    );
  }, [clearing, onDataCleared]);

  return (
    <View style={styles.container}>
      <Text
        style={styles.title}
        accessibilityRole="header"
        allowFontScaling
      >
        Confidentialité & données
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle} allowFontScaling>
          🔒 Tes données restent sur ton appareil
        </Text>
        <Text style={styles.cardText} allowFontScaling>
          RedFlag ne crée pas de compte et n’envoie aucune donnée personnelle à
          un serveur. L’historique de tes recherches est sauvegardé uniquement
          localement, sur ton téléphone.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.linkBtn}
        onPress={handleOpenPolicy}
        activeOpacity={0.7}
        accessible
        accessibilityRole="link"
        accessibilityLabel="Lire la politique de confidentialité"
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Text style={styles.linkBtnText} allowFontScaling>
          📄 Lire la politique de confidentialité →
        </Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <Text
        style={styles.sectionLabel}
        accessibilityRole="header"
        allowFontScaling
      >
        GESTION DE TES DONNÉES
      </Text>
      <Text style={styles.help} allowFontScaling>
        Conformément au RGPD, tu peux supprimer à tout moment l’ensemble des
        données stockées localement par l’application.
      </Text>

      <TouchableOpacity
        style={[styles.dangerBtn, clearing && styles.dangerBtnDisabled]}
        onPress={handleDelete}
        disabled={clearing}
        activeOpacity={0.8}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Supprimer toutes mes données locales"
        accessibilityState={{ disabled: clearing, busy: clearing }}
      >
        <Text style={styles.dangerBtnText} allowFontScaling>
          {clearing ? 'Suppression…' : '🗑️ Supprimer toutes mes données'}
        </Text>
      </TouchableOpacity>
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
  card: {
    backgroundColor: C.bg,
    borderRadius: C.r16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
  },
  cardText: {
    fontSize: 13,
    color: C.textSecondary,
    lineHeight: 19,
  },
  linkBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 4,
    minHeight: 44,
    justifyContent: 'center',
  },
  linkBtnText: {
    fontSize: 14,
    color: C.indigo,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: C.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  help: {
    fontSize: 13,
    color: C.textSecondary,
    lineHeight: 19,
  },
  dangerBtn: {
    marginTop: 4,
    backgroundColor: C.red,
    paddingVertical: 16,
    minHeight: 44,
    borderRadius: C.r12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerBtnDisabled: {
    opacity: 0.6,
  },
  dangerBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: C.textOnRed,
  },
});
