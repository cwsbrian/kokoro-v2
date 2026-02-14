import type {
  AiAnalysisResult,
  AnalysisResult,
  PoemCard,
  SwipeDirection,
  SwipeRecord,
  UserAnalysisState,
} from '@/types'
import { create } from 'zustand'

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
  },

  setLastAnalyzedAtSwipeCount: (count) => {
    set({ lastAnalyzedAtSwipeCount: count })
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
}))
