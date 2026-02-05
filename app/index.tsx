import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function Index() {
  const { user, isLoading } = useAuth();
  const tintColor = useThemeColor({ light: '#0a7ea4', dark: '#fff' }, 'tint');

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color={tintColor} />
      </ThemedView>
    );
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
