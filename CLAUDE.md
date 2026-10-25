# AI-OCEAN 커리어 나침반

## 프로젝트 개요
Big 5(OCEAN) 심리 측정 기반의 성향 분석 웹사이트.
사용자의 직업군(15종)과 OCEAN 점수로 맞춤형 AI 도구를 처방한다.

## 파일 구조
```
/
├── index.html          # 메인 앱 (UI + 퀴즈 + 결과 렌더링 로직)
├── ocean-personas.js   # 32종 페르소나 데이터 + 직업군별 AI 추천 DB (444개)
├── v2_data.js          # 직업군×유형 480개 상세 문장/AI 도구 (약 4MB, 결과 화면에서 로드)
├── i18n_en.js          # 영어 문항·결과 화면 문구·32유형 영어 요약 (영어가 기본 언어)
├── i18n_en_job04.js    # 직군 04(금융/재무/회계) 영어 결과 본문 32개 (다른 직군은 영어 본문 없음 → 유형 요약 + 안내 문구 표시)
├── build_type_pages.js # 유형별 정적 페이지 + sitemap.xml 생성기 (node로 실행)
├── types/<코드>/index.html  # 생성물: 32개 유형 정적 페이지 (예: /types/11010/)
├── robots.txt, sitemap.xml  # 검색엔진용 (sitemap.xml은 생성기가 덮어씀, 33 URL)
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

## SEO 정적 페이지 (유형별 URL)
```bash
node build_type_pages.js   # types/*/index.html 32개, sitemap.xml(33 URL), index.html의 정적 링크 블록을 다시 생성
```
- `types/`와 `sitemap.xml`은 **생성물**이다. 직접 고치지 말고 생성기(또는 원본 데이터)를 수정한 뒤 다시 실행해 함께 커밋한다.
- `index.html`의 `<!-- TYPE-LINKS:START -->` ~ `<!-- TYPE-LINKS:END -->` 블록도 생성기가 갱신한다.
- 페이지 이름·요약은 `ocean-personas.js`, 이모지/영문명/추천 AI 조합/차원 설명은 `index.html` 상수(`PERSONA_EMOJI` 등)를 읽어 재사용한다. 상수 이름을 바꾸면 생성기도 고쳐야 한다.
- 직업군 섹션 본문은 `ocean-personas.js` 직업군 페르소나를 우선 쓰고, 없는 칸만 `v2_data.js`로 보완한다(코드와 모순되는 문장은 제외).
- 데이터가 화면의 직업군 이름과 맞지 않아 **06, 14번 직업군은 페이지에서 제외**했다 (`EXCLUDED_JOB_GROUPS`). 데이터 정리 후 목록에서 빼면 된다.
- 테스트 시작 버튼은 `/?start=1`로 연결되고, 메인 `index.html`이 이를 받아 직업군 선택 화면을 연다.

## 언어 (i18n)
- 기본 언어는 영어. `?lang=ko` 또는 우측 상단 KO/EN 버튼으로 전환하며 선택은 localStorage `ocean_lang`에 저장된다.
- 한국어 정적 유형 페이지(`/types/…`)의 시작 링크는 `?lang=ko`를 붙여 한국어로 연결된다.
- 새 직군의 영어 본문은 `window.EN_JOB['<직군>_<코드>']`에 추가한다 (title, mainAI, specialistAIs, v2 구조는 i18n_en_job04.js 참고).

## 개발 시 주의사항
- `ocean-personas.js`는 ES module 아님 (plain script). `export` 없음.
- N 차원 점수는 내부적으로 **신경증(Neuroticism)을 반전**한 정서안정성 값임.
- 직업군 ID: `JOBS[].id`(숫자 1-15) ↔ `jobGroup`("01"-"15") 변환 필요 (`String(jobId).padStart(2,'0')`)
- 알려진 데이터 불일치 (미해결): ① 6번 직업군은 화면에서 'IT 개발/데이터/AI'인데 데이터 내용은 '건설/채굴', 14번은 '1인 창업/프리랜서'인데 직업군 페르소나 일부는 '설치/정비/수리' 내용. ② `v2_data.js` 문장 일부가 정서안정성 코드와 반대로 서술(예: 안정성 0인데 '낮은 신경성'). ③ 메인 8개 카드 이름(FEATURED_PERSONAS)과 마스터 페르소나 이름이 다름 (예: 11111 '완전 균형형' / '천상계 올라운더 리더').
