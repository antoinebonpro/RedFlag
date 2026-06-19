import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { C } from '../constants/theme';

interface Option<T extends string> {
  value: T;
  label: string;
}

interface MultiChipSelectorProps<T extends string> {
  options: Option<T>[];
  selected: T[] | null;
  onSelect: (values: T[] | null) => void;
}

function MultiChipSelectorInner<T extends string>({
  options,
  selected,
  onSelect,
}: MultiChipSelectorProps<T>) {
  function handlePress(value: T) {
    const current = selected ?? [];
    const exists = current.includes(value);
    if (exists) {
      const next = current.filter((v) => v !== value);
      onSelect(next.length > 0 ? next : null);
    } else {
      onSelect([...current, value]);
    }
  }

  return (
    <View style={styles.wrap}>
      {options.map((option) => {
        const isSelected = selected !== null && selected.includes(option.value);
        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.chip, isSelected && styles.chipSelected]}
            onPress={() => handlePress(option.value)}
            activeOpacity={0.65}
            accessible
            accessibilityRole="checkbox"
            accessibilityLabel={option.label}
            accessibilityState={{ checked: isSelected }}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <Text
              style={[styles.text, isSelected && styles.textSelected]}
              allowFontScaling
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export const MultiChipSelector = React.memo(
  MultiChipSelectorInner,
) as typeof MultiChipSelectorInner;

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: C.rFull,
    backgroundColor: C.bgChip,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipSelected: {
    backgroundColor: C.red,
    borderColor: C.red,
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
    color: C.textSecondary,
  },
  textSelected: {
    color: C.textOnRed,
    fontWeight: '700',
  },
});
