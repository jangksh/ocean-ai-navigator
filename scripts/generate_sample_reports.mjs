#!/usr/bin/env node
/**
 * Build sample Korean report PDFs from live site data, then optionally
 * write them outside the repo (default: /workspace/ocean-business/).
 * sample_report_3.pdf is job 06 (generic type copy fallback).
 *
 * Usage: node scripts/generate_sample_reports.mjs [outdir]
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUTDIR = path.resolve(process.argv[2] || '/workspace/ocean-business');

function runScript(ctx, file) {
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  vm.runInContext(src, ctx, { filename: file });
}

function loadJsPdf(ctx) {
  const src = fs.readFileSync(path.join(ROOT, 'report/js/jspdf.umd.min.js'), 'utf8');
  const sandbox = {
    exports: {},
    module: { exports: {} },
    console,
    atob,
    btoa,
    Buffer,
    Uint8Array,
    ArrayBuffer,
    DataView,
    TextEncoder,
    TextDecoder,
    navigator: { userAgent: 'node' },
    location: { href: 'file:///', origin: 'file://' },
    document: {
      createElement: () => ({ style: {}, dispatchEvent: () => {}, click: () => {} }),
      createEvent: () => ({ initMouseEvent: () => {} }),
      body: { appendChild() {}, removeChild() {} }
    }
  };
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  sandbox.global = sandbox;
  sandbox.module = { exports: sandbox.exports };
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox, { filename: 'jspdf.umd.min.js' });
  const mod = sandbox.module.exports || sandbox.exports;
  const jsPDF = (mod && (mod.jsPDF || mod.default)) || sandbox.jspdf?.jsPDF;
  if (typeof jsPDF !== 'function') throw new Error('jsPDF UMD did not export jsPDF');
  ctx.jspdf = { jsPDF };
}

const ctx = {
  console,
  atob,
  btoa,
  Buffer,
  Uint8Array,
  ArrayBuffer,
  DataView,
  TextEncoder,
  TextDecoder
};
ctx.window = ctx;
ctx.self = ctx;
ctx.global = ctx;
vm.createContext(ctx);
runScript(ctx, 'ocean-personas.js');
runScript(ctx, 'v2_data.js');
loadJsPdf(ctx);
runScript(ctx, 'report/js/report-data.js');
runScript(ctx, 'report/js/report-pdf.js');

const fonts = {
  regular: fs.readFileSync(path.join(ROOT, 'report/fonts/NotoSansKR-Regular.subset.ttf')),
  bold: fs.readFileSync(path.join(ROOT, 'report/fonts/NotoSansKR-Bold.subset.ttf'))
};

const samples = [
  {
    file: 'sample_report_1.pdf',
    job: 10,
    code: '10111',
    scores: { O: 81, C: 33, E: 69, A: 72, N: 61 },
    ts: Date.parse('2026-11-18T15:00:00-08:00'),
    expectJobCopy: true
  },
  {
    file: 'sample_report_2.pdf',
    job: 4,
    code: '11011',
    scores: { O: 82, C: 79, E: 31, A: 71, N: 68 },
    ts: Date.parse('2026-11-19T09:30:00-08:00'),
    expectJobCopy: true
  },
  {
    file: 'sample_report_3.pdf',
    job: 6,
    code: '11001',
    scores: { O: 72, C: 81, E: 28, A: 35, N: 74 },
    ts: Date.parse('2026-11-19T11:00:00-08:00'),
    expectJobCopy: false
  }
];

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function checkModel(s, model) {
  assert(model.usedJobCopy === s.expectJobCopy, s.file + ' usedJobCopy=' + model.usedJobCopy);
  assert(model.job.id === s.job, s.file + ' wrong job id');
  const blob = [model.insight, model.synergy, model.dailyRoutine, ...(model.strengths || []), ...(model.growthPoints || [])].join('\n');
  if (!s.expectJobCopy) {
    assert(!/지반|토목|건설|채굴|설치|정비/.test(blob), s.file + ' still has mismatched job copy');
    assert(blob.includes(model.job.label) || blob.includes(model.typeName), s.file + ' missing generic type copy');
  } else {
    assert(model.hasV2, s.file + ' missing v2 data');
  }
  if (s.scores.N >= 50) {
    assert(!/높(?:은|아|고)?\s*신경(?:성|증)|신경(?:성|증)이\s*높/.test(blob), s.file + ' kept a high-neuroticism claim for high stability');
  }
  // Labeled OCEAN percents, if present, must match the user score (신경성 uses 100-N)
  const dimMap = { '개방성': 'O', '성실성': 'C', '외향성': 'E', '친화성': 'A', '정서안정성': 'N', '정서 안정성': 'N', '정서적 안정성': 'N' };
  const re = /(개방성|성실성|외향성|친화성|정서(?:적\s*)?안정성)\s*(?:이\s*)?(?:높(?:아|은)|낮(?:아|은))?\s*\(?\s*(?:[OCEAN]\s*[=:]?\s*)?(\d{1,3})\s*%/g;
  let m;
  while ((m = re.exec(blob))) {
    const key = dimMap[m[1].replace(/\s+/g, ' ').replace('정서적 안정성', '정서적 안정성')];
    const expect = key === 'N' || /정서/.test(m[1]) ? s.scores.N : s.scores[key];
    const label = Object.keys(dimMap).find((k) => m[1].startsWith(k.slice(0, 2)) && (dimMap[k]));
    const dimKey = /정서/.test(m[1]) ? 'N' : dimMap[m[1]];
    const want = dimKey === 'N' ? s.scores.N : s.scores[dimKey];
    assert(Number(m[2]) === want, s.file + ' stale percent ' + m[0] + ' (want ' + want + ')');
  }
}

fs.mkdirSync(OUTDIR, { recursive: true });

for (const s of samples) {
  const model = ctx.ReportData.buildModel(s);
  checkModel(s, model);
  const doc = await ctx.ReportPDF.generate(model, { fonts });
  const buf = Buffer.from(ctx.ReportPDF.docToArrayBuffer(doc));
  const dest = path.join(OUTDIR, s.file);
  fs.writeFileSync(dest, buf);
  const pages = doc.getNumberOfPages();
  console.log(s.file, 'pages=' + pages, 'bytes=' + buf.length, model.typeName, model.job.label, model.code, model.testDateLabel, 'jobCopy=' + model.usedJobCopy);
}
