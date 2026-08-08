#!/usr/bin/env python3
"""Dump PDF story pages for C19-C23 to assist canonical transcription."""
import os
import re

import pymupdf

ROOT = os.path.join(os.path.dirname(__file__), '..', '..', '..')
PDF = os.path.join(ROOT, 'imports', '40篇短文记完小学1000核心词汇文章.pdf')
OUT = os.path.join(ROOT, 'tools/pack-builder/tmp-c19-c23-pdf.txt')

# PDF page indices 0-based; verify spillover per lesson when transcribing.
LESSONS = [
    ('C19', [37, 38]),
    ('C20', [39, 40]),
    ('C21', [41, 42]),
    ('C22', [43, 44]),
    ('C23', [45, 46, 47]),
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
