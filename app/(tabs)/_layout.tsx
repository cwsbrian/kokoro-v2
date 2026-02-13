import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Text } from "@/components/ui/text";

function TabBarBackgroundPoem() {
  return (
    <>
      <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
      <View className="absolute inset-0 bg-black/20" />
    </>
  );
}

const TAB_BAR_ICON_WHITE = "#FFFFFF";
const TAB_BAR_INACTIVE_WHITE = "rgba(255, 255, 255, 0.7)";

const DEFAULT_TAB_ACTIVE = "#11181C";
const DEFAULT_TAB_INACTIVE = "#687076";
const DEFAULT_TAB_ACTIVE_DARK = "#ECEDEE";
const DEFAULT_TAB_INACTIVE_DARK = "#9BA1A6";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const defaultTabBarStyle = {
    position: "absolute" as const,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: isDark ? "#151718" : "#FFFFFF",
    borderTopWidth: 0,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    paddingTop: 12,
    paddingBottom: (Platform.OS === "ios" ? insets.bottom : 16) + 12,
  };

  const poemTabBarStyle = {
    position: "absolute" as const,
    backgroundColor: "transparent",
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 28,
    overflow: "hidden" as const,
    justifyContent: "center" as const,
    paddingTop: insets.bottom,
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: true,
        tabBarItemStyle: { alignItems: "center", justifyContent: "center" },
        tabBarLabelStyle: { textAlign: "center" },
        tabBarIconStyle: { marginBottom: 0 },
        tabBarLabel: ({ color, children }) => (
          <Text
            className="text-center text-xs"
            style={{ color }}
          >
            {children}
          </Text>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "시",
          tabBarActiveTintColor: TAB_BAR_ICON_WHITE,
          tabBarInactiveTintColor: TAB_BAR_INACTIVE_WHITE,
          tabBarStyle: poemTabBarStyle,
          tabBarBackground: () => <TabBarBackgroundPoem />,
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={focused ? 28 : 26}
              name="book.fill"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="fortune"
        options={{
          title: "운세",
          tabBarActiveTintColor: isDark ? DEFAULT_TAB_ACTIVE_DARK : DEFAULT_TAB_ACTIVE,
          tabBarInactiveTintColor: isDark ? DEFAULT_TAB_INACTIVE_DARK : DEFAULT_TAB_INACTIVE,
          tabBarStyle: defaultTabBarStyle,
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={focused ? 28 : 26}
              name="sparkles"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "나",
          tabBarActiveTintColor: isDark ? DEFAULT_TAB_ACTIVE_DARK : DEFAULT_TAB_ACTIVE,
          tabBarInactiveTintColor: isDark ? DEFAULT_TAB_INACTIVE_DARK : DEFAULT_TAB_INACTIVE,
          tabBarStyle: defaultTabBarStyle,
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={focused ? 28 : 26}
              name="person.fill"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "더보기",
          tabBarActiveTintColor: isDark ? DEFAULT_TAB_ACTIVE_DARK : DEFAULT_TAB_ACTIVE,
          tabBarInactiveTintColor: isDark ? DEFAULT_TAB_INACTIVE_DARK : DEFAULT_TAB_INACTIVE,
          tabBarStyle: defaultTabBarStyle,
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={focused ? 28 : 26}
              name="line.3.horizontal"
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
