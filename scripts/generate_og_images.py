#!/usr/bin/env python3
"""Generate 1200x630 Open Graph images for every OCEAN type and language.

Reads type metadata via scripts/export_og_meta.js and writes:
  og/types/<code>.png      Korean
  og/types/<code>.en.png   English
  og/types/<code>.es.png   Spanish

Usage (from the repo root):
  python3 scripts/generate_og_images.py
"""
from __future__ import annotations

import io
import json
import subprocess
import sys
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "og" / "types"
CACHE_DIR = Path("/tmp/twemoji-svg")
TWEMOJI = "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/{code}.svg"

FONT_BLACK = "/usr/share/fonts/truetype/sand-box/google/Gothic A1/GothicA1-Black.ttf"
FONT_EXTRABOLD = "/usr/share/fonts/truetype/sand-box/google/Gothic A1/GothicA1-ExtraBold.ttf"
FONT_BOLD = "/usr/share/fonts/truetype/sand-box/google/Gothic A1/GothicA1-Bold.ttf"
FONT_MED = "/usr/share/fonts/truetype/sand-box/google/Gothic A1/GothicA1-Medium.ttf"
FONT_REG = "/usr/share/fonts/truetype/sand-box/google/Gothic A1/GothicA1-Regular.ttf"

W, H = 1200, 630
NAVY = (13, 17, 23)
NAVY_2 = (18, 27, 53)
BRAND = (76, 110, 245)
BRAND_DARK = (52, 81, 209)
TEXT = (26, 27, 46)
SUB = (108, 117, 125)
WHITE = (255, 255, 255)
PAGE_BG = (247, 248, 252)

DIM_KEYS = ["O", "C", "E", "A", "N"]
DIM_COLOR = {
    "O": (112, 72, 232),
    "C": (25, 113, 194),
    "E": (230, 119, 0),
    "A": (12, 166, 120),
    "N": (201, 42, 42),
}
DIM_BG = {
    "O": (243, 240, 255),
    "C": (231, 245, 255),
    "E": (255, 249, 219),
    "A": (235, 251, 238),
    "N": (255, 245, 245),
}
DIM_OFF_BG = (240, 242, 248)
DIM_OFF_FG = (160, 174, 192)

COPY = {
    "ko": {
        "eyebrow": "나의 OCEAN 성향 유형",
        "ai": "추천 AI",
        "hi": "높음",
        "lo": "낮음",
        "footer": "25문항 · 3분 · 무료 테스트    thepersonalityai.com",
        "wordmark_sub": "나만의 AI 처방전",
    },
    "en": {
        "eyebrow": "My OCEAN personality type",
        "ai": "Recommended AI",
        "hi": "High",
        "lo": "Low",
        "footer": "25 questions · 3 minutes · Free    thepersonalityai.com",
        "wordmark_sub": "Your AI prescription",
    },
    "es": {
        "eyebrow": "Mi tipo de personalidad OCEAN",
        "ai": "IA recomendada",
        "hi": "Alta",
        "lo": "Baja",
        "footer": "25 preguntas · 3 minutos · Gratis    thepersonalityai.com",
        "wordmark_sub": "Tu receta de IA",
    },
}


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


def twemoji_code(emoji: str) -> str:
    return "-".join(f"{ord(ch):x}" for ch in emoji if ord(ch) != 0xFE0F)


def load_emoji(emoji: str, size: int) -> Image.Image:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    code = twemoji_code(emoji)
    svg_path = CACHE_DIR / f"{code}.svg"
    if not svg_path.exists():
        url = TWEMOJI.format(code=code)
        try:
            with urllib.request.urlopen(url, timeout=20) as r:
                svg_path.write_bytes(r.read())
        except Exception as exc:
            print(f"warn: twemoji fetch failed for {emoji!r} ({code}): {exc}", file=sys.stderr)
            return Image.new("RGBA", (size, size), (0, 0, 0, 0))
    try:
        import cairosvg

        png = cairosvg.svg2png(url=str(svg_path), output_width=size, output_height=size)
        return Image.open(io.BytesIO(png)).convert("RGBA")
    except Exception as exc:
        print(f"warn: svg rasterize failed for {emoji!r}: {exc}", file=sys.stderr)
        return Image.new("RGBA", (size, size), (0, 0, 0, 0))


def fit_font(draw: ImageDraw.ImageDraw, text: str, path: str, max_size: int, min_size: int, max_width: int):
    for size in range(max_size, min_size - 1, -2):
        f = font(path, size)
        if draw.textlength(text, font=f) <= max_width:
            return f
    return font(path, min_size)


