import { loadPoemsFromJSON } from '@/data/poemsLoader'
import { getTodayPoemIndex } from '@/lib/getTodayPoemIndex'
import type { PoemCard } from '@/types'
import * as Notifications from 'expo-notifications'

/** 알림 탭 시 이동할 화면 구분 */
export type NotificationScreenType = 'fortune' | 'poem'

const DAILY_FORTUNE_ID = 'daily-fortune'
const DAILY_POEM_ID = 'daily-poem'

/** 오전 9시(운세), 오후 2시(오늘의 시) - 디바이스 로컬 시간 */
const FORTUNE_HOUR = 9
const FORTUNE_MINUTE = 0
const POEM_HOUR = 14
const POEM_MINUTE = 0

/** 알림 본문 최대 길이 (일부 기기 제한) */
const NOTIFICATION_BODY_MAX = 200

/** 오늘의 시 본문 (알림 body용). poemIndex 사용. */
function getTodayPoemBody(poems: PoemCard[]): string {
  if (poems.length === 0) return '오늘의 시를 확인해 보세요.'
  const index = getTodayPoemIndex(poems)
  const text = poems[index].Poem_Text_KR.trim()
  if (text.length <= NOTIFICATION_BODY_MAX) return text
  return text.slice(0, NOTIFICATION_BODY_MAX - 3) + '...'
}

/** 포그라운드에서도 배너 표시 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync()
  if (existing === 'granted') return true
  const { status } = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: true, allowSound: true },
  })
  return status === 'granted'
}

/** 오늘의 운세 일일 알림(오전 9시) · 오늘의 시 일일 알림(오후 2시) 예약 */
export async function scheduleDailyNotifications(): Promise<void> {
  const granted = await requestNotificationPermissions()
  if (!granted) return

  await Notifications.cancelScheduledNotificationAsync(DAILY_FORTUNE_ID).catch(() => {})
  await Notifications.cancelScheduledNotificationAsync(DAILY_POEM_ID).catch(() => {})

  let poems: PoemCard[] = []
  try {
    poems = await loadPoemsFromJSON()
  } catch {
    // 시 데이터 로드 실패 시 본문만 기본 문구로
  }
  const poemBody = getTodayPoemBody(poems)
  const poemIndex = getTodayPoemIndex(poems)
  const poemId = poems.length > 0 ? poems[poemIndex].Poem_ID : undefined

  try {
    await Notifications.scheduleNotificationAsync({
      identifier: DAILY_FORTUNE_ID,
      content: {
        title: '오늘의 운세',
        body: '오늘 하루 운세를 확인해 보세요.',
        data: { type: 'fortune' as NotificationScreenType },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: FORTUNE_HOUR,
        minute: FORTUNE_MINUTE,
      },
    })

    await Notifications.scheduleNotificationAsync({
      identifier: DAILY_POEM_ID,
      content: {
        title: '오늘의 시',
        body: poemBody,
        data: { type: 'poem' as NotificationScreenType, poemId },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: POEM_HOUR,
        minute: POEM_MINUTE,
      },
    })
  } catch (error) {
    console.error('Failed to schedule daily notifications:', error)
  }
}

/** 테스트: 운세 알림 즉시 발송 (탭 시 운세 탭으로 이동) */
export async function triggerTestFortuneNotification(): Promise<void> {
  const granted = await requestNotificationPermissions()
  if (!granted) return

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '오늘의 운세',
      body: '오늘 하루 운세를 확인해 보세요.',
      data: { type: 'fortune' as NotificationScreenType },
    },
    trigger: null,
  })
}

/** 테스트: 오늘의 시 알림 즉시 발송 (탭 시 시 탭으로 이동) */
export async function triggerTestPoemNotification(): Promise<void> {
  const granted = await requestNotificationPermissions()
  if (!granted) return

  let poems: PoemCard[] = []
  try {
    poems = await loadPoemsFromJSON()
  } catch {
    // 시 데이터 로드 실패 시 본문만 기본 문구로
  }
  const poemBody = getTodayPoemBody(poems)
  const poemIndex = getTodayPoemIndex(poems)
  const poemId = poems.length > 0 ? poems[poemIndex].Poem_ID : undefined

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '오늘의 시',
      body: poemBody,
      data: { type: 'poem' as NotificationScreenType, poemId },
    },
    trigger: null,
  })
}

