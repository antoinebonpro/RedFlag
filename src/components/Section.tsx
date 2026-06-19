import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { C } from '../constants/theme';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface SectionProps {
  icon: string;
  title: string;
  badge?: string | null;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function SectionInner({
  icon,
  title,
  badge,
  children,
  defaultOpen = false,
}: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  const toggle = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((o) => !o);
  }, []);

  const a11yLabel = badge ? `${title}, ${badge} sélectionné${Number(badge) > 1 ? 's' : ''}` : title;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={toggle}
        activeOpacity={0.6}
        accessible
        accessibilityRole="button"
        accessibilityLabel={a11yLabel}
        accessibilityState={{ expanded: open }}
        accessibilityHint={open ? 'Appuyer pour replier' : 'Appuyer pour déplier'}
      >
        <View style={styles.iconWrap}>
          <Text style={styles.icon} allowFontScaling={false}>
            {icon}
          </Text>
        </View>
        <Text style={styles.title} allowFontScaling>
          {title}
        </Text>
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText} allowFontScaling>
              {badge}
            </Text>
          </View>
        )}
        <Text style={styles.chevron} allowFontScaling={false}>
          {open ? '−' : '+'}
        </Text>
      </TouchableOpacity>
      {open && <View style={styles.body}>{children}</View>}
    </View>
  );
}

export const Section = React.memo(SectionInner);

const styles = StyleSheet.create({
  container: {
    backgroundColor: C.bg,
    borderRadius: C.r16,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 44,
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
  },
  badge: {
    backgroundColor: C.red,
    borderRadius: C.rFull,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: C.textOnRed,
  },
  chevron: {
    fontSize: 22,
    fontWeight: '300',
    color: C.textTertiary,
    width: 24,
    textAlign: 'center',
  },
  body: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
});
