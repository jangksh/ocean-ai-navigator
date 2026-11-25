// 이메일 구독·결과 저장 및 유료 리포트 설정.
// endpoint 에 Google Apps Script 웹앱 URL(…/exec)을 넣으면 결과 화면에 카드가 나타난다. 비어 있으면 카드가 보이지 않는다.
// SAVE_RESULT_ENABLED: true 로 켜거나 PAID_REPORT_CONFIG.PAID_SPLIT_ENABLED 가 true 이면
//   구독 카드가 '내 결과 저장' 문구로 전환된다. 기본값 false.
// REPORT_PURCHASE_URL: $3 전체 PDF 리포트 결제 링크(Stripe Payment Link). 비어 있으면 유료 리포트 카드는 숨겨진다.
// 확인용 미리보기: ?subscribe_preview=1 (전송 안 함), ?save_result_preview=1 (내 결과 저장 미리보기),
//   ?report_preview=1 (유료 리포트 카드 미리보기)
window.SUBSCRIBE_CONFIG = {
  endpoint: 'https://script.google.com/macros/s/AKfycbwvTOW-oYzO9jgXUdpEgBf-9Tj98RzdjPkDJrMkVMCBGcQEZZgDo6cL6s-TLdhT_Kuo/exec',
  SAVE_RESULT_ENABLED: false,
  REPORT_PURCHASE_URL: ''
};
