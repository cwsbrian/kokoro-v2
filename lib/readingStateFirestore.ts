import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { UserAnalysisState } from '@/types'
import type { StoredReadingState } from './readingStateStorage'

const COLLECTION = 'users'
const DOC_PATH = 'readingState'

export async function getReadingStateFromFirebase(uid: string): Promise<UserAnalysisState | null> {
  try {
    const ref = doc(db, COLLECTION, uid, DOC_PATH, 'data')
    const snap = await getDoc(ref)
    if (!snap.exists()) return null
    const data = snap.data() as StoredReadingState
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
  const ref = doc(db, COLLECTION, uid, DOC_PATH, 'data')
  await setDoc(ref, state)
  if (__DEV__) console.log('[ReadingState] synced to Firebase, responseCount:', state.responseCount)
}
