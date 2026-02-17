/**
 * 오늘의 운세 카테고리 정의.
 * 아이콘: MaterialIcons (@expo/vector-icons/MaterialIcons)
 * 표시 순서: total → love, money, work, health, relationship → luck → caution
 */

import type { FortuneCategoryId } from '@/types'

export interface FortuneCategory {
  id: FortuneCategoryId
  name: string
  icon: string
}

/** total은 별도 표시(총운 한 줄)이므로 UI 카드 목록에는 love ~ caution만. */
export const FORTUNE_CATEGORIES: FortuneCategory[] = [
  { id: 'love', name: '연애·애정운', icon: 'favorite' },
  { id: 'money', name: '금전·재물운', icon: 'payments' },
  { id: 'work', name: '직업·일운', icon: 'work' },
  { id: 'health', name: '건강운', icon: 'health-and-safety' },
  { id: 'relationship', name: '대인관계운', icon: 'groups' },
  { id: 'luck', name: '행운', icon: 'stars' },
  { id: 'caution', name: '주의·금기', icon: 'warning' },
]

export const FORTUNE_CATEGORY_MAP = Object.fromEntries(
  FORTUNE_CATEGORIES.map((c) => [c.id, c])
) as Record<FortuneCategoryId, FortuneCategory>
