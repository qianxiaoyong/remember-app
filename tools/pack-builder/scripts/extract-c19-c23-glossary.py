#!/usr/bin/env python3
"""Extract colored glossary tiers for C19-C23 from PDF."""
import json
import os
import re

import pymupdf

ROOT = os.path.join(os.path.dirname(__file__), '..', '..', '..')
PDF = os.path.join(ROOT, 'imports', '40篇短文记完小学1000核心词汇文章.pdf')
OUT = os.path.join(ROOT, 'tools/pack-builder/tmp-c19-c23-glossary.json')

LESSONS = [
    ('C19', [37, 38]),
    ('C20', [39, 40]),
    ('C21', [41, 42]),
    ('C22', [43, 44]),
    ('C23', [45, 46, 47]),
]


def rgb_tier(color: int | None) -> str | None:
    if color is None:
        return None
    red = (color >> 16) & 255
    green = (color >> 8) & 255
    blue = color & 255
    if red > 180 and green < 100 and blue < 100:
        return 'high'
    if blue > 150 and red < 150:
        return 'mid'
    if green > 150 and red < 150 and blue < 150:
        return 'low'
    return None


def page_colored_words(page) -> dict[str, str]:
    words: dict[str, str] = {}
    for block in page.get_text('dict')['blocks']:
        if block.get('type') != 0:
            continue
        for line in block.get('lines', []):
            for span in line.get('spans', []):
                text = span.get('text', '').strip()
                tier = rgb_tier(span.get('color'))
                if tier and re.match(r'^[A-Za-z]+$', text):
                    words[text.lower()] = tier
    return words


def extract_glossary_lines(page) -> list[str]:
    rows: list[str] = []
    for line in page.get_text().splitlines():
        match = re.match(r'^([A-Za-z]+)\s*\[([^\]]+)\]', line.strip())
        if match:
            rows.append(line.strip())
    return rows


doc = pymupdf.open(PDF)
report: dict[str, list] = {}

for code, pages in LESSONS:
    colors: dict[str, str] = {}
    glossary_lines: list[str] = []
    for page_index in pages:
        page = doc[page_index]
        colors.update(page_colored_words(page))
        glossary_lines.extend(extract_glossary_lines(page))

    words: list[tuple[str, str, str]] = []
    seen: set[str] = set()
    for line in glossary_lines:
        match = re.match(r'^([A-Za-z]+)\s*\[([^\]]+)\]', line.strip())
        if not match:
            continue
        word = match.group(1).lower()
        if word in seen:
            continue
        seen.add(word)
        tier = colors.get(word, '?')
        words.append((word, tier, line))

    report[code] = words

with open(OUT, 'w', encoding='utf-8') as handle:
    json.dump({k: [[w, [t, ln]] for w, t, ln in v] for k, v in report.items()}, handle, ensure_ascii=False, indent=2)

print(OUT)
