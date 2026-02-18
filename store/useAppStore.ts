import type {
  AiAnalysisResult,
  AnalysisResult,
  PoemCard,
  SwipeDirection,
  SwipeRecord,
  TodayFortuneResponse,
  UserAnalysisState,
} from '@/types'
import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  FORTUNE_QUOTA_MESSAGE,
  getTodayKstYYYYMMDD,
  requestTodayFortune,
} from '@/lib/geminiFortune'
import {
  toStoredReadingState,
  setReadingStateToDevice,
} from '@/lib/readingStateStorage'

const FORTUNE_STORAGE_KEY = '@kokoro/fortune'

function persistReadingStateToDevice(get: () => AppState): void {
  const state = get()
  const stored = toStoredReadingState(state)
  setReadingStateToDevice(stored).catch(() => {})
}

function directionToResponse(direction: SwipeDirection): SwipeRecord['response'] {
  return direction === 'right' ? 'like' : 'dislike'
}

interface AppState {
  poems: PoemCard[]
  currentCardIndex: number
  responseCount: number
  lastAnalyzedAtSwipeCount: number | null
  aiAnalysisResult: AiAnalysisResult | null
  swipeHistory: SwipeRecord[]
  isLoading: boolean
  userId: string | null
  lastUpdated: Date | null
  /** 분석 API 호출 중 */
  isAnalysisLoading: boolean
  /** 분석 실패 시 메시지 (API 키 없음, 네트워크 오류 등) */
  analysisError: string | null
  /** Gemini 이미지 생성 아바타 data URL (계정 화면 표시용) */
  avatarImageDataUrl: string | null
  /** 오늘의 운세 응답 (KST 기준 오늘 날짜와 쌍) */
  todayFortune: TodayFortuneResponse | null
  /** 오늘의 운세 기준일 YYYY-MM-DD (KST) */
  fortuneDate: string | null
  isFortuneLoading: boolean
  fortuneError: string | null
  /** 알림에서 시 탭 진입 시 표시할 시 ID (로드 후 currentCardIndex로 반영) */
  pendingPoemId: string | null

  loadPoems: (poems: PoemCard[]) => void
  loadAndShufflePoems: (poems: PoemCard[]) => void
  swipeCard: (direction: SwipeDirection) => void
  setUserId: (userId: string | null) => void
  loadUserAnalysisState: (state: UserAnalysisState) => void
  resetScores: () => void
  getCurrentCard: () => PoemCard | null
  getAnalysisResult: () => AnalysisResult
  setAiAnalysisResult: (result: AiAnalysisResult | null) => void
  setLastAnalyzedAtSwipeCount: (count: number) => void
  setAnalysisError: (error: string | null) => void
  setAnalysisLoading: (loading: boolean) => void
  setAvatarImageDataUrl: (url: string | null) => void
  shufflePoems: () => void
  fetchTodayFortune: () => Promise<void>
  setFortuneError: (error: string | null) => void
  setPendingPoemId: (poemId: string | null) => void
  setCurrentCardIndex: (index: number) => void
}

const initialState = {
  poems: [],
  currentCardIndex: 0,
  responseCount: 0,
  lastAnalyzedAtSwipeCount: null as number | null,
  aiAnalysisResult: null as AiAnalysisResult | null,
  swipeHistory: [] as SwipeRecord[],
  isLoading: false,
  userId: null,
  lastUpdated: null,
  isAnalysisLoading: false,
  analysisError: null as string | null,
  avatarImageDataUrl: null as string | null,
  todayFortune: null as TodayFortuneResponse | null,
  fortuneDate: null as string | null,
  isFortuneLoading: false,
  fortuneError: null as string | null,
  pendingPoemId: null as string | null,
}

