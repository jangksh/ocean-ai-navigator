#!/usr/bin/env node
/**
 * Dump per-type names, emoji, AI pairing, and OCEAN digits as JSON
 * for scripts/generate_og_images.py.
 *
 * Usage: node scripts/export_og_meta.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const loadVars = (file, names) =>
  new Function(read(file) + `\n;return {${names.join(',')}};`)();

const { OCEAN_MASTER_PERSONAS: MASTER } =
  loadVars('ocean-personas.js', ['OCEAN_MASTER_PERSONAS']);
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

const i18nWin = {};
new Function(
  'window',
  read('i18n_en.js') + '\n' + read('i18n_es.js')
)(i18nWin);
const ES = i18nWin.ES;
if (!ES || !ES.master) throw new Error('i18n_es.js에서 window.ES를 읽지 못했습니다.');

const types = MASTER.map((m) => {
  const code = m.code;
  const es = ES.master[code] || {};
  const enMaster = (i18nWin.EN && i18nWin.EN.master && i18nWin.EN.master[code]) || [];
  return {
    code,
    digits: code.split('').map((d) => d === '1'),
    emoji: EMOJI[code] || '✨',
    pair: AI_REC[code] || 'ChatGPT',
    nameKo: m.name,
    nameEn: EN_NAME[code] || code,
    nameEs: es.name || EN_NAME[code] || code,
    summaryKo: m.summary || '',
    summaryEn: enMaster[0] || '',
    summaryEs: es.summary || '',
  };
});

if (types.length !== 32) throw new Error('Expected 32 types, got ' + types.length);
process.stdout.write(JSON.stringify({ types }, null, 2) + '\n');
