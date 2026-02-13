import { KISHO_RESULTS } from '@/constants/kisho-results'
import { useAppStore } from '@/store/useAppStore'
import { MRT } from '@/utils/scoreCalculator'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { router } from 'expo-router'
import React from 'react'
import { ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { BigFiveRadar } from '@/components/big-five-radar'
import { PreferenceBar } from '@/components/preference-bar'
import { Box } from '@/components/ui/box'
import { Button, ButtonText } from '@/components/ui/button'
import { Progress, ProgressFilledTrack } from '@/components/ui/progress'
import { Text } from '@/components/ui/text'

export default function AccountScreen() {
  const insets = useSafeAreaInsets()
  const tabBarHeight = useBottomTabBarHeight()
  const getAnalysisResult = useAppStore((s) => s.getAnalysisResult)
  const responseCount = useAppStore((s) => s.responseCount)

  const result = getAnalysisResult()
  const { canShowResults, mbti, bigFive, kisho } = result
  const kishoResult = KISHO_RESULTS[kisho.fullType]
  const description = kishoResult?.description ?? '결과를 불러올 수 없습니다.'
  const progressValue = Math.min(1, responseCount / MRT)

  const paddingBottom = tabBarHeight + 24

  const handleGoToPoems = () => {
    router.navigate('/(tabs)')
  }

  return (
    <Box
      className="flex-1 bg-background-0"
      style={{ paddingTop: insets.top, paddingBottom }}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {!canShowResults ? (
          <Box className="flex-1 items-center justify-center py-12">
            <Text className="text-center text-xl font-bold text-typography-0">
              아직 결과를 만들기엔 스와이프가 부족해요
            </Text>
            <Text className="mt-3 text-center text-base text-typography-400">
              {responseCount} / {MRT}회 스와이프하면 나에 대한 결과를 볼 수 있어요.
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
            <Button
              className="mt-8"
              size="lg"
              onPress={handleGoToPoems}
            >
              <ButtonText>시 더 보기</ButtonText>
            </Button>
          </Box>
        ) : (
          <Box className="pb-8">
            <Box className="mt-6 items-center">
              <Box
                className="h-24 w-24 items-center justify-center rounded-full"
                style={{
                  padding: 0,
                  backgroundColor: kishoResult?.color
                    ? `${kishoResult.color}25`
                    : undefined,
                }}
              >
                <MaterialIcons
                  name={
                    (kishoResult?.icon as React.ComponentProps<
                      typeof MaterialIcons
                    >['name']) ?? 'person'
                  }
                  size={48}
                  color={kishoResult?.color ?? '#64748B'}
                  style={{ padding: 0 }}
                />
              </Box>
            </Box>
            <Text className="mt-4 text-center text-lg font-bold text-typography-0">
              나의 유형
            </Text>
            <Text
              className="mt-1 text-center text-base font-medium"
              style={{ color: kishoResult?.color ?? undefined }}
            >
              {kishoResult?.label ?? kisho.fullType}
            </Text>
            <Text className="mt-1 text-center text-sm text-typography-400">
              MBTI {mbti.type}
            </Text>

            <Box className="mt-6 rounded-xl bg-background-50 p-4 dark:bg-background-800">
              <Text className="text-sm leading-relaxed text-typography-700 dark:text-typography-200">
                {description}
              </Text>
            </Box>

            {kishoResult?.keywords?.length ? (
              <>
                <Text className="mt-8 text-base font-semibold text-typography-0">
                  키워드
                </Text>
                <Box className="mt-3 flex-row flex-wrap gap-2">
                  {kishoResult.keywords.map((keyword, i) => (
                    <Box
                      key={i}
                      className="rounded-full px-3 py-1.5"
                      style={{
                        borderWidth: 1,
                        borderColor: kishoResult?.color ?? undefined,
                        backgroundColor: kishoResult?.color
                          ? `${kishoResult.color}15`
                          : undefined,
                      }}
                    >
                      <Text
                        className="text-xs font-medium"
                        style={{
                          color: kishoResult?.color ?? undefined,
                        }}
                      >
                        {keyword}
                      </Text>
                    </Box>
                  ))}
                </Box>
              </>
            ) : null}

            <Text className="mt-8 text-base font-semibold text-typography-0">
              MBTI 선호도
            </Text>
            <Box className="mt-3 gap-4">
              <PreferenceBar
                leftLabel="I"
                rightLabel="E"
                leftPercent={mbti.preferences.I}
                rightPercent={mbti.preferences.E}
                accentColor={kishoResult?.color}
              />
              <PreferenceBar
                leftLabel="S"
                rightLabel="N"
                leftPercent={mbti.preferences.S}
                rightPercent={mbti.preferences.N}
                accentColor={kishoResult?.color}
              />
              <PreferenceBar
                leftLabel="T"
                rightLabel="F"
                leftPercent={mbti.preferences.T}
                rightPercent={mbti.preferences.F}
                accentColor={kishoResult?.color}
              />
              <PreferenceBar
                leftLabel="J"
                rightLabel="P"
                leftPercent={mbti.preferences.J}
                rightPercent={mbti.preferences.P}
                accentColor={kishoResult?.color}
              />
            </Box>

            {kishoResult?.traits?.length ? (
              <>
                <Text className="mt-8 text-base font-semibold text-typography-0">
                  이 유형의 특징
                </Text>
                <Box className="mt-3 rounded-xl bg-background-50 p-4 dark:bg-background-800">
                  <Box className="gap-2">
                    {kishoResult.traits.map((trait, i) => (
                      <Box key={i} className="flex-row items-center gap-2">
                        <Box
                          className="h-1.5 w-1.5 rounded-full"
                          style={{
                            backgroundColor: kishoResult?.color ?? undefined,
                          }}
                        />
                        <Text className="flex-1 text-sm leading-relaxed text-typography-700 dark:text-typography-200">
                          {trait}
                        </Text>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </>
            ) : null}

            <Text className="mt-8 text-base font-semibold text-typography-0">
              Big Five (OCEAN)
            </Text>
            <Box className="mt-3">
              <BigFiveRadar
                O={bigFive.O}
                C={bigFive.C}
                E={bigFive.E}
                A={bigFive.A}
                N={bigFive.N}
                size={300}
                accentColor={kishoResult?.color}
              />
            </Box>

          </Box>
        )}
      </ScrollView>
    </Box>
  )
}
