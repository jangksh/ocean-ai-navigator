# AI-OCEAN 커리어 나침반

## 프로젝트 개요
Big 5(OCEAN) 심리 측정 기반의 성향 분석 웹사이트.
사용자의 직업군(15종)과 OCEAN 점수로 맞춤형 AI 도구를 처방한다.

## 파일 구조
```
/
├── index.html          # 메인 앱 (UI + 퀴즈 + 결과 렌더링 로직)
├── ocean-personas.js   # 32종 페르소나 데이터 + 직업군별 AI 추천 DB (444개)
├── package.json        # 로컬 dev 서버용
└── CLAUDE.md           # 이 파일
```

## 핵심 로직

### 1. 점수 계산 (index.html > `computeScores()`)
- 25문항 IPIP 기반, 리커트 5점 척도
- 각 차원 5문항 평균 → 0~100% 변환
- N 차원은 '정서안정성'으로 반전 표시 (높을수록 안정)

### 2. 32종 페르소나 매칭 (`scoresToCode()`)
- O/C/E/A/N 각 ≥50% → '1', <50% → '0'
- 5자리 이진 코드 생성 (예: "11010")
- `OCEAN_MASTER_PERSONAS`에서 이름·유머 요약 조회
- `OCEAN_JOB_PERSONAS`에서 직업군 맞춤 insight + AI 추천 조회
- 해당 코드 없으면 Hamming 거리 최소 페르소나로 자동 대체

### 3. ocean-personas.js 구조
```js
OCEAN_MASTER_PERSONAS[]   // 32종 { code, name, summary }
OCEAN_JOB_PERSONAS[]      // 444개 { id, jobGroup, code, title, traits, insight, mainAI, specialistAIs[] }
getJobPersona(code, jobGroup)  // 코드 + 직업군으로 페르소나 조회
getMasterPersona(code)         // 마스터 페르소나 조회
getPersonasByJobGroup(jobGroup) // 직업군 전체 페르소나 조회
```

## 화면 흐름
1. **Landing** → 직업군 15종 선택 → 시작 버튼
2. **Quiz** → 25문항 순차 진행 (이전/다음 네비게이션)
3. **Loading** → 4단계 애니메이션 (3.2초)
4. **Results** → 레이더차트 + 성향 분석 + AI 처방전

## 주요 변수/함수 (index.html)
| 이름 | 설명 |
|------|------|
| `JOBS` | 15개 직업군 배열 |
| `QUESTIONS` | 25개 IPIP 문항 배열 |
| `PERSONA_EMOJI` | 32종 코드→이모지 맵 |
| `scoresToCode(scores)` | 점수→5자리 코드 변환 |
| `lookupJobPersona(code, jobId)` | 직업군 맞춤 페르소나 조회 |
| `renderResults(scores)` | 결과 화면 렌더링 |
| `drawRadar(scores)` | Canvas 레이더 차트 그리기 |

## 로컬 실행
```bash
npm run dev
# → http://localhost:3000
```
> `index.html`을 직접 파일로 열면 CORS로 `ocean-personas.js` 로드가 막힐 수 있어 서버 실행 권장.

## 개발 시 주의사항
- `ocean-personas.js`는 ES module 아님 (plain script). `export` 없음.
- N 차원 점수는 내부적으로 **신경증(Neuroticism)을 반전**한 정서안정성 값임.
- 직업군 ID: `JOBS[].id`(숫자 1-15) ↔ `jobGroup`("01"-"15") 변환 필요 (`String(jobId).padStart(2,'0')`)
