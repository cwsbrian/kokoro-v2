import { getTodayKstYYYYMMDD } from '@/lib/getKstDate'
import { TodayFortuneResponseSchema } from '@/schemas/fortuneSchema'
import type { AiAnalysisResult, TodayFortuneResponse } from '@/types'
import { GoogleGenerativeAI } from '@google/generative-ai'

const MODEL_ID = 'gemini-2.0-flash'

const SYSTEM_PROMPT = `당신은 사용자의 성향을 반영한 "오늘의 운세"를 생성하는 전문가입니다.
- 반드시 JSON만 출력하고, 다른 설명이나 마크다운은 넣지 마세요.
- 문구는 친근하고 위로가 되는 톤으로 작성해주세요.
- 사용자의 성향(특징·키워드)을 참고해, 그 사람에게 맞는 조언처럼 작성해주세요.
- 각 항목은 충분히 길게 써주세요: total은 2~3문장, summary는 1~2문장, detail은 2~4문장으로 구체적인 조언을 담아주세요.

아래 JSON 형식만 사용하세요. luck의 number는 숫자(예: 7), 나머지 필드는 문자열입니다.
{
  "total": "오늘의 총운 2~3문장 (하루 요약, 기운, 마음가짐 등)",
  "love": {"summary": "연애·애정운 요약 1~2문장", "detail": "구체적인 조언 2~4문장"},
  "money": {"summary": "금전·재물운 요약 1~2문장", "detail": "구체적인 조언 2~4문장"},
  "work": {"summary": "직업·일운 요약 1~2문장", "detail": "구체적인 조언 2~4문장"},
  "health": {"summary": "건강운 요약 1~2문장", "detail": "구체적인 조언 2~4문장"},
  "relationship": {"summary": "대인관계운 요약 1~2문장", "detail": "구체적인 조언 2~4문장"},
  "luck": {"color": "예: 민트", "number": 7, "direction": "예: 동쪽", "time": "선택"},
  "caution": "주의·금기 1~2문장 (선택)"
}`

function buildUserPrompt(aiResult: AiAnalysisResult, todayYYYYMMDD: string): string {
  const label = aiResult.label ?? '사용자'
  const description = aiResult.description ?? ''
  const traits = (aiResult.traits ?? []).map((t) => t.name).join(', ')
  const keywords = (aiResult.keywords ?? []).map((k) => k.text).join(', ')

  return `오늘 날짜: ${todayYYYYMMDD}
사용자 성향:
- 유형: ${label}
- 설명: ${description}
- 특징: ${traits || '-'}
- 키워드: ${keywords || '-'}

위 성향을 반영해서 "오늘의 운세"를 지정된 JSON 형식으로만 생성해주세요.`
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

export const FORTUNE_QUOTA_MESSAGE =
  '오늘 무료 요청 한도를 모두 사용했어요. 내일 다시 시도해 주세요.'

/**
 * 오늘의 운세 API 호출. aiResult가 없으면 호출하지 말고 UI에서 안내.
 */
export async function requestTodayFortune(
  aiResult: AiAnalysisResult,
  todayYYYYMMDD: string,
  apiKey: string
): Promise<TodayFortuneResponse> {
  const userPrompt = buildUserPrompt(aiResult, todayYYYYMMDD)
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

  const result = await model.generateContent(fullPrompt)
  const response = result.response
  const raw = response.text()
  if (!raw) throw new Error('Gemini returned empty response')

  const jsonStr = extractJsonFromResponse(raw)
  if (!jsonStr || jsonStr.length < 10) {
    throw new Error('Gemini returned no valid JSON')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonStr)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    throw new Error(`Gemini fortune response was invalid JSON: ${msg}`)
  }

  const validated = TodayFortuneResponseSchema.parse(parsed)
  if (process.env.NODE_ENV === 'development') {
    console.warn('[fortune] response:', JSON.stringify(validated, null, 2))
  }
  return validated
}

export { getTodayKstYYYYMMDD }
