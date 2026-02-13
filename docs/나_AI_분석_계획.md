# 나(Me) 화면 AI 분석 계획

시 스와이프 기반 Kishō/MBTI/Big Five 대신, “읽은 시”를 AI에 보내 “나는 어떤 사람인지” 분석하는 방식으로 바꾸기 위한 전략·프롬프트·응답 스키마·구조 변경·그래프용 정보를 정리한 문서입니다.

---

## 현재 vs 목표

- **현재**: 스와이프 방향(공감/비공감) + 카드별 MBTI/Big Five 가중치로 Kishō·MBTI·Big Five를 **로컬 계산** (`utils/scoreCalculator.ts`, MRT=20).
- **목표**: “읽은 시” 목록(또는 요약)을 **AI에 보내서** “나는 어떤 사람인지” 분석받기.
- **문제**:
  - 첫 분석은 20개 채우면 하면 됨.
  - 이후 시를 더 읽으면 결과가 달라질 수 있는데, **읽을 때마다 호출하면 비용·속도 부담**.
- **채택 기준**: 재분석은 **50개** — 스와이프 수가 50개 단위(20 → 70 → 120 …)로 도달할 때마다 AI 호출. “나” 탭 진입 시에는 호출하지 않음. 결과가 바뀌었으면 “확인해보세요” 노티 발송.

---

## AI 호출 타이밍 전략 (채택: C)

### 채택: 50개 도달 시마다 호출 + 결과 변경 시 노티

- **첫 분석**: `responseCount >= MRT(20)`일 때 1회 AI 호출.
- **재분석**: “나” 탭 진입 시에는 호출하지 않음. **스와이프 후** `responseCount >= lastAnalyzedAtSwipeCount + 50`이 되는 **그 타이밍마다** AI 재호출 (20 → 70 → 120 → 170 …).
- **결과 변경 시**: 새 분석 결과와 이전 결과를 비교해 **바뀌었으면** 로컬/푸시 노티 발송 (예: “결과가 바뀌었어요. 확인해보세요”).
- **저장**: `lastAnalyzedAtSwipeCount`, 마지막 분석 결과(비교용). 로컬(Zustand/AsyncStorage) 또는 Firestore `users/{uid}/analysis`.

### 구현 시 필요한 것 (요약)

1. **상태/저장**: `lastAnalyzedAtSwipeCount`, 마지막 분석 결과(비교용). 필요 시 `lastAnalyzedAt`.
2. **트리거**: **스와이프 직후** (예: `swipeCard` 호출 후 또는 `responseCount` 갱신 후) 조건 검사. “나” 탭 진입 시에는 호출하지 않음.
3. **조건**: `responseCount >= MRT` && (`lastAnalyzedAtSwipeCount` 없음 **또는** `responseCount >= lastAnalyzedAtSwipeCount + 50`).
4. **AI 호출**: 조건 통과 시 “읽은 시” 데이터로 API 호출 → 새 결과 저장 → 이전 결과와 비교해 **바뀌었으면** “결과가 바뀌었어요. 확인해보세요” 노티(로컬/푸시) 발송 → `lastAnalyzedAtSwipeCount = responseCount` 갱신.
5. **UI**: 나 화면은 AI 응답(label, description, traits, keywords)만 표시. Kishō 16유형·MBTI·Big Five 제거.

---

## AI가 판단하는 것: “나란 사람이 어떤 사람인지”

- **Kishō 유형(kishoType)을 AI에게 요청하지 않음.** 16유형을 보여주고 싶으면 지금처럼 로컬 계산(scoreCalculator)으로 하면 됨.
- **AI에게 원하는 것**: “이 사용자는 어떤 사람인지”를 **AI가 자유롭게 판단**한 내용. 고정 유형·MBTI·Big Five가 아니라, 시에 대한 공감/비공감만 보고 **그 사람에 대한 해석(설명·한 마디·특징·키워드 등)**을 JSON으로 받음.

---

## AI 프롬프트 예시

**입력**: 사용자가 스와이프한 시 목록. 각 항목은 “공감(오른쪽)” 또는 “비공감(왼쪽)”과 시 텍스트(또는 ID)를 포함.

### 시스템 프롬프트 (예시)

```
당신은 시를 통해 사람을 읽는 분석가입니다.
사용자가 "공감"한 시와 "비공감"한 시 목록만 보고, 그 사람이 어떤 사람인지 당신 나름으로 판단해 주세요.
유형 테스트(MBTI, Big Five, 16유형 등)로 분류하지 말고, "이 사람은 ~한 사람이다"처럼 자유롭게 서술해 주세요.
반드시 아래 JSON 스키마만 사용해 응답하고, 다른 설명은 붙이지 마세요.
```

### 유저 프롬프트 (예시)

