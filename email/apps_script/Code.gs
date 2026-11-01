/**
 * AI-OCEAN 이메일 구독 + 5일 미니 강의 + 주간 팁 발송기 (Google Apps Script, 무료)
 *
 * 흐름
 *   1) 사이트 결과 화면의 폼이 이 웹앱(doPost)으로 email/code/job/lang 을 POST
 *   2) 시트에 'pending' 으로 저장하고 확인 메일 발송 (더블 옵트인 — 남의 이메일로 가입해도 메일이 가지 않음)
 *   3) 확인 링크(doGet ?a=confirm) 클릭 → 'active' + 강의 1일차 즉시 발송
 *   4) 매일 트리거(sendDue)가 2~5일차, 이후 주 1회 팁 10통을 발송
 *   5) 모든 메일 하단의 구독 취소 링크(doGet ?a=unsub) → 'unsub'
 *
 * 원고는 CONTENT_URL(사이트에 배포된 email/content.json)에서 가져온다. 원고 수정은 저장소에서만 하면 된다.
 * 설정 방법은 email/README.md 참고.
 */

var CONFIG = {
  SITE_URL: 'https://thepersonalityai.com',
  CONTENT_URL: 'https://thepersonalityai.com/email/content.json',
  FROM_NAME: 'AI-OCEAN',
  REPLY_TO: '',                 // 비우면 스크립트 소유자 Gmail 로 답장이 온다
  POSTAL_ADDRESS: '',           // 필수(CAN-SPAM). 예: 'AI-OCEAN, PO Box 000, Cypress, CA 90630, USA' — 비어 있으면 발송을 거부한다
  SHEET_NAME: 'subscribers',
  PENDING_PER_DAY_CAP: 60,      // 하루에 새로 받는 확인 메일 상한 (남용 방지)
  RESERVE_QUOTA: 20,            // 일일 메일 한도가 이 값 미만이면 신규 신청을 받지 않는다(기존 구독자 발송 우선)
  CONFIRM_RESEND_HOURS: 24,     // 같은 주소로 확인 메일을 다시 보내는 최소 간격
  PENDING_EXPIRE_DAYS: 14,      // 확인하지 않은 신청이 유효한 기간
  MIN_HOURS_BETWEEN_COURSE: 20, // 강의 1~5일차 사이 최소 간격
  MIN_DAYS_BETWEEN_TIPS: 6.5    // 주간 팁 사이 최소 간격
};

var COLS = ['created_at', 'email', 'token', 'status', 'code', 'job', 'lang', 'confirmed_at', 'sent_count', 'last_sent_at'];
var DIMS = ['O', 'C', 'E', 'A', 'N'];
var HOUR = 3600 * 1000, DAY = 24 * HOUR;

/* ───────────────────────── 순수 함수 (발송 로직·렌더링) ───────────────────────── */

