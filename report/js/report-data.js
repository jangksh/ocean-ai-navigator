/**
 * Assemble a Korean paid-report model from a stored test result.
 * Depends on (loaded separately): OCEAN_V2_DATA, getMasterPersona.
 * No price or payment references.
 */
(function (root) {
  'use strict';

  const JOBS = [
    { id: 1,  label: '학생 (초/중/고)',    short: '학생' },
    { id: 2,  label: '대학(원)생/취준생',  short: '대학/취준' },
    { id: 3,  label: '교육/강연/코칭',     short: '교육자' },
    { id: 4,  label: '금융/회계/법률',     short: '금융·법률' },
    { id: 5,  label: '경영지원/기획/HR',   short: '경영지원' },
    { id: 6,  label: 'IT 개발/데이터/AI',  short: 'IT·개발' },
    { id: 7,  label: '제조/엔지니어링',    short: '제조·엔지니어' },
    { id: 8,  label: '물류/운송/유통',     short: '물류·유통' },
    { id: 9,  label: '영업/고객관리',      short: '영업·CS' },
    { id: 10, label: '마케팅/광고',        short: '마케팅' },
    { id: 11, label: '디자인/예술/미디어', short: '디자인·예술' },
    { id: 12, label: '보건/의료/스포츠',   short: '의료·건강' },
    { id: 13, label: '공공/행정/치안',     short: '공공·행정' },
    { id: 14, label: '1인 창업/프리랜서',  short: '창업·프리랜서' },
    { id: 15, label: '가정주부/은퇴자',    short: '가정·은퇴' }
  ];

  const DIMS = [
    { key: 'O', label: '개방성', color: '#7048E8',
      highLabel: '높음', lowLabel: '낮음',
      highInsight: '새로운 아이디어와 창의적 접근에 강합니다. 혁신적인 AI 도구 탐색에 먼저 나서는 유형입니다.',
      lowInsight: '검증된 방법과 안정성을 선호합니다. 실용적이고 검증된 AI 도구가 가장 잘 맞습니다.' },
    { key: 'C', label: '성실성', color: '#1971C2',
      highLabel: '높음', lowLabel: '낮음',
      highInsight: '체계적인 계획과 꼼꼼한 실행이 강점. 자동화·일정 관리 AI로 시스템을 완성하세요.',
      lowInsight: '유연하고 즉흥적인 스타일. 아이디어를 빠르게 구조화해주는 AI가 최고의 조력자입니다.' },
    { key: 'E', label: '외향성', color: '#E67700',
      highLabel: '높음', lowLabel: '낮음',
      highInsight: '소통과 네트워킹에서 에너지를 얻습니다. 협업·프레젠테이션 AI로 영향력을 더 넓히세요.',
      lowInsight: '깊은 집중과 독립적 작업을 즐깁니다. 혼자 완성도를 높여주는 리서치·분석 AI가 맞습니다.' },
    { key: 'A', label: '친화성', color: '#0CA678',
      highLabel: '높음', lowLabel: '낮음',
      highInsight: '공감 능력과 협력이 강점. 팀 커뮤니케이션·고객 응대 AI로 관계를 더욱 빛내세요.',
      lowInsight: '독립적이고 결과 중심적입니다. 전략·분석 AI로 날카로운 판단력을 극대화하세요.' },
    { key: 'N', label: '정서안정성', color: '#C92A2A',
      highLabel: '높음', lowLabel: '낮음',
      highInsight: '압박 속에서도 침착하게 판단합니다. 복잡한 데이터 분석·의사결정 AI와 완벽한 조합.',
      lowInsight: '감수성이 풍부하고 감정에 민감합니다. 멘탈 관리·마음챙김 AI로 에너지를 지키세요.' }
  ];

  const RESULT_STORAGE_KEY = 'ocean_result';

  const DISCLAIMER =
    '본 리포트는 의학적 진단이 아니며, 채용 선발이나 인사 평가를 위한 검사가 아닙니다. ' +
    'AI 활용을 돕기 위한 성향 참고용입니다. Big Five(OCEAN) 모델 기반이며, ' +
    'IPIP 공개 프레임워크를 참조하고 한국어 문항은 자체 제작했습니다. ' +
    '25문항으로는 하위 척도(facet)를 새로 측정하지 않으며, 이 파일은 새로운 검사가 아니라 ' +
    '결과 화면에 이미 있는 문장을 한 권으로 재구성한 저장본입니다.';

  const SOURCE_NOTE =
    '이 장에 담긴 내용은 새로운 검사가 아니라, 결과 화면에 이미 있는 문장을 한눈에 볼 수 있게 재구성한 것입니다.';

  function scoresToCode(scores) {
    return (scores.O >= 50 ? '1' : '0') +
           (scores.C >= 50 ? '1' : '0') +
           (scores.E >= 50 ? '1' : '0') +
           (scores.A >= 50 ? '1' : '0') +
           (scores.N >= 50 ? '1' : '0');
  }

  function defaultScoresForCode(code) {
    if (!/^[01]{5}$/.test(code)) return null;
    const keys = ['O', 'C', 'E', 'A', 'N'];
    const scores = {};
    keys.forEach((k, i) => { scores[k] = code[i] === '1' ? 72 : 28; });
    return scores;
  }

  function normalizeScores(raw) {
    if (!raw) return null;
    const keys = ['O', 'C', 'E', 'A', 'N'];
    const scores = {};
    for (const k of keys) {
      const n = Number(raw[k]);
      if (!Number.isFinite(n) || n < 0 || n > 100) return null;
      scores[k] = Math.round(n);
    }
    return scores;
  }

  function findJob(jobId) {
    const id = parseInt(jobId, 10);
    return JOBS.find((j) => j.id === id) || null;
  }

  function masterPersona(code) {
    try {
      if (typeof getMasterPersona === 'function') {
        const m = getMasterPersona(code);
        if (m) return m;
      }
    } catch (e) {}
    const list = (typeof OCEAN_MASTER_PERSONAS !== 'undefined') ? OCEAN_MASTER_PERSONAS : (root.OCEAN_MASTER_PERSONAS || []);
    return list.find((p) => p.code === code) || { code: code, name: '나만의 특별한 유형', summary: '세상에 하나뿐인 독창적인 성향의 소유자' };
  }

  function v2Record(jobId, code) {
    const key = String(jobId).padStart(2, '0') + '_' + code;
    const data = (typeof OCEAN_V2_DATA !== 'undefined') ? OCEAN_V2_DATA : (root.OCEAN_V2_DATA || {});
    return data[key] || null;
  }

  function cleanText(s) {
    return String(s || '')
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+\n/g, '\n')
      .trim();
  }

  // Site quiz JOBS IDs 6 and 14 lacked matching v2 copy until PR #24.
  // Auto-disable the generic fallback as soon as all 32 real records exist
  // in OCEAN_V2_DATA (and are not the archived 건설·채굴 / 설치·정비 copy).
  const JOB_IDS_WITHOUT_JOB_COPY = [6, 14];

  function hasCompleteJobCopy(jobId) {
    const id = parseInt(jobId, 10);
    if (!(id >= 1 && id <= 15)) return false;
    const jg = String(id).padStart(2, '0');
    const prefix = jg + '_';
    const data = (typeof OCEAN_V2_DATA !== 'undefined') ? OCEAN_V2_DATA : (root.OCEAN_V2_DATA || {});
    let count = 0;
    for (const k in data) {
      if (Object.prototype.hasOwnProperty.call(data, k) && k.indexOf(prefix) === 0 && /^[01]{5}$/.test(k.slice(3))) {
        count++;
      }
    }
    if (count < 32) return false;
    const personas = (typeof OCEAN_JOB_PERSONAS !== 'undefined') ? OCEAN_JOB_PERSONAS : root.OCEAN_JOB_PERSONAS;
    if (Array.isArray(personas) && personas.length > 0) {
      const pCount = personas.filter(function (p) { return p && p.jobGroup === jg; }).length;
      if (pCount < 32) return false;
    }
    const sample = data[prefix + '11111'];
    if (!sample || /건설|토목|지반|채굴|안전모|설치·정비|기계계/.test(sample.insight_v2 || '')) return false;
    return true;
  }

  function usesGenericTypeCopy(jobId) {
    const id = parseInt(jobId, 10);
    if (JOB_IDS_WITHOUT_JOB_COPY.indexOf(id) === -1) return false;
    return !hasCompleteJobCopy(id);
  }

  function neuroticismPct(scores) {
    return Math.max(0, Math.min(100, 100 - scores.N));
  }

  function splitSentences(text) {
    return String(text || '').split(/(?<=다\.|요\.|까\?|죠\.|니다\.|니까\.)\s+|(?<=[.!?])\s+/).filter(function (s) { return s && s.trim(); });
  }

  function contradictsN(clause, scores) {
    const s = String(clause || '');
    if (!s) return false;
    const highNeuro = /높(?:은|아|고)?\s*신경(?:성|증)|신경(?:성|증)이\s*높|신경(?:성|증)이\s*높아/.test(s);
    const lowNeuro = /낮(?:은|아|고)?\s*신경(?:성|증)|신경(?:성|증)이\s*낮/.test(s);
    const highStab = /높(?:은|아|고)?\s*정서(?:적\s*)?안정|정서(?:적\s*)?안정성이\s*높|감정(?:적)?\s*기복이\s*적(?:어|고|다)?|흔들리지\s*않는\s*안정/.test(s);
    const lowStab = /낮(?:은|아|고)?\s*정서(?:적\s*)?안정|정서(?:적\s*)?안정성이\s*낮/.test(s);
    if (scores.N >= 50) return highNeuro || lowStab;
    return lowNeuro || highStab;
  }

  function dropContradictoryN(text, scores) {
    const sentences = splitSentences(text);
    const kept = [];
    sentences.forEach(function (sentence) {
      if (!/신경(?:성|증)|정서(?:적\s*)?안정/.test(sentence)) {
        kept.push(sentence);
        return;
      }
      if (!contradictsN(sentence, scores)) {
        kept.push(sentence);
        return;
      }
      const parts = sentence.split(/(?<=고,)\s+|(?<=이며,)\s+|(?<=지만,)\s+|(?<=고)\s+(?=신경)|(?<=고)\s+(?=정서)/);
      const ok = parts.filter(function (p) { return p.trim() && !contradictsN(p, scores); });
      if (!ok.length) return;
      let joined = ok.join(' ').replace(/[,\s]+$/g, '');
      joined = joined.replace(/하고$/,'합니다').replace(/이며$/,'입니다');
      if (joined && !/[.!?]$/.test(joined)) joined += '.';
      kept.push(joined);
    });
    return kept.join(' ').replace(/\s{2,}/g, ' ').trim();
  }

  function replaceOneNumber(chunk, fromNum, toNum) {
    return chunk.replace(String(fromNum) + '%', String(toNum) + '%').replace(String(fromNum) + ' %', String(toNum) + '%');
  }

  function replaceV2Percents(text, scores) {
    if (!text) return text;
    const neuro = neuroticismPct(scores);
    const dimVal = {
      '개방성': scores.O,
      '성실성': scores.C,
      '외향성': scores.E,
      '친화성': scores.A,
      '정서안정성': scores.N,
      '정서 안정성': scores.N,
      '정서적 안정성': scores.N
    };
    const letterVal = { O: scores.O, C: scores.C, E: scores.E, A: scores.A, N: scores.N };

    // 신경성/신경증 percentages are neuroticism = 100 - stability.
    text = text.replace(/신경(?:성|증)(?:이\s*)?(?:높(?:아|은)|낮(?:아|은))?\s*\(?\s*(?:N\s*[=:]?\s*)?(\d{1,3})\s*%\s*\)?/g, function (m, num) {
      return replaceOneNumber(m, num, neuro);
    });

    text = text.replace(/정서(?:적\s*)?안정성(?:이\s*)?(?:높(?:아|은)|낮(?:아|은))?\s*\(?\s*(?:N\s*[=:]?\s*)?(\d{1,3})\s*%\s*\)?/g, function (m, num) {
      return replaceOneNumber(m, num, scores.N);
    });

    text = text.replace(/(개방성|성실성|외향성|친화성)(?:이\s*)?(?:높(?:아|은)|낮(?:아|은))?(?:\s*\(\s*[OCEA]\s*[=:]?\s*|\s*\(\s*|\s+)(\d{1,3})\s*%/g, function (m, label, num) {
      return replaceOneNumber(m, num, dimVal[label]);
    });

    // O(개방성98%) / C(성실성95%)
    text = text.replace(/([OCEA])\((개방성|성실성|외향성|친화성)(\d{1,3})\s*%\)/g, function (m, letter, label, num) {
      return letter + '(' + label + dimVal[label] + '%)';
    });

    // (C:96%) C=96% (C 20%) (C20%) C:96%  — N uses stability unless 신경 is nearby
    text = text.replace(/(\()?\b([OCEAN])\s*[=:]?\s*(\d{1,3})\s*%(\))?/g, function (m, open, letter, num, close, offset, src) {
      const start = Math.max(0, offset - 18);
      const window = src.slice(start, offset + m.length);
      let val = letterVal[letter];
      if (letter === 'N' && /신경(?:성|증)/.test(window) && !/안정/.test(window)) val = neuro;
      return replaceOneNumber(m, num, val);
    });

    return text;
  }

  function sanitizeV2Text(text, scores) {
    const cleaned = cleanText(text);
    if (!cleaned) return '';
    const filtered = dropContradictoryN(cleaned, scores);
    return replaceV2Percents(filtered, scores);
  }

  function sanitizeList(items, scores) {
    return (items || []).map(function (s) { return sanitizeV2Text(s, scores); }).filter(Boolean);
  }

  function genericInsight(job, master) {
    const name = master && master.name ? master.name : '이 유형';
    const summary = master && master.summary ? master.summary : '';
    return job.label + ' 분야에서 활동하시는 \'' + name + '\' 유형입니다.' + (summary ? ' ' + summary : '');
  }


  function formatKoDate(d) {
    const dt = (d instanceof Date) ? d : new Date(d);
    if (isNaN(dt.getTime())) return '';
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      year: 'numeric', month: 'numeric', day: 'numeric'
    }).formatToParts(dt);
    const get = (t) => parts.find((p) => p.type === t).value;
    return get('year') + '년 ' + get('month') + '월 ' + get('day') + '일';
  }

  function readStoredResult() {
    try {
      if (typeof localStorage === 'undefined') return null;
      const s = JSON.parse(localStorage.getItem(RESULT_STORAGE_KEY) || '');
      if (!s || !s.scores) return null;
      const scores = normalizeScores(s.scores);
      if (!scores) return null;
      const code = scoresToCode(scores);
      if (!/^[01]{5}$/.test(code)) return null;
      let job = s.job;
      if (job != null) {
        job = parseInt(job, 10);
        if (!(job >= 1 && job <= 15)) return null;
      }
      return { scores: scores, job: job, code: code, ts: s.ts || null };
    } catch (e) {
      return null;
    }
  }

  function resultHashCode(hash) {
    const m = /^#r=([01]{5})\b/.exec(hash || (typeof location !== 'undefined' ? location.hash : '') || '');
    return m ? m[1] : null;
  }

  function buildModel(input) {
    const job = findJob(input.job);
    if (!job) throw new Error('직업군을 선택해 주세요. (1–15)');
    let scores = normalizeScores(input.scores);
    if (!scores && input.code) scores = defaultScoresForCode(input.code);
    if (!scores) throw new Error('점수가 없거나 올바르지 않습니다.');
    const code = scoresToCode(scores);
    if (input.code && input.code !== code) {
      // Trust explicit scores; code is derived.
    }
    const master = masterPersona(code);
    const usedJobCopy = !usesGenericTypeCopy(job.id);
    const v2 = usedJobCopy ? v2Record(job.id, code) : null;
    const tools = (v2 && Array.isArray(v2.ai_tools) ? v2.ai_tools : []).map((t) => ({
      type: t.type || '',
      name: cleanText(t.name),
      tagline: sanitizeV2Text(t.tagline, scores),
      daily_guide: sanitizeV2Text(t.daily_guide, scores),
      morning_tip: sanitizeV2Text(t.morning_tip, scores),
      power_use: sanitizeV2Text(t.power_use, scores),
      prompt_example: sanitizeV2Text(t.prompt_example, scores)
    }));
    const strengths = sanitizeList((v2 && v2.strengths) || [], scores);
    const growthPoints = sanitizeList((v2 && v2.growth_points) || [], scores);
    const insightText = v2
      ? sanitizeV2Text(v2.insight_v2, scores)
      : genericInsight(job, master);
    const colleagueNotes = insightText
      ? insightText.split(/(?<=다\.)\s+/).map((s) => s.trim()).filter(Boolean).slice(0, 2)
      : [];
    const dimensions = DIMS.map((dim) => {
      const pct = scores[dim.key];
      const high = pct >= 50;
      return {
        key: dim.key,
        label: dim.label,
        color: dim.color,
        pct: pct,
        high: high,
        levelLabel: high ? dim.highLabel : dim.lowLabel,
        insight: high ? dim.highInsight : dim.lowInsight
      };
    });
    const testDate = input.ts ? new Date(input.ts) : (input.testDate ? new Date(input.testDate) : new Date());
    return {
      code: code,
      scores: scores,
      job: job,
      typeName: master.name || '나만의 특별한 유형',
      typeSummary: master.summary || '',
      testDate: testDate,
      testDateLabel: formatKoDate(testDate),
      insight: insightText,
      strengths: strengths,
      growthPoints: growthPoints,
      colleagueNotes: colleagueNotes,
      dimensions: dimensions,
      tools: tools,
      synergy: sanitizeV2Text(v2 && v2.synergy_strategy, scores),
      dailyRoutine: sanitizeV2Text(v2 && v2.daily_routine, scores),
      prompts: tools.filter((t) => t.prompt_example).map((t) => ({ name: t.name, text: t.prompt_example })),
      disclaimer: DISCLAIMER,
      sourceNote: SOURCE_NOTE,
      hasV2: !!v2,
      usedJobCopy: usedJobCopy
    };
  }

  function suggestedFilename(model) {
    const job = String(model.job.id).padStart(2, '0');
    const safeName = String(model.typeName || '').replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, ' ').trim();
    return 'AI-OCEAN_' + model.code + '_' + job + (safeName ? '_' + safeName : '') + '.pdf';
  }

  root.ReportData = {
    JOBS: JOBS,
    DIMS: DIMS,
    RESULT_STORAGE_KEY: RESULT_STORAGE_KEY,
    scoresToCode: scoresToCode,
    defaultScoresForCode: defaultScoresForCode,
    normalizeScores: normalizeScores,
    findJob: findJob,
    masterPersona: masterPersona,
    v2Record: v2Record,
    formatKoDate: formatKoDate,
    readStoredResult: readStoredResult,
    resultHashCode: resultHashCode,
    buildModel: buildModel,
    suggestedFilename: suggestedFilename,
    JOB_IDS_WITHOUT_JOB_COPY: JOB_IDS_WITHOUT_JOB_COPY,
    usesGenericTypeCopy: usesGenericTypeCopy,
    sanitizeV2Text: sanitizeV2Text,
    neuroticismPct: neuroticismPct
  };
})(typeof window !== 'undefined' ? window : globalThis);
