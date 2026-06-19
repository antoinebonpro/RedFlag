import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  PanResponder,
  Animated,
  StyleSheet,
  Platform,
} from 'react-native';
import { C } from '../constants/theme';

const THUMB = 28;
const TRACK_H = 4;
const HIT_SLOP = { top: 16, bottom: 16, left: 16, right: 16 };

interface DualSliderProps {
  count: number;
  range: [number, number] | null;
  onRange: (range: [number, number] | null) => void;
  labels: string[];
  rangeLabel?: (minLbl: string, maxLbl: string) => string;
}

export function DualSlider({
  count,
  range,
  onRange,
  labels,
  rangeLabel,
}: DualSliderProps) {
  const trackW = useRef(0);
  const [layoutDone, setLayoutDone] = useState(false);

  // Mutable refs — accessible inside PanResponder closures
  const minPosRef = useRef(0);
  const maxPosRef = useRef(0);
  const minIdxRef = useRef(range?.[0] ?? 0);
  const maxIdxRef = useRef(range?.[1] ?? count - 1);
  const minStartRef = useRef(0);
  const maxStartRef = useRef(0);

  // Always-fresh onRange ref
  const onRangeRef = useRef(onRange);
  onRangeRef.current = onRange;

  // Animated pixel offsets for the two thumbs
  const minX = useRef(new Animated.Value(0)).current;
  const maxX = useRef(new Animated.Value(0)).current;

  // ── Helpers ───────────────────────────────────────────────────

  function avail(): number {
    return Math.max(0, trackW.current - THUMB);
  }

  function idxToPos(idx: number): number {
    if (count <= 1) return 0;
    return (idx / (count - 1)) * avail();
  }

  function posToIdx(pos: number): number {
    const a = avail();
    if (a <= 0) return 0;
    return Math.round(Math.max(0, Math.min(1, pos / a)) * (count - 1));
  }

  function syncToIdxs(lo: number, hi: number) {
    minIdxRef.current = lo;
    maxIdxRef.current = hi;
    const loP = idxToPos(lo);
    const hiP = idxToPos(hi);
    minPosRef.current = loP;
    maxPosRef.current = hiP;
    minX.setValue(loP);
    maxX.setValue(hiP);
  }

  function snapThumb(
    anim: Animated.Value,
    idx: number,
    posRef: React.MutableRefObject<number>,
  ) {
    const target = idxToPos(idx);
    posRef.current = target;
    Animated.spring(anim, {
      toValue: target,
      useNativeDriver: false,
      tension: 200,
      friction: 15,
    }).start();
  }

  // ── Layout ────────────────────────────────────────────────────

  function handleLayout(w: number) {
    if (trackW.current === w && layoutDone) return;
    trackW.current = w;
    syncToIdxs(range?.[0] ?? 0, range?.[1] ?? count - 1);
    setLayoutDone(true);
  }

  // Sync thumb positions when range prop changes externally
  useEffect(() => {
    if (!layoutDone) return;
    syncToIdxs(range?.[0] ?? 0, range?.[1] ?? count - 1);
  }, [range, layoutDone]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── PanResponders ─────────────────────────────────────────────

  const minPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        minStartRef.current = minPosRef.current;
      },
      onPanResponderMove: (_, gs) => {
        const newPos = Math.max(
          0,
          Math.min(minStartRef.current + gs.dx, maxPosRef.current),
        );
        minPosRef.current = newPos;
        minX.setValue(newPos);
        const newIdx = posToIdx(newPos);
        if (newIdx !== minIdxRef.current) {
          minIdxRef.current = newIdx;
          onRangeRef.current([newIdx, maxIdxRef.current]);
        }
      },
      onPanResponderRelease: () => {
        snapThumb(minX, minIdxRef.current, minPosRef);
      },
      onPanResponderTerminate: () => {
        snapThumb(minX, minIdxRef.current, minPosRef);
      },
    }),
  ).current;

  const maxPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        maxStartRef.current = maxPosRef.current;
      },
      onPanResponderMove: (_, gs) => {
        const newPos = Math.max(
          minPosRef.current,
          Math.min(maxStartRef.current + gs.dx, avail()),
        );
        maxPosRef.current = newPos;
        maxX.setValue(newPos);
        const newIdx = posToIdx(newPos);
        if (newIdx !== maxIdxRef.current) {
          maxIdxRef.current = newIdx;
          onRangeRef.current([minIdxRef.current, newIdx]);
        }
      },
      onPanResponderRelease: () => {
        snapThumb(maxX, maxIdxRef.current, maxPosRef);
      },
      onPanResponderTerminate: () => {
        snapThumb(maxX, maxIdxRef.current, maxPosRef);
      },
    }),
  ).current;

  // ── Derived display values ────────────────────────────────────

  const lo = range?.[0] ?? 0;
  const hi = range?.[1] ?? count - 1;
  const minLbl = labels[lo] ?? '';
  const maxLbl = labels[hi] ?? '';
  const pillText = rangeLabel
    ? rangeLabel(minLbl, maxLbl)
    : lo === hi
    ? minLbl
    : `${minLbl} → ${maxLbl}`;

  const isActive = range !== null;

  // ── A11y handlers (VoiceOver / TalkBack adjustable) ───────────

  const handleMinIncrement = useCallback(() => {
    const next = Math.min(maxIdxRef.current, minIdxRef.current + 1);
    if (next !== minIdxRef.current) {
      onRangeRef.current([next, maxIdxRef.current]);
    }
  }, []);

  const handleMinDecrement = useCallback(() => {
    const next = Math.max(0, minIdxRef.current - 1);
    if (next !== minIdxRef.current) {
      onRangeRef.current([next, maxIdxRef.current]);
    }
  }, []);

  const handleMaxIncrement = useCallback(() => {
    const next = Math.min(count - 1, maxIdxRef.current + 1);
    if (next !== maxIdxRef.current) {
      onRangeRef.current([minIdxRef.current, next]);
    }
  }, [count]);

  const handleMaxDecrement = useCallback(() => {
    const next = Math.max(minIdxRef.current, maxIdxRef.current - 1);
    if (next !== maxIdxRef.current) {
      onRangeRef.current([minIdxRef.current, next]);
    }
  }, []);

  const thumbCursor =
    Platform.OS === 'web' ? ({ cursor: 'grab' } as object) : {};

  return (
    <View style={styles.container}>
      {/* ── Track ── */}
      <View
        style={styles.trackOuter}
        onLayout={(e) => handleLayout(e.nativeEvent.layout.width)}
      >
        <View style={[styles.trackBg, isActive && styles.trackBgOn]} />

        {layoutDone && (
          <>
            {isActive && (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.trackFill,
                  {
                    // @ts-ignore
                    left: Animated.add(minX, THUMB / 2),
                    width: Animated.subtract(maxX, minX),
                  },
                ]}
              />
            )}

            {/* Min thumb */}
            <Animated.View
              hitSlop={HIT_SLOP}
              style={[
                styles.thumb,
                isActive && styles.thumbOn,
                // @ts-ignore
                { left: minX },
                thumbCursor,
              ]}
              accessible
              accessibilityRole="adjustable"
              accessibilityLabel={`Valeur minimum, ${minLbl}`}
              accessibilityValue={{
                min: 0,
                max: count - 1,
                now: lo,
                text: minLbl,
              }}
              accessibilityActions={[
                { name: 'increment' },
                { name: 'decrement' },
              ]}
              onAccessibilityAction={(e) => {
                if (e.nativeEvent.actionName === 'increment') handleMinIncrement();
                if (e.nativeEvent.actionName === 'decrement') handleMinDecrement();
              }}
              {...minPan.panHandlers}
            >
              <View style={[styles.dot, isActive && styles.dotOn]} />
            </Animated.View>

            {/* Max thumb */}
            <Animated.View
              hitSlop={HIT_SLOP}
              style={[
                styles.thumb,
                isActive && styles.thumbOn,
                // @ts-ignore
                { left: maxX },
                thumbCursor,
              ]}
              accessible
              accessibilityRole="adjustable"
              accessibilityLabel={`Valeur maximum, ${maxLbl}`}
              accessibilityValue={{
                min: 0,
                max: count - 1,
                now: hi,
                text: maxLbl,
              }}
              accessibilityActions={[
                { name: 'increment' },
                { name: 'decrement' },
              ]}
              onAccessibilityAction={(e) => {
                if (e.nativeEvent.actionName === 'increment') handleMaxIncrement();
                if (e.nativeEvent.actionName === 'decrement') handleMaxDecrement();
              }}
              {...maxPan.panHandlers}
            >
              <View style={[styles.dot, isActive && styles.dotOn]} />
            </Animated.View>
          </>
        )}
      </View>

      {/* ── Edge labels ── */}
      <View style={styles.edgeRow}>
        <Text style={styles.edgeLbl} allowFontScaling>
          {labels[0]}
        </Text>
        <Text style={styles.edgeLbl} allowFontScaling>
          {labels[count - 1]}
        </Text>
      </View>

      {/* ── Pill / hint ── */}
      {isActive ? (
        <View style={styles.pillRow}>
          <View style={styles.pill}>
            <Text style={styles.pillTxt} allowFontScaling>
              📏 {pillText}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => onRange(null)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Effacer la plage"
            style={styles.clearBtnTouch}
          >
            <Text style={styles.clearBtn} allowFontScaling>
              Effacer
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.hint} allowFontScaling>
          Glisse les curseurs pour définir une plage
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  trackOuter: {
    height: THUMB,
    justifyContent: 'center',
  },
  trackBg: {
    position: 'absolute',
    left: THUMB / 2,
    right: THUMB / 2,
    height: TRACK_H,
    borderRadius: TRACK_H / 2,
    backgroundColor: C.bgChip,
  },
  trackBgOn: {
    backgroundColor: 'rgba(232,57,57,0.12)',
  },
  trackFill: {
    position: 'absolute',
    top: (THUMB - TRACK_H) / 2,
    height: TRACK_H,
    backgroundColor: C.red,
    borderRadius: TRACK_H / 2,
  },
  thumb: {
    position: 'absolute',
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: C.bgCard,
    borderWidth: 2.5,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbOn: {
    borderColor: C.red,
    backgroundColor: C.bgCard,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.border,
  },
  dotOn: {
    backgroundColor: C.red,
  },
  edgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 4,
  },
  edgeLbl: {
    fontSize: 12,
    color: C.textTertiary,
    fontWeight: '500',
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  pill: {
    backgroundColor: 'rgba(232,57,57,0.07)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: C.rFull,
    borderWidth: 1,
    borderColor: 'rgba(232,57,57,0.20)',
  },
  pillTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: C.red,
  },
  clearBtnTouch: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  clearBtn: {
    fontSize: 13,
    color: C.textTertiary,
    fontWeight: '600',
  },
  hint: {
    marginTop: 4,
    fontSize: 12,
    color: C.textTertiary,
    fontStyle: 'italic',
  },
});
