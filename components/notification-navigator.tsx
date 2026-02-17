import { useAppStore } from '@/store/useAppStore'
import {
  addNotificationResponseReceivedListener,
  getLastNotificationResponse,
} from 'expo-notifications'
import { router } from 'expo-router'
import { useEffect, useRef } from 'react'

type NotificationScreenType = 'fortune' | 'poem'

function handleNotificationResponse(data: Record<string, unknown> | undefined): void {
  const type = data?.type as NotificationScreenType | undefined
  if (type === 'fortune') {
    router.replace('/(tabs)/fortune')
  } else if (type === 'poem') {
    const poemId = typeof data?.poemId === 'string' ? data.poemId : null
    if (poemId) useAppStore.getState().setPendingPoemId(poemId)
    router.replace('/(tabs)/')
  }
}

/**
 * 알림 탭 시 해당 탭으로 이동 처리.
 * 루트 레이아웃에서 한 번만 마운트.
 */
export function NotificationNavigator() {
  const handledColdStart = useRef(false)

  useEffect(() => {
    const sub = addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, unknown> | undefined
      handleNotificationResponse(data)
    })

    return () => sub.remove()
  }, [])

  useEffect(() => {
    if (handledColdStart.current) return
    const last = getLastNotificationResponse()
    if (!last) return
    handledColdStart.current = true
    const data = last.notification.request.content.data as Record<string, unknown> | undefined
    handleNotificationResponse(data)
  }, [])

  return null
}
