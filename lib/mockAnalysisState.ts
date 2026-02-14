import type { PoemCard, SwipeRecord, SwipeResponse, UserAnalysisState } from '@/types'
import { MRT } from '@/constants/analysis'

const RESPONSES: SwipeResponse[] = ['like', 'dislike']

/**
 * Dev 전용: AI에게 보낼 **요청**(스와이프 이력 50개)만 미리 채운 UserAnalysisState.
 * aiAnalysisResult / lastAnalyzedAtSwipeCount 는 null → 로드 후 triggerAnalysisIfNeeded()로
 * 실제 Gemini API를 호출해 테스트할 수 있음.
 */
export function getMockAnalysisState(poems: PoemCard[]): UserAnalysisState {
  const count = Math.min(MRT, poems.length)
  const swipeHistory: SwipeRecord[] = poems.slice(0, count).map((p, i) => ({
    poemId: p.Poem_ID,
    response: RESPONSES[i % RESPONSES.length],
    timestamp: Date.now() - (count - i) * 1000,
  }))

  return {
    responseCount: count,
    lastAnalyzedAtSwipeCount: null,
    aiAnalysisResult: null,
    swipeHistory,
    lastUpdated: new Date().toISOString(),
  }
}
