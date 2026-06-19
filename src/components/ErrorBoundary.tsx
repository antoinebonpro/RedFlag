import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { C } from '../constants/theme';

interface State {
  hasError: boolean;
  message: string;
  errorCount: number;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { hasError: false, message: '', errorCount: 0 };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      // Only expose technical details in dev. Generic message in production.
      message: __DEV__ ? error.message : '',
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // In production, hook a monitoring service here (Sentry, Crashlytics, etc.)
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.error('[RedFlag] Uncaught error:', error, info.componentStack);
    } else {
      // eslint-disable-next-line no-console
      console.error('[RedFlag] Error captured');
    }
    this.setState((s) => ({ errorCount: s.errorCount + 1 }));
  }

  handleReset = () => {
    // Hard guard against infinite loops: if the same error keeps happening,
    // suggest restarting the app instead of retrying.
    if (this.state.errorCount >= 3) return;
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const stuck = this.state.errorCount >= 3;

    return (
      <View
        style={styles.container}
        accessible
        accessibilityRole="alert"
        accessibilityLiveRegion="assertive"
      >
        <Text style={styles.emoji} allowFontScaling={false}>
          ⚠️
        </Text>
        <Text style={styles.title} allowFontScaling>
          Une erreur est survenue
        </Text>
        <Text style={styles.message} allowFontScaling>
          {stuck
            ? 'Veuillez fermer puis rouvrir l’application.'
            : 'Désolé pour la gêne. Tu peux réessayer.'}
        </Text>
        {__DEV__ && this.state.message ? (
          <Text style={styles.devMessage} allowFontScaling>
            [DEV] {this.state.message}
          </Text>
        ) : null}
        {!stuck && (
          <TouchableOpacity
            style={styles.btn}
            onPress={this.handleReset}
            activeOpacity={0.8}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Réessayer"
          >
            <Text style={styles.btnText} allowFontScaling>
              Réessayer
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: C.bgCard,
    gap: 12,
  },
  emoji: { fontSize: 48 },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: C.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  devMessage: {
    fontSize: 12,
    color: C.textTertiary,
    textAlign: 'center',
    fontFamily: 'monospace',
    marginTop: 4,
  },
  btn: {
    marginTop: 8,
    backgroundColor: C.red,
    paddingHorizontal: 28,
    paddingVertical: 14,
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: C.r12,
  },
  btnText: { fontSize: 15, fontWeight: '700', color: C.textOnRed },
});
