import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { C } from '../constants/theme';

interface Option {
  value: string;
  label: string;
}

interface RangeChipSelectorProps {
  options: Option[];
  range: [number, number] | null; // [minIdx, maxIdx]
  onRange: (range: [number, number] | null) => void;
  rangeLabel?: (minLabel: string, maxLabel: string) => string;
}

export function RangeChipSelector({
  options,
  range,
  onRange,
  rangeLabel,
}: RangeChipSelectorProps) {
  function handlePress(idx: number) {
    if (!range) {
      // Nothing selected → select this chip as single
      return onRange([idx, idx]);
    }
    const [a, b] = range;
    if (a === b && a === idx) {
      // Same single chip tapped → deselect
      return onRange(null);
    }
    if (a === b) {
      // A single chip was selected → extend to range
      return onRange([Math.min(a, idx), Math.max(a, idx)]);
    }
    // A range was active → reset to this chip as single
    return onRange([idx, idx]);
  }

  const hasRange = range !== null && range[0] !== range[1];
  const rangeText =
    range !== null && hasRange
      ? rangeLabel
        ? rangeLabel(options[range[0]]?.label ?? '', options[range[1]]?.label ?? '')
        : `${options[range[0]]?.label} → ${options[range[1]]?.label}`
      : null;

  return (
    <View>
      <View style={styles.wrap}>
        {options.map((option, idx) => {
          const inRange =
            range !== null && idx >= range[0] && idx <= range[1];
          const isEndpoint =
            range !== null && (idx === range[0] || idx === range[1]);
          const isSingle = range !== null && range[0] === range[1] && idx === range[0];

          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.chip,
                inRange && styles.chipInRange,
                isEndpoint && !isSingle && styles.chipEndpoint,
                isSingle && styles.chipSingle,
              ]}
              onPress={() => handlePress(idx)}
              activeOpacity={0.65}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              accessibilityState={{ selected: inRange }}
            >
              <Text
                style={[
                  styles.text,
                  inRange && styles.textActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {rangeText !== null && (
        <View style={styles.rangeLabelWrap}>
          <Text style={styles.rangeLabelText}>📏 {rangeText}</Text>
        </View>
      )}

      {range === null && (
        <Text style={styles.hint}>Appuie sur une tranche, puis sur une autre pour définir une plage</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: C.rFull,
    backgroundColor: C.bgChip,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipInRange: {
    backgroundColor: 'rgba(232, 57, 57, 0.12)',
    borderColor: 'rgba(232, 57, 57, 0.30)',
  },
  chipEndpoint: {
    backgroundColor: C.red,
    borderColor: C.red,
  },
  chipSingle: {
    backgroundColor: C.red,
    borderColor: C.red,
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
    color: C.textSecondary,
  },
  textActive: {
    color: C.textOnRed,
    fontWeight: '700',
  },
  rangeLabelWrap: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(232, 57, 57, 0.07)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: C.rFull,
    borderWidth: 1,
    borderColor: 'rgba(232, 57, 57, 0.20)',
  },
  rangeLabelText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.red,
  },
  hint: {
    marginTop: 8,
    fontSize: 11,
    color: C.textTertiary,
    fontStyle: 'italic',
  },
});
