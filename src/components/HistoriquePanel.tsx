import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SavedSearch, CriteriaState, Ville } from '../types';
import { VILLE_LABELS } from '../constants/labels';
import { C } from '../constants/theme';
import { deleteSearch, clearHistory } from '../services/history';
import { formatNombre, formatPourcentage } from './ResultCard';

interface HistoriquePanelProps {
  history: SavedSearch[];
  onRestore: (criteria: CriteriaState, ville: Ville, mode: 'recherche' | 'profil') => void;
  onHistoryChange: () => void;
}

function formatDate(timestamp: number): string {
  const diffMin = Math.floor((Date.now() - timestamp) / 60000);
  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Il y a ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return 'Hier';
  if (diffD < 7) return `Il y a ${diffD} jours`;
  return new Date(timestamp).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function getVerdictEmoji(p: number): string {
  if (p >= 30) return '😎';
  if (p >= 10) return '👍';
  if (p >= 3)  return '🤔';
  if (p >= 0.5)return '😬';
  if (p >= 0.05)return '🦄';
  return '💀';
}

export function HistoriquePanel({ history, onRestore, onHistoryChange }: HistoriquePanelProps) {
  const [confirmClear, setConfirmClear] = useState(false);

  const handleDelete = useCallback(async (id: string) => {
    await deleteSearch(id);
    onHistoryChange();
  }, [onHistoryChange]);

  const handleClearAll = useCallback(async () => {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    await clearHistory();
    onHistoryChange();
    setConfirmClear(false);
  }, [confirmClear, onHistoryChange]);

  if (history.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>📭</Text>
        <Text style={styles.emptyTitle}>Aucune recherche sauvegardée</Text>
        <Text style={styles.emptyText}>
          Lance un calcul pour retrouver tes recherches ici.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>
          {history.length} recherche{history.length > 1 ? 's' : ''}
        </Text>
        <TouchableOpacity
          onPress={handleClearAll}
          activeOpacity={0.7}
          accessibilityLabel="Effacer tout l'historique"
          accessibilityRole="button"
        >
          <Text style={[styles.clearBtn, confirmClear && styles.clearBtnConfirm]}>
            {confirmClear ? 'Confirmer ?' : 'Tout effacer'}
          </Text>
        </TouchableOpacity>
      </View>

      {history.map((item) => (
        <HistoryCard
          key={item.id}
          item={item}
          onRestore={() => onRestore(item.criteria, item.ville, item.mode)}
          onDelete={() => handleDelete(item.id)}
        />
      ))}
    </View>
  );
}

function HistoryCard({
  item,
  onRestore,
  onDelete,
}: {
  item: SavedSearch;
  onRestore: () => void;
  onDelete: () => void;
}) {
  const { resultat, criteria, ville, mode, timestamp } = item;
  const genreLabel = criteria.genre === 'homme' ? 'hommes' : 'femmes';
  const modeLabel = mode === 'profil' ? '👤 Mon profil' : '🔍 Recherche';
  const villeLabel = VILLE_LABELS[ville];
  const emoji = getVerdictEmoji(resultat.pourcentage);

  return (
    <View style={styles.card} accessibilityRole="none">
      <View style={styles.cardHeader}>
        <View style={styles.cardMeta}>
          <Text style={styles.modeTag}>{modeLabel}</Text>
          <Text style={styles.cardDate}>{formatDate(timestamp)}</Text>
        </View>
        <TouchableOpacity
          onPress={onDelete}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Supprimer cette recherche"
          accessibilityRole="button"
        >
          <Text style={styles.deleteBtn}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.resultRow}>
          <Text style={styles.resultEmoji}>{emoji}</Text>
          <View>
            <Text style={styles.resultPct}>
              {formatPourcentage(resultat.pourcentage)}
            </Text>
            <Text style={styles.resultSub}>
              des {genreLabel} · ≈ {formatNombre(resultat.nombre)} personnes
            </Text>
          </View>
        </View>
        <Text style={styles.villeTag}>{villeLabel}</Text>
      </View>

      <View style={styles.criteriaPreview}>
        {resultat.details.slice(0, 4).map((d, i) => (
          <View key={i} style={styles.criteriaChip}>
            <Text style={styles.criteriaChipText}>{d.label}</Text>
          </View>
        ))}
        {resultat.details.length > 4 && (
          <View style={styles.criteriaChip}>
            <Text style={styles.criteriaChipText}>
              +{resultat.details.length - 4}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.restoreBtn}
        onPress={onRestore}
        activeOpacity={0.7}
        accessibilityLabel="Restaurer cette recherche"
        accessibilityRole="button"
      >
        <Text style={styles.restoreBtnText}>↩ Restaurer cette recherche</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: C.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  clearBtn: { fontSize: 13, color: C.textTertiary, fontWeight: '500' },
  clearBtnConfirm: { color: C.red, fontWeight: '700' },
  card: {
    backgroundColor: C.bg,
    borderRadius: C.r16,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  modeTag: {
    fontSize: 12,
    fontWeight: '700',
    color: C.indigo,
    backgroundColor: C.indigoLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: C.rFull,
  },
  cardDate: { fontSize: 12, color: C.textTertiary, fontWeight: '500' },
  deleteBtn: { fontSize: 14, color: C.textTertiary, fontWeight: '600' },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  resultEmoji: { fontSize: 28 },
  resultPct: { fontSize: 20, fontWeight: '900', color: C.text, letterSpacing: -0.5 },
  resultSub: { fontSize: 12, color: C.textSecondary, fontWeight: '500' },
  villeTag: {
    fontSize: 12,
    color: C.textTertiary,
    fontWeight: '500',
    backgroundColor: C.bgCard,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: C.r8,
  },
  criteriaPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  criteriaChip: {
    backgroundColor: C.bgChip,
    borderRadius: C.rFull,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  criteriaChipText: { fontSize: 11, color: C.textSecondary, fontWeight: '500' },
  restoreBtn: {
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingVertical: 12,
    alignItems: 'center',
  },
  restoreBtnText: { fontSize: 13, color: C.indigo, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: C.text },
  emptyText: {
    fontSize: 14,
    color: C.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
