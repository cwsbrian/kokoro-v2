import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { UserAnalysisState } from '@/types'
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
    await setDoc(ref, state)
    if (__DEV__) console.log('[ReadingState] synced to Firebase successfully, responseCount:', state.responseCount)
  } catch (err) {
    console.error('[ReadingState] Firebase save failed:', err)
    throw err
  }
}
