#!/usr/bin/env python3
import os
import re

import pymupdf

ROOT = os.path.join(os.path.dirname(__file__), '..', '..', '..')
PDF = os.path.join(ROOT, 'imports', '40篇短文记完小学1000核心词汇文章.pdf')
OUT = os.path.join(ROOT, 'tools/pack-builder/tmp-c3-pdf.txt')

doc = pymupdf.open(PDF)
lines = []
for page_index in (4, 5):
    text = doc[page_index].get_text()
    lines.append(f'=== PAGE {page_index + 1} ===')
    lines.append(text)
    lines.append('')

with open(OUT, 'w', encoding='utf-8') as handle:
    handle.write('\n'.join(lines))

print(OUT)
