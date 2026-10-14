#!/usr/bin/env node
/**
 * AI-OCEAN — 유형별 정적 페이지 생성기
 *
 * 실행:  node build_type_pages.js
 *
 * 생성물
 *   types/<코드>/index.html   32개 (예: types/11010/index.html → /types/11010/)
 *   sitemap.xml               홈 + 32개 유형 = 33 URL
 *   index.html                <!-- TYPE-LINKS:START --> ~ <!-- TYPE-LINKS:END --> 사이 정적 링크 블록
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
const typeUrl = (code) => `${SITE}/types/${code}/`;
const typePath = (code) => `/types/${code}/`;

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
.site-header .in{max-width:880px;margin:0 auto;padding:14px 20px;display:flex;align-items:center;justify-content:space-between}
.logo{font-weight:900;font-size:20px;letter-spacing:-.5px;color:var(--brand);text-decoration:none}
.site-header nav a{margin-left:18px;font-size:14px;font-weight:600;color:var(--sub);text-decoration:none}
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
.near{list-style:none;margin:0;padding:0;display:grid;gap:10px}
.near li{background:#fff;border:1px solid var(--line);border-radius:14px;padding:12px 16px}
.near a{font-weight:800;text-decoration:none}.near span{display:block;font-size:14px;color:var(--sub)}
.all{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px}
.all a,.all .cur{display:block;background:#fff;border:1px solid var(--line);border-radius:12px;padding:10px 12px;font-size:14px;font-weight:600;text-decoration:none;color:var(--text)}
.all a:hover{border-color:var(--brand)}.all .cur{background:#EEF1FF;border-color:var(--brand);color:var(--brand2)}
footer{max-width:880px;margin:0 auto;padding:0 20px 48px;font-size:13px;color:var(--sub)}
@media(max-width:560px){.hero{padding:28px 18px}.card{padding:18px}}
`;

function pageFor(code) {
  const m = masterByCode[code];
  const name = m.name;
  const en = EN_NAME[code] || code;
  const emoji = EMOJI[code] || '✨';
  const pair = AI_REC[code] || 'ChatGPT';
  const on = digitsOf(code);
  const highDims = DIM_META.filter((_, i) => on[i]).map((d) => d.label);
  const lowDims = DIM_META.filter((_, i) => !on[i]).map((d) => d.label);
  const alias = FEATURED_ALIAS[code] && FEATURED_ALIAS[code] !== name ? FEATURED_ALIAS[code] : '';

  const jobs = JOB_GROUPS.map((jj) => jobEntry(jj, code)).filter(Boolean);
  jobs.forEach((j) => { STATS[j.source] += 1; });
  STATS.skipped += JOB_GROUPS.length - jobs.length;
  const mainTally = tally(jobs.map((j) => j.main.name));
  const specTally = tally(jobs.flatMap((j) => j.specs.map((s) => s.name))).slice(0, 3);
  const mainSummary = mainTally.slice(0, 3).map(([n, c]) => `${esc(n)} ${c}곳`).join(', ');
  const specSummary = specTally.map(([n]) => esc(n)).join(', ');
  const mainSentence = mainTally.length === 1
    ? `직업군별 상세 처방 ${jobs.length}개의 메인 AI는 모두 ${esc(mainTally[0][0])}입니다.`
    : `직업군별 상세 처방 ${jobs.length}개에서 메인 AI는 ${mainSummary} 순으로 많이 추천됩니다.`;

  const title = `${name}(${en}) 유형 | OCEAN ${code} 성향·AI 추천 - AI-OCEAN`;
  const desc = `${stripEnd(m.summary)}. OCEAN ${code} ${en} 유형에게 어울리는 AI(${pair})와 직업군별 활용법을 확인하세요.`;
  const url = typeUrl(code);

  const pills = DIM_META.map((d, i) =>
    `<span class="pill${on[i] ? '' : ' off'}" style="background:${DIM_BG[d.key]};color:${DIM_COLOR[d.key]}">${d.key} ${on[i] ? '높음' : '낮음'}</span>`
  ).join('');

  const dimRows = DIM_META.map((d, i) => `
      <div class="dim"><div class="ic">${d.icon}</div><div><b style="color:${DIM_COLOR[d.key]}">${esc(d.label)}</b><span class="st" style="background:${DIM_BG[d.key]};color:${DIM_COLOR[d.key]}">${on[i] ? '높음' : '낮음'}</span><p>${esc(on[i] ? d.highInsight : d.lowInsight)}</p></div></div>`
  ).join('');

  const structureLine =
    highDims.length === 5 ? '다섯 차원이 모두 50% 이상인 조합입니다.'
    : lowDims.length === 5 ? '다섯 차원이 모두 50% 미만인 조합입니다.'
    : `높은 차원은 ${highDims.join('·')}, 낮은 차원은 ${lowDims.join('·')}입니다.`;

  const jobCards = jobs.map((j) => `
      <article class="card job">
        <h3>${j.icon} ${esc(j.label)}</h3>
        ${j.title ? `<div class="ttl">“${esc(j.title)}”</div>` : ''}
        <p>${esc(j.insight)}</p>
        <p class="ai"><strong>메인 AI</strong> ${esc(j.main.name)}${j.main.blurb ? ` — ${esc(j.main.blurb)}` : ''}</p>
        ${j.specs.map((s) => `<p class="ai"><strong>전문 AI</strong> ${esc(s.name)}${s.blurb ? ` — ${esc(s.blurb)}` : ''}</p>`).join('\n        ')}
      </article>`).join('');

  const near = neighbors(code).map(({ code: c, dimIndex }) => {
    const nm = masterByCode[c];
    const st = c[dimIndex] === '1' ? '높음' : '낮음';
    return `<li><a href="${typePath(c)}">${EMOJI[c] || ''} ${esc(nm.name)}</a><span>${esc(DIM_META[dimIndex].label)}만 ${st} · ${esc(nm.summary)}</span></li>`;
  }).join('');

  const all = CODES.map((c) => c === code
    ? `<li><span class="cur" aria-current="page">${EMOJI[c] || ''} ${esc(masterByCode[c].name)}</span></li>`
    : `<li><a href="${typePath(c)}">${EMOJI[c] || ''} ${esc(masterByCode[c].name)}</a></li>`
  ).join('');

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'AI-OCEAN', item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: `${name} (${code})`, item: url },
    ],
  };

  return `<!DOCTYPE html>
<html lang="ko">
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
<meta property="og:type" content="article">
<meta property="og:locale" content="ko_KR">
<meta property="og:site_name" content="AI-OCEAN">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${SITE}/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${SITE}/og-image.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;800;900&display=swap">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<style>${CSS}</style>
</head>
<body>
<header class="site-header"><div class="in"><a class="logo" href="/">AI-OCEAN</a><nav><a href="/">홈</a><a href="/?start=1">테스트 시작</a></nav></div></header>
<main>
  <nav class="crumbs" aria-label="breadcrumb"><a href="/">홈</a> › OCEAN 32가지 유형 › ${esc(name)}</nav>

  <div class="hero">
    <div class="emoji" aria-hidden="true">${emoji}</div>
    <p class="eyebrow">OCEAN ${code} · ${esc(en)}</p>
    <h1>${esc(name)}</h1>
    <p class="lead">${esc(m.summary)}</p>
    ${alias ? `<p class="alias">메인 화면 카드 이름: ‘${esc(alias)}’</p>` : ''}
    <div class="pills">${pills}</div>
    <a class="btn" href="/?start=1">나의 AI DNA 분석 시작 →</a>
  </div>

  <section>
    <h2>${esc(name)} 유형의 성향 구조 (${code})</h2>
    <p class="muted">코드는 개방성·성실성·외향성·친화성·정서안정성 순서이며, 각 점수가 50% 이상이면 1, 미만이면 0입니다. ${esc(structureLine)}</p>
    <div class="dims">${dimRows}
    </div>
  </section>

  <section>
    <h2>${esc(name)}에게 어울리는 AI 조합</h2>
    <div class="card">
      <p style="margin:0 0 8px"><strong>기본 추천 조합: ${esc(pair)}</strong></p>
      <p class="muted" style="margin:0">${mainSentence} 보조 AI로는 ${specSummary} 등이 자주 등장합니다.</p>
    </div>
  </section>

  <section>
    <h2>직업군별 ${esc(name)} 가이드</h2>
    <div class="jobs">${jobCards}
    </div>
  </section>

  <div class="cta">
    <h2 style="margin-bottom:6px">내 결과도 ${esc(name)}일까요?</h2>
    <p>25문항에 답하면 내 직업군에 맞춘 AI 처방전을 받을 수 있습니다.</p>
    <a class="btn" href="/?start=1">테스트 시작하기 →</a>
  </div>

  <section>
    <h2>한 차원만 다른 이웃 유형</h2>
    <ul class="near">${near}</ul>
  </section>

  <section>
    <h2>OCEAN 32가지 유형 전체</h2>
    <ul class="all">${all}</ul>
  </section>
</main>
<footer>이 페이지는 Big Five(OCEAN) 성향 모델을 바탕으로 AI 도구를 제안하는 참고 자료이며, 심리 진단이 아닙니다. · <a href="/">AI-OCEAN 홈</a></footer>
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

const STATS = { persona: 0, v2: 0, skipped: 0 };
function buildTypePages() {
  CODES.forEach((code) => writeFile(`types/${code}/index.html`, pageFor(code)));
}

function buildSitemap() {
  const urls = [SITE + '/', ...CODES.map(typeUrl)];
  const body = urls.map((u) => `  <url>\n    <loc>${u}</loc>\n    <lastmod>${TODAY}</lastmod>\n  </url>`).join('\n');
  writeFile('sitemap.xml',
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`);
}

const NAV_START = '<!-- TYPE-LINKS:START (build_type_pages.js가 생성 — 직접 수정하지 마세요) -->';
const NAV_END = '<!-- TYPE-LINKS:END -->';
function typeLinksBlock() {
  const items = CODES.map((c) =>
    `      <li><a href="${typePath(c)}">${EMOJI[c] || ''} ${esc(masterByCode[c].name)}</a></li>`).join('\n');
  return `${NAV_START}
    <nav class="type-links-section" aria-label="OCEAN 32가지 유형 전체 보기" lang="ko">
      <h2 class="tl-title">OCEAN 32가지 유형 전체 보기</h2>
      <ul class="tl-grid">
${items}
      </ul>
    </nav>
    ${NAV_END}`;
}

function injectTypeLinks() {
  let html = read('index.html');
  const block = typeLinksBlock();
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

buildTypePages();
buildSitemap();
injectTypeLinks();
console.log(`생성 완료: types/ ${CODES.length}개, sitemap.xml ${CODES.length + 1} URL`);
console.log(`직업군 ${JOB_GROUPS.length}개 사용(${JOB_GROUPS.join(',')}), 제외 ${[...EXCLUDED_JOB_GROUPS].join(',')}`);
console.log(`직업군 섹션 ${STATS.persona + STATS.v2}개: 페르소나 ${STATS.persona}, v2 보완 ${STATS.v2}, 품질 검사로 제외 ${STATS.skipped}`);
