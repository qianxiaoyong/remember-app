#!/usr/bin/env python3
import json
import os
import re

import pymupdf

ROOT = os.path.join(os.path.dirname(__file__), '..', '..', '..')
PDF = os.path.join(ROOT, 'imports', '40篇短文记完小学1000核心词汇文章.pdf')
JSON = os.path.join(
    ROOT, 'tools/pack-builder/source/primary-1000-stories/cards.json'
)


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


def extract_glossary_lines(page) -> list[dict]:
    rows: list[dict] = []
    text = page.get_text()
    for line in text.splitlines():
        match = re.match(r'^([A-Za-z]+)\s*\[([^\]]+)\]', line.strip())
        if not match:
            continue
        word = match.group(1).lower()
        rows.append({'word': word, 'line': line.strip()[:120]})
    return rows


doc = pymupdf.open(PDF)
with open(JSON, encoding='utf-8') as handle:
    cards = {item['content']['lesson']['code']: item for item in json.load(handle)}

report = []
for code, pages in [('C1', [0, 1]), ('C2', [2, 3]), ('C3', [4, 5])]:
    pdf_colors: dict[str, str] = {}
    glossary: list[dict] = []
    for page_index in pages:
        pdf_colors.update(page_colored_words(doc[page_index]))
        glossary.extend(extract_glossary_lines(doc[page_index]))

    sidebar = {
        entry['vocabId']: entry for entry in cards[code]['content']['sidebar']
    }

    tier_mismatch = [
        {
            'vocabId': vocab_id,
            'jsonTier': sidebar[vocab_id]['tier'],
            'pdfColorTier': pdf_colors[vocab_id],
        }
        for vocab_id in sidebar
        if vocab_id in pdf_colors and sidebar[vocab_id]['tier'] != pdf_colors[vocab_id]
    ]

    report.append(
        {
            'code': code,
            'pdfGlossaryWords': [row['word'] for row in glossary],
            'jsonSidebarWords': sorted(sidebar),
            'glossaryMissingInJson': [
                row['word'] for row in glossary if row['word'] not in sidebar
            ],
            'jsonExtraVsGlossary': [
                vocab_id
                for vocab_id in sidebar
                if vocab_id not in {row['word'] for row in glossary}
            ],
            'tierMismatchVsPdfColor': tier_mismatch,
            'pdfColorSamples': sorted(pdf_colors.items())[:40],
        }
    )

out_path = os.path.join(ROOT, 'tools/pack-builder/tmp-pdf-compare.json')
with open(out_path, 'w', encoding='utf-8') as handle:
    json.dump(report, handle, ensure_ascii=False, indent=2)

print(out_path)
