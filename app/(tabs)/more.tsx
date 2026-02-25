import { privacyUrl, storeLink, termsUrl } from "@/constants/app";
import { useAuth } from "@/contexts/auth-context";
import {
  triggerTestFortuneNotification,
  triggerTestPoemNotification,
} from "@/lib/notifications";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import Constants from "expo-constants";
import { router } from "expo-router";
import React, { useState } from "react";
import { Linking, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Box } from "@/components/ui/box";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";

const SECTION_HEADER =
  "text-sm font-semibold text-typography-400 uppercase tracking-wide";
const ROW_CLASS =
  "mt-3 overflow-hidden rounded-xl border-l-2 border-outline-200 bg-background-50 p-4 dark:border-outline-700 dark:bg-background-100";

function openUrl(url: string) {
  Linking.openURL(url).catch(() => {});
}

export default function MoreScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { logout } = useAuth();
  const [fortuneLoading, setFortuneLoading] = useState(false);
  const [poemLoading, setPoemLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  const handleTestFortune = async () => {
    setFortuneLoading(true);
    try {
      await triggerTestFortuneNotification();
    } finally {
      setFortuneLoading(false);
    }
  };

  const handleTestPoem = async () => {
    setPoemLoading(true);
    try {
      await triggerTestPoemNotification();
    } finally {
      setPoemLoading(false);
    }
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await logout();
      // 로그인 화면으로 직접 이동 (인덱스 리다이렉트 타이밍 이슈 회피)
      router.replace("/(auth)/login");
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <Box
      className="flex-1 bg-background-0"
      style={{ paddingTop: insets.top, paddingBottom: tabBarHeight }}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Box className="pb-2 pt-6">
          <Text className="text-2xl font-bold text-typography-900">더보기</Text>
          <Text className="mt-1 text-base text-typography-400">
            설정 및 기타 메뉴
          </Text>
        </Box>

        {/* 알림 테스트 (개발 빌드에서만 노출) */}
        {__DEV__ && (
          <Box className="mt-8">
            <Text className={SECTION_HEADER}>알림</Text>
            <Text className="mt-1 text-typography-500 text-sm">
              탭 시 해당 화면으로 이동하는지 확인할 수 있습니다.
            </Text>
            <Box className="mt-4 flex-row gap-3">
              <Pressable
                className="flex-1 rounded-xl bg-primary-500 py-3"
                onPress={handleTestFortune}
                disabled={fortuneLoading}
              >
                <Text className="text-center font-semibold text-typography-0 dark:text-typography-900">
                  {fortuneLoading ? "발송 중…" : "운세 알림 보내기"}
                </Text>
              </Pressable>
              <Pressable
                className="flex-1 rounded-xl bg-primary-500 py-3"
                onPress={handleTestPoem}
                disabled={poemLoading}
              >
                <Text className="text-center font-semibold text-typography-0 dark:text-typography-900">
                  {poemLoading ? "발송 중…" : "오늘의 시 알림 보내기"}
                </Text>
              </Pressable>
            </Box>
          </Box>
        )}

        {/* 정보 */}
        <Box className="mt-8">
          <Text className={SECTION_HEADER}>정보</Text>
          {termsUrl ? (
            <Pressable onPress={() => openUrl(termsUrl)} className={ROW_CLASS}>
              <Text className="text-base font-medium text-typography-900">
                이용약관
              </Text>
            </Pressable>
          ) : null}
          {privacyUrl ? (
            <Pressable
              onPress={() => openUrl(privacyUrl)}
              className={ROW_CLASS}
            >
              <Text className="text-base font-medium text-typography-900">
                개인정보처리방침
              </Text>
            </Pressable>
          ) : null}
          {storeLink ? (
            <Pressable onPress={() => openUrl(storeLink)} className={ROW_CLASS}>
              <Text className="text-base font-medium text-typography-900">
                스토어에서 보기
              </Text>
            </Pressable>
          ) : null}
        </Box>

        {/* 버전 */}
        <Box className="mt-8 items-center pb-4">
          <Text className="text-sm text-typography-500">버전 {appVersion}</Text>
        </Box>
        {/* 로그아웃: 화면 하단 중앙, 빨간 버튼 (더보기는 로그인 후 진입하므로 항상 표시) */}
        <Box className="mt-10" style={{ paddingBottom: 16, zIndex: 10 }}>
          <Pressable
            onPress={handleLogout}
            disabled={logoutLoading}
            className="min-w-[200px] rounded-xl bg-error-500 px-8 py-3"
          >
            <Text className="text-center font-semibold text-typography-0 dark:text-typography-900">
              {logoutLoading ? "로그아웃 중…" : "로그아웃"}
            </Text>
          </Pressable>
        </Box>
      </ScrollView>
    </Box>
  );
}
