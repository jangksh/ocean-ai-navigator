/**
 * Client-side Korean PDF generator for the AI-OCEAN personal report.
 * Requires jsPDF (window.jspdf.jsPDF) and Noto Sans KR subset fonts.
 * No price or payment references.
 */
(function (root) {
  'use strict';

  const PAGE_W = 210;
  const PAGE_H = 297;
  const ML = 18;
  const MR = 18;
  const MT = 20;
  const MB = 18;
  const CONTENT_W = PAGE_W - ML - MR;
  const HEADER_H = 10;
  const FOOTER_Y = PAGE_H - 10;
  const NAVY = '#1A1B2E';
  const MUTED = '#5C6370';
  const LINE = '#E6E8EE';
  const RULE = '#D0D4DD';
  const ACCENT = '#4C6EF5';
  const PAPER = '#F7F8FC';
  const FONT = 'NotoSansKR';

  function getJsPDF() {
    if (root.jspdf && typeof root.jspdf.jsPDF === 'function') return root.jspdf.jsPDF;
    if (typeof root.jsPDF === 'function') return root.jsPDF;
    throw new Error('jsPDF가 로드되지 않았습니다.');
  }

  function arrayBufferToBase64(buf) {
    if (typeof Buffer !== 'undefined' && typeof Buffer.from === 'function') {
      return Buffer.from(buf).toString('base64');
    }
    const bytes = (buf instanceof Uint8Array) ? buf : new Uint8Array(buf);
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    return btoa(binary);
  }

  async function loadFonts(baseUrl) {
    const base = (baseUrl || '/report/fonts').replace(/\/$/, '');
    const [regular, bold] = await Promise.all([
      fetch(base + '/NotoSansKR-Regular.subset.ttf').then((r) => {
        if (!r.ok) throw new Error('글꼴을 불러오지 못했습니다. (' + r.status + ')');
        return r.arrayBuffer();
      }),
      fetch(base + '/NotoSansKR-Bold.subset.ttf').then((r) => {
        if (!r.ok) throw new Error('굵은 글꼴을 불러오지 못했습니다. (' + r.status + ')');
        return r.arrayBuffer();
      })
    ]);
    return { regular: regular, bold: bold };
  }

  function registerFonts(doc, fonts) {
    doc.addFileToVFS('NotoSansKR-Regular.ttf', arrayBufferToBase64(fonts.regular));
    doc.addFileToVFS('NotoSansKR-Bold.ttf', arrayBufferToBase64(fonts.bold));
    doc.addFont('NotoSansKR-Regular.ttf', FONT, 'normal');
    doc.addFont('NotoSansKR-Bold.ttf', FONT, 'bold');
  }

  function setFont(doc, style, size) {
    doc.setFont(FONT, style || 'normal');
    if (size) doc.setFontSize(size);
  }

  function setColor(doc, hex, kind) {
    const h = hex.replace('#', '');
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    if (kind === 'fill') doc.setFillColor(r, g, b);
    else if (kind === 'draw') doc.setDrawColor(r, g, b);
    else doc.setTextColor(r, g, b);
  }

  function hexToRgb(hex) {
    const h = hex.replace('#', '');
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16)
    };
  }

  function paragraphs(text) {
    return String(text || '').replace(/\r\n/g, '\n').split(/\n+/).map((s) => s.trim()).filter(Boolean);
  }

  function lineH(fontSize, factor) {
    return fontSize * 0.3528 * (factor || 1.62);
  }
  function fontSizeOffset(fontSize) {
    return fontSize * 0.28;
  }

  function createFlow(doc, model) {
    let y = MT;
    let onCover = true;
    let sectionNo = 0;
    function nextNum() {
      sectionNo += 1;
      return String(sectionNo).padStart(2, '0');
    }

    function contentTop() {
      return onCover ? MT : (MT + HEADER_H);
    }

    function contentBottom() {
      return PAGE_H - MB;
    }

    function newPage() {
      doc.addPage();
      onCover = false;
      y = contentTop();
    }

    function ensure(h) {
      if (y + h > contentBottom()) newPage();
    }

    function gap(mm) {
      y += mm;
      if (y > contentBottom() - 2) newPage();
    }

    function usedHeight() {
      return y - contentTop();
    }

    function maybeNewPage(minUsed) {
      if (onCover) { newPage(); return; }
      if (usedHeight() >= (minUsed || 88)) newPage();
    }

    function subhead(label, color) {
      gap(3.5);
      ensure(10);
      setFont(doc, 'bold', 10.5);
      setColor(doc, color || ACCENT);
      doc.text(label, ML, y);
      y += 6.2;
    }

    function measureParas(text, fontSize, width, leading) {
      return paragraphs(text).reduce((h, p, i, arr) => {
        const pack = textLines(p, fontSize, 'normal', NAVY, width, leading);
        return h + pack.height + (i < arr.length - 1 ? 2.2 : 0);
      }, 0);
    }

    function ensureBlock(h) {
      const room = contentBottom() - y;
      const pageRoom = contentBottom() - contentTop();
      if (h > room && Math.min(h, 52) < pageRoom * 0.9) newPage();
    }

    function rule() {
      ensure(4);
      setColor(doc, LINE, 'draw');
      doc.setLineWidth(0.25);
      doc.line(ML, y, PAGE_W - MR, y);
      y += 4;
    }

    function textLines(text, fontSize, style, color, width, leading) {
      setFont(doc, style || 'normal', fontSize);
      const lines = doc.splitTextToSize(String(text || ''), width || CONTENT_W);
      const lh = lineH(fontSize, leading || 1.55);
      return { lines: lines, lh: lh, height: lines.length * lh };
    }

    function writeLines(text, fontSize, style, color, width, leading, indent) {
      const x = ML + (indent || 0);
      const maxW = (width || CONTENT_W) - (indent || 0);
      const packed = textLines(text, fontSize, style, color, maxW, leading);
      packed.lines.forEach((ln) => {
        ensure(packed.lh);
        setFont(doc, style || 'normal', fontSize);
        setColor(doc, color || NAVY);
        doc.text(ln, x, y + fontSize * 0.28);
        y += packed.lh;
      });
      return packed.lines.length;
    }

    function writeParas(text, fontSize, style, color, paraGap) {
      const paras = paragraphs(text);
      paras.forEach((p, i) => {
        writeLines(p, fontSize, style, color);
        if (i < paras.length - 1) gap(paraGap == null ? 2.2 : paraGap);
      });
    }

    function sectionKicker(num, title) {
      if (!onCover && usedHeight() > 6) gap(7);
      const block = 14;
      ensure(block);
      setFont(doc, 'bold', 8);
      setColor(doc, ACCENT);
      doc.text(num, ML, y + 2.4);
      y += 5.2;
      setFont(doc, 'bold', 14);
      setColor(doc, NAVY);
      doc.text(title, ML, y + 2.6);
      y += 7;
      setColor(doc, ACCENT, 'draw');
      doc.setLineWidth(0.7);
      doc.line(ML, y, ML + 18, y);
      y += 6;
    }

    function bulletList(items, fontSize, color, bulletColor) {
      const mark = '·  ';
      setFont(doc, 'normal', fontSize);
      const markW = doc.getTextWidth(mark);
      (items || []).forEach((item, idx) => {
        const packed = textLines(item, fontSize, 'normal', color, CONTENT_W - markW, 1.5);
        ensure(packed.height + 1);
        setFont(doc, 'bold', fontSize + 1);
        setColor(doc, bulletColor || ACCENT);
        doc.text('·', ML, y + fontSize * 0.28);
        packed.lines.forEach((ln, i) => {
          if (i > 0) ensure(packed.lh);
          setFont(doc, 'normal', fontSize);
          setColor(doc, color || NAVY);
          doc.text(ln, ML + markW, y + fontSize * 0.28);
          y += packed.lh;
        });
        y += 2.1;
      });
    }

    function bar(x, yBar, w, h, pct, color) {
      setColor(doc, '#EEF0F5', 'fill');
      doc.roundedRect(x, yBar, w, h, h / 2, h / 2, 'F');
      const fw = Math.max(0, Math.min(w, w * (pct / 100)));
      if (fw > 0.8) {
        setColor(doc, color, 'fill');
        doc.roundedRect(x, yBar, fw, h, h / 2, h / 2, 'F');
      }
    }

    function drawRadar(cx, cy, r, scores) {
      const keys = ['O', 'C', 'E', 'A', 'N'];
      const labels = ['개방성', '성실성', '외향성', '친화성', '정서안정성'];
      const colors = ['#7048E8', '#1971C2', '#E67700', '#0CA678', '#C92A2A'];
      const n = 5;
      const angle = (i) => (-Math.PI / 2) + (i * 2 * Math.PI / n);
      const pt = (i, rad) => [cx + Math.cos(angle(i)) * rad, cy + Math.sin(angle(i)) * rad];

      [0.25, 0.5, 0.75, 1].forEach((f) => {
        doc.setLineWidth(0.2);
        setColor(doc, '#DDE1EA', 'draw');
        doc.setFillColor(247, 248, 252);
        const pts = keys.map((_, i) => pt(i, r * f));
        pts.forEach((p, i) => {
          const q = pts[(i + 1) % n];
          if (i === 0) {
            // polygon stroke
          }
          doc.line(p[0], p[1], q[0], q[1]);
        });
      });
      keys.forEach((_, i) => {
        const p = pt(i, r);
        setColor(doc, '#DDE1EA', 'draw');
        doc.setLineWidth(0.2);
        doc.line(cx, cy, p[0], p[1]);
      });

      const data = keys.map((k, i) => pt(i, r * (scores[k] / 100)));
      // filled polygon via triangles from center
      const rgb = hexToRgb(ACCENT);
      doc.setFillColor(rgb.r, rgb.g, rgb.b);
      // jsPDF doesn't have globalAlpha on all builds consistently; use light fill by mixing
      doc.setFillColor(200, 210, 250);
      for (let i = 0; i < n; i++) {
        const a = data[i];
        const b = data[(i + 1) % n];
        doc.triangle(cx, cy, a[0], a[1], b[0], b[1], 'F');
      }
      doc.setDrawColor(76, 110, 245);
      doc.setLineWidth(0.6);
      for (let i = 0; i < n; i++) {
        const a = data[i];
        const b = data[(i + 1) % n];
        doc.line(a[0], a[1], b[0], b[1]);
      }
      data.forEach((p, i) => {
        const c = hexToRgb(colors[i]);
        doc.setFillColor(c.r, c.g, c.b);
        doc.circle(p[0], p[1], 1.15, 'F');
      });
      setFont(doc, 'bold', 7);
      keys.forEach((_, i) => {
        const p = pt(i, r + 6.2);
        setColor(doc, colors[i]);
        doc.text(labels[i], p[0], p[1] + 0.8, { align: 'center' });
      });
    }

    function drawCover() {
      // Dark top band
      setColor(doc, NAVY, 'fill');
      doc.rect(0, 0, PAGE_W, 42, 'F');
      setColor(doc, ACCENT, 'fill');
      doc.rect(0, 42, PAGE_W, 1.4, 'F');

      setFont(doc, 'bold', 11);
      setColor(doc, '#FFFFFF');
      doc.text('AI-OCEAN', ML, 16);
      setFont(doc, 'normal', 8);
      setColor(doc, '#C5CAE0');
      doc.text('thepersonalityai.com', PAGE_W - MR, 16, { align: 'right' });
      setFont(doc, 'bold', 18);
      setColor(doc, '#FFFFFF');
      doc.text('개인 성향 리포트', ML, 32);

      y = 56;
      setFont(doc, 'normal', 9);
      setColor(doc, ACCENT);
      doc.text('유형', ML, y);
      y += 9;
      setFont(doc, 'bold', 24);
      setColor(doc, NAVY);
      const nameLines = doc.splitTextToSize(model.typeName, CONTENT_W);
      nameLines.forEach((ln) => {
        doc.text(ln, ML, y);
        y += 10;
      });

      y += 1;
      // Code chips
      const dimKeys = ['O', 'C', 'E', 'A', 'N'];
      const dimColors = ['#7048E8', '#1971C2', '#E67700', '#0CA678', '#C92A2A'];
      let cx = ML;
      dimKeys.forEach((k, i) => {
        const high = model.code[i] === '1';
        const label = k + (high ? ' ▲' : ' ▽');
        setFont(doc, 'bold', 8);
        const tw = doc.getTextWidth(label) + 6;
        const rgb = hexToRgb(dimColors[i]);
        if (high) {
          doc.setFillColor(rgb.r, rgb.g, rgb.b);
          doc.roundedRect(cx, y - 4.2, tw, 7, 1.4, 1.4, 'F');
          setColor(doc, '#FFFFFF');
        } else {
          doc.setFillColor(241, 243, 245);
          doc.roundedRect(cx, y - 4.2, tw, 7, 1.4, 1.4, 'F');
          setColor(doc, MUTED);
        }
        doc.text(label, cx + 3, y + 0.6);
        cx += tw + 2.5;
      });
      setFont(doc, 'normal', 9);
      setColor(doc, MUTED);
      doc.text(model.code, cx + 2, y + 0.6);

      y += 14;
      setFont(doc, 'normal', 9);
      setColor(doc, MUTED);
      doc.text('직업군', ML, y);
      doc.text('검사일', ML + 95, y);
      y += 6;
      setFont(doc, 'bold', 12);
      setColor(doc, NAVY);
      doc.text(model.job.label, ML, y);
      doc.text(model.testDateLabel || '', ML + 95, y);

      y += 10;
      if (model.typeSummary) {
        setFont(doc, 'normal', 10);
        setColor(doc, MUTED);
        const sum = doc.splitTextToSize(model.typeSummary, CONTENT_W);
        sum.forEach((ln) => {
          doc.text(ln, ML, y);
          y += 5.4;
        });
      }

      y += 6;
      // Radar + bars
      const radarCx = ML + 38;
      const radarCy = y + 38;
      drawRadar(radarCx, radarCy, 28, model.scores);

      const barX = ML + 84;
      const barW = CONTENT_W - 84;
      let by = y + 8;
      model.dimensions.forEach((dim) => {
        setFont(doc, 'bold', 8.5);
        setColor(doc, dim.color);
        doc.text(dim.label, barX, by);
        setFont(doc, 'bold', 9);
        doc.text(String(dim.pct) + '%', barX + barW, by, { align: 'right' });
        bar(barX, by + 2, barW, 3.4, dim.pct, dim.color);
        by += 13;
      });

      y = Math.max(radarCy + 40, by + 4);
      setFont(doc, 'normal', 8.5);
      const note = '이 리포트는 당신의 검사 결과를 한 파일로 정리한 저장본입니다. 의학 진단이나 채용 선발 목적이 아닙니다. 점수는 브라우저에 저장된 결과(또는 미리보기에서 선택한 결과)를 바탕으로 하며, 본문의 해석은 사이트에 수록된 기존 문장입니다.';
      const noteLines = doc.splitTextToSize(note, CONTENT_W - 10);
      const boxH = noteLines.length * 4.8 + 12;
      const boxY = Math.max(y, PAGE_H - 20 - boxH);
      setColor(doc, PAPER, 'fill');
      doc.roundedRect(ML, boxY, CONTENT_W, boxH, 2.5, 2.5, 'F');
      setColor(doc, MUTED);
      let ny = boxY + 8;
      noteLines.forEach((ln) => {
        doc.text(ln, ML + 5, ny);
        ny += 4.8;
      });

    }

    function stampPages() {
      const total = doc.getNumberOfPages();
      for (let i = 1; i <= total; i++) {
        doc.setPage(i);
        if (i > 1) {
          setColor(doc, '#FFFFFF', 'fill');
          doc.rect(0, 0, PAGE_W, 16, 'F');
          setFont(doc, 'bold', 8);
          setColor(doc, NAVY);
          doc.text('AI-OCEAN  개인 성향 리포트', ML, 10);
          setFont(doc, 'normal', 8);
          setColor(doc, MUTED);
          let right = model.typeName + '  ·  ' + model.job.short;
          setFont(doc, 'normal', 8);
          if (doc.getTextWidth(right) > 90) right = model.typeName;
          doc.text(right, PAGE_W - MR, 10, { align: 'right' });
          setColor(doc, ACCENT, 'draw');
          doc.setLineWidth(0.4);
          doc.line(ML, 12.5, PAGE_W - MR, 12.5);
        }
        setColor(doc, '#FFFFFF', 'fill');
        doc.rect(0, PAGE_H - 16, PAGE_W, 16, 'F');
        setColor(doc, RULE, 'draw');
        doc.setLineWidth(0.25);
        doc.line(ML, PAGE_H - 14, PAGE_W - MR, PAGE_H - 14);
        setFont(doc, 'normal', 8);
        setColor(doc, MUTED);
        doc.text(i === 1 ? 'AI-OCEAN  ·  개인 성향 리포트' : 'thepersonalityai.com', ML, FOOTER_Y);
        doc.text(String(i) + ' / ' + total, PAGE_W - MR, FOOTER_Y, { align: 'right' });
      }
    }

    // ---- pages ----
    drawCover();
    newPage();

    // 2. One-page summary
    sectionKicker(nextNum(), '한눈에 보는 요약');
    writeLines(model.sourceNote, 9, 'normal', MUTED, CONTENT_W, 1.5);
    gap(5);

    subhead('한 줄 소개', ACCENT);
    const oneLiner = model.typeName + ' · ' + model.job.label +
      (model.typeSummary ? ' — ' + model.typeSummary : '');
    writeLines(oneLiner, 11, 'bold', NAVY, CONTENT_W, 1.5);
    gap(3);

    if (model.strengths.length) {
      subhead('핵심 강점', '#0CA678');
      bulletList(model.strengths, 10, NAVY, '#0CA678');
    }
    if (model.growthPoints.length) {
      subhead('보완 포인트', '#E67700');
      bulletList(model.growthPoints, 10, NAVY, '#E67700');
    }
    if (model.colleagueNotes.length) {
      subhead('함께 일할 때 참고할 점', ACCENT);
      writeLines('직군 맞춤 인사이트의 앞부분을, 함께 일하는 사람이 먼저 볼 수 있게 모아 둔 것입니다.', 9, 'normal', MUTED, CONTENT_W, 1.5);
      gap(2.5);
      bulletList(model.colleagueNotes, 10, NAVY, ACCENT);
    }

    // 3. Dimension scores
    newPage();
    sectionKicker(nextNum(), 'OCEAN 점수 해석');
    writeLines('다섯 차원의 점수(%)와, 50점을 기준으로 한 높음/낮음 해석입니다. 해석 문장은 결과 화면과 같습니다.', 9, 'normal', MUTED, CONTENT_W, 1.5);
    gap(6);

    model.dimensions.forEach((dim, idx) => {
      const insightH = textLines(dim.insight, 10, 'normal', NAVY, CONTENT_W, 1.5).height;
      ensure(18 + insightH);
      // dim header row
      setColor(doc, dim.color, 'fill');
      doc.roundedRect(ML, y - 1, 7, 7, 1.2, 1.2, 'F');
      setFont(doc, 'bold', 8);
      setColor(doc, '#FFFFFF');
      doc.text(dim.key, ML + 3.5, y + 3.8, { align: 'center' });

      setFont(doc, 'bold', 12);
      setColor(doc, NAVY);
      const dimTitle = dim.key === 'N' ? dim.label + '  (Emotional Stability)' : dim.label;
      doc.text(dimTitle, ML + 10, y + 4.2);
      setFont(doc, 'bold', 9);
      setColor(doc, dim.color);
      doc.text(dim.levelLabel + '  ·  ' + dim.pct + '%', PAGE_W - MR, y + 4.2, { align: 'right' });
      y += 9;
      bar(ML, y, CONTENT_W, 3.6, dim.pct, dim.color);
      y += 8;
      writeLines(dim.insight, 10, 'normal', NAVY, CONTENT_W, 1.5);
      if (idx < model.dimensions.length - 1) gap(6);
    });

    // 4. Job-specific insight
    newPage();
    sectionKicker(nextNum(), '직군 맞춤 인사이트');
    if (model.usedJobCopy) {
      writeLines(model.job.label + ' 분야를 기준으로 정리한 해석입니다. 결과 화면의 성향 공감 리포트 전문입니다.', 9, 'normal', MUTED, CONTENT_W, 1.5);
    } else {
      writeLines('이 직업군은 직군 맞춤 문장이 사이트 선택지와 아직 맞지 않아, 유형 일반 해석으로 수록했습니다. 점수와 다섯 차원 해석은 검사 결과 그대로입니다.', 9, 'normal', MUTED, CONTENT_W, 1.5);
    }
    gap(6);
    if (model.insight) {
      const paras = paragraphs(model.insight);
      const bodyH = paras.reduce((h, p, i, arr) => {
        return h + textLines(p, 11.5, 'normal', NAVY, CONTENT_W - 14, 1.7).height + (i < arr.length - 1 ? 3.5 : 0);
      }, 0);
      const boxH = bodyH + 16;
      ensure(boxH);
      setColor(doc, PAPER, 'fill');
      doc.roundedRect(ML, y - 4, CONTENT_W, boxH, 3, 3, 'F');
      setColor(doc, ACCENT, 'fill');
      doc.rect(ML, y - 4, 1.6, boxH, 'F');
      y += 6;
      paras.forEach((p, i) => {
        writeLines(p, 11.5, 'normal', NAVY, CONTENT_W - 14, 1.7, 8);
        if (i < paras.length - 1) gap(3.5);
      });
      y += 8;
    } else {
      writeLines('이 유형과 직업군 조합에 대한 직군 맞춤 문장이 아직 없습니다.', 10, 'normal', MUTED);
    }

    // 5. Full trait / AI survival strategy
    if (model.tools.length) {
    newPage();
    sectionKicker(nextNum(), 'AI 맞춤형 생존 전략');
    writeLines('추천 도구별 일상 활용 가이드, 아침 루틴, 이 성향을 위한 파워 활용을 모두 수록했습니다. 결과 화면에서는 일부만 먼저 보여 주는 내용을 여기서는 펼쳐 둡니다.', 9, 'normal', MUTED, CONTENT_W, 1.5);
    gap(6);

    model.tools.forEach((tool, idx) => {
      const isMain = tool.type === '메인' || /^main/i.test(tool.type);
      const badge = isMain ? 'MAIN' : (tool.type || '전문 AI');
      ensure(22);
      // tool header bar
      setColor(doc, isMain ? '#EEF0FF' : PAPER, 'fill');
      doc.roundedRect(ML, y - 2, CONTENT_W, 14, 2, 2, 'F');
      setFont(doc, 'bold', 7.5);
      setColor(doc, isMain ? ACCENT : MUTED);
      doc.text(badge, ML + 4, y + 5);
      const badgeW = doc.getTextWidth(badge) + 8;
      setFont(doc, 'bold', 12);
      setColor(doc, NAVY);
      doc.text(tool.name || 'AI 도구', ML + badgeW + 2, y + 5.4);
      y += 14;
      if (tool.tagline) {
        writeLines(tool.tagline, 9, 'normal', MUTED);
        gap(2);
      }
      function writeToolBlock(title, text) {
        const h = 8 + measureParas(text, 10, CONTENT_W, 1.62);
        ensureBlock(h);
        setFont(doc, 'bold', 9);
        setColor(doc, ACCENT);
        ensure(8);
        doc.text(title, ML, y);
        y += 5.2;
        writeParas(text, 10, 'normal', NAVY, 2);
        gap(3.2);
      }
      if (tool.daily_guide) writeToolBlock('일상 활용 가이드', tool.daily_guide);
      if (tool.morning_tip) writeToolBlock('아침 루틴 활용법', tool.morning_tip);
      if (tool.power_use) writeToolBlock('이 성향을 위한 파워 활용', tool.power_use);
      if (idx < model.tools.length - 1) {
        gap(2);
        rule();
        gap(2);
      }
    });
    }

    // 6. Synergy
    if (model.synergy) {
    maybeNewPage(90);
    sectionKicker(nextNum(), 'AI × 성향 시너지 전략');
      writeParas(model.synergy, 10.5, 'normal', NAVY, 3);
    }

    // 7. Daily routine
    if (model.dailyRoutine) {
    newPage();
    sectionKicker(nextNum(), 'AI와 함께하는 나의 하루');
      const chunks = model.dailyRoutine.split(/(?<=^|[.\s])(?=(?:오전|오후|점심)?\s*\d{1,2}:\d{2}(?!\d))|(?<=^|[.\s])(?=(?:오전|오후)\s*\d{1,2}시)/).map((x) => x.trim()).filter(Boolean);
      if (chunks.length >= 3) {
        chunks.forEach((item) => {
          ensureBlock(14);
          const m = item.match(/^((?:오전|오후|점심)?\s*\d{1,2}(?::\d{2}|시(?:\s*\d{1,2}분)?))\s*(.*)$/);
          const time = m && m[1] ? m[1].trim() : '';
          const rest = (m && m[2] ? m[2] : item).replace(/^[·\-–]\s*/, '').replace(/[.]\s*$/, '').trim();
          if (time) {
            const col = 22;
            setFont(doc, 'bold', 10);
            setColor(doc, ACCENT);
            doc.text(time, ML, y + fontSizeOffset(10));
            writeLines(rest, 10.5, 'normal', NAVY, CONTENT_W - col, 1.55, col);
            gap(3.2);
          } else {
            writeLines(item, 10.5, 'normal', NAVY);
            gap(2.5);
          }
        });
      } else {
        writeParas(model.dailyRoutine, 10.5, 'normal', NAVY, 3);
      }
    }

    // 8. Prompts appendix
    if (model.prompts.length) {
    newPage();
    sectionKicker(nextNum(), '프롬프트 모음 부록');
    writeLines('결과 화면에 흩어져 있던 추천 프롬프트를 한곳에 모았습니다. 도구에 그대로 붙여 넣어 활용해 보세요.', 9, 'normal', MUTED, CONTENT_W, 1.5);
    gap(6);
    model.prompts.forEach((p, idx) => {
      ensure(20);
      setFont(doc, 'bold', 11);
      setColor(doc, NAVY);
      doc.text(p.name, ML, y);
      y += 6;
      // quote box
      const packed = textLines(p.text, 9.5, 'normal', NAVY, CONTENT_W - 10, 1.5);
      const boxH = packed.height + 8;
      ensure(boxH);
      setColor(doc, PAPER, 'fill');
      doc.roundedRect(ML, y - 3, CONTENT_W, boxH, 2, 2, 'F');
      setColor(doc, ACCENT, 'fill');
      doc.rect(ML, y - 3, 1.2, boxH, 'F');
      const boxTop = y;
      packed.lines.forEach((ln) => {
        setFont(doc, 'normal', 9.5);
        setColor(doc, NAVY);
        doc.text(ln, ML + 6, y + 2.6);
        y += packed.lh;
      });
      y = boxTop + boxH + 4;
      if (idx < model.prompts.length - 1) gap(3);
    });
    }

    // 9. Disclaimer
    maybeNewPage(140);
    sectionKicker(nextNum(), '면책 안내');
    writeParas(model.disclaimer, 9.5, 'normal', MUTED, 2.5);
    gap(6);
    writeLines('문의  oceanainavigator@gmail.com', 9, 'normal', MUTED);

    stampPages();
    return doc;
  }

  async function generate(model, options) {
    const fonts = options && options.fonts;
    if (!fonts || !fonts.regular || !fonts.bold) {
      throw new Error('Noto Sans KR 글꼴이 필요합니다.');
    }
    const JsPDF = getJsPDF();
    const doc = new JsPDF({ unit: 'mm', format: 'a4', compress: true });
    registerFonts(doc, fonts);
    setFont(doc, 'normal', 10);
    createFlow(doc, model);
    return doc;
  }

  function docToBlob(doc) {
    return doc.output('blob');
  }

  function docToArrayBuffer(doc) {
    return doc.output('arraybuffer');
  }

  function download(doc, filename) {
    const name = filename || 'AI-OCEAN-report.pdf';
    if (typeof doc.save === 'function') {
      doc.save(name);
      return;
    }
    const blob = docToBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  root.ReportPDF = {
    generate: generate,
    download: download,
    loadFonts: loadFonts,
    docToBlob: docToBlob,
    docToArrayBuffer: docToArrayBuffer,
    arrayBufferToBase64: arrayBufferToBase64
  };
})(typeof window !== 'undefined' ? window : globalThis);
