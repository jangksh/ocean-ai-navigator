# UTM 규칙 (홍보 링크 만들 때 항상 이것만 쓴다)

## 형식
```
https://thepersonalityai.com/?start=1&job=04&utm_source=<source>&utm_medium=<medium>&utm_campaign=<campaign>&utm_content=<content>
```
- `start=1` : 시작 화면으로 바로 진입. `job=04` : 재무·회계를 미리 선택 (한 번만 누르면 시작). 한국어 링크는 `&lang=ko`를 추가한다. 기본은 영어다.
- 값은 **소문자, 영문·숫자·밑줄·하이픈만** 쓴다 (공백·한글·대문자 금지. 40자까지만 저장됨).

## 값 정의
| 항목 | 값 | 뜻 |
|---|---|---|
| utm_source | `youtube` `tiktok` `instagram` `linkedin` `email` `direct_outreach` | 어디서 왔나 |
| utm_medium | `shorts` `reel` `post` `carousel` `comment` `bio` `dm` | 어떤 형식인가 |
| utm_campaign | `tc04_w1` ~ `tc04_w4` (유형 카드 실험 1~4주차) | 어느 실험·주차인가. 새 실험은 새 이름 |
| utm_content | `e01_11010` (에피소드 번호 + 유형 코드) | 어느 영상인가. 같은 영상의 다른 위치(설명란/고정댓글)는 `_desc` `_pin` 접미사 |

예: 1주차 첫 영상의 설명란 링크
`https://thepersonalityai.com/?start=1&job=04&utm_source=youtube&utm_medium=shorts&utm_campaign=tc04_w1&utm_content=e01_11010_desc`

## 어디서 보나
- **GA4**: 보고서 → 획득 → 트래픽 획득. 보조 차원에 "세션 수동 광고 콘텐츠"를 추가하면 영상별 세션이 나온다. 탐색 분석에서 test_start → test_complete → subscribe_submit 퍼널을 이 차원으로 나눠 본다.
- **구독 시트**: `subscribers` 탭의 `utm` 열에 `source|medium|campaign|content`가 저장된다 → 어떤 영상이 구독자를 만들었는지 직접 센다.
- 마지막으로 들어온 UTM이 우선한다(브라우저에 저장). UTM 없는 직접 방문은 기존 값을 덮어쓰지 않는다.

## 주의
- UTM에 이메일·이름 등 개인정보를 넣지 않는다.
- 링크 단축기를 쓰면 `?` 뒤가 잘리는지 먼저 확인한다 (YouTube 설명란은 그대로 둬도 된다).
