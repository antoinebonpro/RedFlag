import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Genre } from '../types';
import { C } from '../constants/theme';

interface GenreSelectorProps {
  selected: Genre;
  onSelect: (genre: Genre) => void;
}

export function GenreSelector({ selected, onSelect }: GenreSelectorProps) {
  return (
    <View style={styles.container}>
      <Tab
        emoji="👨"
        label="Un homme"
        active={selected === 'homme'}
        onPress={() => onSelect('homme')}
      />
      <Tab
        emoji="👩"
        label="Une femme"
        active={selected === 'femme'}
        onPress={() => onSelect('femme')}
      />
    </View>
  );
}

function Tab({
  emoji,
  label,
  active,
  onPress,
}: {
  emoji: string;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.tab, active && styles.tabActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
      {active && <View style={styles.indicator} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: C.bgCard,
    borderRadius: C.r16,
    padding: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: C.r12,
    gap: 4,
  },
  tabActive: {
    backgroundColor: C.bg,
    shadowColor: C.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  emoji: {
    fontSize: 26,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textTertiary,
  },
  labelActive: {
    color: C.text,
    fontWeight: '700',
  },
  indicator: {
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: C.red,
    marginTop: 2,
  },
});
