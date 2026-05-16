#!/usr/bin/env python3
"""Merge v2_gen_*.json temp files into v2_data.js"""
import sys, re, json
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')
BASE = Path("C:/Users/jangk/OneDrive/Desktop/Big5 OCEAN")

v2_file = BASE / "v2_data.js"
txt = v2_file.read_text(encoding='utf-8')
m = re.search(r'const OCEAN_V2_DATA\s*=\s*(\{.*\});', txt, re.DOTALL)
existing = json.loads(m.group(1)) if m else {}
print(f"Existing entries: {len(existing)}")

merged = dict(existing)
gen_files = sorted(BASE.glob("v2_gen_*.json"))
print(f"Found {len(gen_files)} temp files: {[f.name for f in gen_files]}")

for f in gen_files:
    try:
        data = json.loads(f.read_text(encoding='utf-8'))
        before = len(merged)
        merged.update(data)
        print(f"  {f.name}: +{len(merged)-before} entries (total {len(merged)})")
    except Exception as e:
        print(f"  ERROR reading {f.name}: {e}")

js = "// OCEAN v2 enriched persona data — auto-generated\n"
js += "const OCEAN_V2_DATA = " + json.dumps(merged, ensure_ascii=False, indent=2) + ";\n"
v2_file.write_text(js, encoding='utf-8')
print(f"\nDone. v2_data.js now has {len(merged)} entries.")
