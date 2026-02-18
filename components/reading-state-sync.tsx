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

  // 1) 앱 마운트 시 기기에서 읽기 상태 복원
  useEffect(() => {
    let cancelled = false
    getReadingStateFromDevice().then((state) => {
      if (cancelled || !state) return
      loadUserAnalysisState(state)
    })
    return () => {
      cancelled = true
    }
  }, [loadUserAnalysisState])

  // 2) 로그인 시 Firebase에서 읽기 상태 불러와서 덮어쓰기
  useEffect(() => {
    if (!user?.uid) return
    let cancelled = false
    getReadingStateFromFirebase(user.uid).then((state) => {
      if (cancelled || !state) return
      loadUserAnalysisState(state)
    })
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
        setReadingStateToFirebase(user.uid, stored).catch(() => {})
      }
    })
    return () => subscription.remove()
  }, [user?.uid])

  return null
}
