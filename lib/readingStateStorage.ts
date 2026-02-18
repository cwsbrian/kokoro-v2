import AsyncStorage from '@react-native-async-storage/async-storage'
import type { UserAnalysisState } from '@/types'

const READING_STATE_KEY = '@kokoro/readingState'

export interface StoredReadingState {
  responseCount: number
  lastAnalyzedAtSwipeCount: number | null
  aiAnalysisResult: UserAnalysisState['aiAnalysisResult']
  swipeHistory: UserAnalysisState['swipeHistory']
  lastUpdated: string
}

export function toStoredReadingState(state: {
  responseCount: number
  lastAnalyzedAtSwipeCount: number | null
  aiAnalysisResult: UserAnalysisState['aiAnalysisResult']
  swipeHistory: UserAnalysisState['swipeHistory']
  lastUpdated: Date | null
}): StoredReadingState {
  return {
    responseCount: state.responseCount,
    lastAnalyzedAtSwipeCount: state.lastAnalyzedAtSwipeCount,
    aiAnalysisResult: state.aiAnalysisResult,
    swipeHistory: state.swipeHistory ?? [],
    lastUpdated: state.lastUpdated?.toISOString() ?? new Date().toISOString(),
  }
}

export function fromStoredReadingState(stored: StoredReadingState): UserAnalysisState {
  return {
    responseCount: stored.responseCount,
    lastAnalyzedAtSwipeCount: stored.lastAnalyzedAtSwipeCount,
    aiAnalysisResult: stored.aiAnalysisResult,
    swipeHistory: stored.swipeHistory ?? [],
    lastUpdated: stored.lastUpdated ? new Date(stored.lastUpdated) : new Date(),
  }
}

export async function getReadingStateFromDevice(): Promise<UserAnalysisState | null> {
  try {
    const raw = await AsyncStorage.getItem(READING_STATE_KEY)
    if (!raw) {
      if (__DEV__) console.log('[ReadingState] no device state found')
      return null
    }
    const parsed = JSON.parse(raw) as StoredReadingState
    const state = fromStoredReadingState(parsed)
    if (__DEV__) console.log('[ReadingState] loaded from device, responseCount:', state.responseCount)
    return state
  } catch (err) {
    if (__DEV__) console.warn('[ReadingState] device load failed:', err)
    return null
  }
}

export async function setReadingStateToDevice(state: UserAnalysisState): Promise<void> {
  const stored = toStoredReadingState(state)
  await AsyncStorage.setItem(READING_STATE_KEY, JSON.stringify(stored))
}
