#!/usr/bin/env node
/**
 * AI-OCEAN — 유형별 정적 페이지 생성기
 *
 * 실행:  node build_type_pages.js
 *
 * 생성물
 *   types/<코드>/index.html      32개 한국어 (예: types/11010/index.html → /types/11010/)
 *   en/types/<코드>/index.html   32개 영어 (예: en/types/11010/index.html → /en/types/11010/)
 *   og/types/<코드>.png (.en.png, .es.png)  유형별 1200×630 OG 이미지 (scripts/generate_og_images.py)
 *   en/index.html                영어 홈 (index.html을 변환, data-i18n 영어 SSR)
 *   en/blog/index.html, en/privacy/index.html, es/privacy/index.html, es/types/
 *   sitemap.xml                  홈+/en/ + 유형 쌍 + BLOG_URLS + /en/blog/ (xhtml hreflang)
 *   index.html                   TYPE-LINKS 블록 + hreflang 마커
 *
 * 데이터 출처
 *   ocean-personas.js  마스터 페르소나(이름/한줄 요약)
 *   v2_data.js         직업군 × 유형 상세(insight_v2, AI 도구)  ← 빌드 시에만 읽는다. 페이지에는 필요한 문장만 담긴다.
 *   index.html         이모지, 영문명, 추천 AI 조합, 차원 설명, 직업군 아이콘 (상수 블록을 읽어 재사용)
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SITE = 'https://thepersonalityai.com';
const GA_ID = 'G-180ERLEMSE';
const TODAY = new Date().toISOString().slice(0, 10);

// 데이터의 직업군 내용이 사이트에 표시되는 직업군 이름과 맞지 않아 공개 페이지에서는 제외한다.
//  06: 데이터는 '건설/채굴' 내용인데 퀴즈 화면의 6번 직업군은 'IT 개발/데이터/AI'
//  14: v2는 대부분 '1인 창업/프리랜서'인데 일부(14_11111, 14_01001)와 직업군 페르소나는 '설치/정비/수리' 내용
// 데이터가 정리되면 이 목록에서 빼면 된다.
const EXCLUDED_JOB_GROUPS = new Set(['06', '14']);

// ───────────────────────── 데이터 로드 ─────────────────────────
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const loadVars = (file, names) =>
  new Function(read(file) + `\n;return {${names.join(',')}};`)();

const { OCEAN_MASTER_PERSONAS: MASTER, OCEAN_JOB_PERSONAS: JOB_PERSONAS } =
  loadVars('ocean-personas.js', ['OCEAN_MASTER_PERSONAS', 'OCEAN_JOB_PERSONAS']);
const { OCEAN_V2_DATA: V2 } = loadVars('v2_data.js', ['OCEAN_V2_DATA']);

const indexSrc = read('index.html');
function extractConst(name) {
  const re = new RegExp('const ' + name + ' = ([\\[{][\\s\\S]*?\\n[\\]}]);');
  const m = indexSrc.match(re);
  if (!m) throw new Error('index.html에서 ' + name + ' 상수를 찾지 못했습니다.');
  return new Function('return ' + m[1])();
}
const EMOJI = extractConst('PERSONA_EMOJI');
const EN_NAME = extractConst('PERSONA_EN_NAME');
const AI_REC = extractConst('PERSONA_AI_REC');
const FEATURED = extractConst('FEATURED_PERSONAS');
const DIM_META = extractConst('OCEAN_DIM_META');
const JOBS = extractConst('JOBS');

const i18nWin = {};
new Function('window', read('i18n_en.js') + '\n' + read('i18n_en_job04.js') + '\n' + read('i18n_es.js') + '\n' + read('i18n_es_job04.js') + '\n' + read('i18n_es_job05.js') + '\n' + read('i18n_es_job09.js') + '\n' + read('i18n_es_job10.js') + '\n' + read('i18n_es_job02.js'))(i18nWin);
const EN = i18nWin.EN;
const ES = i18nWin.ES;
const ES_NAME = (ES && ES.master)
  ? Object.fromEntries(Object.entries(ES.master).map(([k, v]) => [k, v.name]))
  : {};
const EN_JOB = i18nWin.EN_JOB || {};
const ES_JOB = i18nWin.ES_JOB || {};
if (!EN || !EN.master || !EN.dims) throw new Error('i18n_en.js에서 window.EN을 읽지 못했습니다.');
if (!ES || !ES.master || !ES.dims) throw new Error('i18n_es.js에서 window.ES를 읽지 못했습니다.');
const JOB_EN_NAME = Object.fromEntries(JOBS.map((j) => [String(j.id).padStart(2, '0'), j.en_label]));
const JOB_ES_NAME = Object.fromEntries(JOBS.map((j) => [String(j.id).padStart(2, '0'), j.es_label || j.en_label]));
const DIM_EN = EN.dims;
const DIM_ES = (ES && ES.dims) || DIM_EN;

const FEATURED_ALIAS = Object.fromEntries(FEATURED.map((p) => [p.code, p.name]));
const JOB_NAME = {};
JOB_PERSONAS.forEach((p) => { JOB_NAME[p.jobGroup] = p.jobGroupName; });
const JOB_ICON = Object.fromEntries(JOBS.map((j) => [String(j.id).padStart(2, '0'), j.icon]));
const JOB_GROUPS = Object.keys(JOB_NAME).filter((g) => !EXCLUDED_JOB_GROUPS.has(g)).sort();

const CODES = MASTER.map((m) => m.code);
const masterByCode = Object.fromEntries(MASTER.map((m) => [m.code, m]));

// ───────────────────────── 유틸 ─────────────────────────
const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const stripEnd = (s) => String(s).trim().replace(/[.。\s]+$/, '');
const firstSentence = (s) => {
  const t = String(s || '').trim();
  const m = t.match(/^[\s\S]*?[.!?](?=\s|$)/);
  return (m ? m[0] : t).trim();
};
const ALIAS = {
  'Perplexity AI': 'Perplexity', 'Google Gemini': 'Gemini', 'ChatGPT Enterprise': 'ChatGPT',
  'ChatGPT Plus': 'ChatGPT', 'Claude Enterprise': 'Claude', 'Canva Magic': 'Canva',
  'Canva Magic Studio': 'Canva', 'Canva AI': 'Canva', 'Suno AI': 'Suno',
};
function cleanAI(name) {
  const n = String(name || '').replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
  return ALIAS[n] || n;
}
const digitsOf = (code) => code.split('').map((d) => d === '1');
const DIM_ORDER = ['O', 'C', 'E', 'A', 'N'];
const DIM_COLOR = { O: '#7048E8', C: '#1971C2', E: '#E67700', A: '#0CA678', N: '#C92A2A' };
const DIM_BG = { O: '#F3F0FF', C: '#E7F5FF', E: '#FFF9DB', A: '#EBFBEE', N: '#FFF5F5' };
const typeUrl = (code, lang) => lang === 'en' ? `${SITE}/en/types/${code}/` : lang === 'es' ? `${SITE}/es/types/${code}/` : `${SITE}/types/${code}/`;
const typePath = (code, lang) => lang === 'en' ? `/en/types/${code}/` : lang === 'es' ? `/es/types/${code}/` : `/types/${code}/`;
const homeUrl = (lang) => lang === 'en' ? `${SITE}/en/` : lang === 'es' ? `${SITE}/es/` : `${SITE}/`;
const homePath = (lang) => lang === 'en' ? '/en/' : lang === 'es' ? '/es/' : '/';
const startPath = (lang) => lang === 'en' ? '/en/?start=1' : lang === 'es' ? '/es/?start=1' : '/?start=1';

function startHref(lang, utm = {}) {
  const parts = Object.entries(utm)
    .filter(([, v]) => v)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
  return parts.length ? `${startPath(lang)}&amp;${parts.join('&amp;')}` : startPath(lang);
}

function typeStartHref(lang, content) {
  return startHref(lang, { utm_source: 'type', utm_medium: 'page', utm_content: content });
}

function startCtaBox(lang, pageType, href) {
  const copy = pageType === 'type'
    ? (lang === 'es'
      ? '¿También eres este tipo? Compruébalo con el test gratuito de 25 preguntas (unos&nbsp;3&nbsp;min)'
      : lang === 'en'
        ? 'Is this your type? Find out with the free 25-question test (~3&nbsp;min)'
        : '나도 이 유형일까? 25문항 무료 테스트로 확인 (약&nbsp;3분)')
    : (lang === 'en'
      ? 'Take the free Big Five test · 25 questions · ~3&nbsp;min'
      : '내 빅파이브 성향 바로 확인하기 · 25문항 · 약&nbsp;3분 · 무료');
  const btn = lang === 'es' ? 'Empezar el test →' : lang === 'en' ? 'Start the test →' : '테스트 시작하기 →';
  return `<aside class="cta-top" data-cta-position="top" data-page-type="${pageType}">
    <p>${copy}</p>
    <a class="btn" href="${href}">${btn}</a>
  </aside>`;
}

function hreflangTags(koUrl, enUrl, esUrl) {
  const tags = [
    `<link rel="alternate" hreflang="ko" href="${koUrl}">`,
    `<link rel="alternate" hreflang="en" href="${enUrl}">`,
  ];
  if (esUrl) tags.push(`<link rel="alternate" hreflang="es" href="${esUrl}">`);
  tags.push(`<link rel="alternate" hreflang="x-default" href="${enUrl}">`);
  return tags.join('\n');
}

function xhtmlLinks(koUrl, enUrl, esUrl) {
  const tags = [
    `    <xhtml:link rel="alternate" hreflang="ko" href="${koUrl}"/>`,
    `    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}"/>`,
  ];
  if (esUrl) tags.push(`    <xhtml:link rel="alternate" hreflang="es" href="${esUrl}"/>`);
  tags.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${enUrl}"/>`);
  return tags.join('\n');
}

function neighbors(code) {
  return code.split('').map((_, i) => {
    const flipped = code.slice(0, i) + (code[i] === '1' ? '0' : '1') + code.slice(i + 1);
    return { code: flipped, dimIndex: i };
  });
}

// ───────────────────────── 직업군 × 유형 데이터 ─────────────────────────
function toolsOf(v) {
  const t = v.ai_tools;
  if (Array.isArray(t)) {
    return t.filter(Boolean).map((x) => ({ role: x.type, name: cleanAI(x.name), blurb: x.tagline || '' }));
  }
  const out = [];
  if (t && t.main) out.push({ role: '메인', name: cleanAI(t.main.name), blurb: firstSentence(t.main.usage) });
  ((t && t.specialists) || []).forEach((s) =>
    out.push({ role: '전문', name: cleanAI(s.name), blurb: firstSentence(s.usage) }));
  return out;
}

// v2 상세 문장 중 일부는 코드와 반대로 서술돼 있다(예: 정서안정성 0인데 '낮은 신경성·흔들리지 않는다').
// 보완용으로 쓸 때는 명시적 모순이 없는 문장만 허용한다.
function contradictsCode(code, text) {
  const t = String(text);
  const has = (re) => re.test(t);
  const dims = [['개방성', 0], ['성실성', 1], ['외향성', 2], ['친화성', 3]];
  for (const [n, i] of dims) {
    const hi = has(new RegExp('높은 ?' + n)) || has(new RegExp(n + '(이|은|도)? ?(매우 )?높'));
    const lo = has(new RegExp('낮은 ?' + n)) || has(new RegExp(n + '(이|은|도)? ?(매우 )?낮'));
    if (code[i] === '1' && lo && !hi) return true;
    if (code[i] === '0' && hi && !lo) return true;
  }
  // 코드의 5번째 자리는 신경성이 아니라 정서안정성(1=안정)
  const hiNeu = has(/높은 ?(신경성|신경증)|(신경성|신경증)(이|은|도)? ?(매우 )?높|민감한 ?(신경성|신경증)/);
  const loNeu = has(/낮은 ?(신경성|신경증)|(신경성|신경증)(이|은|도)? ?(매우 )?낮|안정적인 ?(신경성|신경증)|(신경성|신경증)(이|은|도)? ?(매우 )?안정/);
  if (code[4] === '0' && loNeu && !hiNeu) return true;
  if (code[4] === '1' && hiNeu && !loNeu) return true;
  const hiStab = has(/높은 ?정서안정성|정서안정성(이|은)? ?(매우 )?높|강철 멘탈|정서적으로 ?(매우 )?안정|흔들리지 않|침착/);
  const loStab = has(/낮은 ?정서안정성|정서안정성(이|은)? ?(매우 )?낮|유리 ?멘탈|정서적으로 ?(매우 )?(불안정|예민)|감정 기복|예민/);
  if (code[4] === '0' && hiStab && !loStab) return true;
  if (code[4] === '1' && loStab && !hiStab) return true;
  return false;
}

// 문장 안의 '개방성 95%', 'O 95%' 같은 수치가 코드의 높음/낮음과 어긋나면 false (신경성 수치는 해석이 갈려 검사하지 않음)
function percentsMatchCode(code, text) {
  const KO = { 개방성: 0, 성실성: 1, 외향성: 2, 친화성: 3 };
  const LT = { O: 0, C: 1, E: 2, A: 3 };
  const re = /(개방성|성실성|외향성|친화성)[^%.\d]{0,14}?(\d{1,3})\s?%|\b([OCEA])\s?(\d{1,3})\s?%/g;
  let m;
  while ((m = re.exec(text))) {
    const idx = m[1] ? KO[m[1]] : LT[m[3]];
    const pct = Number(m[1] ? m[2] : m[4]);
    if ((pct >= 50) !== (code[idx] === '1')) return false;
  }
  // 위 형식으로 해석되지 않는 수치(예: 신경성 85%)가 남아 있으면 안전하게 제외
  const rest = text.replace(re, '');
  return !/\d{2,3}\s?%/.test(rest);
}

// v2 문장에서 코드와 모순되는 문장, 수치(%)가 붙은 문장(수치 라벨이 뒤섞인 경우가 있음)을 걸러 낸다.
function cleanV2Insight(code, text) {
  const sentences = String(text).trim().split(/(?<=[.!?])\s+/);
  const keep = sentences.filter((x) => !contradictsCode(code, x) && percentsMatchCode(code, x));
  const out = keep.join(' ');
  return keep.length >= 3 && out.length >= 140 && !contradictsCode(code, out) ? out : null;
}

// 기본 출처: ocean-personas.js 직업군 페르소나 (코드와 일치하는 큐레이션 문장)
// 보완 출처: v2_data.js (직업군 페르소나가 없거나 데이터가 깨진 칸만, 모순 검사를 통과할 때)
function jobEntry(jj, code) {
  const jp = JOB_PERSONAS.find((p) => p.jobGroup === jj && p.code === code);
  const base = { jj, label: JOB_NAME[jj], icon: JOB_ICON[jj] || '💼' };
  const specsOk = jp && Array.isArray(jp.specialistAIs) && jp.specialistAIs.length >= 1 && jp.specialistAIs.length <= 4;
  if (jp && jp.mainAI && specsOk && !contradictsCode(code, jp.insight)) {
    return {
      ...base, source: 'persona', title: jp.title, insight: String(jp.insight).trim(),
      main: { name: cleanAI(jp.mainAI.name), blurb: jp.mainAI.reason },
      specs: jp.specialistAIs.slice(0, 2).map((s) => ({ name: cleanAI(s.name), blurb: s.reason })),
    };
  }
  const v = V2[jj + '_' + code];
  if (!v) return null;
  const insight = cleanV2Insight(code, v.insight_v2);
  if (!insight) return null;
  const tools = toolsOf(v);
  if (!tools.length) return null;
  const main = tools.find((t) => t.role === '메인') || tools[0];
  return {
    ...base, source: 'v2', title: jp ? jp.title : '', insight,
    main, specs: tools.filter((t) => t !== main).slice(0, 2),
  };
}

function tally(names) {
  const m = new Map();
  names.forEach((n) => m.set(n, (m.get(n) || 0) + 1));
  return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

// ───────────────────────── 페이지 템플릿 ─────────────────────────
const CSS = `
:root{--bg:#F7F8FC;--card:#fff;--line:#E9ECF3;--text:#1A1B2E;--sub:#6C757D;--brand:#4C6EF5;--brand2:#3451D1;--shadow:0 1px 4px rgba(0,0,0,.06),0 0 0 1px rgba(0,0,0,.04)}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--text);font-family:'Noto Sans KR','Inter',-apple-system,'Segoe UI',sans-serif;line-height:1.75;word-break:keep-all}
a{color:var(--brand2)}
.site-header{background:#fff;border-bottom:1px solid var(--line)}
.site-header .in{max-width:880px;margin:0 auto;padding:14px 20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px 12px}
.logo{font-weight:900;font-size:20px;letter-spacing:-.5px;color:var(--brand);text-decoration:none}
.site-header nav{display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-end}.site-header nav a{margin-left:18px;font-size:14px;font-weight:600;color:var(--sub);text-decoration:none}
.lang-switch{display:inline-block;margin-left:16px;font-size:12px;font-weight:800;letter-spacing:.4px;color:var(--brand);text-decoration:none;border:1px solid var(--line);border-radius:999px;padding:3px 10px}
main{max-width:880px;margin:0 auto;padding:20px 20px 64px}
.crumbs{font-size:13px;color:var(--sub);margin:4px 0 20px}.crumbs a{color:var(--sub)}
.hero{background:#fff;border:1px solid var(--line);border-radius:24px;padding:36px 28px;text-align:center;box-shadow:var(--shadow)}
.hero .emoji{font-size:64px;line-height:1}
.eyebrow{margin:14px 0 4px;font-size:12px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:var(--brand)}
h1{margin:0 0 10px;font-size:clamp(28px,5vw,40px);line-height:1.25;letter-spacing:-.5px}
.lead{margin:0 auto 18px;max-width:560px;font-size:18px;color:var(--sub)}
.alias{margin:-6px 0 16px;font-size:13px;color:var(--sub)}
.pills{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-bottom:22px}
.pill{padding:5px 11px;border-radius:999px;font-size:12px;font-weight:800}
.pill.off{background:#F0F2F8!important;color:#A0AEC0!important}
.btn{display:inline-block;background:var(--brand);color:#fff;text-decoration:none;font-weight:800;font-size:16px;padding:14px 30px;border-radius:14px;box-shadow:0 6px 20px rgba(76,110,245,.3)}
.btn:hover{background:var(--brand2)}
section{margin-top:40px}
h2{font-size:clamp(21px,3.4vw,26px);margin:0 0 14px;letter-spacing:-.3px;line-height:1.35}
h3{font-size:18px;margin:0 0 4px}
.card{background:#fff;border:1px solid var(--line);border-radius:18px;padding:20px 22px;box-shadow:var(--shadow)}
.muted{color:var(--sub);font-size:15px}
.dims{display:grid;gap:10px;margin-top:14px}
.dim{display:flex;gap:12px;align-items:flex-start;background:#fff;border:1px solid var(--line);border-radius:14px;padding:14px 16px}
.dim .ic{font-size:22px;line-height:1.4}
.dim b{font-size:15px}.dim .st{display:inline-block;margin-left:6px;padding:1px 8px;border-radius:999px;font-size:11px;font-weight:800}
.dim p{margin:2px 0 0;font-size:14.5px;color:var(--sub)}
.jobs{display:grid;gap:14px}
.job .ttl{margin:0 0 8px;font-size:14px;font-weight:700;color:var(--brand2)}
.job p{margin:0 0 10px;font-size:15.5px}
.job .ai{font-size:14.5px;margin:0 0 4px}
.job .ai strong{display:inline-block;min-width:56px;color:var(--sub);font-size:12px;letter-spacing:.3px}
.cta{margin-top:40px;background:linear-gradient(135deg,#EEF1FF,#F3F0FF);border:1px solid var(--line);border-radius:22px;padding:30px 24px;text-align:center}
.cta p{margin:0 0 16px;color:var(--sub)}
.cta-slot{margin-top:20px}
.cta-top{background:linear-gradient(135deg,#EEF1FF,#F3F0FF);border:1px solid var(--line);border-radius:16px;padding:16px 18px;display:flex;gap:12px 16px;align-items:center;justify-content:space-between;flex-wrap:wrap}
.cta-top p{margin:0;font-weight:700;font-size:15.5px;line-height:1.45;color:var(--text);flex:1 1 200px}
.cta-top .btn{padding:12px 20px;font-size:15px;white-space:nowrap}
.near{list-style:none;margin:0;padding:0;display:grid;gap:10px}
.near li{background:#fff;border:1px solid var(--line);border-radius:14px;padding:12px 16px}
.near a{font-weight:800;text-decoration:none}.near span{display:block;font-size:14px;color:var(--sub)}
.all{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px}
.all a,.all .cur{display:block;background:#fff;border:1px solid var(--line);border-radius:12px;padding:10px 12px;font-size:14px;font-weight:600;text-decoration:none;color:var(--text)}
.all a:hover{border-color:var(--brand)}.all .cur{background:#EEF1FF;border-color:var(--brand);color:var(--brand2)}
footer{max-width:880px;margin:0 auto;padding:0 20px 48px;font-size:13px;color:var(--sub)}
@media(max-width:560px){.hero{padding:28px 18px}.card{padding:18px}.site-header .in{padding:12px 16px}.site-header nav a,.site-header nav .lang-switch{margin-left:10px}.cta-top{padding:14px;text-align:center;justify-content:center}.cta-top p{flex-basis:100%}.cta-top .btn{width:100%;text-align:center;white-space:normal}}
`;

function latinName(s) {
  const cleaned = String(s || '').replace(/[\uac00-\ud7a3]+/g, ' ').replace(/\s+/g, ' ').trim();
  return cleaned || s;
}

function jobEntryEn(jj, code) {
  const ko = jobEntry(jj, code);
  const label = JOB_EN_NAME[jj] || (ko && ko.label) || jj;
  const icon = (ko && ko.icon) || JOB_ICON[jj] || '💼';
  const ej = EN_JOB[jj + '_' + code];
  const master = EN.master[code] || ['', ''];
  const toolsFrom = (entry) => {
    if (!entry) return { main: { name: 'ChatGPT', blurb: '' }, specs: [] };
    return {
      main: { name: latinName(entry.main.name), blurb: '' },
      specs: (entry.specs || []).map((s) => ({ name: latinName(s.name), blurb: '' })),
    };
  };
  if (ej) {
    const mainName = latinName((ej.mainAI && ej.mainAI.name) || (ko && ko.main && ko.main.name) || 'ChatGPT');
    const specs = (ej.specialistAIs || []).slice(0, 2).map((s) => ({
      name: latinName(s.name),
      blurb: s.reason || '',
    }));
    const tools = (ej.v2 && Array.isArray(ej.v2.ai_tools)) ? ej.v2.ai_tools : [];
    const mainTool = tools.find((t) => t.type === 'main');
    const specTools = tools.filter((t) => t !== mainTool).slice(0, 2);
    return {
      jj, label, icon, source: 'en_job',
      title: ej.title || '',
      insight: String(ej.insight || '').trim(),
      main: { name: mainName, blurb: (ej.mainAI && ej.mainAI.reason) || (mainTool && mainTool.tagline) || '' },
      specs: specs.length ? specs : specTools.map((s) => ({ name: latinName(s.name), blurb: s.tagline || '' })),
    };
  }
  if (!ko) return null;
  const tools = toolsFrom(ko);
  const insight = `${master[1] || master[0]} In ${label}, this type often pairs well with ${tools.main.name}. A longer English job-group write-up is available after you take the test; the Korean page has the full field guide.`.trim();
  return {
    jj, label, icon, source: 'en_fallback',
    title: '',
    insight,
    main: tools.main,
    specs: tools.specs,
  };
}


function jobEntryEs(jj, code) {
  const ko = jobEntry(jj, code);
  const label = JOB_ES_NAME[jj] || JOB_EN_NAME[jj] || (ko && ko.label) || jj;
  const icon = (ko && ko.icon) || JOB_ICON[jj] || '💼';
  const ej = ES_JOB[jj + '_' + code] || EN_JOB[jj + '_' + code];
  const fromEs = !!ES_JOB[jj + '_' + code];
  const master = (ES && ES.master && ES.master[code]) || {};
  const toolsFrom = (entry) => {
    if (!entry) return { main: { name: 'ChatGPT', blurb: '' }, specs: [] };
    return {
      main: { name: latinName(entry.main.name), blurb: '' },
      specs: (entry.specs || []).map((s) => ({ name: latinName(s.name), blurb: '' })),
    };
  };
  if (ej) {
    const mainName = latinName((ej.mainAI && ej.mainAI.name) || (ko && ko.main && ko.main.name) || 'ChatGPT');
    const specs = (ej.specialistAIs || []).slice(0, 2).map((s) => ({
      name: latinName(s.name),
      blurb: s.reason || '',
    }));
    const tools = (ej.v2 && Array.isArray(ej.v2.ai_tools)) ? ej.v2.ai_tools : [];
    const mainTool = tools.find((t) => t.type === 'main');
    const specTools = tools.filter((t) => t !== mainTool).slice(0, 2);
    return {
      jj, label, icon, source: fromEs ? 'es_job' : 'en_job',
      title: ej.title || '',
      insight: String(ej.insight || '').trim(),
      main: { name: mainName, blurb: (ej.mainAI && ej.mainAI.reason) || (mainTool && mainTool.tagline) || '' },
      specs: specs.length ? specs : specTools.map((s) => ({ name: latinName(s.name), blurb: s.tagline || '' })),
    };
  }
  if (!ko) return null;
  const tools = toolsFrom(ko);
  const insight = `${master.insight || master.summary || ''} En ${label}, este tipo suele combinar bien con ${tools.main.name}. Una guía más extensa por área profesional estará disponible más adelante; la página en coreano tiene la guía completa.`.trim();
  return {
    jj, label, icon, source: 'es_fallback',
    title: '',
    insight,
    main: tools.main,
    specs: tools.specs,
  };
}


function contactMailto(lang) {
  const label = lang === 'en' ? 'Contact' : lang === 'es' ? 'Contacto' : '문의';
  return `${label}: <a href="mailto:oceanainavigator@gmail.com">oceanainavigator@gmail.com</a>`;
}

function pageFor(code, lang) {
  const isEn = lang === 'en';
  const isEs = lang === 'es';
  const loc = isEn || isEs;
  const m = masterByCode[code];
  const nameKo = m.name;
  const nameEn = EN_NAME[code] || code;
  const nameEs = (ES_NAME && ES_NAME[code]) || nameEn;
  const name = isEs ? nameEs : isEn ? nameEn : nameKo;
  const emoji = EMOJI[code] || '✨';
  const pair = AI_REC[code] || 'ChatGPT';
  const on = digitsOf(code);
  const masterEn = EN.master[code] || [nameEn, ''];
  const masterEs = (ES && ES.master && ES.master[code]) || { name: nameEs, summary: masterEn[0], insight: masterEn[1] || '' };
  const summary = isEs
    ? (masterEs.summary + (masterEs.insight ? ' ' + masterEs.insight : ''))
    : isEn ? (masterEn[0] + (masterEn[1] ? ' ' + masterEn[1] : '')) : m.summary;
  const lead = isEs ? masterEs.summary : isEn ? masterEn[0] : m.summary;
  const dimSource = isEs ? DIM_ES : isEn ? DIM_EN : null;
  const dimMeta = dimSource
    ? dimSource.map((d, i) => ({
        key: DIM_ORDER[i],
        icon: DIM_META[i].icon,
        label: d.label,
        highInsight: d.hi,
        lowInsight: d.lo,
      }))
    : DIM_META;
  const highDims = dimMeta.filter((_, i) => on[i]).map((d) => d.label);
  const lowDims = dimMeta.filter((_, i) => !on[i]).map((d) => d.label);
  const alias = !loc && FEATURED_ALIAS[code] && FEATURED_ALIAS[code] !== nameKo ? FEATURED_ALIAS[code] : '';

  const jobs = isEs
    ? JOB_GROUPS.map((jj) => jobEntryEs(jj, code)).filter(Boolean)
    : isEn
      ? JOB_GROUPS.map((jj) => jobEntryEn(jj, code)).filter(Boolean)
      : JOB_GROUPS.map((jj) => jobEntry(jj, code)).filter(Boolean);
  if (lang === 'ko') {
    jobs.forEach((j) => { STATS[j.source] += 1; });
    STATS.skipped += JOB_GROUPS.length - jobs.length;
  } else if (lang === 'en') {
    jobs.forEach((j) => { STATS[j.source] = (STATS[j.source] || 0) + 1; });
  }
  const mainTally = tally(jobs.map((j) => j.main.name));
  const specTally = tally(jobs.flatMap((j) => j.specs.map((s) => s.name))).slice(0, 3);
  const mainSummary = loc
    ? mainTally.slice(0, 3).map(([n, c]) => `${esc(n)} (${c})`).join(', ')
    : mainTally.slice(0, 3).map(([n, c]) => `${esc(n)} ${c}곳`).join(', ');
  const specSummary = specTally.map(([n]) => esc(n)).join(', ');
  const mainSentence = isEs
    ? (mainTally.length === 1
      ? `En las ${jobs.length} guías por área profesional, la IA principal es ${esc(mainTally[0][0])} en todos los casos.`
      : `En las ${jobs.length} guías por área profesional, la IA principal suele ser ${mainSummary}.`)
    : isEn
      ? (mainTally.length === 1
        ? `Across ${jobs.length} job-group guides, the main AI is ${esc(mainTally[0][0])} in every case.`
        : `Across ${jobs.length} job-group guides, the main AI is most often ${mainSummary}.`)
      : (mainTally.length === 1
        ? `직업군별 상세 처방 ${jobs.length}개의 메인 AI는 모두 ${esc(mainTally[0][0])}입니다.`
        : `직업군별 상세 처방 ${jobs.length}개에서 메인 AI는 ${mainSummary} 순으로 많이 추천됩니다.`);

  const title = isEs
    ? `${nameEs} | Tipo OCEAN ${code}: personalidad y herramientas de IA — AI-OCEAN`
    : isEn
      ? `${nameEn} | OCEAN type ${code} personality and AI tools — AI-OCEAN`
      : `${nameKo}(${nameEn}) 유형 | OCEAN ${code} 성향·AI 추천 - AI-OCEAN`;
  const desc = isEs
    ? `${stripEnd(lead)}. Mira la combinación de IA (${pair}) y las notas por área profesional del tipo OCEAN ${code} (${nameEs}).`
    : isEn
      ? `${stripEnd(lead)}. See the AI pairing (${pair}) and job-group notes for OCEAN type ${code} (${nameEn}).`
      : `${stripEnd(m.summary)}. OCEAN ${code} ${nameEn} 유형에게 어울리는 AI(${pair})와 직업군별 활용법을 확인하세요.`;
  // Facebook/Twitter preview (keep <title> SEO-oriented; og:title is written for the share card)
  const ogTitle = isEs
    ? `${emoji} Soy «${nameEs}» | Mi resultado AI-OCEAN`
    : isEn
      ? `${emoji} I'm ${nameEn} | My AI-OCEAN result`
      : `${emoji} 나는 ‘${nameKo}’ 유형이에요 | AI-OCEAN`;
  const ogDesc = isEs
    ? `${stripEnd(lead)}. Haz el test gratuito (25 preguntas, unos 3 minutos) y descubre tu tipo y la IA que mejor te va.`
    : isEn
      ? `${stripEnd(lead)}. Take the free 25-question test (about 3 minutes) to find your type and the AI that fits you.`
      : `${stripEnd(m.summary)}. 무료 25문항, 약 3분이면 내 유형과 어울리는 AI를 알 수 있어요.`;
  const ogImage = isEs
    ? `${SITE}/og/types/${code}.es.png`
    : isEn
      ? `${SITE}/og/types/${code}.en.png`
      : `${SITE}/og/types/${code}.png`;
  const ogAlt = isEs
    ? `Resultado AI-OCEAN: ${nameEs} (OCEAN ${code})`
    : isEn
      ? `AI-OCEAN result: ${nameEn} (OCEAN ${code})`
      : `AI-OCEAN 결과: ${nameKo} (OCEAN ${code})`;
  const url = typeUrl(code, lang);
  const koUrl = typeUrl(code, 'ko');
  const enUrl = typeUrl(code, 'en');
  const esUrl = typeUrl(code, 'es');
  const hiWord = isEs ? 'Alta' : isEn ? 'High' : '높음';
  const loWord = isEs ? 'Baja' : isEn ? 'Low' : '낮음';

  const pills = dimMeta.map((d, i) =>
    `<span class="pill${on[i] ? '' : ' off'}" style="background:${DIM_BG[d.key]};color:${DIM_COLOR[d.key]}">${d.key} ${on[i] ? hiWord : loWord}</span>`
  ).join('');

  const dimRows = dimMeta.map((d, i) => `
      <div class="dim"><div class="ic">${d.icon}</div><div><b style="color:${DIM_COLOR[d.key]}">${esc(d.label)}</b><span class="st" style="background:${DIM_BG[d.key]};color:${DIM_COLOR[d.key]}">${on[i] ? hiWord : loWord}</span><p>${esc(on[i] ? d.highInsight : d.lowInsight)}</p></div></div>`
  ).join('');

  const structureLine = isEs
    ? (highDims.length === 5 ? 'Las cinco dimensiones llegan al 50% o más.'
      : lowDims.length === 5 ? 'Las cinco dimensiones quedan por debajo del 50%.'
      : `Dimensiones altas: ${highDims.join(', ')}. Dimensiones bajas: ${lowDims.join(', ')}.`)
    : isEn
      ? (highDims.length === 5 ? 'All five dimensions score at or above 50%.'
        : lowDims.length === 5 ? 'All five dimensions score below 50%.'
        : `High dimensions: ${highDims.join(', ')}. Low dimensions: ${lowDims.join(', ')}.`)
      : (highDims.length === 5 ? '다섯 차원이 모두 50% 이상인 조합입니다.'
        : lowDims.length === 5 ? '다섯 차원이 모두 50% 미만인 조합입니다.'
        : `높은 차원은 ${highDims.join('·')}, 낮은 차원은 ${lowDims.join('·')}입니다.`);

  const mainLabel = isEs ? 'IA principal' : isEn ? 'Main AI' : '메인 AI';
  const specLabel = isEs ? 'IA especializada' : isEn ? 'Specialist' : '전문 AI';
  const jobCards = jobs.map((j) => `
      <article class="card job">
        <h3>${j.icon} ${esc(j.label)}</h3>
        ${j.title ? `<div class="ttl">“${esc(j.title)}”</div>` : ''}
        <p>${esc(j.insight)}</p>
        <p class="ai"><strong>${mainLabel}</strong> ${esc(j.main.name)}${j.main.blurb ? ` — ${esc(j.main.blurb)}` : ''}</p>
        ${j.specs.map((s) => `<p class="ai"><strong>${specLabel}</strong> ${esc(s.name)}${s.blurb ? ` — ${esc(s.blurb)}` : ''}</p>`).join('\n        ')}
      </article>`).join('');

  const near = neighbors(code).map(({ code: c, dimIndex }) => {
    const nm = masterByCode[c];
    const st = c[dimIndex] === '1' ? hiWord : loWord;
    const nearName = isEs ? (ES_NAME[c] || EN_NAME[c] || c) : isEn ? (EN_NAME[c] || c) : nm.name;
    const nearSum = isEs
      ? ((ES.master[c] && ES.master[c].summary) || '')
      : isEn ? ((EN.master[c] && EN.master[c][0]) || '') : nm.summary;
    const dimBit = isEs
      ? `Solo ${esc(dimMeta[dimIndex].label)}: ${st}`
      : isEn
        ? `${esc(dimMeta[dimIndex].label)} only ${st}`
        : `${esc(dimMeta[dimIndex].label)} 만 ${st}`;
    return `<li><a href="${typePath(c, lang)}">${EMOJI[c] || ''} ${esc(nearName)}</a><span>${dimBit} · ${esc(nearSum)}</span></li>`;
  }).join('');

  const all = CODES.map((c) => {
    const label = isEs ? (ES_NAME[c] || EN_NAME[c] || c) : isEn ? (EN_NAME[c] || c) : masterByCode[c].name;
    return c === code
      ? `<li><span class="cur" aria-current="page">${EMOJI[c] || ''} ${esc(label)}</span></li>`
      : `<li><a href="${typePath(c, lang)}">${EMOJI[c] || ''} ${esc(label)}</a></li>`;
  }).join('');

  const crumbHome = isEs ? 'Inicio' : isEn ? 'Home' : '홈';
  const crumbTypes = isEs ? '32 tipos OCEAN' : isEn ? '32 OCEAN types' : 'OCEAN 32가지 유형';
  const navHome = crumbHome;
  const navStart = isEs ? 'Empezar el test' : isEn ? 'Start the test' : '테스트 시작';
  const blogHref = (isEn || isEs) ? '/en/blog/' : '/blog/';
  const blogLabel = (isEn || isEs) ? 'Blog' : '블로그';
  const langSwitch = [
    { id: 'ko', href: typePath(code, 'ko'), label: 'KO' },
    { id: 'en', href: typePath(code, 'en'), label: 'EN' },
    { id: 'es', href: typePath(code, 'es'), label: 'ES' },
  ].map((i) => i.id === lang
    ? `<span class="lang-switch" aria-current="page">${i.label}</span>`
    : `<a class="lang-switch" href="${i.href}" hreflang="${i.id}" lang="${i.id}">${i.label}</a>`
  ).join('');
  const logoHref = homePath(lang);
  const ctaHref = startPath(lang);
  const hrefHeader = typeStartHref(lang, 'header');
  const hrefHero = typeStartHref(lang, 'hero');
  const hrefTop = typeStartHref(lang, 'top');
  const hrefBottom = typeStartHref(lang, 'bottom');
  const topCta = startCtaBox(lang, 'type', hrefTop);
  const ogLocale = isEs ? 'es_419' : isEn ? 'en_US' : 'ko_KR';
  const ogAlts = (isEs ? ['en_US', 'ko_KR'] : isEn ? ['ko_KR', 'es_419'] : ['en_US', 'es_419'])
    .map((c) => `<meta property="og:locale:alternate" content="${c}">`).join('\n');
  const fontLink = loc
    ? 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800;900&family=Noto+Sans+KR:wght@400;500;700;800;900&display=swap'
    : 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;800;900&display=swap';
  const htmlLang = isEs ? 'es' : isEn ? 'en' : 'ko';

  const bareName = String(name).replace(/^(The|El|La|Los|Las)\s+/i, '');
  const h2Structure = isEs
    ? `Cómo se construye el tipo ${esc(bareName)} (${code})`
    : isEn
      ? `How the ${esc(String(name).replace(/^The\s+/i, ''))} type is built (${code})`
      : `${esc(nameKo)} 유형의 성향 구조 (${code})`;
  const codeExplain = isEs
    ? `El código enumera Apertura, Responsabilidad, Extraversión, Amabilidad y Estabilidad emocional, en ese orden. Un puntaje de 50% o más es 1; por debajo de 50% es 0. ${esc(structureLine)}`
    : isEn
      ? `The code lists Openness, Conscientiousness, Extraversion, Agreeableness and Emotional Stability in that order. A score at or above 50% is 1; below 50% is 0. ${esc(structureLine)}`
      : `코드는 개방성·성실성·외향성·친화성·정서안정성 순서이며, 각 점수가 50% 이상이면 1, 미만이면 0입니다. ${esc(structureLine)}`;
  const h2Ai = isEs ? `IA recomendada para ${esc(name)}` : isEn ? `AI pairing for ${esc(name)}` : `${esc(nameKo)}에게 어울리는 AI 조합`;
  const recLabel = isEs ? 'Combinación sugerida: ' : isEn ? 'Default pairing: ' : '기본 추천 조합: ';
  const specLine = isEs
    ? `${mainSentence} Entre las herramientas especializadas que aparecen a menudo están ${specSummary}.`
    : isEn
      ? `${mainSentence} Specialist tools that appear often include ${specSummary}.`
      : `${mainSentence} 보조 AI로는 ${specSummary} 등이 자주 등장합니다.`;
  const h2Jobs = isEs ? `Notas por área profesional para ${esc(name)}` : isEn ? `Job-group notes for ${esc(name)}` : `직업군별 ${esc(nameKo)} 가이드`;
  const ctaH = isEs ? `¿Tu resultado también es ${esc(name)}?` : isEn ? `Is your result ${esc(name)} too?` : `내 결과도 ${esc(nameKo)}일까요?`;
  const ctaP = isEs
    ? 'Son 25 preguntas, unos 3 minutos y es gratis. Recibe un plan de IA para tu área profesional.'
    : isEn
      ? 'Answer 25 questions (about 3 minutes, free) and get an AI plan for your job group.'
      : '25문항 · 약&nbsp;3분 · 무료. 내 직업군에 맞춘 AI 처방전을 받을 수 있습니다.';
  const ctaBtn = isEs ? 'Empezar el test →' : isEn ? 'Start the test →' : '테스트 시작하기 →';
  const heroBtn = isEs ? 'Empezar mi análisis de ADN de IA →' : isEn ? 'Start my AI DNA analysis →' : '나의 AI DNA 분석 시작 →';
  const h2Near = isEs ? 'Tipos vecinos (cambia una sola dimensión)' : isEn ? 'Neighbor types (one dimension flipped)' : '한 차원만 다른 이웃 유형';
  const h2All = isEs ? 'Los 32 tipos OCEAN' : isEn ? 'All 32 OCEAN types' : 'OCEAN 32가지 유형 전체';
  const footer = isEs
    ? `Esta página sugiere herramientas de IA a partir del modelo Big Five (OCEAN). No es un diagnóstico psicológico. · <a href="${logoHref}">Inicio AI-OCEAN</a> · ${contactMailto('es')}`
    : isEn
      ? `This page suggests AI tools from the Big Five (OCEAN) model. It is not a psychological diagnosis. · <a href="${logoHref}">AI-OCEAN home</a> · ${contactMailto('en')}`
      : `이 페이지는 Big Five(OCEAN) 성향 모델을 바탕으로 AI 도구를 제안하는 참고 자료이며, 심리 진단이 아닙니다. · <a href="${logoHref}">AI-OCEAN 홈</a> · ${contactMailto('ko')}`;
  const aliasLine = alias ? `<p class="alias">메인 화면 카드 이름: ‘${esc(alias)}’</p>` : '';

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'AI-OCEAN', item: homeUrl(lang) },
      { '@type': 'ListItem', position: 2, name: `${name} (${code})`, item: url },
    ],
  };

  return `<!DOCTYPE html>
<html lang="${htmlLang}">
<head>
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${GA_ID}');
</script>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
${hreflangTags(koUrl, enUrl, esUrl)}
<meta property="og:type" content="article">
<meta property="og:locale" content="${ogLocale}">
${ogAlts}
<meta property="og:site_name" content="AI-OCEAN">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(ogTitle)}">
<meta property="og:description" content="${esc(ogDesc)}">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(ogAlt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(ogTitle)}">
<meta name="twitter:description" content="${esc(ogDesc)}">
<meta name="twitter:image" content="${ogImage}">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${fontLink}">
<script src="/i18n_router.js"></script>
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<style>${CSS}</style>
</head>
<body>
<header class="site-header"><div class="in"><a class="logo" href="${logoHref}">AI-OCEAN</a><nav><a href="${logoHref}">${navHome}</a><a href="${blogHref}">${blogLabel}</a><a href="${hrefHeader}">${navStart}</a>${langSwitch}</nav></div></header>
<main>
  <nav class="crumbs" aria-label="breadcrumb"><a href="${logoHref}">${crumbHome}</a> › ${crumbTypes} › ${esc(name)}</nav>

  <div class="hero">
    <div class="emoji" aria-hidden="true">${emoji}</div>
    <p class="eyebrow">OCEAN ${code} · ${esc(isEs ? nameEn : isEn ? nameKo : nameEn)}</p>
    <h1>${esc(name)}</h1>
    <p class="lead">${esc(lead)}</p>
    <div class="pills">${pills}</div>
    <a class="btn" href="${hrefHero}">${heroBtn}</a>
  </div>

  <div class="cta-slot">
    ${topCta}
  </div>

  <section>
    <h2>${h2Structure}</h2>
    <p class="muted">${codeExplain}</p>
    <div class="dims">${dimRows}
    </div>
  </section>

  <section>
    <h2>${h2Ai}</h2>
    <div class="card">
      <p style="margin:0 0 8px"><strong>${recLabel}${esc(pair)}</strong></p>
      <p class="muted" style="margin:0">${specLine}</p>
    </div>
  </section>

  <section>
    <h2>${h2Jobs}</h2>
    <div class="jobs">${jobCards}
    </div>
  </section>

  <div class="cta">
    <h2 style="margin-bottom:6px">${ctaH}</h2>
    <p>${ctaP}</p>
    <a class="btn" href="${hrefBottom}">${ctaBtn}</a>
  </div>

  <section>
    <h2>${h2Near}</h2>
    <ul class="near">${near}</ul>
  </section>

  <section>
    <h2>${h2All}</h2>
    <ul class="all">${all}</ul>
  </section>
</main>
<footer>${footer}</footer>
</body>
</html>
`;
}

// ───────────────────────── 출력 ─────────────────────────
function writeFile(rel, content) {
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content);
}

const STATS = { persona: 0, v2: 0, skipped: 0, en_job: 0, en_fallback: 0 };
function buildTypePages() {
  CODES.forEach((code) => {
    writeFile(`types/${code}/index.html`, pageFor(code, 'ko'));
    writeFile(`en/types/${code}/index.html`, pageFor(code, 'en'));
    writeFile(`es/types/${code}/index.html`, pageFor(code, 'es'));
  });
}

// 손으로 쓴 정적 블로그 글. lang으로 목록을 나눈다: /blog/는 ko만, /en/blog/는 en만.
// 글 본문은 생성기가 만들지 않으므로 글을 고치면 여기 lastmod도 함께 바꾼다.
// 옛 URL /blog/big-five-personality-test-for-careers/ 는 리다이렉트 스텁이므로 sitemap에 넣지 않는다.
const BLOG_POSTS = [
  {
    lang: 'ko',
    path: '/blog/sbti-vs-bigfive-ocean/',
    lastmod: '2026-11-17',
    datePublished: '2026-11-17',
  },
  {
    lang: 'ko',
    path: '/blog/free-personality-test-career-bigfive/',
    lastmod: '2026-11-17',
    datePublished: '2026-11-16',
  },
  {
    lang: 'ko',
    path: '/blog/mbti-vs-bigfive-ocean/',
    lastmod: '2026-11-17',
    datePublished: '2026-11-14',
  },
  {
    lang: 'en',
    path: '/en/blog/big-five-personality-test-for-careers/',
    lastmod: '2026-11-17',
    datePublished: '2026-11-14',
    dateLabel: 'November 14, 2026',
    kicker: 'Career guide',
    title: 'Big Five Personality Test for Careers: How to Read OCEAN Scores at Work',
    excerpt: 'A free Big Five (OCEAN) personality test can inform career decisions if you read the five scores as work patterns, not as a job title. Learn how to use yours.',
  },
];

const BLOG_URLS = [
  { loc: SITE + '/blog/', lastmod: TODAY, pair: SITE + '/en/blog/' },
  ...BLOG_POSTS.map((p) => ({ loc: SITE + p.path, lastmod: p.lastmod })),
  { loc: SITE + '/en/blog/', lastmod: TODAY, pairKo: SITE + '/blog/' },
];

function buildSitemap() {
  const xhtmlHome = [
    `    <xhtml:link rel="alternate" hreflang="ko" href="${SITE}/"/>`,
    `    <xhtml:link rel="alternate" hreflang="en" href="${SITE}/en/"/>`,
    `    <xhtml:link rel="alternate" hreflang="es" href="${SITE}/es/"/>`,
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/en/"/>`,
  ].join('\n');
  const paired = [
    { loc: SITE + '/', lastmod: TODAY, home: true },
    { loc: SITE + '/en/', lastmod: TODAY, home: true },
    { loc: SITE + '/es/', lastmod: TODAY, home: true },
    ...CODES.map((code) => ({ loc: typeUrl(code, 'ko'), lastmod: TODAY, ko: typeUrl(code, 'ko'), en: typeUrl(code, 'en'), es: typeUrl(code, 'es') })),
    ...CODES.map((code) => ({ loc: typeUrl(code, 'en'), lastmod: TODAY, ko: typeUrl(code, 'ko'), en: typeUrl(code, 'en'), es: typeUrl(code, 'es') })),
    ...CODES.map((code) => ({ loc: typeUrl(code, 'es'), lastmod: TODAY, ko: typeUrl(code, 'ko'), en: typeUrl(code, 'en'), es: typeUrl(code, 'es') })),
  ];
  const blogEntries = BLOG_URLS.map((u) => {
    if (u.pair) return { loc: u.loc, lastmod: u.lastmod, ko: u.loc, en: u.pair };
    if (u.pairKo) return { loc: u.loc, lastmod: u.lastmod, ko: u.pairKo, en: u.loc };
    return { loc: u.loc, lastmod: u.lastmod };
  });
  const urls = paired.concat(blogEntries);
  const body = urls.map((u) => {
    const links = u.home ? '\n' + xhtmlHome : (u.ko && u.en ? '\n' + xhtmlLinks(u.ko, u.en, u.es) : '');
    return `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>${links}\n  </url>`;
  }).join('\n');
  writeFile('sitemap.xml',
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${body}\n</urlset>\n`);
}

const NAV_START = '<!-- TYPE-LINKS:START (build_type_pages.js가 생성 — 직접 수정하지 마세요) -->';
const NAV_END = '<!-- TYPE-LINKS:END -->';
function typeLinksBlock(lang) {
  const isEn = lang === 'en';
  const isEs = lang === 'es';
  const nameOf = (c) => isEs ? (ES_NAME[c] || EN_NAME[c] || c) : isEn ? (EN_NAME[c] || c) : masterByCode[c].name;
  const hrefLang = lang;
  const items = CODES.map((c) =>
    `      <li><a href="${typePath(c, hrefLang)}" data-code="${c}">${EMOJI[c] || ''} ${esc(nameOf(c))}</a></li>`).join('\n');
  const label = isEs ? 'Los 32 tipos OCEAN' : isEn ? 'All 32 OCEAN types' : 'OCEAN 32가지 유형 전체 보기';
  const title = label;
  return `${NAV_START}
    <nav class="type-links-section" aria-label="${label}" lang="${isEs ? 'es' : isEn ? 'en' : 'ko'}">
      <h2 class="tl-title">${title}</h2>
      <ul class="tl-grid">
${items}
      </ul>
    </nav>
    ${NAV_END}`;
}

function injectTypeLinks() {
  let html = read('index.html');
  const block = typeLinksBlock('ko');
  const s = html.indexOf('<!-- TYPE-LINKS:START');
  const e = html.indexOf(NAV_END);
  if (s !== -1 && e !== -1) {
    html = html.slice(0, s) + block + html.slice(e + NAV_END.length);
  } else {
    const anchor = 'data-i18n="ts_btn">모든 유형 탐색하기</button>\n    </div>\n';
    if (!html.includes(anchor)) throw new Error('index.html에서 유형 쇼케이스 위치를 찾지 못했습니다.');
    html = html.replace(anchor, anchor + '\n    ' + block + '\n');
  }
  fs.writeFileSync(path.join(ROOT, 'index.html'), html);
}

const HREFLANG_START = '<!-- HREFLANG:START -->';
const HREFLANG_END = '<!-- HREFLANG:END -->';
const HOME_HREFLANG = `${HREFLANG_START}
<link rel="alternate" hreflang="ko" href="${SITE}/">
<link rel="alternate" hreflang="en" href="${SITE}/en/">
<link rel="alternate" hreflang="es" href="${SITE}/es/">
<link rel="alternate" hreflang="x-default" href="${SITE}/en/">
${HREFLANG_END}`;

function patchKoreanHome(html) {
  if (!html.includes('src="/i18n_router.js"')) {
    html = html.replace('<meta charset="UTF-8">', '<script src="/i18n_router.js"></script>\n<meta charset="UTF-8">');
  }
  if (!html.includes('property="og:locale"')) {
    html = html.replace(
      '<meta property="og:type" content="website">',
      '<meta property="og:type" content="website">\n<meta property="og:locale" content="ko_KR">\n<meta property="og:locale:alternate" content="en_US">'
    );
  }
  const hs = html.indexOf(HREFLANG_START);
  const he = html.indexOf(HREFLANG_END);
  if (hs !== -1 && he !== -1) {
    html = html.slice(0, hs) + HOME_HREFLANG + html.slice(he + HREFLANG_END.length);
  } else {
    html = html.replace(
      '<link rel="canonical" href="https://thepersonalityai.com/">',
      '<link rel="canonical" href="https://thepersonalityai.com/">\n' + HOME_HREFLANG
    );
  }
  html = html.replace(/<script src="(ocean-personas\.js|v2_data\.js|i18n_en\.js|i18n_en_job04\.js|subscribe_config\.js)"/g, '<script src="/$1"');
  return html;
}

function extractStrings(html) {
  const m = html.match(/const STRINGS = ({[\s\S]*?})\s*;\s*\nfunction setLang/);
  if (!m) throw new Error('index.html에서 STRINGS를 추출하지 못했습니다.');
  return new Function('return ' + m[1])();
}

function applyDataI18n(html, map) {
  return html.replace(/<([a-zA-Z][\w:-]*)([^>]*?\sdata-i18n="([^"]+)"[^>]*)>([\s\S]*?)<\/\1>/g, (all, tag, attrs, key) => {
    if (map[key] === undefined) return all;
    return '<' + tag + attrs + '>' + map[key] + '</' + tag + '>';
  });
}

function buildEnHome() {
  let html = read('index.html');
  const strings = extractStrings(html);
  html = applyDataI18n(html, strings.en);
  html = html.replace('<html lang="ko">', '<html lang="en">');
  html = html.replace(/<title>[^<]*<\/title>/, '<title>AI-OCEAN | Your Personality-Based AI Prescription</title>');
  const enDesc = 'Get AI tools matched to your Big Five (OCEAN) personality. 25 questions, about 3 minutes, free.';
  html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(enDesc)}">`);
  html = html.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${SITE}/en/">`);
  const hl = `${HREFLANG_START}
<link rel="alternate" hreflang="ko" href="${SITE}/">
<link rel="alternate" hreflang="en" href="${SITE}/en/">
<link rel="alternate" hreflang="es" href="${SITE}/es/">
<link rel="alternate" hreflang="x-default" href="${SITE}/en/">
${HREFLANG_END}`;
  const hs = html.indexOf(HREFLANG_START);
  const he = html.indexOf(HREFLANG_END);
  if (hs !== -1 && he !== -1) html = html.slice(0, hs) + hl + html.slice(he + HREFLANG_END.length);

  html = html.replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${SITE}/en/">`);
  html = html.replace(/<meta property="og:title" content="[^"]*">/, '<meta property="og:title" content="AI-OCEAN | Your Personality-Based AI Prescription">');
  html = html.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(enDesc)}">`);
  html = html.replace(/<meta name="twitter:title" content="[^"]*">/, '<meta name="twitter:title" content="AI-OCEAN | Your Personality-Based AI Prescription">');
  html = html.replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${esc(enDesc)}">`);
  html = html.replace(/<meta property="og:image:alt" content="[^"]*">/, '<meta property="og:image:alt" content="AI-OCEAN — Get AI tools matched to your Big Five personality.">');
  html = html.replace(/<meta property="og:locale" content="[^"]*">/, '<meta property="og:locale" content="en_US">');
  html = html.replace(/<meta property="og:locale:alternate" content="[^"]*">/, '<meta property="og:locale:alternate" content="ko_KR">');

  // Replace Korean type-link block with the English one (same markers).
  const s = html.indexOf('<!-- TYPE-LINKS:START');
  const e = html.indexOf(NAV_END);
  if (s !== -1 && e !== -1) {
    html = html.slice(0, s) + typeLinksBlock('en') + html.slice(e + NAV_END.length);
  }

  html = html.replace(
    'onclick="toggleLangMenu(event)">KO</button>',
    'onclick="toggleLangMenu(event)">EN</button>'
  );
  html = html.replace(
    '<a href="/blog/" style="color:var(--text-secondary)">블로그 · Blog</a>',
    '<a href="/en/blog/" style="color:var(--text-secondary)">Blog</a>'
  );
  const quizEn = [
    ['id="progressText">질문 1 / 25<', 'id="progressText">Question 1 / 25<'],
    ['id="btnPrev" onclick="prevQuestion()">← 이전<', 'id="btnPrev" onclick="prevQuestion()">← Back<'],
    ['id="btnNext" onclick="nextQuestion()">다음 →<', 'id="btnNext" onclick="nextQuestion()">Next →<'],
    ['id="loadTitle">항로 분석 중...<', 'id="loadTitle">Charting your course…<'],
    ['id="loadSub">OCEAN Navigator가 당신의 성향을 탐색합니다<', 'id="loadSub">OCEAN Navigator is exploring your personality<'],
    ['id="ls1"><span class="loading-step-icon">⚓</span> OCEAN 5차원 측정 중<', 'id="ls1"><span class="loading-step-icon">⚓</span> Measuring 5 OCEAN dimensions<'],
    ['id="ls2"><span class="loading-step-icon">🗺️</span> 항로 설정 &amp; 페르소나 생성<', 'id="ls2"><span class="loading-step-icon">🗺️</span> Plotting your course &amp; generating persona<'],
    ['id="ls3"><span class="loading-step-icon">🤖</span> AI 도구 매칭 중<', 'id="ls3"><span class="loading-step-icon">🤖</span> Matching AI tools<'],
    ['id="ls4"><span class="loading-step-icon">⭐</span> 항해 지도 완성 중<', 'id="ls4"><span class="loading-step-icon">⭐</span> Completing your navigation chart<'],
  ];
  quizEn.forEach(([a, b]) => {
    if (!html.includes(a)) throw new Error('English home quiz chrome 원문을 찾지 못했습니다: ' + a);
    html = html.replace(a, b);
  });
  writeFile('en/index.html', html);
}

function buildEsHome() {
  let html = read('index.html');
  const strings = extractStrings(html);
  const map = Object.assign({}, strings.en || {}, strings.es || {});
  html = applyDataI18n(html, map);
  html = html.replace('<html lang="ko">', '<html lang="es">');
  html = html.replace(/<title>[^<]*<\/title>/, '<title>AI-OCEAN | Tu receta de IA según tu personalidad</title>');
  const esDesc = 'Encuentra las herramientas de IA que van contigo, según tu personalidad Big Five (OCEAN). 25 preguntas, unos 3 minutos, gratis.';
  html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(esDesc)}">`);
  html = html.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${SITE}/es/">`);
  const hs = html.indexOf(HREFLANG_START);
  const he = html.indexOf(HREFLANG_END);
  if (hs !== -1 && he !== -1) html = html.slice(0, hs) + HOME_HREFLANG + html.slice(he + HREFLANG_END.length);

  html = html.replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${SITE}/es/">`);
  html = html.replace(/<meta property="og:title" content="[^"]*">/, '<meta property="og:title" content="AI-OCEAN | Tu receta de IA según tu personalidad">');
  html = html.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(esDesc)}">`);
  html = html.replace(/<meta name="twitter:title" content="[^"]*">/, '<meta name="twitter:title" content="AI-OCEAN | Tu receta de IA según tu personalidad">');
  html = html.replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${esc(esDesc)}">`);
  html = html.replace(/<meta property="og:image:alt" content="[^"]*">/, '<meta property="og:image:alt" content="AI-OCEAN — Encuentra las herramientas de IA que van con tu personalidad.">');
  html = html.replace(/<meta property="og:locale" content="[^"]*">/, '<meta property="og:locale" content="es_419">');
  html = html.replace(/<meta property="og:locale:alternate" content="[^"]*">/, '<meta property="og:locale:alternate" content="en_US">');

  const s = html.indexOf('<!-- TYPE-LINKS:START');
  const e = html.indexOf(NAV_END);
  if (s !== -1 && e !== -1) {
    html = html.slice(0, s) + typeLinksBlock('es') + html.slice(e + NAV_END.length);
  }

  html = html.replace(
    'onclick="toggleLangMenu(event)">KO</button>',
    'onclick="toggleLangMenu(event)">ES</button>'
  );
  html = html.replace(
    '<a href="/blog/" style="color:var(--text-secondary)">블로그 · Blog</a>',
    '<a href="/en/blog/" style="color:var(--text-secondary)">Blog</a>'
  );
  const quizEs = [
    ['id="progressText">질문 1 / 25<', 'id="progressText">Pregunta 1 / 25<'],
    ['id="btnPrev" onclick="prevQuestion()">← 이전<', 'id="btnPrev" onclick="prevQuestion()">← Atrás<'],
    ['id="btnNext" onclick="nextQuestion()">다음 →<', 'id="btnNext" onclick="nextQuestion()">Siguiente →<'],
    ['id="loadTitle">항로 분석 중...<', 'id="loadTitle">Trazando tu rumbo…<'],
    ['id="loadSub">OCEAN Navigator가 당신의 성향을 탐색합니다<', 'id="loadSub">OCEAN Navigator está explorando tu personalidad<'],
    ['id="ls1"><span class="loading-step-icon">⚓</span> OCEAN 5차원 측정 중<', 'id="ls1"><span class="loading-step-icon">⚓</span> Midiendo las 5 dimensiones OCEAN<'],
    ['id="ls2"><span class="loading-step-icon">🗺️</span> 항로 설정 &amp; 페르소나 생성<', 'id="ls2"><span class="loading-step-icon">🗺️</span> Trazando tu rumbo y creando tu persona<'],
    ['id="ls3"><span class="loading-step-icon">🤖</span> AI 도구 매칭 중<', 'id="ls3"><span class="loading-step-icon">🤖</span> Enlazando herramientas de IA<'],
    ['id="ls4"><span class="loading-step-icon">⭐</span> 항해 지도 완성 중<', 'id="ls4"><span class="loading-step-icon">⭐</span> Completando tu carta de navegación<'],
  ];
  quizEs.forEach(([a, b]) => {
    if (!html.includes(a)) throw new Error('Spanish home quiz chrome 원문을 찾지 못했습니다: ' + a);
    html = html.replace(a, b);
  });
  writeFile('es/index.html', html);
}

function buildEnBlogIndex() {
  const title = 'AI-OCEAN Blog | Big Five (OCEAN) personality and AI guides';
  const desc = 'Guides on the Big Five (OCEAN) personality model, careers, and choosing AI tools that fit your type.';
  const posts = BLOG_POSTS
    .filter((p) => p.lang === 'en')
    .slice()
    .sort((a, b) => String(b.datePublished).localeCompare(String(a.datePublished)));
  const cards = posts.map((p, i) => `    <article class="card"${i ? ' style="margin-top:14px"' : ''}>
      <p class="meta"><time datetime="${p.datePublished}">${esc(p.dateLabel)}</time> · ${esc(p.kicker)}</p>
      <h2 style="margin:6px 0 8px"><a href="${p.path}" style="text-decoration:none">${esc(p.title)}</a></h2>
      <p style="margin:0 0 10px">${esc(p.excerpt)}</p>
      <a href="${p.path}">Read the article →</a>
    </article>`).join('\n');
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${GA_ID}');
</script>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${SITE}/en/blog/">
${hreflangTags(SITE + '/blog/', SITE + '/en/blog/')}
<meta property="og:type" content="website">
<meta property="og:locale" content="en_US">
<meta property="og:locale:alternate" content="ko_KR">
<meta property="og:site_name" content="AI-OCEAN">
<meta property="og:url" content="${SITE}/en/blog/">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${SITE}/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(title)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${SITE}/og-image.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800;900&family=Noto+Sans+KR:wght@400;500;700;800;900&display=swap">
<script src="/i18n_router.js"></script>
<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'AI-OCEAN Blog',
    url: SITE + '/en/blog/',
    inLanguage: 'en',
    publisher: { '@type': 'Organization', name: 'AI-OCEAN', url: SITE + '/' },
    blogPost: posts.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: SITE + p.path,
      datePublished: p.datePublished,
      inLanguage: 'en',
    })),
  })}</script>
<style>
:root{--bg:#F7F8FC;--card:#fff;--line:#E9ECF3;--text:#1A1B2E;--sub:#6C757D;--brand:#4C6EF5;--brand2:#3451D1;--shadow:0 1px 4px rgba(0,0,0,.06),0 0 0 1px rgba(0,0,0,.04)}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--text);font-family:'Inter','Noto Sans KR',-apple-system,'Segoe UI',sans-serif;line-height:1.75}
a{color:var(--brand2)}
.site-header{background:#fff;border-bottom:1px solid var(--line)}
.site-header .in{max-width:880px;margin:0 auto;padding:14px 20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px 12px}
.logo{font-weight:900;font-size:20px;letter-spacing:-.5px;color:var(--brand);text-decoration:none}
.site-header nav{display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-end}.site-header nav a{margin-left:18px;font-size:14px;font-weight:600;color:var(--sub);text-decoration:none}
.lang-switch{display:inline-block;margin-left:16px;font-size:12px;font-weight:800;color:var(--brand);text-decoration:none;border:1px solid var(--line);border-radius:999px;padding:3px 10px}
main{max-width:760px;margin:0 auto;padding:20px 20px 64px}
.crumbs{font-size:13px;color:var(--sub);margin:4px 0 20px}.crumbs a{color:var(--sub)}
.hero{background:#fff;border:1px solid var(--line);border-radius:24px;padding:32px 28px;box-shadow:var(--shadow)}
.eyebrow{margin:0 0 6px;font-size:12px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:var(--brand)}
h1{margin:0 0 12px;font-size:clamp(26px,5vw,36px);line-height:1.3;letter-spacing:-.5px}
.meta{margin:0;font-size:13px;color:var(--sub)}
.btn{display:inline-block;background:var(--brand);color:#fff;text-decoration:none;font-weight:800;font-size:16px;padding:14px 30px;border-radius:14px;box-shadow:0 6px 20px rgba(76,110,245,.3)}
.card{background:#fff;border:1px solid var(--line);border-radius:18px;padding:20px 22px;box-shadow:var(--shadow)}
.cta{margin-top:44px;background:linear-gradient(135deg,#EEF1FF,#F3F0FF);border:1px solid var(--line);border-radius:22px;padding:30px 24px;text-align:center}
.cta p{margin:0 0 16px;color:var(--sub)}
footer{max-width:760px;margin:0 auto;padding:0 20px 48px;font-size:13px;color:var(--sub)}
</style>
</head>
<body>
<header class="site-header"><div class="in"><a class="logo" href="/en/">AI-OCEAN</a><nav><a href="/en/blog/">Blog</a><a href="/en/?start=1&amp;utm_source=blog&amp;utm_medium=article&amp;utm_campaign=en-blog-index&amp;utm_content=header">Start the test</a><a class="lang-switch" href="/blog/" hreflang="ko" lang="ko">KO</a></nav></div></header>
<main>
  <nav class="crumbs" aria-label="breadcrumb"><a href="/en/">Home</a> › Blog</nav>
  <header class="hero">
    <p class="eyebrow">AI-OCEAN Blog</p>
    <h1>AI-OCEAN Blog</h1>
    <p class="meta">Big Five (OCEAN) personality, careers, and AI tools that fit your type.</p>
  </header>
  <section style="margin-top:28px">
${cards}
  </section>
  <div class="cta">
    <h2 style="margin-bottom:6px">Curious about your OCEAN type?</h2>
    <p>Answer 25 questions and get an AI plan for your job group.</p>
    <a class="btn" href="/en/?start=1&amp;utm_source=blog&amp;utm_medium=article&amp;utm_campaign=en-blog-index&amp;utm_content=blog_index">Start the test →</a>
  </div>
</main>
<footer>This is a reference based on the Big Five (OCEAN) model, not a psychological diagnosis. MBTI is a trademark of its owners; AI-OCEAN is not affiliated with the official Myers-Briggs Type Indicator. · <a href="/en/">AI-OCEAN home</a> · <a href="/en/blog/">Blog</a> · <a href="/en/privacy/">Privacy</a> · ${contactMailto('en')}</footer>
</body>
</html>
`;
  writeFile('en/blog/index.html', html);
}

function buildPrivacy() {
  let html = read('privacy/index.html');
  if (!html.includes('i18n_router.js')) {
    html = html.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<script src="/i18n_router.js"></script>');
  }
  html = html.replace(/\n?<link rel="canonical" href="[^"]*">/g, '');
  html = html.replace(/\n?<link rel="alternate" hreflang="[^"]+" href="[^"]*">/g, '');
  const hl = hreflangTags(SITE + '/privacy/', SITE + '/en/privacy/', SITE + '/es/privacy/');
  html = html.replace(
    /<title>[^<]*<\/title>/,
    '<title>__TITLE__</title>\n<link rel="canonical" href="__CANON__">\n' + hl
  );
  html = html.replace(/<div class="lang">[\s\S]*?<\/div>/,
    '<div class="lang"><a href="/en/privacy/" hreflang="en">EN</a> · <a href="/privacy/" hreflang="ko" lang="ko">KO</a> · <a href="/es/privacy/" hreflang="es" lang="es">ES</a></div>');
  html = html.replace(
    /function setLang\(l\) \{ document\.body\.className = l; document\.documentElement\.lang = l; \}[\s\S]*?\}\)\(\);/,
    `function setLang(l) { document.body.className = l; document.documentElement.lang = l; }
  (function () {
    var l = (typeof oceanPathLang === 'function' ? oceanPathLang(location.pathname) : '__LANG__');
    setLang(l);
  })();`
  );

  const titles = { ko: '개인정보 안내 — AI-OCEAN', en: 'Privacy — AI-OCEAN', es: 'Privacidad — AI-OCEAN' };
  const canons = { ko: SITE + '/privacy/', en: SITE + '/en/privacy/', es: SITE + '/es/privacy/' };
  const homes = { ko: '/', en: '/en/', es: '/es/' };

  function variant(lang) {
    let out = html;
    out = out.replace('__TITLE__', titles[lang]);
    out = out.replace('__CANON__', canons[lang]);
    out = out.replace('__LANG__', lang);
    out = out.replace(/<html lang="[^"]*">/, '<html lang="' + lang + '">');
    out = out.replace(/<body class="[^"]*">/, '<body class="' + lang + '">');
    out = out.replace(/<p><a href="[^"]*">← thepersonalityai.com<\/a><\/p>/,
      '<p><a href="' + homes[lang] + '">← thepersonalityai.com</a></p>');
    return out;
  }
  writeFile('privacy/index.html', variant('ko'));
  writeFile('en/privacy/index.html', variant('en'));
  writeFile('es/privacy/index.html', variant('es'));
}

function patchKoreanHomeFile() {
  const html = patchKoreanHome(read('index.html'));
  fs.writeFileSync(path.join(ROOT, 'index.html'), html);
}

patchKoreanHomeFile();
buildTypePages();
injectTypeLinks();
buildEnHome();
buildEsHome();
buildEnBlogIndex();
buildPrivacy();
buildSitemap();
const sitemapCount = 3 + CODES.length * 3 + BLOG_URLS.length;
console.log(`생성 완료: types/ ${CODES.length}개, en/types/ ${CODES.length}개, es/types/ ${CODES.length}개, en/index.html, es/index.html, sitemap.xml ${sitemapCount} URL`);
console.log(`직업군 ${JOB_GROUPS.length}개 사용(${JOB_GROUPS.join(',')}), 제외 ${[...EXCLUDED_JOB_GROUPS].join(',')}`);
console.log(`직업군 섹션 ${STATS.persona + STATS.v2}개: 페르소나 ${STATS.persona}, v2 보완 ${STATS.v2}, 품질 검사로 제외 ${STATS.skipped}`);
console.log(`영어 직업군 섹션: EN_JOB ${STATS.en_job}, 요약 대체 ${STATS.en_fallback}`);
