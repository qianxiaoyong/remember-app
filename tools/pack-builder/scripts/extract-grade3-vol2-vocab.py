#!/usr/bin/env python3
"""Extract all Words in each unit pages from grade3 vol2 PDF."""
import re
from pathlib import Path

import pymupdf

ROOT = Path(__file__).resolve().parents[3]
PDF = ROOT / 'imports' / '最新【人教版】3年级英语课本•下册.pdf'
OUT = ROOT / 'tools' / 'pack-builder' / 'tmp-grade3-vol2-vocab-full.txt'

ENTRY = re.compile(
    r'^\*?(?P<headword>[A-Za-z][A-Za-z\'\-\s]*?)\s+/(?P<ipa>[^/]+)/\s+(?P<zh>.+?)\s+p\.\s*\d',
    re.MULTILINE,
)
UNIT = re.compile(r'^Unit\s+(\d+)', re.MULTILINE)


def main() -> None:
    doc = pymupdf.open(PDF)
    chunks: list[str] = []
    for i in range(doc.page_count):
        text = doc[i].get_text()
        if 'Words in each unit' in text or '单元词汇表' in text or (
            i >= 84 and 'Unit ' in text and '/\u2002' not in text and '/we' in text or '/fr' in text or re.search(r'/[a-z\u0259\u02d0\u0283]+/', text)
        ):
            if i >= 84:
                chunks.append(f'=== page {i + 1} ===\n{text}')
    full = '\n\n'.join(chunks)
    OUT.write_text(full, encoding='utf-8')

    # naive parse stats
    units: dict[str, list[str]] = {}
    current = 'unknown'
    for line in full.splitlines():
        um = UNIT.match(line.strip())
        if um:
            current = f'Unit {um.group(1)}'
            units.setdefault(current, [])
            continue
        em = ENTRY.match(line.strip())
        if em:
            units.setdefault(current, []).append(em.group('headword').strip())

    summary = ['', '=== parse summary ===']
    total = 0
    for unit, words in sorted(units.items(), key=lambda x: x[0]):
        summary.append(f'{unit}: {len(words)} words')
        total += len(words)
    summary.append(f'total parsed: {total}')
    OUT.write_text(full + '\n'.join(summary), encoding='utf-8')
    print(OUT)
    print('\n'.join(summary))


if __name__ == '__main__':
    main()