```
다음은 사용자가 스와이프한 시입니다. "공감"은 오른쪽, "비공감"은 왼쪽 스와이프입니다.

[공감]
- "바람이 잠깐 멈추면 / 나도 잠깐 멈춘다"
- "빈 의자만 남은 방에서 / 창문이 햇빛을 나눠준다"
… (최대 N편, 또는 최근 50편 등)

[비공감]
- "번개는 하늘의 주름 / 우리는 땅의 그늘"
…

위 목록만 보고, 이 사용자가 어떤 사람인지 판단한 뒤, 지정된 JSON 형식으로만 답하세요.
```

**토큰 절약**: 시 전문 대신 `Poem_ID` + `방향`만 보내도 됨. 이 경우 시스템에 “시 ID별 텍스트/카테고리” 참조 테이블을 주거나, 백엔드에서 ID→텍스트를 붙여서 AI에 넘길 수 있음.

---

## AI 응답 JSON 스키마 (“나란 사람이 어떤 사람인지”)

- **kishoType 없음.** 16유형·MBTI·Big Five 요청/응답 없음.
- AI가 **자유롭게 쓴** “이 사람에 대한 한 마디·설명·특징·키워드”만 받음.

### 필수·권장 필드

| 필드 | 타입 | 설명 |
|------|------|------|
| `description` | string | “이 사람은 ~하다” 2~3문장 설명. 나 화면 메인 카드에 표시. |
| `label` | string | 한 마디로 요약 (예: “고요함을 찾는 사람”). 제목/부제목용. |

### 선택 필드

| 필드 | 타입 | 설명 |
|------|------|------|
| `traits` | string[] | 특징 3~5개. “이 유형의 특징” 리스트로 표시. |
| `keywords` | string[] | 키워드 3~6개. 칩/태그로 표시. |
| `summary` | string | 한 줄 요약. 노티 문구(“결과가 바뀌었어요”) 대신 쓸 수 있음. |

### 예시

```json
{
  "label": "고요함을 찾는 사람",
  "description": "바람이나 빈 의자, 햇빛 같은 소재에 공감하는 걸 보면, 소음보다 고요함과 여백을 중요하게 여기는 사람으로 보인다. 번개나 격한 비유에는 거리를 두는 쪽이라, 감정을 과하게 드러내기보다는 안쪽으로 정리하는 스타일일 가능성이 높다.",
  "traits": ["여백과 고요를 중시함", "감정을 안쪽으로 정리하는 편", "단순한 이미지에 공감함"],
  "keywords": ["고요", "여백", "내면", "단순함"],
  "summary": "고요와 여백을 좋아하는 사람으로 보여요."
}
```

**“결과 바뀌었는지” 비교**: 이전/현재 payload를 비교. `description`만 비교하거나, `label` + `description`을 이어 붙인 문자열 해시로 비교해도 됨. (전체 JSON 문자열 비교도 가능.)

---

## 그래프·차트로 보여주고 싶을 때 필요한 정보

나 화면에 **그래프/차트**까지 넣어서 다양한 정보를 보여주려면, “어떤 차트를 쓸지”에 따라 **AI 응답에 넣을 필드**와 **앱에서 쌓을 데이터**가 갈립니다.

### 1. AI 응답에서 받으면 좋은 정보 (차트용)

| 보여주고 싶은 것 | 차트 형태 | AI 응답에 추가로 받을 필드 | 비고 |
|------------------|-----------|----------------------------|------|
| **성향 축별 강도** | 레이더 차트 / 바 차트 | `dimensions`: 축 이름 + 0~100 점수. 예: `{ "감정 지향": 70, "내면 지향": 30, "유연함": 60, "조화 지향": 80 }` 또는 `[{ "name": "감정 지향", "value": 70 }, ...]` | AI가 “이 사람은 감정/내면/유연/조화 쪽으로 얼마나?”를 수치로 주면 그대로 시각화 가능. |
| **특징 강도** | 바 차트 | `traits`를 `{ name, strength }[]` 형태로. 예: `[{ "name": "여백을 중시함", "strength": 85 }, { "name": "감정을 안쪽으로 정리", "strength": 70 }]` | 지금의 `traits: string[]`에 `strength`(0~100)만 붙이면 “이 유형의 특징”을 막대 길이로 표현 가능. |
| **키워드 비중** | 태그 클라우드(크기 차이) / 바 차트 | `keywords`를 `{ text, weight }[]` 형태로. 예: `[{ "text": "고요", "weight": 90 }, { "text": "여백", "weight": 70 }]` | `weight` 있으면 글자 크기나 막대 길이로 비중 표현. 없으면 동일 크리 칩으로만. |

**AI 응답 JSON 예시 (차트까지 쓸 때 확장)**

