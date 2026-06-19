import { Platform } from 'react-native';

// ─── Privacy & consent bootstrap ─────────────────────────────────────────────
//
// This module is safe to call on every platform; calls become no-ops where
// the underlying SDK isn't available (web, missing module, etc.).
//
// Order of operations on iOS / Android:
//   1. Request ATT (App Tracking Transparency) — iOS 14.5+ only
//   2. Request UMP (User Messaging Platform) consent info — required for AdMob in EEA
//   3. Show consent form if required
//
// The app should call `bootstrapAdsAndConsent()` once at startup, before any
// ads are loaded.

async function requestATT(): Promise<void> {
  if (Platform.OS !== 'ios') return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const TT = require('expo-tracking-transparency');
    if (TT?.requestTrackingPermissionsAsync) {
      await TT.requestTrackingPermissionsAsync();
    }
  } catch {
    // Module not installed or failed — silent fail
  }
}

async function requestUMPConsent(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Ads = require('react-native-google-mobile-ads');
    const { AdsConsent } = Ads;
    if (!AdsConsent) return;

    await AdsConsent.requestInfoUpdate();

    // Show form only if required (EEA / regulated regions)
    if (typeof AdsConsent.loadAndShowConsentFormIfRequired === 'function') {
      await AdsConsent.loadAndShowConsentFormIfRequired();
    }
  } catch {
    // Module not available, network error, etc.
  }
}

async function initializeMobileAds(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mobileAds = require('react-native-google-mobile-ads').default;
    if (mobileAds) await mobileAds().initialize();
  } catch {
    // ignore
  }
}

export async function bootstrapAdsAndConsent(): Promise<void> {
  // ATT first (iOS) so the user has already made the tracking choice when
  // UMP shows its consent form.
  await requestATT();
  await requestUMPConsent();
  await initializeMobileAds();
}
