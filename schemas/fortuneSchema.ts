import { z } from 'zod'

const TodayFortuneCategoryItemSchema = z.object({
  summary: z.string(),
  detail: z.string().optional(),
})

const TodayFortuneLuckSchema = z
  .object({
    color: z.string().optional(),
    number: z.number().optional(),
    direction: z.string().optional(),
    time: z.string().optional(),
  })
  .optional()

export const TodayFortuneResponseSchema = z.object({
  total: z.string(),
  love: TodayFortuneCategoryItemSchema,
  money: TodayFortuneCategoryItemSchema,
  work: TodayFortuneCategoryItemSchema,
  health: TodayFortuneCategoryItemSchema,
  relationship: TodayFortuneCategoryItemSchema,
  luck: TodayFortuneLuckSchema,
  caution: z.string().optional(),
})

export type TodayFortuneResponseInput = z.infer<typeof TodayFortuneResponseSchema>
