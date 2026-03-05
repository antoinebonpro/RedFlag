import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';

import App from './App';
import { ADS_CONFIG } from './src/config/ads';

// ─── Suppress known react-native-web 0.21.x internal deprecation warnings ────
// These warnings come from react-native-web's own TouchableOpacity and
// AppContainer components (not our code) and cannot be fixed from user-land.
// Tracked upstream: https://github.com/necolas/react-native-web/issues
if (Platform.OS === 'web') {
  const _warn = console.warn.bind(console);
  console.warn = (...args: unknown[]) => {
    const msg = typeof args[0] === 'string' ? args[0] : '';
    if (msg.includes('props.pointerEvents is deprecated')) return;
    _warn(...args);
  };
}

// ─── Injection Google AdSense (web) ──────────────────────────────────────────
// Le script est injecté dynamiquement pour éviter un template HTML personnalisé
if (Platform.OS === 'web' && ADS_CONFIG.enabled) {
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS_CONFIG.adsense.publisherId}`;
  script.setAttribute('crossorigin', 'anonymous');
  document.head?.appendChild(script);
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
