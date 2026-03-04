import { Platform, ViewStyle } from 'react-native';

export const C = {
  // Backgrounds
  bg: '#FFFFFF',
  bgCard: '#F7F7FA',
  bgChip: '#F0F0F5',
  bgChipActive: 'rgba(232, 57, 57, 0.06)',
  bgSection: '#FFFFFF',
  bgInput: '#F4F4F8',
  bgOverlay: 'rgba(0, 0, 0, 0.03)',

  // Primary
  red: '#E83939',
  redLight: 'rgba(232, 57, 57, 0.07)',
  redDark: '#C62828',

  // Text
  text: '#1A1A2E',
  textSecondary: '#6B6B80',
  textTertiary: '#9B9BAE',
  textOnRed: '#FFFFFF',

  // Borders
  border: '#EDEDF0',
  borderFocus: '#E83939',

  // Accent
  green: '#16A34A',
  greenLight: 'rgba(22, 163, 74, 0.08)',
  yellow: '#CA8A04',
  yellowLight: 'rgba(202, 138, 4, 0.08)',
  orange: '#EA580C',
  orangeLight: 'rgba(234, 88, 12, 0.08)',
  indigo: '#4F46E5',
  indigoLight: 'rgba(79, 70, 229, 0.06)',
  indigoBorder: 'rgba(79, 70, 229, 0.19)',

  // Warning (SourcesPanel disclaimer)
  warningBg: '#FFFBEB',
  warningBorder: '#FDE68A',
  warningTitle: '#92400E',
  warningText: '#A16207',

  // Shadows
  shadowColor: '#1A1A2E',

  // Radius
  r8: 8,
  r12: 12,
  r16: 16,
  r20: 20,
  rFull: 999,
} as const;

// ─── Shadow presets ────────────────────────────────────────────
// Platform-aware: shadow* on native (iOS/Android), boxShadow on web (react-native-web 0.21+)
function mk(webCss: string, native: ViewStyle): ViewStyle {
  return (Platform.OS === 'web' ? { boxShadow: webCss } : native) as ViewStyle;
}

export const S = {
  /** Subtle card — used in selectors and tabs */
  subtleCard: mk('0px 2px 8px rgba(26, 26, 46, 0.06)', {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  }),
  /** Main card — used in ResultCard */
  card: mk('0px 4px 16px rgba(26, 26, 46, 0.06)', {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  }),
  /** Mode tab active */
  tab: mk('0px 1px 4px rgba(26, 26, 46, 0.06)', {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  }),
  /** Red CTA button */
  redBtn: mk('0px 4px 12px rgba(232, 57, 57, 0.25)', {
    shadowColor: '#E83939',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  }),
};