```json
{
  "label": "고요함을 찾는 사람",
  "description": "...",
  "traits": [
    { "name": "여백과 고요를 중시함", "strength": 85 },
    { "name": "감정을 안쪽으로 정리하는 편", "strength": 70 }
  ],
  "keywords": [
    { "text": "고요", "weight": 90 },
    { "text": "여백", "weight": 75 }
  ],
  "dimensions": {
    "감정 지향": 72,
    "내면 지향": 65,
    "유연함": 58,
    "조화 지향": 80
  },
  "summary": "고요와 여백을 좋아하는 사람으로 보여요."
}
```

- **레이더/바**: `dimensions` 키 이름을 축 라벨로, 값을 0~100으로 사용.
- **특징 바**: `traits[].strength`로 막대 길이.
- **키워드**: `keywords[].weight`로 칩 크기 또는 작은 바 차트.

### 2. 앱에서만 쌓으면 되는 정보 (AI 응답 없이 차트)

| 보여주고 싶은 것 | 차트 형태 | 앱에서 필요한 데이터 | 비고 |
|------------------|-----------|------------------------|------|
| **공감 / 비공감 비율** | 파이·도넛 | 스와이프별 방향 저장 또는 `rightCount`, `leftCount` 집계 | `responseCount`만 있으면 비율은 “공감 수 / 전체”만 가능. 좌/우 개별 필요. |
| **카테고리별 공감률** | 가로/세로 바 차트 | 시별 `Content_Category` + 스와이프 방향. 카테고리별 “공감 횟수 / 노출 횟수” 집계 | `PoemCard`에 `Content_Category` 있음. 스와이프 이력에 카드 메타 저장 필요. |
| **시간에 따른 공감률** | 라인 차트 | 스와이프 시점 + 방향. 예: “최근 10개씩 묶어서 공감률” | 이력이 시점별로 있어야 함. |

정리하면, **AI에게 차트용으로 추가로 받고 싶으면** `dimensions`, `traits[].strength`, `keywords[].weight`를 위 예시처럼 정의하면 되고, **공감률·카테고리·추이** 같은 건 AI 없이 **앱에서 스와이프 이력(방향 + 카드 메타/시점)**만 잘 쌓으면 됩니다.

---

## 구조 변경 (AI “나란 사람” 분석만 사용)

- **Kishō 16유형·MBTI·Big Five**는 나 화면·분석 경로에서 **제거**. (Kishō를 보여주고 싶으면 지금처럼 로컬 계산으로만 하고, AI는 “어떤 사람인지” 자유 서술만 받음.)

### 1. 데이터·타입

| 위치 | 변경 내용 |
|------|-----------|
| `types/index.ts` | 분석 결과용: `AnalysisResult`를 `{ canShowResults: boolean, aiResult: AiAnalysisResult \| null }` 형태로 단순화. `AiAnalysisResult { label: string, description: string, traits?: string[], keywords?: string[], summary?: string }` 새로 정의. (기존 mbti, bigFive, kisho 제거.) |
| 스토어 | `aiAnalysisResult: AiAnalysisResult \| null`, `lastAnalyzedAtSwipeCount: number \| null` 저장. 비교·노티는 위 payload 비교로 수행. |

### 2. 스토어·분석 흐름

| 위치 | 변경 내용 |
|------|-----------|
| `store/useAppStore.ts` | **추가**: `aiAnalysisResult`, `lastAnalyzedAtSwipeCount`. **변경**: `getAnalysisResult()`는 `canShowResults = responseCount >= MRT` + `aiResult`만 반환. (mbtiTotal/bigFiveCumulative 업데이트는 분석에 쓰지 않으면 제거 가능.) |
| `utils/scoreCalculator.ts` | `MRT`와 “결과 표시 가능 여부”만 사용. MBTI/Big Five/Kisho 계산은 분석 경로에서 제거. |

### 3. UI (나 화면)

| 위치 | 변경 내용 |
|------|-----------|
| `app/(tabs)/account.tsx` | **표시**: AI 결과만 사용. `label`(한 마디), `description`(설명 카드), `traits`, `keywords`. 16유형 아바타·KISHO_RESULTS 조회 제거. (아바타는 제거하거나, 통일된 단일 아이콘/이미지로 대체.) **제거**: MBTI 문구, PreferenceBar, BigFiveRadar, Kishō 유형 아이콘·색상 매핑. |
| `constants/kisho-results.ts` | 나 화면 AI 결과 표시에는 사용하지 않음. (로컬 Kishō 결과를 다른 곳에서 쓰면 유지.) |
| `components/preference-bar.tsx`, `components/big-five-radar.tsx` | account에서 제거. 다른 화면에서 안 쓰면 삭제 또는 보관. |

**정리**: AI에게는 **kishoType이 아니라 “나란 사람이 어떤 사람인지”**만 요청하고, 응답은 **label + description + (선택) traits, keywords, summary** JSON으로 받아서 그대로 나 화면에 뿌리면 됨.
