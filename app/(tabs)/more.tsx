import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MoreScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <Box
      className="flex-1 justify-center items-center bg-background-dark"
      style={{ paddingTop: insets.top, paddingBottom: tabBarHeight }}
    >
      <Text className="text-2xl font-bold text-typography-0">더보기</Text>
      <Text className="mt-2 text-base text-typography-400">Coming soon</Text>
    </Box>
  );
}
