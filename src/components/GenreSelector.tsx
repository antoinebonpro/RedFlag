import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Genre } from '../types';
import { C, S } from '../constants/theme';

interface GenreSelectorProps {
  selected: Genre;
  onSelect: (genre: Genre) => void;
}

function GenreSelectorInner({ selected, onSelect }: GenreSelectorProps) {
  return (
    <View
      style={styles.container}
      accessibilityRole="radiogroup"
      accessibilityLabel="Choix du genre"
    >
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

export const GenreSelector = React.memo(GenreSelectorInner);

const Tab = React.memo(function Tab({
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
      style={[styles.tab, active && styles.tabActive, active && S.subtleCard]}
      onPress={onPress}
      activeOpacity={0.7}
      accessible
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
    >
      <Text style={styles.emoji} allowFontScaling={false}>
        {emoji}
      </Text>
      <Text
        style={[styles.label, active && styles.labelActive]}
        allowFontScaling
      >
        {label}
      </Text>
      {active && <View style={styles.indicator} />}
    </TouchableOpacity>
  );
});

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
    minHeight: 44,
    borderRadius: C.r12,
    gap: 4,
  },
  tabActive: {
    backgroundColor: C.bg,
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
