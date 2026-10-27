// Code.gs 의 발송 로직을 Apps Script 없이 검증한다. 사용법: node email/test_engine.js
const fs = require('fs'), vm = require('vm'), path = require('path'), assert = require('assert');
const content = require('./content.json');

// ── Apps Script 서비스 가짜 구현 ──
let rows = [], sent = [], props = {};
const fakeRange = (r0, c0, nr) => ({
  getValues: () => rows.slice(r0 - 1, r0 - 1 + nr).map(r => r.slice()),
  setValue: v => { rows[r0 - 1][c0 - 1] = v; },
  setNumberFormat: () => {},
});
const sheet = {
  getLastRow: () => rows.length, getMaxRows: () => 1000,
  appendRow: r => rows.push(r),
  getRange: (r, c, nr, nc) => (nr ? fakeRange(r, c, nr) : fakeRange(r, c, 1)),
};
const ctx = {
  console, Date, JSON, Math, String, Number, RegExp, Object, Array,
  SpreadsheetApp: { getActiveSpreadsheet: () => ({ getSheetByName: () => sheet, insertSheet: () => sheet }) },
  LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
  CacheService: { getScriptCache: () => ({ get: () => null, put() {} }) },
  UrlFetchApp: { fetch: () => ({ getResponseCode: () => 200, getContentText: () => JSON.stringify(content) }) },
  ScriptApp: { getService: () => ({ getUrl: () => 'https://script.example/exec' }) },
  Utilities: { getUuid: () => require('crypto').randomUUID() },
  ContentService: { createTextOutput: s => ({ text: s }) },
  HtmlService: { createHtmlOutput: h => ({ html: h, setTitle() { return this; } }) },
  MailApp: { sendEmail: (to, subject, text, o) => sent.push({ to, subject, text, html: o.htmlBody }), getRemainingDailyQuota: () => 100 },
  PropertiesService: { getScriptProperties: () => ({ getProperty: k => props[k] }) },
  Session: { getEffectiveUser: () => ({ getEmail: () => 'me@example.com' }) },
};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, 'apps_script/Code.gs'), 'utf8'), ctx);
const run = s => vm.runInContext(s, ctx);
const H = 3600e3, D = 24 * H;

// 1) 스케줄 규칙
const ns = (n, gapMs) => ctx.nextStep_(n, 0, gapMs, 10);
assert.strictEqual(ns(0, 99 * D), null);
assert.deepStrictEqual(JSON.parse(JSON.stringify(ns(1, 21 * H))), { kind: 'course', day: 2 });
assert.strictEqual(ns(1, 10 * H), null);
assert.deepStrictEqual(JSON.parse(JSON.stringify(ns(4, 21 * H))), { kind: 'course', day: 5 });
assert.strictEqual(ns(5, 3 * D), null);
assert.deepStrictEqual(JSON.parse(JSON.stringify(ns(5, 7 * D))), { kind: 'tip', week: 1 });
assert.deepStrictEqual(JSON.parse(JSON.stringify(ns(14, 7 * D))), { kind: 'tip', week: 10 });
assert.strictEqual(ns(15, 99 * D), null);

