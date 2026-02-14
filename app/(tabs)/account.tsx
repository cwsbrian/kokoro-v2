import { MRT } from "@/constants/analysis";
import { storeLink } from "@/constants/app";
import { triggerAnalysisIfNeeded } from "@/lib/triggerAnalysis";
import { useAppStore } from "@/store/useAppStore";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, Share } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DimensionsRadar } from "@/components/dimensions-radar";
import { Box } from "@/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { ShareIcon } from "@/components/ui/icon";
import { Progress, ProgressFilledTrack } from "@/components/ui/progress";
import { Text } from "@/components/ui/text";

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const getAnalysisResult = useAppStore((s) => s.getAnalysisResult);
  const responseCount = useAppStore((s) => s.responseCount);
  const analysisError = useAppStore((s) => s.analysisError);
  const isAnalysisLoading = useAppStore((s) => s.isAnalysisLoading);
  const setAnalysisError = useAppStore((s) => s.setAnalysisError);
  const avatarImageDataUrl = useAppStore((s) => s.avatarImageDataUrl);
  const [showResultsWithoutAvatar, setShowResultsWithoutAvatar] =
    useState(false);

  const result = getAnalysisResult();
  const { canShowResults, aiResult } = result;

  const avatarReadyOrGiveUp = !!avatarImageDataUrl || showResultsWithoutAvatar;

  useEffect(() => {
    if (!canShowResults || !aiResult) return;
    if (avatarImageDataUrl) {
      setShowResultsWithoutAvatar(false);
      return;
    }
    setShowResultsWithoutAvatar(false);
    const t = setTimeout(() => setShowResultsWithoutAvatar(true), 5000);
    return () => clearTimeout(t);
  }, [canShowResults, aiResult, avatarImageDataUrl]);

  const handleRetryAnalysis = () => {
    setAnalysisError(null);
    triggerAnalysisIfNeeded();
  };

  const handleShare = async () => {
    if (!aiResult) return;
    const message = [aiResult.label, aiResult.description, "", storeLink].join(
      "\n",
    );
    const hasFileUri =
      typeof avatarImageDataUrl === "string" &&
      avatarImageDataUrl.startsWith("file://");
    try {
      await Share.share({
        message,
        ...(hasFileUri && { url: avatarImageDataUrl }),
      });
    } catch {
      // User dismissed or share failed
    }
  };

  const progressValue = Math.min(1, responseCount / MRT);
  const paddingBottom = tabBarHeight + 24;

  const spinValue = useSharedValue(0);
  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinValue.value}deg` }],
  }));
  useEffect(() => {
    const shouldSpin =
      isAnalysisLoading ||
      (!!canShowResults && !!aiResult && !avatarReadyOrGiveUp);
    if (shouldSpin) {
      spinValue.value = 0;
      spinValue.value = withRepeat(
        withTiming(360, { duration: 1200, easing: Easing.linear }),
        -1,
      );
    } else {
      spinValue.value = 0;
    }
  }, [
    isAnalysisLoading,
    canShowResults,
    aiResult,
    avatarReadyOrGiveUp,
    spinValue,
  ]);

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
        {!canShowResults ? (
          <Box className="flex-1 items-center justify-center py-12">
            <Box className="mb-6 h-16 w-16 items-center justify-center rounded-full bg-typography-200/20">
              <MaterialIcons name="touch-app" size={40} color="#64748B" />
            </Box>
            <Text className="text-center text-xl font-bold text-typography-0">
              아직 결과를 만들기엔 스와이프가 부족해요
            </Text>
            <Text className="mt-3 text-center text-base text-typography-400">
              {responseCount} / {MRT}회 스와이프하면 나에 대한 결과를 볼 수
              있어요.
            </Text>
            <Box className="mt-6 w-full max-w-xs">
              <Progress
                value={progressValue * 100}
                size="md"
                className="w-full"
              >
                <ProgressFilledTrack />
              </Progress>
            </Box>
          </Box>
        ) : !aiResult ? (
          <Box className="flex-1 items-center justify-center px-4 py-12">
            {analysisError ? (
              <>
                <Box className="mb-6 h-16 w-16 items-center justify-center rounded-full bg-error-500/20">
                  <MaterialIcons
                    name="error-outline"
                    size={40}
                    color="#EF4444"
                  />
                </Box>
                <Text className="text-center text-xl font-bold text-typography-0">
                  분석에 실패했어요
                </Text>
                <Text className="mt-3 text-center text-base text-typography-400">
                  {analysisError}
                </Text>
                <Button
                  className="mt-6"
                  size="lg"
                  onPress={handleRetryAnalysis}
                >
                  <ButtonText>다시 시도하기</ButtonText>
                </Button>
              </>
            ) : (
              <>
                <Box className="mb-6 h-16 w-16 items-center justify-center rounded-full bg-primary-500/20">
                  <Animated.View style={spinStyle}>
                    <MaterialIcons
                      name="hourglass-empty"
                      size={40}
                      color="#64748B"
                    />
                  </Animated.View>
                </Box>
                <Text className="text-center text-base text-typography-400">
                  {isAnalysisLoading
                    ? "분석 중이에요. 잠시만 기다려 주세요."
                    : "결과를 불러오는 중이에요."}
                </Text>
              </>
            )}
          </Box>
        ) : !avatarReadyOrGiveUp ? (
          <Box className="flex-1 items-center justify-center px-4 py-12">
            <Box className="mb-6 h-16 w-16 items-center justify-center rounded-full bg-primary-500/20">
              <Animated.View style={spinStyle}>
                <MaterialIcons
                  name="hourglass-empty"
                  size={40}
                  color="#64748B"
                />
              </Animated.View>
            </Box>
            <Text className="text-center text-base text-typography-400">
              프로필 이미지 준비 중이에요.
            </Text>
          </Box>
        ) : (
          (() => {
            const accentColor = aiResult.color ?? "#DB2777";
            const withAlpha = (hex: string, alpha: number) => {
              const r = parseInt(hex.slice(1, 3), 16);
              const g = parseInt(hex.slice(3, 5), 16);
              const b = parseInt(hex.slice(5, 7), 16);
              return `rgba(${r},${g},${b},${alpha})`;
            };
            return (
              <Box className="pb-8">
                <Box className="mt-6 items-center">
                  <Box
                    className="h-52 w-52 items-center justify-center overflow-hidden rounded-full"
                    style={{ backgroundColor: withAlpha(accentColor, 0.2) }}
                  >
                    {avatarImageDataUrl ? (
                      <Image
                        source={{ uri: avatarImageDataUrl }}
                        style={{ width: 200, height: 200, borderRadius: 100 }}
                        resizeMode="cover"
                      />
                    ) : (
                      <MaterialIcons name="person" size={48} color="#64748B" />
                    )}
                  </Box>
                </Box>

                <Text
                  className="mt-8 text-center text-base font-medium"
                  style={{ color: accentColor }}
                >
                  {aiResult.label}
                </Text>

                <Box className="mt-6 rounded-xl bg-background-50 p-4 dark:bg-background-800">
                  <Text className="text-sm leading-relaxed text-typography-700 dark:text-typography-200">
                    {aiResult.description}
                  </Text>
                </Box>

                <Button
                  className="mt-4"
                  size="lg"
                  onPress={handleShare}
                >
                  <ButtonIcon as={ShareIcon} />
                  <ButtonText>공유하기</ButtonText>
                </Button>

                {aiResult.keywords?.length ? (
                  <>
                    <Box className="mt-8 flex-row flex-wrap gap-2">
                      {aiResult.keywords.map((kw, i) => (
                        <Box
                          key={i}
                          className="flex-row items-center gap-1.5 rounded-full border px-3 py-1.5"
                          style={{
                            borderColor: withAlpha(accentColor, 0.5),
                            backgroundColor: withAlpha(accentColor, 0.15),
                          }}
                        >
                          <Text
                            className="text-xs font-medium"
                            style={{ color: accentColor }}
                          >
                            {kw.text}
                          </Text>
                        </Box>
                      ))}
                    </Box>
                  </>
                ) : null}

                {aiResult.traits?.length ? (
                  <>
                    <Box className="mt-8 rounded-xl ">
                      <Box className="gap-3">
                        {aiResult.traits.map((trait, i) => (
                          <Box key={i}>
                            <Box className="mb-1 flex-row items-center justify-between">
                              <Text className="text-sm text-typography-700 dark:text-typography-200">
                                {trait.name}
                              </Text>
                              <Text className="text-xs text-typography-500">
                                {trait.strength}
                              </Text>
                            </Box>
                            <Box className="h-2 w-full overflow-hidden rounded-full bg-outline-200 dark:bg-outline-700">
                              <Box
                                className="h-full rounded-full"
                                style={{
                                  width: `${Math.min(100, Math.max(0, trait.strength))}%`,
                                  backgroundColor: accentColor,
                                }}
                              />
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </>
                ) : null}
                {aiResult.values?.length ? (
                  <>
                    <Text className="mt-14 text-base font-semibold ">
                      무엇을 중요히 여기는가
                    </Text>

                    <Box className="mt-3 flex-row flex-wrap gap-2">
                      {aiResult.values.map((v, i) => (
                        <Box
                          key={i}
                          className="flex-row items-center gap-1.5 rounded-full border border-outline-300 bg-background-200/80 px-3 py-1.5 dark:border-outline-500 dark:bg-background-400/50"
                        >
                          <Text className="text-xs font-medium text-typography-800 dark:text-typography-100">
                            {v.name}
                          </Text>
                        </Box>
                      ))}
                    </Box>
                  </>
                ) : null}

                {aiResult.dimensions &&
                Object.keys(aiResult.dimensions).length > 0 ? (
                  <>
                    <Box className="mt-8 rounded-xl">
                      <DimensionsRadar
                        dimensions={aiResult.dimensions}
                        size={340}
                        accentColor={aiResult.color}
                      />
                    </Box>
                  </>
                ) : null}

                {aiResult.quote ? (
                  <>
                    <Box
                      className="mt-3 rounded-xl border-l-4 bg-background-50 py-3 pl-4 pr-4 dark:bg-background-800"
                      style={{ borderLeftColor: withAlpha(accentColor, 0.6) }}
                    >
                      <Text className="text-sm italic leading-relaxed text-typography-700 dark:text-typography-200">
                        {'"'}
                        {aiResult.quote}
                        {'"'}
                      </Text>
                    </Box>
                  </>
                ) : null}
              </Box>
            );
          })()
        )}
      </ScrollView>
    </Box>
  );
}
