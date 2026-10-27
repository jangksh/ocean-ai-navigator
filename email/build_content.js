// email/copy.js(원고) + 유형 데이터(ocean-personas.js, i18n_en.js, index.html 상수)를 합쳐 email/content.json 을 만든다.
// 사용법: node email/build_content.js
// content.json 은 생성물이다. 직접 고치지 말고 copy.js 를 고친 뒤 다시 실행한다.
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const copy = require('./copy.js');

const DIMS = ['O', 'C', 'E', 'A', 'N'];
const WEEKS = 10;

// ── 유형 데이터 로드 ──
const html = read('index.html');
const grab = name => { const i = html.indexOf('const ' + name); const j = html.indexOf('\n};', i); return html.slice(i, j + 3); };
const c1 = vm.createContext({});
vm.runInContext(grab('PERSONA_EN_NAME') + ';' + grab('PERSONA_AI_REC') + ';this.N=PERSONA_EN_NAME;this.R=PERSONA_AI_REC', c1);
const c2 = { }; c2.window = c2; vm.createContext(c2);
vm.runInContext(read('i18n_en.js') + ';this.E=window.EN', c2);
const c3 = { }; c3.window = c3; vm.createContext(c3);
vm.runInContext(read('ocean-personas.js') + ';this.M=OCEAN_MASTER_PERSONAS', c3);

const types = {};
for (let n = 0; n < 32; n++) {
  const code = n.toString(2).padStart(5, '0');
  const en = c2.E.master[code], ko = c3.M.find(m => m.code === code);
  if (!en || !ko || !c1.N[code] || !c1.R[code]) throw new Error('missing data for ' + code);
  types[code] = {
    en: { name: c1.N[code], summary: en[0], insight: en[1] },
    ko: { name: ko.name, summary: ko.summary, insight: '' },
    tools: c1.R[code],
  };
}

// ── 검증 ──
const problems = [];
for (const lang of ['en', 'ko']) {
  const c = copy[lang];
  if (c.course.length !== 5) problems.push(lang + ': course must have 5 days');
  for (const d of DIMS) for (const b of [0, 1]) {
    const arr = c.tips[d + b];
    if (!arr || arr.length !== 2) problems.push(lang + ': tips ' + d + b + ' needs 2 rounds');
    else arr.forEach((t, i) => ['t', 'b', 'p', 'a'].forEach(k => { if (!t[k]) problems.push(lang + ' ' + d + b + '[' + i + '] missing ' + k); }));
    if (!c.blind[d + b]) problems.push(lang + ': blind ' + d + b + ' missing');
  }
}
const allowed = new Set(['name', 'summary', 'insight', 'tools']);
for (const lang of ['en', 'ko']) for (const day of copy[lang].course) {
  const text = day.subject + JSON.stringify(day.blocks);
  for (const m of text.matchAll(/\{\{(\w+)\}\}/g)) if (!allowed.has(m[1])) problems.push(lang + ': unknown placeholder ' + m[0]);
}
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }

const out = { version: 1, dims: DIMS, weeks: WEEKS, types, en: copy.en, ko: copy.ko };
fs.writeFileSync(path.join(__dirname, 'content.json'), JSON.stringify(out, null, 1) + '\n');
console.log('content.json written:', Object.keys(types).length, 'types,', copy.en.course.length, 'course days,', WEEKS, 'weekly tips per type');