def wrap_text(draw: ImageDraw.ImageDraw, text: str, fnt, max_width: int, max_lines: int = 2) -> list[str]:
    if draw.textlength(text, font=fnt) <= max_width:
        return [text]
    # Prefer wrapping at spaces / middle-dot style gaps; otherwise split by character (Korean).
    words = text.split(" ") if " " in text else list(text)
    joiner = " " if " " in text else ""
    lines: list[str] = []
    current = ""
    for part in words:
        trial = part if not current else current + joiner + part
        if draw.textlength(trial, font=fnt) <= max_width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = part
    if current:
        lines.append(current)
    if len(lines) > max_lines:
        # shrink not handled here; caller should pass a smaller font
        kept = lines[: max_lines - 1]
        rest = joiner.join(lines[max_lines - 1 :])
        while rest and draw.textlength(rest + "…", font=fnt) > max_width:
            rest = rest[:-1]
        kept.append(rest + "…")
        return kept
    return lines


def dominant_key(digits: list[bool]) -> str:
    for key, on in zip(DIM_KEYS, digits):
        if on:
            return key
    return "C"


def rounded_paste(base: Image.Image, color: tuple, box: tuple, radius: int, shadow: bool = False) -> None:
    x0, y0, x1, y1 = box
    if shadow:
        shadow_img = Image.new("RGBA", base.size, (0, 0, 0, 0))
        sd = ImageDraw.Draw(shadow_img)
        sd.rounded_rectangle((x0 + 8, y0 + 12, x1 + 8, y1 + 12), radius=radius, fill=(15, 20, 40, 40))
        shadow_img = shadow_img.filter(ImageFilter.GaussianBlur(12))
        base.alpha_composite(shadow_img)
    draw = ImageDraw.Draw(base)
    draw.rounded_rectangle(box, radius=radius, fill=color)


