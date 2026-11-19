#!/usr/bin/env node
/**
 * Build two sample Korean report PDFs from live site data, then optionally
 * write them outside the repo (default: /workspace/ocean-business/).
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
    scores: { O: 76, C: 26, E: 74, A: 78, N: 74 },
    ts: Date.parse('2026-11-18T15:00:00-08:00')
  },
  {
    file: 'sample_report_2.pdf',
    job: 4,
    code: '11011',
    scores: { O: 82, C: 79, E: 31, A: 71, N: 68 },
    ts: Date.parse('2026-11-19T09:30:00-08:00')
  }
];

fs.mkdirSync(OUTDIR, { recursive: true });

for (const s of samples) {
  const model = ctx.ReportData.buildModel(s);
  if (!model.hasV2) throw new Error('Missing v2 data for ' + s.file);
  const doc = await ctx.ReportPDF.generate(model, { fonts });
  const buf = Buffer.from(ctx.ReportPDF.docToArrayBuffer(doc));
  const dest = path.join(OUTDIR, s.file);
  fs.writeFileSync(dest, buf);
  const pages = doc.getNumberOfPages();
  console.log(s.file, 'pages=' + pages, 'bytes=' + buf.length, model.typeName, model.job.label, model.code, model.testDateLabel);
}
