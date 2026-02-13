import { useAuth } from "@/contexts/auth-context";
import { loadPoemsFromJSON } from "@/data/poemsLoader";
import { useAppStore } from "@/store/useAppStore";
import { MRT } from "@/utils/scoreCalculator";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SwipeablePoemCard } from "@/components/SwipeablePoemCard";

// 이미지 URL 생성 함수 (카드 인덱스 기반)
const getImageUrl = (index: number) => {
  return `https://picsum.photos/1080/1920?random=${index}`;
};

export default function HomeScreen() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const preloadedImagesRef = useRef<Set<number>>(new Set());

  const poems = useAppStore((s) => s.poems);
  const currentCardIndex = useAppStore((s) => s.currentCardIndex);
  const responseCount = useAppStore((s) => s.responseCount);
  const loadAndShufflePoems = useAppStore((s) => s.loadAndShufflePoems);
  const swipeCard = useAppStore((s) => s.swipeCard);
  const setUserId = useAppStore((s) => s.setUserId);
  const getAnalysisResult = useAppStore((s) => s.getAnalysisResult);
  const shufflePoems = useAppStore((s) => s.shufflePoems);

  // selector로 현재 카드 구독 → poems/currentCardIndex 변경 시 올바른 카드 반영
  const currentCard = useAppStore((state) => {
    const { poems: p, currentCardIndex: idx } = state;
    if (!p?.length || idx < 0 || idx >= p.length) return null;
    return p[idx];
  });

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

      // 2. 시 카드 로드 + 셔플 (한 번에 처리해 스토어 타이밍 이슈 방지)
      const loadedPoems = await loadPoemsFromJSON();
      loadAndShufflePoems(loadedPoems);

      // Firestore 동기화는 1단계에서 제외 (옵션 A)

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
  }, [loadAndShufflePoems]);

  // 초기화
  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

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
    // 햅틱 피드백
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    swipeCard(direction);
  };

  const handleViewResults = () => {
    const result = getAnalysisResult();
    if (result.canShowResults) {
      // router.push('/results');
    }
  };

  const result = getAnalysisResult();

  // 디버깅: 현재 카드 태그 확인 (Logic만 나오는지 검증용)
  useEffect(() => {
    if (__DEV__ && currentCard) {
      console.log("Card state updated:", {
        currentCardIndex,
        currentCardId: currentCard.Poem_ID,
        Kisho_Tag: currentCard.Kisho_Tag,
        totalPoems: poems.length,
      });
    }
  }, [currentCardIndex, poems, currentCard]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>로딩 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={initializeApp}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentCard) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>모든 시 카드를 확인했습니다.</Text>
        <TouchableOpacity
          style={styles.restartButton}
          onPress={() => {
            shufflePoems();
          }}
        >
          <Text style={styles.restartButtonText}>다시 시작</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 현재 카드 인덱스 기반 안정적인 이미지 URL
  const currentImageUrl = getImageUrl(currentCardIndex);

  return (
    <ImageBackground
      source={{ uri: currentImageUrl }}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <BlurView intensity={20} style={styles.blurOverlay}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* <Text style={styles.appTitle}>Kokoro</Text> */}
            <Text style={styles.responseCount}>
              {responseCount >= MRT ? responseCount : `${responseCount}/${MRT}`}{" "}
              회
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[
                styles.resultButton,
                !result.canShowResults && styles.resultButtonDisabled,
              ]}
              onPress={handleViewResults}
              disabled={!result.canShowResults}
            >
              <Text style={styles.resultButtonText}>결과</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Card Stack */}
        <View style={styles.cardStack}>
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
        </View>
      </BlurView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.0)",
  },
  blurOverlay: {
    flex: 1,
    // backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#FFFFFF",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: "#F44336",
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 24,
  },
  restartButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  restartButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  responseCount: {
    fontSize: 14,
    color: "#ffffff",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  userId: {
    fontSize: 12,
    color: "#CCCCCC",
    maxWidth: 80,
  },
  resultButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  resultButtonDisabled: {
    backgroundColor: "#000",
    opacity: 0.5,
  },
  resultButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  cardStack: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    position: "relative",
  },
  nextCardContainer: {
    position: "absolute",
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
    zIndex: 0,
  },
});