function esc_(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function inline_(s) { // **굵게** 만 지원, 나머지는 이스케이프
  return esc_(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}
function plain_(s) { return String(s).replace(/\*\*(.+?)\*\*/g, '$1'); }

function fill_(str, vars) {
  return String(str).replace(/\{\{(\w+)\}\}/g, function (_, k) { return vars[k] == null ? '' : vars[k]; });
}

/** 보낸 개수와 마지막 발송 시각으로 다음에 보낼 메일을 정한다. 아직이거나 끝났으면 null. */
function nextStep_(sentCount, lastSentMs, nowMs, weeks) {
  var gap = nowMs - lastSentMs;
  if (sentCount < 1) return null;                                      // 아직 확인 전
  if (sentCount < 5) return gap >= CONFIG.MIN_HOURS_BETWEEN_COURSE * HOUR ? { kind: 'course', day: sentCount + 1 } : null;
  var week = sentCount - 4;                                            // 5통 후 → 팁 1주차
  if (week > weeks) return null;                                       // 끝
  return gap >= CONFIG.MIN_DAYS_BETWEEN_TIPS * DAY ? { kind: 'tip', week: week } : null;
}

function tipFor_(content, lang, code, week) {
  var dim = DIMS[(week - 1) % 5];
  var round = Math.floor((week - 1) / 5);
  var bit = code.charAt(DIMS.indexOf(dim));
  return content[lang].tips[dim + bit][round];
}

function typeVars_(content, lang, code) {
  var t = content.types[code], l = t[lang];
  return { name: l.name, summary: l.summary, insight: l.insight, tools: t.tools };
}

function blocksToHtml_(blocks, vars, c, code) {
  var h = [], t = [];
  blocks.forEach(function (b) {
    if (b.p != null) {
      var s = fill_(b.p, vars); if (!s.trim()) return;
      h.push('<p style="margin:0 0 14px;line-height:1.65">' + inline_(s) + '</p>'); t.push(plain_(s));
    } else if (b.h != null) {
      var hs = fill_(b.h, vars);
      h.push('<h3 style="margin:22px 0 8px;font-size:17px;color:#1b3a57">' + esc_(hs) + '</h3>'); t.push('\n' + hs.toUpperCase());
    } else if (b.prompt != null) {
      var ps = fill_(b.prompt, vars);
      h.push('<div style="margin:0 0 16px;padding:14px 16px;background:#f1f5f9;border-left:4px solid #2b7fff;border-radius:6px;font-family:Menlo,Consolas,monospace;font-size:13.5px;line-height:1.6;white-space:pre-wrap">' + esc_(ps) + '</div>');
      t.push('> ' + ps);
    } else if (b.li) {
      h.push('<ul style="margin:0 0 14px;padding-left:20px;line-height:1.65">' + b.li.map(function (x) { return '<li style="margin-bottom:6px">' + inline_(fill_(x, vars)) + '</li>'; }).join('') + '</ul>');
      b.li.forEach(function (x) { t.push('- ' + plain_(fill_(x, vars))); });
    } else if (b.blind) {
      var lines = DIMS.map(function (d, i) { return c.blind[d + code.charAt(i)]; });
      h.push('<ul style="margin:0 0 14px;padding-left:20px;line-height:1.65">' + lines.map(function (x) {
        var k = x.indexOf(':'); // 첫 ':' 앞(예: "High openness")을 굵게
        return '<li style="margin-bottom:8px">' + (k > 0 ? '<strong>' + esc_(x.slice(0, k)) + '</strong>' + esc_(x.slice(k)) : esc_(x)) + '</li>';
      }).join('') + '</ul>');
      lines.forEach(function (x) { t.push('- ' + x); });
    }
  });
  return { html: h.join('\n'), text: t.join('\n\n') };
}

function wrapEmail_(bodyHtml, bodyText, c, links) {
  var foot = esc_(c.labels.why) + '<br><a href="' + links.unsub + '" style="color:#64748b">' + esc_(c.labels.unsub) + '</a>' +
    (CONFIG.POSTAL_ADDRESS ? '<br>' + esc_(CONFIG.POSTAL_ADDRESS) : '');
  var html = '<div style="max-width:560px;margin:0 auto;padding:24px 20px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1f2937;font-size:15.5px">' +
    bodyHtml + '<p style="margin:26px 0 0;color:#475569">' + esc_(c.labels.sign) + '</p>' +
    '<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0 12px"><p style="font-size:12px;line-height:1.6;color:#64748b">' + foot + '</p></div>';
  var text = bodyText + '\n\n' + c.labels.sign + '\n\n--\n' + c.labels.why + '\n' + c.labels.unsub + ': ' + links.unsub +
    (CONFIG.POSTAL_ADDRESS ? '\n' + CONFIG.POSTAL_ADDRESS : '');
  return { html: html, text: text };
}

/** step = {kind:'course', day} | {kind:'tip', week}. rec = {code, lang}. */
function buildEmail_(content, step, rec, links) {
  var lang = content[rec.lang] ? rec.lang : 'en', c = content[lang], code = rec.code;
  var vars = typeVars_(content, lang, code), subject, parts;
  if (step.kind === 'course') {
    var day = c.course[step.day - 1];
    subject = fill_(day.subject, vars);
    parts = blocksToHtml_(day.blocks, vars, c, code);
  } else {
    var tip = tipFor_(content, lang, code, step.week);
    var head = c.labels.weekOf.replace('{w}', step.week).replace('{n}', content.weeks);
    var dimName = c.labels.dim[DIMS[(step.week - 1) % 5]];
    subject = '[AI-OCEAN] ' + head + ' · ' + tip.t;
    parts = blocksToHtml_([
      { p: head + ' · ' + dimName },
      { h: tip.t },
      { p: tip.b },
      { h: c.labels.promptHead },
      { prompt: tip.p },
      { h: c.labels.actionHead },
      { p: tip.a }
    ], vars, c, code);
  }
  var w = wrapEmail_(parts.html, parts.text, c, links);
  return { subject: subject, html: w.html, text: w.text };
}

function confirmEmail_(content, rec, links) {
  var lang = content[rec.lang] ? rec.lang : 'en', c = content[lang];
  var bodyHtml = '<p style="margin:0 0 18px;line-height:1.65">' + esc_(c.labels.confirmBody) + '</p>' +
    '<p style="margin:0 0 8px"><a href="' + links.confirm + '" style="display:inline-block;padding:12px 22px;background:#2b7fff;color:#fff;text-decoration:none;border-radius:8px;font-weight:700">' + esc_(c.labels.confirmBtn) + '</a></p>';
  var w = wrapEmail_(bodyHtml, c.labels.confirmBody + '\n\n' + links.confirm, c, links);
  return { subject: c.labels.confirmSubject, html: w.html, text: w.text };
}

function validEmail_(s) { return typeof s === 'string' && s.length <= 254 && /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']{2,}$/.test(s); }

/* ───────────────────────── Apps Script 연동 ───────────────────────── */

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SHEET_ID'));
  var sh = ss.getSheetByName(CONFIG.SHEET_NAME) || ss.insertSheet(CONFIG.SHEET_NAME);
  if (sh.getLastRow() === 0) {
    // 코드('01101')·토큰이 숫자로 바뀌지 않도록 해당 열을 텍스트 서식으로 고정
    ['email', 'token', 'code', 'job'].forEach(function (k) { sh.getRange(1, COLS.indexOf(k) + 1, sh.getMaxRows(), 1).setNumberFormat('@'); });
    sh.appendRow(COLS);
  }
  return sh;
}
function rows_(sh) {
  var n = sh.getLastRow(); if (n < 2) return [];
  return sh.getRange(2, 1, n - 1, COLS.length).getValues().map(function (v, i) {
    var o = { row: i + 2 }; COLS.forEach(function (k, j) { o[k] = v[j]; }); return o;
  });
}
function setRow_(sh, row, patch) {
  Object.keys(patch).forEach(function (k) { sh.getRange(row, COLS.indexOf(k) + 1).setValue(patch[k]); });
}
function getContent_() {
  var cache = CacheService.getScriptCache(), hit = cache.get('content_json');
  if (hit) return JSON.parse(hit);
  var res = UrlFetchApp.fetch(CONFIG.CONTENT_URL + '?v=' + Math.floor(Date.now() / 3600000), { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) throw new Error('content.json fetch failed: HTTP ' + res.getResponseCode());
  var txt = res.getContentText();
  try { cache.put('content_json', txt.length < 95000 ? txt : '', 1800); } catch (e) {}
  return JSON.parse(txt);
}
function baseUrl_() { return ScriptApp.getService().getUrl(); }
function linksFor_(token) { var b = baseUrl_(); return { confirm: b + '?a=confirm&t=' + token, unsub: b + '?a=unsub&t=' + token }; }

function send_(to, mail) {
  if (!CONFIG.POSTAL_ADDRESS) throw new Error('Set CONFIG.POSTAL_ADDRESS before sending (CAN-SPAM requires a physical address).');
  var opts = { name: CONFIG.FROM_NAME, htmlBody: mail.html };
  if (CONFIG.REPLY_TO) opts.replyTo = CONFIG.REPLY_TO;
  MailApp.sendEmail(to, mail.subject, mail.text, opts);
}
function page_(title, body) {
  return HtmlService.createHtmlOutput('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:480px;margin:12vh auto;padding:0 20px;color:#1f2937"><h2>' + esc_(title) + '</h2><p style="line-height:1.6">' + esc_(body) + '</p><p><a href="' + CONFIG.SITE_URL + '">thepersonalityai.com</a></p></body>')
    .setTitle('AI-OCEAN');
}

/** 사이트 폼 → 구독 신청 */
function doPost(e) {
  var p = (e && e.parameter) || {};
  var ok = ContentService.createTextOutput('ok');
  if (p.company) return ok;                                            // 허니팟: 봇은 조용히 무시
  var email = String(p.email || '').trim().toLowerCase();
  var code = /^[01]{5}$/.test(p.code || '') ? p.code : null;
  var lang = p.lang === 'ko' ? 'ko' : 'en';
  var job = /^\d{1,2}$/.test(p.job || '') ? String(p.job).padStart(2, '0') : '';
  if (!validEmail_(email) || !code) return ok;
  if (MailApp.getRemainingDailyQuota() < CONFIG.RESERVE_QUOTA) { console.warn('daily mail quota low — signup skipped'); return ok; } // 이미 가입한 사람들의 강의 메일을 위해 한도를 남겨 둔다

  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var sh = sheet_(), all = rows_(sh), now = Date.now();
    var mine = all.filter(function (r) { return String(r.email).toLowerCase() === email; })[0];
    if (mine && mine.status === 'active') return ok;
    if (mine && mine.status === 'unsub') return ok;                    // 취소한 사람에게는 다시 보내지 않는다
    var today = all.filter(function (r) { return r.status === 'pending' && now - new Date(r.created_at).getTime() < DAY; }).length;
    if (today >= CONFIG.PENDING_PER_DAY_CAP) return ok;
    if (mine && now - new Date(mine.created_at).getTime() < CONFIG.CONFIRM_RESEND_HOURS * HOUR) return ok;

    var token = Utilities.getUuid().replace(/-/g, '');
    var content = getContent_();
    if (mine) setRow_(sh, mine.row, { created_at: new Date(now), token: token, code: code, job: job, lang: lang });
    else sh.appendRow([new Date(now), email, token, 'pending', code, job, lang, '', 0, '']);
    send_(email, confirmEmail_(content, { code: code, lang: lang }, linksFor_(token)));
  } finally { lock.releaseLock(); }
  return ok;
}

/** 확인·구독취소 링크 */
function doGet(e) {
  var a = e && e.parameter && e.parameter.a, t = e && e.parameter && e.parameter.t;
  if ((a !== 'confirm' && a !== 'unsub') || !/^[0-9a-f]{32}$/.test(t || '')) return page_('AI-OCEAN', 'Invalid link / 올바르지 않은 링크입니다.');
  var content = getContent_();
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var sh = sheet_(), r = rows_(sh).filter(function (x) { return x.token === t; })[0];
    if (!r) return page_('AI-OCEAN', content.en.labels.badLink + ' / ' + content.ko.labels.badLink);
    var lang = r.lang === 'ko' ? 'ko' : 'en', c = content[lang];
    if (a === 'unsub') {
      if (r.status !== 'unsub') setRow_(sh, r.row, { status: 'unsub' });
      return page_(c.labels.unsubTitle, c.labels.unsubBody);
    }
    if (r.status === 'unsub') return page_(c.labels.badLink, '');
    if (r.status === 'pending') {
      if (Date.now() - new Date(r.created_at).getTime() > CONFIG.PENDING_EXPIRE_DAYS * DAY) return page_(c.labels.badLink, '');
      var now = Date.now();
      // 발송이 먼저: 한도 초과 등으로 실패하면 상태를 바꾸지 않아 링크를 다시 누를 수 있다
      send_(r.email, buildEmail_(content, { kind: 'course', day: 1 }, { code: String(r.code).padStart(5, '0'), lang: lang }, linksFor_(t)));
      setRow_(sh, r.row, { status: 'active', confirmed_at: new Date(now), sent_count: 1, last_sent_at: new Date(now) });
    }
    return page_(c.labels.confirmedTitle, c.labels.confirmedBody);
  } finally { lock.releaseLock(); }
}

/** 매일 한 번 실행되는 발송기 (setupTrigger 가 등록) */
function sendDue() {
  var content = getContent_(), sh = sheet_(), now = Date.now(), sent = 0, left = MailApp.getRemainingDailyQuota();
  rows_(sh).forEach(function (r) {
    if (r.status !== 'active' || left <= 0) return;
    var step = nextStep_(Number(r.sent_count) || 0, new Date(r.last_sent_at).getTime(), now, content.weeks);
    if (!step) return;
    var code = String(r.code).padStart(5, '0'), lang = r.lang === 'ko' ? 'ko' : 'en';
    try {
      send_(r.email, buildEmail_(content, step, { code: code, lang: lang }, linksFor_(r.token)));
      setRow_(sh, r.row, { sent_count: (Number(r.sent_count) || 0) + 1, last_sent_at: new Date(now) });
      left--; sent++;
    } catch (err) { console.error('send failed for row ' + r.row + ': ' + err); }
  });
  console.log('sendDue: sent ' + sent + ', quota left ' + left);
}

/** 한 번만 실행: 매일 오전 9시(스크립트 시간대)에 sendDue 실행 */
function setupTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'sendDue') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('sendDue').timeBased().everyDays(1).atHour(9).create();
}

/** 내 메일함으로 미리보기: 강의 5통 + 팁 3통을 보낸다. 실제 구독자 데이터는 건드리지 않는다. */
function previewToMe() {
  var me = Session.getEffectiveUser().getEmail(), content = getContent_();
  [['11010', 'en'], ['01101', 'ko']].forEach(function (x) {
    var rec = { code: x[0], lang: x[1] }, links = { confirm: CONFIG.SITE_URL, unsub: CONFIG.SITE_URL };
    for (var d = 1; d <= 5; d++) send_(me, (function (m) { m.subject = '[PREVIEW ' + x[1] + ' ' + x[0] + '] ' + m.subject; return m; })(buildEmail_(content, { kind: 'course', day: d }, rec, links)));
    [1, 2, 6].forEach(function (w) { send_(me, (function (m) { m.subject = '[PREVIEW ' + x[1] + ' ' + x[0] + '] ' + m.subject; return m; })(buildEmail_(content, { kind: 'tip', week: w }, rec, links))); });
  });
}
