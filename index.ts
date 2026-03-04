import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';

import App from './App';

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

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
