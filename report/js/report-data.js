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
    const v2 = v2Record(job.id, code);
    const tools = (v2 && Array.isArray(v2.ai_tools) ? v2.ai_tools : []).map((t) => ({
      type: t.type || '',
      name: cleanText(t.name),
      tagline: cleanText(t.tagline),
      daily_guide: cleanText(t.daily_guide),
      morning_tip: cleanText(t.morning_tip),
      power_use: cleanText(t.power_use),
      prompt_example: cleanText(t.prompt_example)
    }));
    const strengths = ((v2 && v2.strengths) || []).map(cleanText).filter(Boolean);
    const growthPoints = ((v2 && v2.growth_points) || []).map(cleanText).filter(Boolean);
    const insightText = cleanText(v2 && v2.insight_v2);
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
      synergy: cleanText(v2 && v2.synergy_strategy),
      dailyRoutine: cleanText(v2 && v2.daily_routine),
      prompts: tools.filter((t) => t.prompt_example).map((t) => ({ name: t.name, text: t.prompt_example })),
      disclaimer: DISCLAIMER,
      sourceNote: SOURCE_NOTE,
      hasV2: !!v2
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
    suggestedFilename: suggestedFilename
  };
})(typeof window !== 'undefined' ? window : globalThis);
