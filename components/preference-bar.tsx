import React from 'react'

import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'

interface PreferenceBarProps {
  leftLabel: string
  rightLabel: string
  leftPercent: number
  rightPercent: number
  /** 유형별 색상 (미지정 시 primary) */
  accentColor?: string
}

export function PreferenceBar({
  leftLabel,
  rightLabel,
  leftPercent,
  rightPercent,
  accentColor,
}: PreferenceBarProps) {
  const sanitizedLeft = Math.max(0, leftPercent)
  const sanitizedRight = Math.max(0, rightPercent)
  const total = sanitizedLeft + sanitizedRight
  const left = total > 0 ? (sanitizedLeft / total) * 100 : 50
  const right = 100 - left

  return (
    <Box className="gap-1">
      <Box className="flex-row justify-between">
        <Text className="text-xs text-typography-400">{leftLabel}</Text>
        <Text className="text-xs text-typography-400">{rightLabel}</Text>
      </Box>
      <Box className="h-2 flex-row rounded-full bg-outline-200 overflow-hidden">
        <Box
          className={`h-full rounded-l-full ${!accentColor ? 'bg-primary-500' : ''}`}
          style={{
            width: `${left}%`,
            ...(accentColor ? { backgroundColor: accentColor } : {}),
          }}
        />
        <Box
          className="h-full rounded-r-full bg-outline-400"
          style={{ width: `${right}%` }}
        />
      </Box>
    </Box>
  )
}
