#!/usr/bin/env python3
"""Renderiza os slides do motor de templates (slides.json) em PNG/JPG reais 1080x1350.

Lê o modelo de slides produzido pelo motor (fundo, formas e textos com
geometria em px) e desenha-o com PIL/DejaVu. É a mesma geometria que o
drawSlideToCanvas do Editor desenha no browser; a renderização no canvas do
browser NÃO foi executada aqui (sem browser nesta sessão).

Uso: python3 scripts/render-carousel-pil.py [pasta-da-demo]
Entrada: <pasta>/slides.json (+ cover-variants.json)
Saída:   <pasta>/exports/slide-N.png|jpg, cover-*.png
Sem argumento, usa .proof/fase1-motor/demo-ofensiva (compatibilidade).
"""
import json
import os
import sys
import textwrap
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEMO = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, ".proof", "fase1-motor", "demo-ofensiva")
OUT = os.path.join(DEMO, "exports")
os.makedirs(OUT, exist_ok=True)

BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"


def font(path, size):
    return ImageFont.truetype(path, max(8, int(size)))


def wrap(draw, text, fnt, max_width):
    words, lines, cur = text.split(), [], ""
    for w in words:
        trial = f"{cur} {w}".strip()
        if draw.textlength(trial, font=fnt) <= max_width:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines or [""]


def render_slide(slide, path_base):
    bg = slide["background"]["value"]
    img = Image.new("RGB", (1080, 1350), bg)
    draw = ImageDraw.Draw(img)
    for el in sorted(slide["elements"], key=lambda e: e.get("zIndex", 0)):
        x, y, w, h = el["x"], el["y"], el["width"], el["height"]
        if el["type"] == "shape":
            draw.rectangle([x, y, x + w, y + h], fill=el.get("color", "#000000"))
        elif el["type"] == "text":
            weight = el.get("fontWeight", 400)
            fnt = font(BOLD if int(weight) >= 700 else REG, el.get("fontSize", 32))
            lh = int(el.get("fontSize", 32) * (el.get("lineHeight", 1.2)))
            content = el["content"].upper() if el.get("isUppercase") else el["content"]
            lines = []
            for raw in content.split("\n"):
                lines.extend(wrap(draw, raw, fnt, w))
            align = el.get("textAlign", "left")
            for i, line in enumerate(lines):
                ly = y + i * lh
                if ly > y + h:
                    break
                if align == "center":
                    lx = x + (w - draw.textlength(line, font=fnt)) / 2
                elif align == "right":
                    lx = x + w - draw.textlength(line, font=fnt)
                else:
                    lx = x
                draw.text((lx, ly), line, font=fnt, fill=el.get("color", "#FFFFFF"))
    img.save(f"{path_base}.png")
    img.save(f"{path_base}.jpg", quality=92)
    return img.size


def main():
    with open(os.path.join(DEMO, "slides.json")) as f:
        doc = json.load(f)
    assert doc["canvasFormat"]["width"] == 1080 and doc["canvasFormat"]["height"] == 1350
    rendered = []
    for i, slide in enumerate(doc["slides"], start=1):
        size = render_slide(slide, os.path.join(OUT, f"slide-{i}"))
        assert size == (1080, 1350), f"slide-{i} ficou {size}"
        rendered.append(f"slide-{i}.png/jpg 1080x1350")
    with open(os.path.join(DEMO, "cover-variants.json")) as f:
        variants = json.load(f)
    for v in variants:
        size = render_slide(v["slide"], os.path.join(OUT, f"cover-{v['variant']}"))
        assert size == (1080, 1350)
        rendered.append(f"cover-{v['variant']}.png/jpg 1080x1350")
    print("renderizados:")
    for r in rendered:
        print(" -", r)


if __name__ == "__main__":
    main()
