#!/usr/bin/env python3
import os
import re

import pymupdf

ROOT = os.path.join(os.path.dirname(__file__), '..', '..', '..')
PDF = os.path.join(ROOT, 'imports', '40篇短文记完小学1000核心词汇文章.pdf')
OUT = os.path.join(ROOT, 'tools/pack-builder/tmp-c2-pdf.txt')

doc = pymupdf.open(PDF)
lines = []
for page_index in (2, 3):
    text = doc[page_index].get_text()
    lines.append(f'=== PAGE {page_index + 1} ===')
    lines.append(text)
    lines.append('')

# Also dump story hint lines (Chinese annotations under blanks)
hint_lines = []
for page_index in (2, 3):
    page = doc[page_index]
    for block in page.get_text('dict')['blocks']:
        if block.get('type') != 0:
            continue
        for line in block.get('lines', []):
            text = ''.join(span.get('text', '') for span in line.get('spans', [])).strip()
            if text and not re.match(r'^[A-Za-z]+\s*\[', text):
                if re.search(r'[\u4e00-\u9fff]', text) or text in {
                    'Work',
                    'Save',
                    'Come',
                    'Winter',
                }:
                    hint_lines.append(text)

with open(OUT, 'w', encoding='utf-8') as handle:
    handle.write('\n'.join(lines))
    handle.write('\n\n=== HINTS ===\n')
    handle.write('\n'.join(hint_lines))

print(OUT)
