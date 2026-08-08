#!/usr/bin/env python3
"""Parse Appendix 2 vocabulary from grade 3 vol 2 PEP PDF."""
from __future__ import annotations

import json
import re
from dataclasses import asdict, dataclass
from pathlib import Path

import pymupdf

ROOT = Path(__file__).resolve().parents[3]
PDF = ROOT / 'imports' / '最新【人教版】3年级英语课本•下册.pdf'
OUT = ROOT / 'tools' / 'pack-builder' / 'cache' / 'grade3-vol2-vocab.json'

UNIT_RE = re.compile(r'^Unit\s+(\d+)\s*$')
PAGE_RE = re.compile(r'^p\.\s*(\d+)\s*$')
INLINE_PAGE_RE = re.compile(r'\s+p\.\s*(\d+)\s*$')
ENTRY_START = re.compile(
    r'^\*?(?P<headword>[A-Za-z][A-Za-z\'\-\s]*?)\s+/(?P<ipa>[^/]+)/\s*(?P<rest>.*)$'
)
IN_CLASS_RE = re.compile(r'^in\s+class\s+(.+)$', re.IGNORECASE)


@dataclass
class VocabRow:
    unit: int
    headword: str
    ipa: str
    definition_zh: str
    page: int
    kind: str


def normalize_headword(raw: str) -> str:
    return ' '.join(raw.replace('*', '').split())


def flush_entry(
    unit: int,
    headword: str | None,
    ipa: str | None,
    zh_parts: list[str],
    page: int | None,
    rows: list[VocabRow],
) -> tuple[str | None, str | None, list[str], int | None]:
    if headword and ipa and page is not None:
        definition = ''.join(zh_parts).strip()
        definition = re.sub(r'\s+', '', definition) if definition else definition
        # restore semicolon spacing for readability
        definition = definition.replace('；', '；').strip('*').strip()
        kind = 'phrase' if ' ' in headword.strip() else 'word'
        rows.append(
            VocabRow(
                unit=unit,
                headword=headword.strip(),
                ipa=ipa.strip() if ipa.startswith('/') else f'/{ipa.strip()}/',
                definition_zh=definition,
                page=page,
                kind=kind,
            )
        )
    return None, None, [], None


def parse_appendix_text(text: str) -> list[VocabRow]:
    rows: list[VocabRow] = []
    unit = 1
    headword: str | None = None
    ipa: str | None = None
    zh_parts: list[str] = []
    page: int | None = None

    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line or line in {'Appendix 2', 'Appendix 3', 'Words in each unit', '单 元 词 汇 表'}:
            continue
        if line.isdigit() and len(line) <= 2:
            continue
        if line.startswith('注：'):
            continue

        unit_match = UNIT_RE.match(line)
        if unit_match:
            headword, ipa, zh_parts, page = flush_entry(unit, headword, ipa, zh_parts, page, rows)
            unit = int(unit_match.group(1))
            continue

        page_match = PAGE_RE.match(line)
        if page_match:
            page = int(page_match.group(1))
            headword, ipa, zh_parts, page = flush_entry(unit, headword, ipa, zh_parts, page, rows)
            continue

        entry_match = ENTRY_START.match(line)
        if entry_match:
            headword, ipa, zh_parts, page = flush_entry(unit, headword, ipa, zh_parts, page, rows)
            headword = normalize_headword(entry_match.group('headword'))
            ipa = entry_match.group('ipa')
            rest = entry_match.group('rest').strip().replace('*', '')
            inline_page = INLINE_PAGE_RE.search(rest)
            if inline_page:
                page = int(inline_page.group(1))
                rest = INLINE_PAGE_RE.sub('', rest).strip()
            if headword.lower() == 'in' and rest.lower().startswith('class'):
                in_class = IN_CLASS_RE.match(rest)
                headword = 'in class'
                ipa = 'ɪn klɑːs'
                zh_parts = [in_class.group(1).strip()] if in_class else ['在课堂上']
                continue
            zh_parts = [rest] if rest else []
            continue

        if headword:
            cleaned = line.replace('*', '').strip()
            if cleaned:
                zh_parts.append(cleaned)

    flush_entry(unit, headword, ipa, zh_parts, page, rows)

    # merge duplicate "in" (Unit 5) while keeping "in class" phrase from Unit 3
    fixed: list[VocabRow] = []
    for row in rows:
        if row.headword.lower() == 'in' and row.definition_zh == 'class在课堂上':
            continue
        fixed.append(row)
    return fixed


def main() -> None:
    doc = pymupdf.open(PDF)
    chunks: list[str] = []
    for index in range(doc.page_count):
        text = doc[index].get_text()
        if index >= 84 and index <= 86:
            chunks.append(text)
    rows = parse_appendix_text('\n'.join(chunks))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    payload = [asdict(row) for row in rows]
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'wrote {len(rows)} entries to {OUT}')
    by_unit: dict[int, int] = {}
    for row in rows:
        by_unit[row.unit] = by_unit.get(row.unit, 0) + 1
    for unit in sorted(by_unit):
        print(f'  Unit {unit}: {by_unit[unit]}')


if __name__ == '__main__':
    main()
