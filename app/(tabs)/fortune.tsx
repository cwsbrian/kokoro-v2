import { FORTUNE_CATEGORIES } from "@/constants/fortune-categories";
import { useAppStore } from "@/store/useAppStore";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { Pressable, ScrollView } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import type { FortuneCategoryId, TodayFortuneCategoryItem } from "@/types";

const CARD_CATEGORY_IDS: FortuneCategoryId[] = [
  "love",
  "money",
  "work",
  "health",
  "relationship",
];

/** 운세 화면 포인트 컬러 (나 탭 primary와 통일) */
const FORTUNE_ACCENT = "#DB2777";
const withAlpha = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

export default function FortuneScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const paddingBottom = tabBarHeight + 24;

  const getAnalysisResult = useAppStore((s) => s.getAnalysisResult);
  const fetchTodayFortune = useAppStore((s) => s.fetchTodayFortune);
  const todayFortune = useAppStore((s) => s.todayFortune);
  const isFortuneLoading = useAppStore((s) => s.isFortuneLoading);
  const fortuneError = useAppStore((s) => s.fortuneError);
  const setFortuneError = useAppStore((s) => s.setFortuneError);

  const { canShowResults } = getAnalysisResult();
  const [expandedId, setExpandedId] = useState<FortuneCategoryId | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (canShowResults) fetchTodayFortune();
    }, [canShowResults, fetchTodayFortune]),
  );

  const spinValue = useSharedValue(0);
  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinValue.value}deg` }],
  }));
  React.useEffect(() => {
    if (isFortuneLoading) {
      spinValue.value = 0;
      spinValue.value = withRepeat(
        withTiming(360, { duration: 1200, easing: Easing.linear }),
        -1,
      );
    } else {
      spinValue.value = 0;
    }
  }, [isFortuneLoading, spinValue]);

  const handleRetry = () => {
    setFortuneError(null);
    fetchTodayFortune();
  };

  const handleGoToSwipe = () => {
    router.replace("/(tabs)");
  };

  // 분석 결과 없음
  if (!canShowResults) {
    return (
      <Box
        className="flex-1 bg-background-0"
        style={{ paddingTop: insets.top, paddingBottom }}
      >
        <Box className="flex-1 items-center justify-center px-6 py-12">
          <Box className="mb-6 h-16 w-16 items-center justify-center rounded-full bg-typography-200/20">
            <MaterialIcons name="touch-app" size={40} color="#64748B" />
          </Box>
          <Text
            className="text-center text-xl font-bold text-typography-0"
            accessibilityLabel="운세를 보려면 먼저 시 스와이프가 필요합니다"
          >
            먼저 시를 스와이프해 나를 분석해 주세요
          </Text>
          <Text className="mt-3 text-center text-base text-typography-400">
            나에 대한 분석이 있으면 오늘의 운세를 볼 수 있어요.
          </Text>
          <Button className="mt-6" size="lg" onPress={handleGoToSwipe}>
            <ButtonText>시 탭에서 스와이프하기</ButtonText>
          </Button>
        </Box>
      </Box>
    );
  }

  // 로딩
  if (isFortuneLoading && !todayFortune) {
    return (
      <Box
        className="flex-1 bg-background-0"
        style={{ paddingTop: insets.top, paddingBottom }}
      >
        <Box className="flex-1 items-center justify-center px-4 py-12">
          <Box className="mb-6 h-16 w-16 items-center justify-center rounded-full bg-primary-500/20">
            <Animated.View style={spinStyle}>
              <MaterialIcons name="hourglass-empty" size={40} color="#64748B" />
            </Animated.View>
          </Box>
          <Text className="text-center text-base text-typography-400">
            오늘의 운세를 불러오는 중이에요.
          </Text>
        </Box>
      </Box>
    );
  }

  // 에러 (오늘 데이터 없을 때만 에러 UI)
  if (fortuneError && !todayFortune) {
    return (
      <Box
        className="flex-1 bg-background-0"
        style={{ paddingTop: insets.top, paddingBottom }}
      >
        <Box className="flex-1 items-center justify-center px-4 py-12">
          <Box className="mb-6 h-16 w-16 items-center justify-center rounded-full bg-error-500/20">
            <MaterialIcons name="error-outline" size={40} color="#EF4444" />
          </Box>
          <Text className="text-center text-xl font-bold text-typography-0">
            오늘의 운세를 불러오지 못했어요
          </Text>
          <Text className="mt-3 text-center text-base text-typography-400">
            {fortuneError}
          </Text>
          <Button className="mt-6" size="lg" onPress={handleRetry}>
            <ButtonText>다시 시도</ButtonText>
          </Button>
        </Box>
      </Box>
    );
  }

  // 성공: 한 화면에 총운 → 카드 → 행운 → 주의 (포인트 컬러 적용)
  if (!todayFortune) return null;

  return (
    <Box
      className="flex-1 bg-background-0"
      style={{ paddingTop: insets.top, paddingBottom }}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* 히어로: 제목만, 뒤에 부드러운 원형 포인트 */}

        <Text
          className="text-xl font-bold text-typography-700 mt-5"
          accessibilityLabel="오늘의 운세"
        >
          오늘의 운세
        </Text>

        {/* 총운: 왼쪽 포인트 라인 + 연한 배경 */}
        <Box
          className="mt-6 rounded-xl border-l-4 p-4 dark:bg-background-800/80"
          style={{
            borderLeftColor: FORTUNE_ACCENT,
            backgroundColor: withAlpha(FORTUNE_ACCENT, 0.06),
          }}
          accessibilityLabel={`총운: ${todayFortune.total}`}
        >
          <Text className="text-lg font-medium leading-relaxed text-typography-700 dark:text-typography-200">
            {todayFortune.total}
          </Text>
        </Box>

        {/* 행운: 섹션 라벨 + 칩 포인트 컬러 */}
        {todayFortune.luck &&
          (todayFortune.luck.color ||
            todayFortune.luck.number != null ||
            todayFortune.luck.direction ||
            todayFortune.luck.time) && (
            <Box className="mt-8 mb-5" accessibilityLabel="행운 정보">
              <Box className="flex-row items-center gap-2">
                <MaterialIcons name="stars" size={18} color={FORTUNE_ACCENT} />
                <Text
                  className="text-sm font-semibold"
                  style={{ color: FORTUNE_ACCENT }}
                >
                  행운
                </Text>
              </Box>
              <Box className="mt-2 flex-row flex-wrap gap-2">
                {todayFortune.luck.color && (
                  <Box
                    className="rounded-full border px-3 py-1.5"
                    style={{
                      borderColor: withAlpha(FORTUNE_ACCENT, 0.5),
                      backgroundColor: withAlpha(FORTUNE_ACCENT, 0.12),
                    }}
                  >
                    <Text
                      className="text-xs font-medium"
                      style={{ color: FORTUNE_ACCENT }}
                    >
                      색: {todayFortune.luck.color}
                    </Text>
                  </Box>
                )}
                {todayFortune.luck.number != null && (
                  <Box
                    className="rounded-full border px-3 py-1.5"
                    style={{
                      borderColor: withAlpha(FORTUNE_ACCENT, 0.5),
                      backgroundColor: withAlpha(FORTUNE_ACCENT, 0.12),
                    }}
                  >
                    <Text
                      className="text-xs font-medium"
                      style={{ color: FORTUNE_ACCENT }}
                    >
                      숫자: {todayFortune.luck.number}
                    </Text>
                  </Box>
                )}
                {todayFortune.luck.direction && (
                  <Box
                    className="rounded-full border px-3 py-1.5"
                    style={{
                      borderColor: withAlpha(FORTUNE_ACCENT, 0.5),
                      backgroundColor: withAlpha(FORTUNE_ACCENT, 0.12),
                    }}
                  >
                    <Text
                      className="text-xs font-medium"
                      style={{ color: FORTUNE_ACCENT }}
                    >
                      방향: {todayFortune.luck.direction}
                    </Text>
                  </Box>
                )}
                {todayFortune.luck.time && (
                  <Box
                    className="rounded-full border px-3 py-1.5"
                    style={{
                      borderColor: withAlpha(FORTUNE_ACCENT, 0.5),
                      backgroundColor: withAlpha(FORTUNE_ACCENT, 0.12),
                    }}
                  >
                    <Text
                      className="text-xs font-medium"
                      style={{ color: FORTUNE_ACCENT }}
                    >
                      시간: {todayFortune.luck.time}
                    </Text>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        {/* 카테고리 카드: 아이콘 포인트 컬러, 카드 왼쪽 얇은 라인 */}
        {CARD_CATEGORY_IDS.map((id) => {
          const cat = FORTUNE_CATEGORIES.find((c) => c.id === id);
          const item = todayFortune[id] as TodayFortuneCategoryItem | undefined;
          if (!cat || !item) return null;
          const isExpanded = expandedId === id;
          const hasDetail = !!item.detail?.trim();
          return (
            <Pressable
              key={id}
              onPress={() => setExpandedId((prev) => (prev === id ? null : id))}
              className="mt-3 overflow-hidden rounded-xl border-l-2 bg-background-50 p-4 dark:bg-background-800"
              style={{ borderLeftColor: withAlpha(FORTUNE_ACCENT, 0.4) }}
              accessibilityLabel={`${cat.name}: ${item.summary}`}
              accessibilityState={{ expanded: isExpanded }}
            >
              <Box className="flex-row items-center gap-2">
                <MaterialIcons
                  name={cat.icon as keyof typeof MaterialIcons.glyphMap}
                  size={22}
                  color={FORTUNE_ACCENT}
                />
                <Text
                  className="text-sm font-semibold"
                  style={{ color: FORTUNE_ACCENT }}
                >
                  {cat.name}
                </Text>
                {hasDetail && (
                  <MaterialIcons
                    name={isExpanded ? "expand-less" : "expand-more"}
                    size={20}
                    color="#64748B"
                  />
                )}
              </Box>
              <Text className="mt-2 text-base leading-relaxed text-typography-700 dark:text-typography-200">
                {item.summary}
              </Text>
              {hasDetail && isExpanded && (
                <Text className="mt-2 text-sm leading-relaxed text-typography-500 dark:text-typography-400">
                  {item.detail}
                </Text>
              )}
            </Pressable>
          );
        })}

        {/* 주의: 왼쪽 경고 톤 라인 */}
        {todayFortune.caution?.trim() && (
          <Box
            className="mt-6 rounded-xl border-l-4 bg-background-50 py-3 pl-4 pr-4 dark:bg-background-800"
            style={{ borderLeftColor: withAlpha("#D97706", 0.8) }}
            accessibilityLabel={`주의: ${todayFortune.caution}`}
          >
            <Text className="text-sm leading-relaxed text-typography-700 dark:text-typography-200">
              {todayFortune.caution}
            </Text>
          </Box>
        )}
      </ScrollView>
    </Box>
  );
}
