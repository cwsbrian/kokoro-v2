import { z } from 'zod'

// Poem Card Schema (tag만 유지, MBTI/BigFive/Kisho_Axis 제거)
export const PoemCardSchema = z.object({
  Poem_ID: z.string().regex(/^P\d+$/),
  Poem_Type: z.enum(['Haiku', 'Senryu', 'Single-Line Poem']),
  Poem_Text_KR: z.string().min(1),
  Poem_Text_JP: z.string(),
  Content_Category: z.string(),
  Tag: z.string(),
})

export const PoemCardsSchema = z.array(PoemCardSchema)

// Swipe & AI Analysis
export const SwipeResponseSchema = z.enum(['like', 'dislike'])

export const SwipeRecordSchema = z.object({
  poemId: z.string(),
  response: SwipeResponseSchema,
  timestamp: z.number().optional(),
})

export const AiAnalysisResultSchema = z.object({
  label: z.string(),
  description: z.string(),
  traits: z
    .array(z.object({ name: z.string(), strength: z.number().min(0).max(100) }))
    .optional(),
  keywords: z
    .array(z.object({ text: z.string(), weight: z.number().min(0).max(100) }))
    .optional(),
  summary: z.string().optional(),
  dimensions: z.record(z.string(), z.number().min(0).max(100)).optional(),
  values: z
    .array(z.object({ name: z.string(), weight: z.number().min(0).max(100) }))
    .optional(),
  quote: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
})

export const UserAnalysisStateSchema = z.object({
  responseCount: z.number().int().min(0).default(0),
  lastAnalyzedAtSwipeCount: z.number().int().min(0).nullable().default(null),
  aiAnalysisResult: AiAnalysisResultSchema.nullable().default(null),
  swipeHistory: z.array(SwipeRecordSchema).default([]),
  lastUpdated: z.string(),
})
