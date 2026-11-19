# 개인 성향 리포트 (PDF)

클라이언트에서만 PDF를 만듭니다. 서버가 없고, 가격이나 결제 연동은 이 폴더에 넣지 않습니다.

- 미리보기: `/report/preview/` (메뉴에 연결하지 않음, 검색엔진 색인 제외)
- 생성기: `/report/js/report-data.js`, `/report/js/report-pdf.js`
- 글꼴: `/report/fonts/` — Noto Sans KR Regular/Bold 부분집합 (SIL Open Font License, `OFL.txt`)
- jsPDF 2.5.2는 MIT 라이선스이며 `/report/js/jspdf.umd.min.js`에 포함했습니다.

미리보기 페이지는 `localStorage`의 `ocean_result`, 주소의 `#r=` 코드, `?job=` 직업군을 읽습니다. 샘플 PDF를 다시 만들려면 저장소 루트에서 `node scripts/generate_sample_reports.mjs`를 실행합니다.