def draw_card(meta: dict, lang: str) -> Image.Image:
    copy = COPY[lang]
    digits = meta["digits"]
    dom = dominant_key(digits)
    accent = DIM_COLOR[dom]
    accent_bg = DIM_BG[dom]
    if lang == "ko":
        primary = meta["nameKo"]
        secondary = meta["nameEn"]
    elif lang == "es":
        primary = meta["nameEs"]
        secondary = meta["nameEn"]
    else:
        primary = meta["nameEn"]
        secondary = meta["nameKo"]

    img = Image.new("RGBA", (W, H), PAGE_BG + (255,))
    draw = ImageDraw.Draw(img)

    # Soft decorative orbs in the dominant dimension color
    orb = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(orb)
    od.ellipse((820, -180, 1380, 380), fill=accent + (28,))
    od.ellipse((-200, 360, 360, 920), fill=accent + (18,))
    od.ellipse((980, 420, 1320, 760), fill=BRAND + (18,))
    img.alpha_composite(orb)

    # Main card
    card = (48, 40, 1152, 560)
    rounded_paste(img, WHITE, card, radius=36, shadow=True)
    draw = ImageDraw.Draw(img)

    # Top accent bar inside the card
    draw.rounded_rectangle((48, 40, 1152, 52), radius=8, fill=accent)
    draw.rectangle((48, 46, 1152, 52), fill=accent)

    # Wordmark
    f_word = font(FONT_BLACK, 28)
    draw.text((80, 72), "AI-OCEAN", font=f_word, fill=BRAND)
    f_sub = font(FONT_MED, 16)
    sub_x = 80 + draw.textlength("AI-OCEAN", font=f_word) + 14
    draw.text((sub_x, 82), copy["wordmark_sub"], font=f_sub, fill=SUB)

    # Type code pill
    code_label = f"OCEAN  {meta['code']}"
    f_code = font(FONT_BOLD, 16)
    tw = draw.textlength(code_label, font=f_code)
    pill = (1152 - 36 - tw - 28, 70, 1152 - 36, 108)
    draw.rounded_rectangle(pill, radius=16, fill=accent_bg)
    draw.text((pill[0] + 14, 78), code_label, font=f_code, fill=accent)

    # Emoji circle
    cx, cy, r = 210, 280, 118
    # outer ring
    draw.ellipse((cx - r - 10, cy - r - 10, cx + r + 10, cy + r + 10), outline=accent + (0,), width=0)
    ring = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    rd = ImageDraw.Draw(ring)
    rd.ellipse((cx - r - 8, cy - r - 8, cx + r + 8, cy + r + 8), outline=accent + (70,))
    rd.ellipse((cx - r, cy - r, cx + r, cy + r), fill=accent_bg)
    img.alpha_composite(ring)
    emoji_img = load_emoji(meta["emoji"], 168)
    ew, eh = emoji_img.size
    img.alpha_composite(emoji_img, (int(cx - ew / 2), int(cy - eh / 2)))

    # Eyebrow + names
    text_left = 370
    text_right = 1110
    max_w = text_right - text_left
    f_eye = font(FONT_BOLD, 18)
    draw = ImageDraw.Draw(img)
    draw.text((text_left, 150), copy["eyebrow"], font=f_eye, fill=accent)

    # Name: shrink, then wrap if still needed
    name_font = fit_font(draw, primary, FONT_BLACK, 58, 36, max_w)
    lines = wrap_text(draw, primary, name_font, max_w, 2)
    if len(lines) > 1:
        name_font = fit_font(draw, max(lines, key=len), FONT_BLACK, 50, 34, max_w)
        lines = wrap_text(draw, primary, name_font, max_w, 2)
    y = 188
    for line in lines:
        draw.text((text_left, y), line, font=name_font, fill=TEXT)
        bbox = draw.textbbox((text_left, y), line, font=name_font)
        y = bbox[3] + 2
    f_sec = font(FONT_MED, 24)
    draw.text((text_left, y + 8), secondary, font=f_sec, fill=SUB)
    y = y + 8 + 24 + 22

    # AI pairing
    f_ai_l = font(FONT_BOLD, 16)
    f_ai = font(FONT_BOLD, 22)
    draw.text((text_left, y), copy["ai"], font=f_ai_l, fill=SUB)
    label_w = draw.textlength(copy["ai"], font=f_ai_l)
    draw.text((text_left + label_w + 14, y - 4), meta["pair"], font=f_ai, fill=TEXT)

    # Dimension pills
    pill_y = 430
    gap = 12
    available = 1152 - 80 - 80
    pill_w = (available - gap * 4) / 5
    pill_h = 78
    f_letter = font(FONT_BLACK, 22)
    f_state = font(FONT_BOLD, 14)
    for i, key in enumerate(DIM_KEYS):
        on = digits[i]
        x0 = 80 + i * (pill_w + gap)
        x1 = x0 + pill_w
        bg = DIM_BG[key] if on else DIM_OFF_BG
        fg = DIM_COLOR[key] if on else DIM_OFF_FG
        draw.rounded_rectangle((x0, pill_y, x1, pill_y + pill_h), radius=16, fill=bg)
        letter = key
        state = copy["hi"] if on else copy["lo"]
        lw = draw.textlength(letter, font=f_letter)
        sw = draw.textlength(state, font=f_state)
        draw.text((x0 + (pill_w - lw) / 2, pill_y + 12), letter, font=f_letter, fill=fg)
        draw.text((x0 + (pill_w - sw) / 2, pill_y + 42), state, font=f_state, fill=fg)

    # Footer bar
    footer_box = (48, 560, 1152, 590)
    # redraw bottom of card as navy footer with matching radius at the bottom only
    footer_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    fd = ImageDraw.Draw(footer_layer)
    fd.rounded_rectangle((48, 500, 1152, 560), radius=36, fill=NAVY)
    fd.rectangle((48, 500, 1152, 530), fill=NAVY)
    img.alpha_composite(footer_layer)
    draw = ImageDraw.Draw(img)
    f_foot = font(FONT_MED, 18)
    foot = copy["footer"]
    fw = draw.textlength(foot, font=f_foot)
    draw.text(((W - fw) / 2, 516), foot, font=f_foot, fill=(220, 224, 235))

    return img.convert("RGB")


def filename(code: str, lang: str) -> Path:
    if lang == "ko":
        return OUT_DIR / f"{code}.png"
    return OUT_DIR / f"{code}.{lang}.png"


def main() -> int:
    meta_json = subprocess.check_output(["node", str(ROOT / "scripts" / "export_og_meta.js")], cwd=ROOT)
    data = json.loads(meta_json)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    n = 0
    for t in data["types"]:
        for lang in ("ko", "en", "es"):
            img = draw_card(t, lang)
            path = filename(t["code"], lang)
            img.save(path, "PNG", optimize=True)
            n += 1
            print(f"wrote {path.relative_to(ROOT)}  ({path.stat().st_size} bytes)")
    print(f"done: {n} images")
    return 0


if __name__ == "__main__":
    sys.exit(main())
