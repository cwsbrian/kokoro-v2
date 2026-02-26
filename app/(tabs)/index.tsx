import { MRT } from "@/constants/analysis";
import { useAuth } from "@/contexts/auth-context";
import { loadPoemsFromJSON } from "@/data/poemsLoader";
import { getTodayPoemIndex } from "@/lib/getTodayPoemIndex";
import { triggerAnalysisIfNeeded } from "@/lib/triggerAnalysis";
import { useAppStore } from "@/store/useAppStore";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, ImageBackground } from "react-native";

import { SwipeablePoemCard } from "@/components/SwipeablePoemCard";
import { Box } from "@/components/ui/box";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";

// 이미지 URL 생성 함수 (카드 인덱스 기반)
const getImageUrl = (index: number) => {
  return `https://picsum.photos/1080/1920?random=${index}`;
};

/** 오늘의 시를 첫 장으로, 나머지는 랜덤 순서 (Fisher–Yates) */
function poemsWithTodayFirst<T>(poems: T[], todayIndex: number): T[] {
  if (poems.length <= 1) return [...poems];
  const first = poems[todayIndex];
  const rest = poems.filter((_, i) => i !== todayIndex);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return [first, ...rest];
}

export default function HomeScreen() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const preloadedImagesRef = useRef<Set<number>>(new Set());

  const poems = useAppStore((s) => s.poems);
  const currentCardIndex = useAppStore((s) => s.currentCardIndex);
  const responseCount = useAppStore((s) => s.responseCount);
  const loadPoems = useAppStore((s) => s.loadPoems);
  const loadAndShufflePoems = useAppStore((s) => s.loadAndShufflePoems);
  const swipeCard = useAppStore((s) => s.swipeCard);
  const setUserId = useAppStore((s) => s.setUserId);
  const getAnalysisResult = useAppStore((s) => s.getAnalysisResult);
  const shufflePoems = useAppStore((s) => s.shufflePoems);
  const pendingPoemId = useAppStore((s) => s.pendingPoemId);
  const setPendingPoemId = useAppStore((s) => s.setPendingPoemId);
  const setCurrentCardIndex = useAppStore((s) => s.setCurrentCardIndex);

  // selector로 현재 카드 구독 → poems/currentCardIndex 변경 시 올바른 카드 반영
  const currentCard = useAppStore((state) => {
    const { poems: p, currentCardIndex: idx } = state;
    if (!p?.length || idx < 0 || idx >= p.length) return null;
    return p[idx];
  });

  const tabBarHeight = useBottomTabBarHeight();

  // Firebase user → store (auth state may resolve after first paint)
  useEffect(() => {
    if (user) setUserId(user.uid);
    else setUserId(null);
  }, [user, setUserId]);

  const initializeApp = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. userId는 useAuth().user → useEffect에서 setUserId로 동기화됨

      // 2. 시 카드 로드 (알림 진입 시: 오늘의 시 첫 장, 나머지 랜덤 / 일반: 전부 랜덤)
      const loadedPoems = await loadPoemsFromJSON();
      const fromNotification = useAppStore.getState().pendingPoemId != null;
      if (fromNotification) {
        const todayIndex = getTodayPoemIndex(loadedPoems);
        const ordered = poemsWithTodayFirst(loadedPoems, todayIndex);
        loadPoems(ordered);
        setCurrentCardIndex(0);
        setPendingPoemId(null);
      } else {
        loadAndShufflePoems(loadedPoems);
      }

      setIsLoading(false);
    } catch (err: unknown) {
      console.error("Initialization error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "앱 초기화 중 오류가 발생했습니다.";
      setError(errorMessage);
      setIsLoading(false);
    }
  }, [loadPoems, loadAndShufflePoems, setCurrentCardIndex, setPendingPoemId]);

  // 초기화
  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  // 알림으로 진입 후 시 탭에 포커스될 때 해당 시 표시 (앱이 이미 열려 있을 때만; cold start는 initializeApp에서 처리)
  useFocusEffect(
    useCallback(() => {
      if (!pendingPoemId || poems.length === 0) return;
      loadPoemsFromJSON()
        .then((loadedPoems) => {
          const todayIndex = getTodayPoemIndex(loadedPoems);
          const ordered = poemsWithTodayFirst(loadedPoems, todayIndex);
          loadPoems(ordered);
          setCurrentCardIndex(0);
          setPendingPoemId(null);
        })
        .catch((err) => {
          console.error("Failed to load poem from notification:", err);
        });
    }, [
      pendingPoemId,
      poems.length,
      loadPoems,
      setCurrentCardIndex,
      setPendingPoemId,
    ]),
  );

  // 이미지 프리로딩 함수
  const preloadImages = useCallback(
    async (startIndex: number, count: number = 3) => {
      for (let i = 1; i <= count; i++) {
        const targetIndex = startIndex + i;
        // poems 배열 범위를 벗어나지 않고, 아직 프리로드하지 않은 이미지만 로드
        if (
          targetIndex < poems.length &&
          !preloadedImagesRef.current.has(targetIndex)
        ) {
          try {
            const imageUrl = getImageUrl(targetIndex);
            await Image.prefetch(imageUrl);
            preloadedImagesRef.current.add(targetIndex);
            if (__DEV__) {
              console.log(`Preloaded image for index ${targetIndex}`);
            }
          } catch (error) {
            console.warn(
              `Failed to preload image for index ${targetIndex}:`,
              error,
            );
          }
        }
      }
    },
    [poems.length],
  );

  // currentCardIndex 변경 시 다음 이미지들 프리로드
  useEffect(() => {
    if (poems.length > 0 && currentCardIndex >= 0) {
      preloadImages(currentCardIndex, 5);
    }
  }, [currentCardIndex, poems.length, preloadImages]);

  const handleSwipe = (direction: "right" | "left") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    swipeCard(direction);
    triggerAnalysisIfNeeded();
  };

  const handleViewResults = () => {
    const result = getAnalysisResult();
    if (result.canShowResults) {
      // router.push('/results');
    }
  };

  const result = getAnalysisResult();

  useEffect(() => {
    if (__DEV__ && currentCard) {
      console.log("Card state updated:", {
        currentCardIndex,
        currentCardId: currentCard.Poem_ID,
        Tag: currentCard.Tag,
        totalPoems: poems.length,
      });
    }
  }, [currentCardIndex, poems, currentCard]);

  if (isLoading) {
    return (
      <Box className="flex-1 justify-center items-center bg-background-dark">
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text className="mt-4 text-base text-typography-0 dark:text-typography-900">
          로딩 중...
        </Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="flex-1 justify-center items-center bg-background-dark p-6">
        <Text className="text-base text-error-500 text-center mb-6">
          {error}
        </Text>
        <Pressable
          className="bg-primary-500 px-6 py-3 rounded-lg"
          onPress={initializeApp}
        >
          <Text className="text-typography-0 dark:text-typography-900 text-base font-semibold">
            다시 시도
          </Text>
        </Pressable>
      </Box>
    );
  }

  if (!currentCard) {
    return (
      <Box className="flex-1 justify-center items-center bg-background-dark p-6">
        <Text className="text-lg text-typography-0 dark:text-typography-900 text-center mb-6">
          모든 시 카드를 확인했습니다.
        </Text>
        <Pressable
          className="bg-primary-500 px-6 py-3 rounded-lg"
          onPress={() => {
            shufflePoems();
          }}
        >
          <Text className="text-typography-0 dark:text-typography-900 text-base font-semibold">
            다시 시작
          </Text>
        </Pressable>
      </Box>
    );
  }

  // 현재 카드 인덱스 기반 안정적인 이미지 URL
  const currentImageUrl = getImageUrl(currentCardIndex);

  return (
    <ImageBackground
      source={{ uri: currentImageUrl }}
      className="flex-1 bg-black"
      resizeMode="cover"
    >
      <Box className="absolute inset-0 bg-transparent" />
      <BlurView intensity={20} style={{ flex: 1, paddingBottom: tabBarHeight }}>
        {/* Header */}
        <Box className="flex-row justify-between items-center px-5 pt-[60px] pb-5">
          <Box className="flex-row items-center gap-3">
            <Text className="text-sm text-typography-0 dark:text-typography-900 bg-black/50 px-2 py-1 rounded-xl">
              {responseCount >= MRT ? responseCount : `${responseCount}/${MRT}`}{" "}
              회
            </Text>
          </Box>
          <Box className="flex-row items-center gap-3">
            <Pressable
              className={`px-4 py-2 rounded-lg ${
                result.canShowResults
                  ? "bg-primary-500"
                  : "bg-black/50 opacity-50"
              }`}
              onPress={handleViewResults}
              disabled={!result.canShowResults}
            >
              <Text className="text-typography-0 dark:text-typography-900 text-sm font-semibold">
                결과
              </Text>
            </Pressable>
          </Box>
        </Box>

        {/* Card Stack */}
        <Box className="flex-1 justify-center items-center py-10 relative">
          {/* 현재 카드 */}
          {currentCard && (
            <SwipeablePoemCard
              key={`current-${currentCardIndex}`}
              card={currentCard}
              index={currentCardIndex}
              onSwipe={handleSwipe}
              isActive={true}
            />
          )}
        </Box>
      </BlurView>
    </ImageBackground>
  );
}
