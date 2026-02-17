/**
 * KST(Asia/Seoul) 기준 오늘 날짜 YYYY-MM-DD.
 * 오늘의 운세 기준일·캐시 키용.
 */
export function getTodayKstYYYYMMDD(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })
}

/**
 * KST 기준 오늘 날짜를 한국어 표시용으로 (예: "2월 17일").
 */
export function getTodayKstLabel(): string {
  return new Date().toLocaleDateString('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: 'long',
    day: 'numeric',
  })
}
