import type { AiAnalysisResult } from '@/types'
import { File, Paths } from 'expo-file-system'

/** Nano Banana — Gemini 2.5 Flash Image (공식 문서 기준) */
const IMAGE_MODEL = 'gemini-2.5-flash-image'

function buildAvatarPrompt(result: AiAnalysisResult): string {
  const parts: string[] = [
    'Create a single cute, simple character avatar illustration.',
    'Style: flat design, minimal details, suitable for a profile picture. No text in the image.',
    `The character should represent: "${result.label}".`,
    result.description ? `Personality/tone: ${result.description.slice(0, 150)}...` : '',
  ]
  if (result.color) {
    parts.push(`Use ${result.color} as the main accent color for the character or background.`)
  }
  return parts.filter(Boolean).join('\n')
}

interface GenerateContentResponse {
  candidates?: {
    content?: {
      parts?: { text?: string; inlineData?: { mimeType?: string; data?: string } }[]
    }
  }[]
}

/**
 * Gemini 이미지 생성(Nano Banana)으로 분석 결과 기반 캐릭터 아바타 생성.
 * base64를 파일로 저장해 file URI 반환 (data URL 길이 제한 회피).
 * 성공 시 file URI, 실패 시 null.
 */
export async function requestAvatarImage(
  apiKey: string,
  result: AiAnalysisResult
): Promise<string | null> {
  const prompt = buildAvatarPrompt(result)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:generateContent`
  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE'],
    },
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.text()
    if (__DEV__) console.warn('Avatar image request failed:', res.status, err)
    return null
  }

  const data = (await res.json()) as GenerateContentResponse
  if (__DEV__) {
    const summary = {
      candidatesCount: data.candidates?.length ?? 0,
      parts: data.candidates?.[0]?.content?.parts?.map((p) =>
        p.inlineData ? { type: 'inlineData', mimeType: p.inlineData.mimeType, dataLength: p.inlineData.data?.length } : { type: 'text', length: p.text?.length }
      ) ?? [],
    }
    console.warn('[AI response] avatar:', JSON.stringify(summary, null, 2))
  }
  const parts = data.candidates?.[0]?.content?.parts ?? []
  for (const part of parts) {
    if (part.inlineData?.data) {
      const base64 = part.inlineData.data
      const ext = part.inlineData.mimeType === 'image/jpeg' ? 'jpg' : 'png'
      try {
        const file = new File(Paths.cache, `avatar_${Date.now()}.${ext}`)
        file.create({ overwrite: true })
        file.write(base64, { encoding: 'base64' })
        if (__DEV__) console.warn('[AI response] avatar saved:', file.uri)
        return file.uri
      } catch (e) {
        if (__DEV__) console.warn('Avatar file write failed:', e)
        return null
      }
    }
  }
  return null
}
