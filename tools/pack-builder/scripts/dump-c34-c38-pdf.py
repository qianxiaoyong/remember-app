#!/usr/bin/env python3
"""Dump PDF story pages for C34-C38 to assist canonical transcription."""
import os
import re

import pymupdf

ROOT = os.path.join(os.path.dirname(__file__), '..', '..', '..')
PDF = os.path.join(ROOT, 'imports', '40篇短文记完小学1000核心词汇文章.pdf')
OUT = os.path.join(ROOT, 'tools/pack-builder/tmp-c34-c38-pdf.txt')

LESSONS = [
    ('C34', [72, 73, 74]),
    ('C35', [75, 76]),
    ('C36', [77, 78, 79]),
    ('C37', [80, 81, 82]),
    ('C38', [83, 84, 85]),
]

doc = pymupdf.open(PDF)
lines: list[str] = []

for code, pages in LESSONS:
    lines.append(f'======== {code} ========')
    for page_index in pages:
        page = doc[page_index]
        text = page.get_text()
        lines.append(f'--- page {page_index + 1} ---')
        lines.append(text)
        lines.append('')
        lines.append('--- glossary ---')
        for raw_line in text.splitlines():
            if re.match(r'^[A-Za-z]+ \[[^\]]+\]', raw_line.strip()):
                lines.append(raw_line.strip())
        lines.append('')

with open(OUT, 'w', encoding='utf-8') as handle:
    handle.write('\n'.join(lines))

print(OUT)