export const useAppStore = create<AppState>((set, get) => ({
  ...initialState,

  loadPoems: (poems) => {
    set({ poems, currentCardIndex: 0 })
  },

  loadAndShufflePoems: (poems) => {
    const shuffled = [...poems]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    set({ poems: shuffled, currentCardIndex: 0 })
  },

  swipeCard: (direction) => {
    const state = get()
    const currentCard = state.poems[state.currentCardIndex]

    if (!currentCard) {
      console.warn('No current card to swipe')
      return
    }

    const nextIndex = state.currentCardIndex + 1
    const newRecord: SwipeRecord = {
      poemId: currentCard.Poem_ID,
      response: directionToResponse(direction),
      timestamp: Date.now(),
    }

    set({
      swipeHistory: [...state.swipeHistory, newRecord],
      responseCount: state.responseCount + 1,
      currentCardIndex: nextIndex,
      lastUpdated: new Date(),
    })
    persistReadingStateToDevice(get)
  },

  setUserId: (userId) => {
    set({ userId })
  },

  loadUserAnalysisState: (state) => {
    set({
      responseCount: state.responseCount,
      lastAnalyzedAtSwipeCount: state.lastAnalyzedAtSwipeCount,
      aiAnalysisResult: state.aiAnalysisResult,
      swipeHistory: state.swipeHistory ?? [],
      lastUpdated: state.lastUpdated ? new Date(state.lastUpdated) : null,
    })
  },

  resetScores: () => {
    set({
      ...initialState,
      poems: get().poems,
      currentCardIndex: 0,
      isAnalysisLoading: false,
      analysisError: null,
    })
  },

  getCurrentCard: () => {
    const state = get()
    return state.poems[state.currentCardIndex] ?? null
  },

  getAnalysisResult: (): AnalysisResult => {
    const state = get()
    // 결과 버튼: API 호출 후 응답 데이터가 있을 때만 활성화 (횟수 조건 아님)
    return {
      canShowResults: state.aiAnalysisResult != null,
      aiResult: state.aiAnalysisResult,
    }
  },

  setAiAnalysisResult: (result) => {
    set({ aiAnalysisResult: result })
    persistReadingStateToDevice(get)
  },

  setLastAnalyzedAtSwipeCount: (count) => {
    set({ lastAnalyzedAtSwipeCount: count })
    persistReadingStateToDevice(get)
  },

  setAnalysisError: (error) => {
    set({ analysisError: error })
  },

  setAnalysisLoading: (loading) => {
    set({ isAnalysisLoading: loading })
  },

  setAvatarImageDataUrl: (url) => {
    set({ avatarImageDataUrl: url })
  },

  shufflePoems: () => {
    const state = get()
    if (state.poems.length === 0) return
    const shuffled = [...state.poems]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    set({ poems: shuffled, currentCardIndex: 0 })
  },

  setFortuneError: (error) => {
    set({ fortuneError: error })
  },

  setPendingPoemId: (poemId) => {
    set({ pendingPoemId: poemId })
  },

  setCurrentCardIndex: (index) => {
    const state = get()
    const clamped = Math.max(0, Math.min(index, Math.max(0, state.poems.length - 1)))
    set({ currentCardIndex: clamped })
  },

  fetchTodayFortune: async () => {
    const state = get()
    const { aiResult } = state.getAnalysisResult()
    if (!aiResult) return

    const today = getTodayKstYYYYMMDD()

    try {
      const raw = await AsyncStorage.getItem(FORTUNE_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as {
          fortuneDate: string
          todayFortune: TodayFortuneResponse
        }
        if (parsed.fortuneDate === today && parsed.todayFortune) {
          set({
            todayFortune: parsed.todayFortune,
            fortuneDate: parsed.fortuneDate,
            fortuneError: null,
          })
          return
        }
      }
    } catch {
      // ignore stale/invalid storage
    }

    const apiKey =
      (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_GEMINI_API_KEY) || ''
    if (!apiKey) {
      set({ fortuneError: 'API 키가 설정되지 않았습니다.' })
      return
    }

    set({ isFortuneLoading: true, fortuneError: null })
    try {
      const result = await requestTodayFortune(aiResult, today, apiKey)
      set({ todayFortune: result, fortuneDate: today, fortuneError: null })
      await AsyncStorage.setItem(
        FORTUNE_STORAGE_KEY,
        JSON.stringify({ fortuneDate: today, todayFortune: result })
      )
    } catch (e) {
      const raw = e instanceof Error ? e.message : String(e)
      const isQuota =
        raw.includes('429') || raw.includes('quota') || raw.includes('Quota exceeded')
      set({
        fortuneError: isQuota ? FORTUNE_QUOTA_MESSAGE : raw || '오늘의 운세를 불러오지 못했어요.',
      })
    } finally {
      set({ isFortuneLoading: false })
    }
  },
}))
