#!/usr/bin/env python3
"""
직업군 32종 페르소나 v2 Generator
- Reads ocean-personas.js (444 job personas, structured)
- Reads AI tools Excel for job-specific tools
- Calls Claude API (haiku) in batches of 6 to enrich content
- Outputs rich markdown: 직업군 32종 페르소나 v2.md
"""
import sys, re, json, time, os
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

BASE = Path("C:/Users/jangk/OneDrive/Desktop/Big5 OCEAN")
ENV_PATH = Path("C:/Users/jangk/OneDrive/Desktop/ocean_ai_navigator_new/.env")
OUTPUT = BASE / "직업군 32종 페르소나 v2.md"
PROGRESS_FILE = BASE / "v2_progress.json"
V2_DATA_FILE = BASE / "v2_data.js"

# ── Load .env ──────────────────────────────────────────
def load_env():
    env = {}
    if ENV_PATH.exists():
        for line in ENV_PATH.read_text(encoding='utf-8').splitlines():
            if '=' in line and not line.startswith('#'):
                k, v = line.split('=', 1)
                env[k.strip()] = v.strip()
    return env

# ── Parse ocean-personas.js → list of persona dicts ───
def parse_ocean_personas_js():
    js = (BASE / "ocean-personas.js").read_text(encoding='utf-8')
    # Extract the OCEAN_JOB_PERSONAS array
    m = re.search(r'const OCEAN_JOB_PERSONAS\s*=\s*(\[.*?\]);', js, re.DOTALL)
    if not m:
        raise ValueError("OCEAN_JOB_PERSONAS not found in ocean-personas.js")
    return json.loads(m.group(1))

# ── Parse AI Tools Excel ───────────────────────────────
def parse_excel_tools():
    import openpyxl
    wb = openpyxl.load_workbook(str(BASE / "AI tools.xlsx"))
    ws = wb.active
    job_tools = {}
    current_job = None
    for row in ws.iter_rows(values_only=True):
        if not any(c is not None for c in row):
            continue
        first = row[0]
        if isinstance(first, str) and re.match(r'\d+\.\s+', first.strip()):
            current_job = first.strip()
            job_tools[current_job] = []
        elif isinstance(first, int) and current_job:
            tools = []
            for cell in row[1:5]:
                if cell and isinstance(cell, str):
                    # Extract tool name (before '–' or ':')
                    name = re.split(r'[–:\-]', str(cell))[0].strip()
                    if name and len(name) < 60:
                        tools.append(name)
            job_tools[current_job].extend(tools)
    return job_tools

# ── Group personas by job group ────────────────────────
def group_by_job(personas):
    groups = {}
    for p in personas:
        jg = p['jobGroup']
        if jg not in groups:
            groups[jg] = {'id': jg, 'name': p['jobGroupName'], 'personas': []}
        groups[jg]['personas'].append(p)
    return groups

# ── Map job group id → excel tools ────────────────────
JOB_GROUP_TO_EXCEL = {
    '01': '1. 학생 (초/중/고)',
    '02': '2. 대학(원)생/취준생',
    '03': '3. 교육/강연/코칭',
    '04': '4. 금융/회계/법률',
    '05': '5. 경영지원 (기획/인사/총무)',
    '06': '7. 제조/엔지니어링',       # 건설/채굴 — 제조 tools가 가장 근접
    '07': '7. 제조/엔지니어링',
    '08': '8. 물류/운송/유통',
    '09': '9. 영업/고객관리',
    '10': '10. 마케팅/광고',
    '11': '11. 디자인/예술/미디어',
    '12': '12. 보건/의료/스포츠',
    '13': '13. 공공/행정/치안',
    '14': '7. 제조/엔지니어링',       # 설치/정비/수리 — 제조 tools
    '15': '15. 가정주부/은퇴자',
}

