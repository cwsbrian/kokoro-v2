import { db } from '@/lib/firebase'
import type { UserAnalysisState } from '@/types'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import type { StoredReadingState } from './readingStateStorage'

const COLLECTION = 'users'

export async function getReadingStateFromFirebase(uid: string): Promise<UserAnalysisState | null> {
  try {
    // users/{uid}/readingState 문서에서 읽기
    const ref = doc(db, COLLECTION, uid, 'readingState', 'data')
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      if (__DEV__) console.log('[ReadingState] Firebase doc does not exist yet')
      return null
    }
    const data = snap.data() as StoredReadingState
    if (__DEV__) console.log('[ReadingState] loaded from Firebase, responseCount:', data.responseCount)
    return {
      responseCount: data.responseCount ?? 0,
      lastAnalyzedAtSwipeCount: data.lastAnalyzedAtSwipeCount ?? null,
      aiAnalysisResult: data.aiAnalysisResult ?? null,
      swipeHistory: data.swipeHistory ?? [],
      lastUpdated: data.lastUpdated ? new Date(data.lastUpdated) : new Date(),
    }
  } catch (err) {
    console.error('[ReadingState] Firebase load failed:', err)
    return null
  }
}

export async function setReadingStateToFirebase(
  uid: string,
  state: StoredReadingState
): Promise<void> {
  try {
    // users/{uid}/readingState/data 문서에 저장
    const ref = doc(db, COLLECTION, uid, 'readingState', 'data')
    
    // 데이터 크기 및 구조 확인
    const dataSize = JSON.stringify(state).length
    const swipeHistorySample = state.swipeHistory?.slice(0, 3) ?? []
    
    if (__DEV__) {
      console.log('[ReadingState] Attempting to save to Firebase:', {
        uid,
        path: `users/${uid}/readingState/data`,
        responseCount: state.responseCount,
        swipeHistoryLength: state.swipeHistory?.length ?? 0,
        dataSizeBytes: dataSize,
        swipeHistorySample: swipeHistorySample.map(s => ({ poemId: s.poemId, poemIdType: typeof s.poemId, response: s.response })),
      })
    }
    
    // Firestore는 number를 잘 처리하지만, 혹시 모를 문제를 위해 검증
    const validatedState: StoredReadingState = {
      ...state,
      swipeHistory: (state.swipeHistory ?? []).map(record => ({
        poemId: typeof record.poemId === 'number' ? record.poemId : Number(record.poemId),
        response: record.response,
        timestamp: record.timestamp,
      })),
    }
    
    await setDoc(ref, validatedState)
    if (__DEV__) console.log('[ReadingState] synced to Firebase successfully, responseCount:', state.responseCount)
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    const errorCode = (err as any)?.code
    const errorDetails = err instanceof Error ? {
      name: err.name,
      message: err.message,
      stack: err.stack,
    } : {}
    
    console.error('[ReadingState] Firebase save failed:', {
      error: errorMessage,
      code: errorCode,
      uid,
      path: `users/${uid}/readingState/data`,
      ...errorDetails,
    })
    throw err
  }
}
