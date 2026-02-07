import { ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';

import { Box } from '@/components/ui/box';
import { useAuth } from '@/contexts/auth-context';

export default function Index() {
  const { user, isLoading } = useAuth();

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

  return <Redirect href="/login" />;
}