// 2) 32유형 × (강의 5 + 팁 10) × 2언어 렌더링
const links = { confirm: 'https://x/c', unsub: 'https://x/u' };
ctx.CONFIG.POSTAL_ADDRESS = 'AI-OCEAN, PO Box 1, Cypress, CA 90630, USA';
let n = 0; const subjects = new Set();
for (const lang of ['en', 'ko']) for (let i = 0; i < 32; i++) {
  const code = i.toString(2).padStart(5, '0');
  const steps = [1, 2, 3, 4, 5].map(day => ({ kind: 'course', day })).concat(Array.from({ length: 10 }, (_, k) => ({ kind: 'tip', week: k + 1 })));
  for (const st of steps) {
    ctx.__a = content; ctx.__s = st; ctx.__r = { code, lang }; ctx.__l = links;
    const m = run('buildEmail_(__a, __s, __r, __l)');
    for (const f of ['subject', 'html', 'text']) {
      assert.ok(m[f] && m[f].length > (f === 'subject' ? 5 : 20), `${lang} ${code} ${JSON.stringify(st)} empty ${f}`);
      assert.ok(!/\{\{|undefined|\[object|NaN/.test(m[f]), `${lang} ${code} ${JSON.stringify(st)} bad token in ${f}: ${(m[f].match(/.{20}(\{\{|undefined|\[object|NaN).{20}/) || [''])[0]}`);
    }
    assert.ok(m.html.includes('https://x/u') && m.text.includes('https://x/u'), 'unsubscribe link missing');
    assert.ok(m.text.includes('PO Box 1'), 'postal address missing');
    if (lang === 'ko' && st.kind === 'course') assert.ok(!/[A-Za-z]{4,} {1,}\(\)/.test(m.text));
    n++; subjects.add(lang + code + st.kind + (st.day || st.week));
  }
}
console.log('rendered', n, 'emails OK');

// 3) 같은 유형의 10주 팁이 서로 다른 것 (중복 없음)
for (let i = 0; i < 32; i++) {
  const code = i.toString(2).padStart(5, '0'); const seen = new Set();
  for (let w = 1; w <= 10; w++) { ctx.__c = content; ctx.__code = code; ctx.__w = w; seen.add(run('tipFor_(__c, "en", __code, __w).t')); }
  assert.strictEqual(seen.size, 10, code + ' has duplicate tips');
}
console.log('10 distinct weekly tips for each of 32 types OK');

// 4) 전체 흐름: 신청 → 확인 → 1일차 → 매일 발송
rows = []; sent = [];
const post = p => run('doPost({parameter:' + JSON.stringify(p) + '})');
post({ email: 'A@Example.com', code: '01101', job: '4', lang: 'ko' });
assert.strictEqual(rows.length, 2); assert.strictEqual(rows[1][3], 'pending'); assert.strictEqual(rows[1][1], 'a@example.com'); assert.strictEqual(rows[1][5], '04');
assert.strictEqual(sent.length, 1); assert.ok(sent[0].subject.includes('확인'));
const token = rows[1][2];
post({ email: 'a@example.com', code: '01101', lang: 'ko' });                   // 24시간 안 재신청 → 무시
assert.strictEqual(sent.length, 1);
post({ email: 'bot@example.com', code: '01101', lang: 'en', company: 'x' });   // 허니팟
post({ email: 'not-an-email', code: '01101' }); post({ email: 'b@example.com', code: '999' });
assert.strictEqual(rows.length, 2);
run('doGet({parameter:{a:"confirm",t:"' + 'f'.repeat(32) + '"}})');            // 모르는 토큰
assert.strictEqual(rows[1][3], 'pending');
const page = run('doGet({parameter:{a:"confirm",t:"' + token + '"}})');
assert.strictEqual(rows[1][3], 'active'); assert.strictEqual(rows[1][8], 1); assert.strictEqual(sent.length, 2);
assert.ok(page.html.includes('구독이 완료')); assert.ok(sent[1].subject.includes('환영'));
run('doGet({parameter:{a:"confirm",t:"' + token + '"}})');                      // 두 번 눌러도 중복 발송 없음
assert.strictEqual(sent.length, 2);
run('sendDue()'); assert.strictEqual(sent.length, 2);                           // 20시간 전이라 아직
rows[1][9] = new Date(Date.now() - 21 * H);
run('sendDue()'); assert.strictEqual(sent.length, 3); assert.strictEqual(rows[1][8], 2);
for (let k = 0; k < 20; k++) { rows[1][9] = new Date(Date.now() - 8 * D); run('sendDue()'); }
assert.strictEqual(rows[1][8], 15); assert.strictEqual(sent.length, 1 + 15);   // 확인 1 + 강의 5 + 팁 10
run('doGet({parameter:{a:"unsub",t:"' + token + '"}})'); assert.strictEqual(rows[1][3], 'unsub');
rows[1][8] = 5; rows[1][9] = new Date(Date.now() - 9 * D); const before = sent.length; run('sendDue()'); assert.strictEqual(sent.length, before);
post({ email: 'a@example.com', code: '01101', lang: 'ko' }); assert.strictEqual(sent.length, before);   // 취소한 주소는 다시 안 보냄
console.log('subscribe → confirm → course → weekly → unsubscribe flow OK');

// 4b) 한도 부족 시 신규 신청 보류
rows = []; sent = [];
ctx.MailApp.getRemainingDailyQuota = () => 5;
post({ email: 'q@example.com', code: '00000', lang: 'en' });
assert.strictEqual(rows.length, 0); assert.strictEqual(sent.length, 0);
ctx.MailApp.getRemainingDailyQuota = () => 100;
console.log('low-quota signup hold OK');

// 5) 주소 미설정 시 발송 거부
ctx.CONFIG.POSTAL_ADDRESS = ''; rows = []; sent = [];
assert.throws(() => post({ email: 'z@example.com', code: '00000', lang: 'en' }), /POSTAL_ADDRESS/);
console.log('refuses to send without postal address OK');

if (process.argv.includes('--sample')) {
  ctx.CONFIG.POSTAL_ADDRESS = '[postal address]';
  for (const [st, r] of [[{ kind: 'course', day: 1 }, { code: '11010', lang: 'en' }], [{ kind: 'tip', week: 3 }, { code: '11010', lang: 'en' }], [{ kind: 'course', day: 4 }, { code: '01101', lang: 'ko' }]]) {
    ctx.__a = content; ctx.__s = st; ctx.__r = r; ctx.__l = links;
    const m = run('buildEmail_(__a, __s, __r, __l)');
    console.log('\n=== ' + m.subject + ' ===\n' + m.text);
  }
}
