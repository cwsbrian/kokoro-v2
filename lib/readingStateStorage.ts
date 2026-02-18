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
    lastUpdated: stored.lastUpdated,
  }
}

export async function getReadingStateFromDevice(): Promise<UserAnalysisState | null> {
  try {
    const raw = await AsyncStorage.getItem(READING_STATE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredReadingState
    return fromStoredReadingState(parsed)
  } catch {
    return null
  }
}

export async function setReadingStateToDevice(state: StoredReadingState): Promise<void> {
  await AsyncStorage.setItem(READING_STATE_KEY, JSON.stringify(state))
}
