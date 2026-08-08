#!/usr/bin/env python3
"""Probe 三年级下册 PDF for 单元词汇表 pages."""
import re
import sys
from pathlib import Path

import pymupdf

ROOT = Path(__file__).resolve().parents[3]
PDF = ROOT / 'imports' / '最新【人教版】3年级英语课本•下册.pdf'
OUT = ROOT / 'tools' / 'pack-builder' / 'tmp-grade3-vol2-vocab.txt'


def main() -> None:
    doc = pymupdf.open(PDF)
    lines: list[str] = [f'pages: {doc.page_count}', f'toc: {doc.get_toc()}', '']
    for i in range(doc.page_count):
        text = doc[i].get_text()
        if any(k in text for k in ('单元词汇表', 'Words in each unit', '词汇表')):
            lines.append(f'=== page {i + 1} ===')
            lines.append(text)
            lines.append('')
    OUT.write_text('\n'.join(lines), encoding='utf-8')
    print(OUT)
    print(f'written {len(lines)} lines')


if __name__ == '__main__':
    main()
