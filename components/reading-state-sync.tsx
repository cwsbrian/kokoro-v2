import { useAuth } from '@/contexts/auth-context'
import {
  downloadAvatarUrlToDevice,
  getAvatarFromDevice,
  getAvatarUrlFromFirestore,
  isLocalAvatarFileAvailable,
  setAvatarToDevice,
} from '@/lib/avatarStorage'
import {
  getReadingStateFromFirebase,
  setReadingStateToFirebase,
} from '@/lib/readingStateFirestore'
import { getReadingStateFromDevice, toStoredReadingState } from '@/lib/readingStateStorage'
import { useAppStore } from '@/store/useAppStore'
import { useEffect, useRef } from 'react'
import { AppState, type AppStateStatus } from 'react-native'

/**
 * - 앱 시작 시: 기기(AsyncStorage)에서 읽기 상태 복원 → 로그인 시 Firebase와 비교해 더 최신 데이터 사용
 * - 시 읽을 때마다: device에만 저장 (store에서 자동 처리)
 * - 앱 백그라운드/종료 시: 로그인 사용자면 현재 상태를 Firebase에 저장
 */
export function ReadingStateSync() {
  const { user } = useAuth()
  const loadUserAnalysisState = useAppStore((s) => s.loadUserAnalysisState)
  const setAvatarImageDataUrl = useAppStore((s) => s.setAvatarImageDataUrl)
  const appStateRef = useRef<AppStateStatus>(AppState.currentState)

  // 읽기 상태 복원: 로그인 시 Firebase와 기기 데이터를 비교. 기기가 더 많으면 기기 사용 후 Firebase에 업로드
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      if (user?.uid) {
        // Firebase와 기기 데이터를 모두 로드
        const [firebaseState, deviceState] = await Promise.all([
          getReadingStateFromFirebase(user.uid),
          getReadingStateFromDevice(),
        ])
        if (cancelled) return

        if (firebaseState && deviceState) {
          // 기기 데이터가 더 많은지 비교 (responseCount 기준, 동일하면 lastUpdated)
          const deviceHasMore =
            deviceState.responseCount > firebaseState.responseCount ||
            (deviceState.responseCount === firebaseState.responseCount &&
              deviceState.lastUpdated.getTime() > firebaseState.lastUpdated.getTime())

          if (deviceHasMore) {
            // 기기가 더 많음 → 기기 데이터 사용하고, Firebase를 기기 데이터로 덮어씀
            loadUserAnalysisState(deviceState)
            if (__DEV__) {
              console.log('[ReadingState] device has more data, applying device and uploading to Firebase', {
                deviceResponseCount: deviceState.responseCount,
                firebaseResponseCount: firebaseState.responseCount,
              })
            }
            setReadingStateToFirebase(user.uid, toStoredReadingState(deviceState)).catch((err) => {
              console.error('[ReadingState] failed to upload device state to Firebase:', err)
            })
          } else {
            // Firebase가 더 많거나 동일 → Firebase 사용 (기기 덮어쓰지 않음)
            loadUserAnalysisState(firebaseState)
            if (__DEV__) {
              console.log('[ReadingState] Firebase has more or same, applying Firebase state', {
                firebaseResponseCount: firebaseState.responseCount,
                deviceResponseCount: deviceState.responseCount,
              })
            }
          }
        } else if (firebaseState) {
          loadUserAnalysisState(firebaseState)
          if (__DEV__) console.log('[ReadingState] applied from Firebase (no device state), responseCount:', firebaseState.responseCount)
        } else if (deviceState) {
          loadUserAnalysisState(deviceState)
          // 기기만 있으면 Firebase에 업로드 (로그인 사용자)
          if (__DEV__) console.log('[ReadingState] applied from device (no Firebase state), uploading to Firebase, responseCount:', deviceState.responseCount)
          setReadingStateToFirebase(user.uid, toStoredReadingState(deviceState)).catch((err) => {
            console.error('[ReadingState] failed to upload device state to Firebase:', err)
          })
        }
      } else {
        // 비로그인: 기기 데이터만 사용
        const deviceState = await getReadingStateFromDevice()
        if (!cancelled && deviceState) {
          loadUserAnalysisState(deviceState)
          if (__DEV__) console.log('[ReadingState] applied from device (not logged in), responseCount:', deviceState.responseCount)
        }
      }
      if (cancelled) return

      // 프로필 아바타 복원: 기기에 로컬 파일이 있으면 그대로 사용, 없으면 Firebase URL로 다운로드 후 기기에 저장해 계속 사용
      const deviceAvatar = await getAvatarFromDevice()
      if (deviceAvatar?.startsWith('file://') && (await isLocalAvatarFileAvailable(deviceAvatar))) {
        setAvatarImageDataUrl(deviceAvatar)
        if (__DEV__) console.log('[Avatar] restored from device (local file)')
      } else {
        const firebaseUrl =
          deviceAvatar?.startsWith('http')
            ? deviceAvatar
            : user?.uid
              ? await getAvatarUrlFromFirestore(user.uid)
              : null
        if (firebaseUrl) {
          try {
            const localUri = await downloadAvatarUrlToDevice(firebaseUrl)
            await setAvatarToDevice(localUri)
            setAvatarImageDataUrl(localUri)
            if (__DEV__) console.log('[Avatar] downloaded from Firebase and saved to device')
          } catch (e) {
            if (__DEV__) console.warn('[Avatar] download failed, using URL:', e)
            setAvatarImageDataUrl(firebaseUrl)
            await setAvatarToDevice(firebaseUrl)
          }
        }
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [user?.uid, loadUserAnalysisState, setAvatarImageDataUrl])

  // 2) 앱이 백그라운드/종료 시 Firebase에 현재 상태 저장
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const wentToBackground =
        appStateRef.current === 'active' &&
        (nextState === 'background' || nextState === 'inactive')
      appStateRef.current = nextState
      if (wentToBackground && user?.uid) {
        const state = useAppStore.getState()
        const stored = toStoredReadingState(state)
        if (__DEV__) {
          console.log('[ReadingState] syncing to Firebase on background', {
            uid: user.uid,
            responseCount: stored.responseCount,
            swipeHistoryLength: stored.swipeHistory?.length ?? 0,
          })
        }
        setReadingStateToFirebase(user.uid, stored)
          .then(() => {
            if (__DEV__) console.log('[ReadingState] Firebase sync completed successfully')
          })
          .catch((err) => {
            const errorMessage = err instanceof Error ? err.message : String(err)
            const errorCode = (err as any)?.code
            console.error('[ReadingState] Firebase sync on background failed:', {
              error: errorMessage,
              code: errorCode,
              uid: user.uid,
              fullError: err,
            })
          })
      }
    })
    return () => subscription.remove()
  }, [user?.uid])

  return null
}
