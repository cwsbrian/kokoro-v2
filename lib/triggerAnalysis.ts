import type { AiAnalysisResult } from '@/types'
import { MRT } from '@/constants/analysis'
import { requestAnalysis } from '@/lib/gemini'
import { requestAvatarImage } from '@/lib/geminiAvatar'
import { useAppStore } from '@/store/useAppStore'
import { Image } from 'react-native'

const REANALYZE_INTERVAL = 50

export async function triggerAnalysisIfNeeded(): Promise<void> {
  const state = useAppStore.getState()
  if (state.responseCount < MRT) return
  if (state.isAnalysisLoading) return
  if (
    state.lastAnalyzedAtSwipeCount != null &&
    state.responseCount < state.lastAnalyzedAtSwipeCount + REANALYZE_INTERVAL
  ) {
    return
  }

  const apiKey =
    (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_GEMINI_API_KEY) ||
    ''

  useAppStore.getState().setAnalysisError(null)
  useAppStore.getState().setAnalysisLoading(true)

  const preloadEnabled =
    typeof process !== 'undefined' &&
    process.env?.EXPO_PUBLIC_PRELOAD_API_RESPONSE === 'true'
  if (__DEV__ && preloadEnabled) {
    try {
      const result = require('@/lib/dev-ai-response.json') as AiAnalysisResult
      useAppStore.getState().setAiAnalysisResult(result)
      useAppStore.getState().setLastAnalyzedAtSwipeCount(state.responseCount)
      useAppStore.getState().setAnalysisError(null)
      const resolved = Image.resolveAssetSource(
        require('@/assets/dev-avatar.png')
      )
      useAppStore.getState().setAvatarImageDataUrl(resolved?.uri ?? null)
    } finally {
      useAppStore.getState().setAnalysisLoading(false)
    }
    return
  }

  if (!apiKey) {
    useAppStore.getState().setAnalysisError('API 키가 설정되지 않았습니다.')
    useAppStore.getState().setAnalysisLoading(false)
    return
  }

  try {
    const result = await requestAnalysis(state.swipeHistory, state.poems, apiKey)
    const prev = state.aiAnalysisResult
    useAppStore.getState().setAiAnalysisResult(result)
    useAppStore.getState().setLastAnalyzedAtSwipeCount(state.responseCount)
    useAppStore.getState().setAnalysisError(null)
    useAppStore.getState().setAvatarImageDataUrl(null)
    requestAvatarImage(apiKey, result)
      .then((url) => {
        if (url) useAppStore.getState().setAvatarImageDataUrl(url)
      })
      .catch(() => {})
    if (
      prev &&
      (prev.label !== result.label || prev.description !== result.description)
    ) {
      // TODO: 로컬/푸시 노티 "결과가 바뀌었어요. 확인해보세요"
    }
  } catch (e) {
    const raw = e instanceof Error ? e.message : String(e)
    console.log('raw', raw)
    const isQuotaExceeded =
      raw.includes('429') || raw.includes('quota') || raw.includes('Quota exceeded')
    const message = isQuotaExceeded
      ? '오늘 무료 요청 한도를 모두 사용했어요. 내일 다시 시도해 주세요.'
      : raw || '분석 요청에 실패했습니다.'
    if (isQuotaExceeded) {
      console.warn('Analysis skipped: quota exceeded (free tier limit).')
    } else {
      console.error('Analysis request failed:', e)
    }
    useAppStore.getState().setAnalysisError(message)
  } finally {
    useAppStore.getState().setAnalysisLoading(false)
  }
}
