/**
 * Dev fixture 캡처: 미리 만든 시로 Gemini 분석 API를 한 번 호출하고
 * 응답을 lib/dev-ai-response.json 에 저장합니다.
 * 사용: npm run capture-dev-response 또는 EXPO_PUBLIC_GEMINI_API_KEY=your_key node scripts/capture-dev-response.mjs
 * .env 파일이 프로젝트 루트에 있으면 dotenv로 자동 로드됩니다.
 */

import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

dotenv.config({ path: path.join(rootDir, '.env') })

const outPath = path.join(rootDir, 'lib', 'dev-ai-response.json')
const avatarOutPath = path.join(rootDir, 'assets', 'dev-avatar.png')

const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY
if (!apiKey) {
  console.error('EXPO_PUBLIC_GEMINI_API_KEY not set. Set it in .env or pass when running.')
  process.exit(1)
}

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
- dimensions: 성향 축 4~6개, 축 이름을 키로 0~100 — 레이더 차트 전용.
- values: 이 사람이 중요히 여기는 가치관 3~5개, weight 0~100.
- quote: 이 사람을 한 문장으로 요약한 인용문.
- color: 이 사람을 대표하는 색상 hex 6자.`

const PREMADE_LIKES = [
  '고요할수록 더 잘 들린다.',
  '바람이 지나간 자리에는 빈 의자가 하나.',
  '한 걸음 물러서면 보이는 것들이 있다.',
]
const PREMADE_DISLIKES = [
  '시끄러운 소리만 가득한 거리.',
]

function buildUserPrompt(likeTexts, dislikeTexts) {
  const lines = ['다음은 사용자가 스와이프한 시입니다.']
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

function extractJsonFromResponse(text) {
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

const userPrompt = buildUserPrompt(PREMADE_LIKES, PREMADE_DISLIKES)
const fullPrompt = SYSTEM_PROMPT + '\n\n' + userPrompt

const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`

const body = {
  contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 4096,
    responseMimeType: 'application/json',
  },
}

console.log('Calling Gemini API with pre-made poems...')
const res = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

if (!res.ok) {
  const err = await res.text()
  console.error('API error:', res.status, err)
  process.exit(1)
}

const data = await res.json()
const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
if (!text) {
  console.error('No text in response:', JSON.stringify(data, null, 2))
  process.exit(1)
}

const jsonStr = extractJsonFromResponse(text)
let parsed
try {
  parsed = JSON.parse(jsonStr)
} catch (e) {
  console.error('Invalid JSON in response:', jsonStr.slice(0, 200))
  process.exit(1)
}

fs.writeFileSync(outPath, JSON.stringify(parsed, null, 2), 'utf8')
console.log('Saved to', outPath)

function buildAvatarPrompt(result) {
  const parts = [
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

console.log('Calling Gemini avatar API...')
const avatarUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`
const avatarBody = {
  contents: [{ role: 'user', parts: [{ text: buildAvatarPrompt(parsed) }] }],
  generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
}
const avatarRes = await fetch(avatarUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(avatarBody),
})
if (avatarRes.ok) {
  const avatarData = await avatarRes.json()
  const parts = avatarData?.candidates?.[0]?.content?.parts ?? []
  for (const part of parts) {
    if (part.inlineData?.data) {
      const buf = Buffer.from(part.inlineData.data, 'base64')
      fs.writeFileSync(avatarOutPath, buf)
      console.log('Saved avatar to', avatarOutPath)
      break
    }
  }
} else {
  console.warn('Avatar API failed (', avatarRes.status, '), dev-avatar.png not updated.')
}
