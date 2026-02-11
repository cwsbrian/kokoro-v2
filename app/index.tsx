import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';

import { Box } from '@/components/ui/box';
import { useAuth } from '@/contexts/auth-context';

const ONBOARDING_DONE_KEY = '@kokoro/onboarding_done';

export default function Index() {
  const { user, isLoading } = useAuth();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(
    null
  );

  useEffect(() => {
    if (user != null) return;
    if (__DEV__) {
      setHasSeenOnboarding(false);
      return;
    }
    AsyncStorage.getItem(ONBOARDING_DONE_KEY).then((value) => {
      setHasSeenOnboarding(value === 'true');
    });
  }, [user]);

  if (isLoading) {
    return (
      <Box className="flex-1 justify-center items-center bg-background-0">
        <ActivityIndicator size="large" color="#0a7ea4" />
      </Box>
    );
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  if (__DEV__) {
    return <Redirect href="/onboarding" />;
  }

  if (hasSeenOnboarding === null) {
    return (
      <Box className="flex-1 justify-center items-center bg-background-0">
        <ActivityIndicator size="large" color="#0a7ea4" />
      </Box>
    );
  }

  return hasSeenOnboarding ? (
    <Redirect href="/login" />
  ) : (
    <Redirect href="/onboarding" />
  );
}
