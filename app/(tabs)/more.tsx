import {
  triggerTestFortuneNotification,
  triggerTestPoemNotification,
} from '@/lib/notifications'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import React, { useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Box } from '@/components/ui/box'
import { Pressable } from '@/components/ui/pressable'
import { Text } from '@/components/ui/text'

export default function MoreScreen() {
  const insets = useSafeAreaInsets()
  const tabBarHeight = useBottomTabBarHeight()
  const [fortuneLoading, setFortuneLoading] = useState(false)
  const [poemLoading, setPoemLoading] = useState(false)

  const handleTestFortune = async () => {
    setFortuneLoading(true)
    try {
      await triggerTestFortuneNotification()
    } finally {
      setFortuneLoading(false)
    }
  }

  const handleTestPoem = async () => {
    setPoemLoading(true)
    try {
      await triggerTestPoemNotification()
    } finally {
      setPoemLoading(false)
    }
  }

  return (
    <Box
      className="flex-1 bg-background-0"
      style={{ paddingTop: insets.top, paddingBottom: tabBarHeight }}
    >
      <Box className="px-5 pt-6">
        <Text className="text-2xl font-bold text-typography-0">더보기</Text>
        <Text className="mt-1 text-base text-typography-400">
          설정 및 기타 메뉴
        </Text>
      </Box>

      <Box className="mt-8 px-5">
        <Text className="text-sm font-semibold text-typography-400 uppercase tracking-wide">
          알림 테스트
        </Text>
        <Text className="mt-1 text-typography-500 text-sm">
          탭 시 해당 화면으로 이동하는지 확인할 수 있습니다.
        </Text>
        <Box className="mt-4 flex-row gap-3">
          <Pressable
            className="flex-1 rounded-xl bg-primary-500 py-3"
            onPress={handleTestFortune}
            disabled={fortuneLoading}
          >
            <Text className="text-center font-semibold text-typography-0">
              {fortuneLoading ? '발송 중…' : '운세 알림 보내기'}
            </Text>
          </Pressable>
          <Pressable
            className="flex-1 rounded-xl bg-primary-500 py-3"
            onPress={handleTestPoem}
            disabled={poemLoading}
          >
            <Text className="text-center font-semibold text-typography-0">
              {poemLoading ? '발송 중…' : '오늘의 시 알림 보내기'}
            </Text>
          </Pressable>
        </Box>
      </Box>
    </Box>
  )
}
