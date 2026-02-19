// Poem Card Types
export type PoemType = '단문시' | '하이쿠' | '센류';

export interface PoemCard {
  Poem_ID: number
  Poem_Type: PoemType
  Poem_Text_KR: string
  Poem_Text_JP?: string
  Content_Category: string
  Tag: string // UI 표시용 태그 (기존 Kisho_Tag)
}

// Swipe
export type SwipeDirection = 'right' | 'left'

export type SwipeResponse = 'like' | 'dislike'

export interface SwipeRecord {
  poemId: number
  response: SwipeResponse
  timestamp?: number
}

// AI Analysis Result (Gemini 응답) — 차트용 필드 포함
export interface AiAnalysisResult {
  label: string
  description: string
  /** 특징 + 강도(0~100) — 바 차트용 */
  traits?: { name: string; strength: number }[]
  /** 키워드 + 비중(0~100) — 태그용 */
  keywords?: { text: string; weight: number }[]
  summary?: string
  /** 성향 축별 점수(0~100) — 레이더 차트 전용 */
  dimensions?: Record<string, number>
  /** 가치관: 무엇을 중요히 여기는가 (특징과 구분) */
  values?: { name: string; weight: number }[]
  /** 이 사람을 한 문장으로 (인용문) */
  quote?: string
  /** 이 사람을 대표하는 색상 hex (예: #DB2777) — 차트·강조용 */
  color?: string
}

// Analysis Result (나 화면 표시용)
export interface AnalysisResult {
  canShowResults: boolean
  aiResult: AiAnalysisResult | null
}

// User Analysis State (영속화용)
export interface UserAnalysisState {
  responseCount: number
  lastAnalyzedAtSwipeCount: number | null
  aiAnalysisResult: AiAnalysisResult | null
  swipeHistory: SwipeRecord[]
  lastUpdated: Date
}

// Today's Fortune (오늘의 운세)
/** Categories that map to TodayFortuneCategoryItem (uniform shape) */
export type UniformFortuneCategoryId =
  | 'love'
  | 'money'
  | 'work'
  | 'health'
  | 'relationship'

/** Total/luck/caution have different shapes in TodayFortuneResponse */
export type SpecialFortuneCategoryId = 'total' | 'luck' | 'caution'

export type FortuneCategoryId = UniformFortuneCategoryId | SpecialFortuneCategoryId

export interface TodayFortuneLuck {
  color?: string
  number?: number
  direction?: string
  time?: string
}

export interface TodayFortuneCategoryItem {
  summary: string
  detail?: string
}

export interface TodayFortuneResponse {
  total: string
  love: TodayFortuneCategoryItem
  money: TodayFortuneCategoryItem
  work: TodayFortuneCategoryItem
  health: TodayFortuneCategoryItem
  relationship: TodayFortuneCategoryItem
  luck?: TodayFortuneLuck
  caution?: string
}
