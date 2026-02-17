import { getTodayKstYYYYMMDD } from '@/lib/getKstDate'
import type { PoemCard } from '@/types'

/** KST 오늘 날짜로 오늘의 시 인덱스 (날마다 동일, 알림·시 탭 공통) */
export function getTodayPoemIndex(poems: PoemCard[]): number {
  if (poems.length === 0) return 0
  const seed = getTodayKstYYYYMMDD()
  const hash = seed.split('').reduce((acc, c) => ((acc << 5) - acc + c.charCodeAt(0)) | 0, 0)
  return Math.abs(hash) % poems.length
}
