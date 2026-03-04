import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { C } from '../constants/theme';

interface State { hasError: boolean; message: string }

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // In production you'd send this to a monitoring service (Sentry, etc.)
    console.error('[RedFlag] Uncaught error:', error, info.componentStack);
  }

  handleReset = () => this.setState({ hasError: false, message: '' });

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>⚠️</Text>
        <Text style={styles.title}>Une erreur est survenue</Text>
        <Text style={styles.message}>{this.state.message}</Text>
        <TouchableOpacity
          style={styles.btn}
          onPress={this.handleReset}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>Réessayer</Text>
        </TouchableOpacity>
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
  title: { fontSize: 20, fontWeight: '800', color: C.text, textAlign: 'center' },
  message: {
    fontSize: 13,
    color: C.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
  },
  btn: {
    marginTop: 8,
    backgroundColor: C.red,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: C.r12,
  },
  btnText: { fontSize: 15, fontWeight: '700', color: C.textOnRed },
});
