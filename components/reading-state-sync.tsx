import { useAuth } from '@/contexts/auth-context'
import {
  getReadingStateFromFirebase,
  setReadingStateToFirebase,
} from '@/lib/readingStateFirestore'
import { getReadingStateFromDevice, toStoredReadingState } from '@/lib/readingStateStorage'
import { useAppStore } from '@/store/useAppStore'
import { useEffect, useRef } from 'react'
import { AppState, type AppStateStatus } from 'react-native'

/**
 * - 앱 시작 시: 기기(AsyncStorage)에서 읽기 상태 복원 → 로그인 시 Firebase에서 추가 복원
 * - 앱 백그라운드/종료 시: 로그인 사용자면 현재 상태를 Firebase에 저장
 */
export function ReadingStateSync() {
  const { user } = useAuth()
  const loadUserAnalysisState = useAppStore((s) => s.loadUserAnalysisState)
  const appStateRef = useRef<AppStateStatus>(AppState.currentState)

  // 읽기 상태 복원: 로그인 시 Firebase 우선, 없으면 기기; 비로그인 시 기기만. Firebase가 항상 승자.
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      if (user?.uid) {
        const state = await getReadingStateFromFirebase(user.uid)
        if (cancelled) return
        if (state) {
          loadUserAnalysisState(state)
          if (__DEV__) console.log('[ReadingState] applied from Firebase, responseCount:', state.responseCount)
          return
        }
        const deviceState = await getReadingStateFromDevice()
        if (cancelled || !deviceState) return
        loadUserAnalysisState(deviceState)
        if (__DEV__) console.log('[ReadingState] no Firebase doc, applied from device')
      } else {
        const deviceState = await getReadingStateFromDevice()
        if (cancelled || !deviceState) return
        loadUserAnalysisState(deviceState)
        if (__DEV__) console.log('[ReadingState] applied from device')
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [user?.uid, loadUserAnalysisState])

  // 3) 앱이 백그라운드로 갈 때 Firebase에 현재 상태 저장
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const wentToBackground =
        appStateRef.current === 'active' &&
        (nextState === 'background' || nextState === 'inactive')
      appStateRef.current = nextState
      if (wentToBackground && user?.uid) {
        const state = useAppStore.getState()
        const stored = toStoredReadingState(state)
        if (__DEV__) console.log('[ReadingState] syncing to Firebase on background, responseCount:', stored.responseCount)
        setReadingStateToFirebase(user.uid, stored).catch((err) => {
          console.error('[ReadingState] Firebase sync on background failed:', err)
        })
      }
    })
    return () => subscription.remove()
  }, [user?.uid])

  return null
}
