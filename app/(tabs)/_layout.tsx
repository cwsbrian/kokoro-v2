import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';

function TabBarBackground() {
  return (
    <>
      <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
      <View className="absolute inset-0 bg-black/20" />
    </>
  );
}

const TAB_BAR_ICON_WHITE = '#FFFFFF';
const TAB_BAR_INACTIVE_WHITE = 'rgba(255, 255, 255, 0.7)';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: TAB_BAR_ICON_WHITE,
        tabBarInactiveTintColor: TAB_BAR_INACTIVE_WHITE,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: true,
        tabBarItemStyle: { alignItems: 'center', justifyContent: 'center' },
        tabBarLabelStyle: { textAlign: 'center' },
        tabBarIconStyle: { marginBottom: 0 },
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          marginHorizontal: 20,
          marginBottom: 16,
          borderRadius: 28,
          overflow: 'hidden',
          justifyContent: 'center',
          paddingTop: insets.bottom,
        },
        tabBarBackground: () => <TabBarBackground />,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={focused ? 28 : 26} name="heart.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="fortune"
        options={{
          title: '운세',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={focused ? 28 : 26} name="sparkles" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: '계정',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={focused ? 28 : 26} name="person.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: '더보기',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={focused ? 28 : 26} name="line.3.horizontal" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