# ── Call Claude API for a batch of personas ───────────
def enrich_batch(client, batch, job_name, excel_tools_list):
    tools_str = '\n'.join(f"- {t}" for t in excel_tools_list[:10]) if excel_tools_list else "없음"

    batch_desc = []
    for p in batch:
        specialist_names = ' / '.join(ai['name'] for ai in p.get('specialistAIs', []))
        batch_desc.append(
            f"코드:{p['code']} | 제목:\"{p['title']}\" | 성향:{p['traits']}\n"
            f"기존해석:{p['insight']}\n"
            f"메인AI:{p['mainAI']['name']} - {p['mainAI']['reason']}\n"
            f"전문AI:{specialist_names}\n"
        )

    batch_text = "\n---\n".join(batch_desc)

    prompt = f"""당신은 한국의 AI 활용 커리어 전문 컨설턴트입니다. 최고 수준의 성격 유형 설명을 작성합니다 (16personalities.com 수준).

직업군: {job_name}
이 직업군에서 활용 가능한 AI 도구:
{tools_str}

아래 {len(batch)}개 성향 유형에 대해 v2 콘텐츠를 JSON 배열로 생성해주세요.

{batch_text}

각 항목 형식 (JSON 배열, 한국어):
[
  {{
    "code": "XXXXX",
    "insight_v2": "300자 이상. 기존 해석을 바탕으로 더 풍부하게. 직업 현장의 생생한 에피소드로 시작. 이 성향이 {job_name} 분야에서 만드는 구체적 강점과 어려움, 동료들이 보는 이 사람의 모습까지. 따뜻하고 유머러스한 톤, 당신이라는 2인칭으로.",
    "strengths": ["직업 현장에서 이 성향의 핵심 강점 1 (50자 이상)", "핵심 강점 2 (50자 이상)", "핵심 강점 3 (50자 이상)"],
    "growth_points": ["보완할 점 1 (50자 이상)", "보완할 점 2 (50자 이상)"],
    "ai_tools": [
      {{
        "type": "메인",
        "name": "메인AI이름",
        "tagline": "30자 이내 핵심 한 줄",
        "daily_guide": "250자 이상. 이 성향의 사람이 {job_name} 업무에서 이 AI를 어떻게 매일 쓰는지 구체적 시나리오. 실제 프롬프트 예시 1개 포함('예: ...' 형식). 어떤 상황에서 쓰면 가장 효과적인지, 어떤 결과를 기대할 수 있는지까지.",
        "morning_tip": "아침 업무 루틴에서 이 AI 활용법 (100자 이상)",
        "power_use": "이 성향에게 특히 강력한 활용법 (120자 이상)",
        "prompt_example": "실제 쓸 수 있는 프롬프트 예시 1개 (한국어, 실용적으로)"
      }},
      {{
        "type": "전문1",
        "name": "전문AI1이름",
        "tagline": "30자 이내",
        "daily_guide": "200자 이상 구체적 활용 시나리오 + 프롬프트 예시",
        "morning_tip": "100자 이상",
        "power_use": "120자 이상",
        "prompt_example": "실용적 프롬프트 예시"
      }},
      {{
        "type": "전문2",
        "name": "전문AI2이름",
        "tagline": "30자 이내",
        "daily_guide": "200자 이상",
        "morning_tip": "100자 이상",
        "power_use": "120자 이상",
        "prompt_example": "실용적 프롬프트 예시"
      }}
    ],
    "synergy_strategy": "200자 이상. 이 OCEAN 성향 코드가 {job_name} 분야 + AI 도구 조합으로 만드는 독보적 경쟁력. 구체적인 성과나 결과물 예시 포함.",
    "daily_routine": "350자 이상. AI 도구를 활용한 실제 하루 루틴. 오전 출근(또는 시작)/오전 업무/점심 전후/오후 핵심 업무/퇴근 후 단계로 각 AI 도구 활용을 자연스럽게 녹여서 서술. 스토리 형식으로."
  }}
]

JSON만 출력. 다른 텍스트 없이."""

    resp = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=8000,
        messages=[{"role": "user", "content": prompt}]
    )
    raw = resp.content[0].text.strip()
    # Strip markdown code fences
    raw = re.sub(r'^```(?:json)?\s*', '', raw)
    raw = re.sub(r'\s*```\s*$', '', raw).strip()
    # Fix invalid JSON escape: \' → '  (model sometimes escapes Korean apostrophes)
    raw = raw.replace("\\'", "’")  # replace \' with right single quotation mark

    # Find JSON array boundaries reliably
    start = raw.find('[')
    if start == -1:
        raise ValueError(f"No JSON array found: {raw[:200]}")

    # Walk forward to find matching bracket (handle truncated responses)
    depth = 0
    end = -1
    in_str = False
    esc = False
    for i, ch in enumerate(raw[start:], start):
        if esc:
            esc = False
            continue
        if ch == '\\' and in_str:
            esc = True
            continue
        if ch == '"':
            in_str = not in_str
            continue
        if in_str:
            continue
        if ch == '[' or ch == '{':
            depth += 1
        elif ch == ']' or ch == '}':
            depth -= 1
            if depth == 0:
                end = i + 1
                break

    if end == -1:
        # JSON was truncated — repair it
        json_str = raw[start:]
        json_str = json_str.rstrip()

        # Step 1: detect if we're inside an unterminated string
        in_str = False
        esc = False
        for ch in json_str:
            if esc:
                esc = False
                continue
            if ch == '\\' and in_str:
                esc = True
                continue
            if ch == '"':
                in_str = not in_str
        if in_str:
            # Close the unterminated string
            json_str += '"'

        # Step 2: strip trailing commas / partial key-value pairs
        json_str = re.sub(r',\s*$', '', json_str)
        json_str = re.sub(r',\s*"[^"]*"\s*:\s*$', '', json_str)  # trailing key:
        json_str = re.sub(r',\s*"[^"]*"\s*$', '', json_str)       # trailing key

        # Step 3: count bracket depth and close open structures
        depth_stack = []
        in_str2 = False
        esc2 = False
        for ch in json_str:
            if esc2:
                esc2 = False
                continue
            if ch == '\\' and in_str2:
                esc2 = True
                continue
            if ch == '"':
                in_str2 = not in_str2
                continue
            if in_str2:
                continue
            if ch == '[':
                depth_stack.append(']')
            elif ch == '{':
                depth_stack.append('}')
            elif ch in ']}' and depth_stack:
                depth_stack.pop()

        # Close open structures in reverse order
        for closer in reversed(depth_stack):
            json_str += closer
    else:
        json_str = raw[start:end]

    # Clean up invalid escapes
    json_str = re.sub(r"\\(?![\"\\bfnrtu/\n])", "", json_str)

    try:
        return json.loads(json_str)
    except json.JSONDecodeError as e:
        # Last resort: extract any valid objects
        objects = re.findall(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', json_str, re.DOTALL)
        if objects:
            try:
                return [json.loads(o) for o in objects]
            except Exception:
                pass
        raise ValueError(f"JSON parse failed: {e} | Sample: {json_str[:300]}")

# ── Render a persona entry to markdown ────────────────
def render_persona_md(persona_data, orig, job_id, seq):
    code = persona_data.get('code', orig['code'])
    title = orig['title']
    traits = orig['traits']

    lines = []
    lines.append(f"### {job_id}-{str(seq).zfill(2)}. \"{title}\"")
    lines.append(f"**OCEAN 코드**: `{code}` &nbsp;|&nbsp; **성향 수치**: {traits}\n")

    # Insight
    lines.append("#### 💡 성향 공감 리포트")
    lines.append(persona_data.get('insight_v2', orig['insight']))
    lines.append("")

    # Strengths
    strengths = persona_data.get('strengths', [])
    if strengths:
        lines.append("#### ✅ 핵심 강점")
        for s in strengths:
            lines.append(f"- {s}")
        lines.append("")

    # Growth points
    growth = persona_data.get('growth_points', [])
    if growth:
        lines.append("#### 🔧 보완 포인트")
        for g in growth:
            lines.append(f"- {g}")
        lines.append("")

    # AI Tools
    lines.append("#### 🤖 AI 맞춤형 생존 전략 상세")

    for tool in persona_data.get('ai_tools', []):
        t_type = tool.get('type', '')
        icon = "🌟" if t_type == "메인" else "⚡"
        tag = "MAIN ENGINE" if t_type == "메인" else "전문 AI"
        lines.append(f"\n##### {icon} {tag}: **{tool.get('name', '')}**")
        tagline = tool.get('tagline', '')
        if tagline:
            lines.append(f"> *{tagline}*")
        lines.append("")

        lines.append("**📱 일상 활용 가이드**")
        lines.append(tool.get('daily_guide', ''))
        lines.append("")

        lines.append("**☀️ 아침 루틴 활용법**")
        lines.append(tool.get('morning_tip', ''))
        lines.append("")

        lines.append("**⚡ 이 성향을 위한 파워 활용법**")
        lines.append(tool.get('power_use', ''))
        lines.append("")

        prompt_ex = tool.get('prompt_example', '')
        if prompt_ex:
            lines.append("**💬 추천 프롬프트 예시**")
            lines.append(f"```\n{prompt_ex}\n```")
            lines.append("")

    # Synergy strategy
    lines.append("#### 🏆 AI × 성향 시너지 전략")
    lines.append(persona_data.get('synergy_strategy', ''))
    lines.append("")

    # Daily routine
    lines.append("#### 📅 AI와 함께하는 나의 하루")
    lines.append(persona_data.get('daily_routine', ''))
    lines.append("")
    lines.append("---")
    lines.append("")

    return "\n".join(lines)

# ── Load / Save progress ───────────────────────────────
def load_progress():
    if PROGRESS_FILE.exists():
        return json.loads(PROGRESS_FILE.read_text(encoding='utf-8'))
    return {}

def save_progress(progress):
    PROGRESS_FILE.write_text(json.dumps(progress, ensure_ascii=False, indent=2), encoding='utf-8')

# ── Load / Save v2 JS data file ────────────────────────
def load_v2_data():
    if V2_DATA_FILE.exists():
        txt = V2_DATA_FILE.read_text(encoding='utf-8')
        m = re.search(r'const OCEAN_V2_DATA\s*=\s*(\{.*\});', txt, re.DOTALL)
        if m:
            try:
                return json.loads(m.group(1))
            except Exception:
                pass
    return {}

def save_v2_data(data):
    js = "// OCEAN v2 enriched persona data — auto-generated\n"
    js += "const OCEAN_V2_DATA = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n"
    V2_DATA_FILE.write_text(js, encoding='utf-8')

# ── MAIN ───────────────────────────────────────────────
def main():
    env = load_env()
    api_key = env.get('ANTHROPIC_API_KEY', '')
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY not found in .env")

    import anthropic
    client = anthropic.Anthropic(api_key=api_key)

    print("Reading ocean-personas.js...")
    all_personas = parse_ocean_personas_js()
    print(f"  Total personas: {len(all_personas)}")

    print("Reading Excel tools...")
    excel_tools = parse_excel_tools()
    print(f"  Job groups with tools: {len(excel_tools)}")

    job_groups = group_by_job(all_personas)
    print(f"  Job groups: {len(job_groups)}")

    progress = load_progress()
    v2_data = load_v2_data()
    if not V2_DATA_FILE.exists():
        save_v2_data({})

    # Open output file (append mode — resume friendly)
    is_new_file = not OUTPUT.exists() or (not progress and not v2_data)
    mode = 'w' if is_new_file else 'a'

    with open(OUTPUT, mode, encoding='utf-8') as out:
        if is_new_file:
            out.write("# 직업군 32종 페르소나 v2\n")
            out.write("**AI-OCEAN 맞춤형 생존 전략 완전 가이드** — 16personalities 수준의 개인화 AI 커리어 코치\n\n")
            out.write("> 이 문서는 Big5 OCEAN 성격 심리학 기반으로, 15개 직업군 × 32가지 성향 유형에 맞춘 AI 도구 활용 심층 가이드입니다.\n")
            out.write("> 각 페르소나는 성향 공감 리포트, AI 도구별 일상 활용법, 실제 프롬프트 예시, 하루 루틴 시나리오를 포함합니다.\n\n")
            out.write("---\n\n")

        batch_size = 1
        total_batches = sum((len(g['personas']) + batch_size - 1) // batch_size for g in job_groups.values())
        done_batches = sum(len(v) for v in progress.values())

        print(f"\nTotal batches needed: {total_batches} | Already done: {done_batches}")
        print("Starting generation...\n")

        for jg_id, job_group in sorted(job_groups.items()):
            job_name = job_group['name']
            excel_key = JOB_GROUP_TO_EXCEL.get(jg_id, '')
            tools_list = excel_tools.get(excel_key, [])

            personas = job_group['personas']
            jg_progress = progress.get(jg_id, [])

            # Check if all personas in this group already exist in v2_data
            all_done = all((f"{jg_id}_{p['code']}" in v2_data) for p in personas)
            if all_done:
                print(f"  Skip job {jg_id} — all {len(personas)} already in v2_data")
                continue

            # Write job group header if starting fresh for this group
            if not jg_progress:
                out.write(f"## 직업군 {jg_id}: {job_name}\n\n")
                out.flush()

            # Process in batches
            for batch_start in range(0, len(personas), batch_size):
                batch_key = f"{jg_id}_{batch_start}"
                if batch_key in jg_progress:
                    print(f"  Skip {jg_id} batch {batch_start} (already done)")
                    continue

                batch = personas[batch_start:batch_start + batch_size]

                # Skip if already in v2_data (progress file may have been deleted)
                if all((f"{jg_id}_{p['code']}" in v2_data) for p in batch):
                    print(f"  Skip {jg_id} batch {batch_start} (already in v2_data)")
                    continue
                print(f"  [{jg_id}] {job_name} — batch {batch_start//batch_size + 1} ({len(batch)} personas)...", end=' ', flush=True)

                try:
                    enriched = enrich_batch(client, batch, job_name, tools_list)

                    for i, orig in enumerate(batch):
                        seq = batch_start + i + 1
                        # Find matching enriched entry by code
                        enriched_entry = next(
                            (e for e in enriched if e.get('code') == orig['code']),
                            enriched[i] if i < len(enriched) else {}
                        )
                        md = render_persona_md(enriched_entry, orig, jg_id, seq)
                        out.write(md)
                        # Save to v2_data.js for website integration
                        v2_key = f"{jg_id}_{orig['code']}"
                        v2_data[v2_key] = {
                            k: enriched_entry.get(k) for k in
                            ['insight_v2', 'strengths', 'growth_points', 'ai_tools',
                             'synergy_strategy', 'daily_routine']
                        }

                    out.flush()
                    save_v2_data(v2_data)

                    # Save progress
                    if jg_id not in progress:
                        progress[jg_id] = []
                    progress[jg_id].append(batch_key)
                    save_progress(progress)

                    print(f"✓")
                    time.sleep(1.5)  # Rate limit buffer

                except Exception as e:
                    print(f"ERROR: {e}")
                    # Write original content as fallback
                    for i, orig in enumerate(batch):
                        seq = batch_start + i + 1
                        out.write(f"### {jg_id}-{str(seq).zfill(2)}. \"{orig['title']}\"\n")
                        out.write(f"**OCEAN 코드**: `{orig['code']}` | **성향**: {orig['traits']}\n\n")
                        out.write(f"#### 💡 성향 공감 리포트\n{orig['insight']}\n\n")
                        out.write(f"#### 🤖 AI 맞춤형 생존 전략\n\n")
                        out.write(f"##### 🌟 MAIN ENGINE: **{orig['mainAI']['name']}**\n")
                        out.write(f"{orig['mainAI']['reason']}\n\n")
                        for ai in orig.get('specialistAIs', []):
                            out.write(f"##### ⚡ 전문 AI: **{ai['name']}**\n{ai['reason']}\n\n")
                        out.write("---\n\n")
                    out.flush()
                    time.sleep(3)

        out.write("\n---\n\n")
        out.write(f"*AI-OCEAN 직업군 32종 페르소나 v2 — 총 {len(all_personas)}개 성향 유형 완성*\n")
        out.write("*Big5 OCEAN 기반 AI 커리어 코치 | 무단 전재 및 재배포 금지*\n")

    # Clean up progress file
    if PROGRESS_FILE.exists():
        PROGRESS_FILE.unlink()

    file_size = OUTPUT.stat().st_size / 1024
    print(f"\n✅ 완료! 파일 저장: {OUTPUT}")
    print(f"   파일 크기: {file_size:.1f} KB")

if __name__ == "__main__":
    main()
