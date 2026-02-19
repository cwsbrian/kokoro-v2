import { ANALYSIS_WINDOW_SIZE } from '@/constants/analysis'
import { AiAnalysisResultSchema } from '@/schemas/poemSchema'
import type { AiAnalysisResult, PoemCard, SwipeRecord } from '@/types'
import { GoogleGenerativeAI } from '@google/generative-ai'

const MODEL_ID = 'gemini-2.0-flash'
/** API 프롬프트용: 최근 N개 스와이프만 전달 (입력 길이 줄여 출력 여유 확보) */
const PROMPT_SWIPE_WINDOW = 50
/** API 프롬프트용: 시 한 편당 최대 문자 수 (MAX_TOKENS 방지) */
const PROMPT_POEM_MAX_CHARS = 120

const SYSTEM_PROMPT = `당신은 시를 통해 사람을 읽는 분석가입니다.
사용자가 "좋아한 시", "싫어한 시" 목록만 보고, 그 사람이 어떤 사람인지 당신 나름으로 판단해 주세요.
유형 테스트(MBTI, Big Five, 16유형 등)로 분류하지 말고, "이 사람은 ~한 사람이다"처럼 자유롭게 서술해 주세요.
반드시 아래 JSON 스키마만 사용해 응답하고, 다른 설명은 붙이지 마세요.

JSON 형식 (모든 수치는 0~100):
{
  "label": "한 마디 요약 (예: 고요함을 찾는 사람)",
  "description": "이 사람은 ~하다 2~3문장 설명",
  "traits": [{"name": "특징 설명", "strength": 85}, ...],
  "keywords": [{"text": "키워드", "weight": 90}, ...],
  "summary": "한 줄 요약",
  "dimensions": {"감정 지향": 70, "내면 지향": 65, "유연함": 58, "조화 지향": 80},
  "values": [{"name": "자유", "weight": 90}, ...],
  "quote": "이 사람을 한 문장으로 표현한 인용문",
  "color": "#DB2777"
}
- traits: 이 사람의 특징(성격) 3~5개, strength 0~100 — 바 차트용.
- keywords: 시에서 읽힌 키워드 3~6개, weight 0~100 — 태그용.
- dimensions: 성향 축 4~6개, 축 이름을 키로 0~100 — 레이더 차트 전용 (예: 감정 지향, 내면 지향, 유연함, 조화 지향, 논리 지향).
- values: 이 사람이 중요히 여기는 가치관 3~5개 (traits와 구분), weight 0~100 — 태그/비중 표시용.
- quote: 이 사람을 한 문장으로 요약한 인용문 (따옴표 문장).
- color: 이 사람을 대표하는 색상 hex 6자 (예: #DB2777, #6366f1). 차트·강조에 사용됨.`

function buildUserPrompt(likeTexts: string[], dislikeTexts: string[]): string {
  const lines: string[] = ['다음은 사용자가 스와이프한 시입니다.']
  if (likeTexts.length > 0) {
    lines.push('\n[좋아한 시]')
    likeTexts.forEach((t) => lines.push(`- "${t}"`))
  }
  if (dislikeTexts.length > 0) {
    lines.push('\n[싫어한 시]')
    dislikeTexts.forEach((t) => lines.push(`- "${t}"`))
  }
  lines.push('\n위 목록만 보고, 이 사용자가 어떤 사람인지 판단한 뒤, 지정된 JSON 형식으로만 답하세요.')
  return lines.join('\n')
}

function extractJsonFromResponse(text: string): string {
  const trimmed = text.trim()
  const codeBlock = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlock) return codeBlock[1].trim()
  const firstBrace = trimmed.indexOf('{')
  const lastBrace = trimmed.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1)
  }
  return trimmed
}

export async function requestAnalysis(
  swipeHistory: SwipeRecord[],
  poems: PoemCard[],
  apiKey: string
): Promise<AiAnalysisResult> {
  const poemMap = new Map(poems.map((p) => [p.Poem_ID, p]))
  const window = swipeHistory.slice(-Math.min(PROMPT_SWIPE_WINDOW, ANALYSIS_WINDOW_SIZE))

  const likeTexts: string[] = []
  const dislikeTexts: string[] = []

  for (const record of window) {
    const poem = poemMap.get(record.poemId)
    const raw = poem?.Poem_Text_KR ?? ''
    if (!raw) continue
    const text =
      raw.length > PROMPT_POEM_MAX_CHARS ? raw.slice(0, PROMPT_POEM_MAX_CHARS) + '…' : raw
    if (record.response === 'like') likeTexts.push(text)
    else dislikeTexts.push(text)
  }

  const userPrompt = buildUserPrompt(likeTexts, dislikeTexts)
  const fullPrompt = SYSTEM_PROMPT + '\n\n' + userPrompt
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: MODEL_ID,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
      responseMimeType: 'application/json',
    },
  })

  const maxAttempts = 2
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await model.generateContent(fullPrompt)
      const response = result.response
      const raw = response.text()
      if (!raw) throw new Error('Gemini returned empty response')

      const jsonStr = extractJsonFromResponse(raw)
      if (!jsonStr || jsonStr.length < 10) {
        throw new Error('Gemini returned no valid JSON (empty or truncated response)')
      }

      let parsed: unknown
      try {
        parsed = JSON.parse(jsonStr)
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        lastError = new Error(`Gemini response was invalid JSON: ${msg}. Response may be truncated.`)
        if (attempt < maxAttempts && msg.includes('Unexpected end of input')) {
          await new Promise((r) => setTimeout(r, 1500))
          continue
        }
        throw lastError
      }
      const analysisResult = AiAnalysisResultSchema.parse(parsed)
      if (__DEV__) console.warn('[AI response] analysis:', JSON.stringify(analysisResult, null, 2))
      return analysisResult
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e))
      const isTruncated =
        lastError.message.includes('Unexpected end of input') ||
        lastError.message.includes('truncated')
      if (attempt < maxAttempts && isTruncated) {
        await new Promise((r) => setTimeout(r, 1500))
        continue
      }
      throw lastError
    }
  }

  throw lastError ?? new Error('Analysis failed after retries')
}
