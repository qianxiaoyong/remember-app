#!/usr/bin/env python3
"""Generate sidebar rows from PDF dump for C9-C13."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def _dump_paths(code: str) -> tuple[Path, Path]:
    lesson_number = int(code[1:])
    if lesson_number >= 39:
        return ROOT / 'tmp-c39-c40-glossary.json', ROOT / 'tmp-c39-c40-pdf.txt'
    if lesson_number >= 34:
        return ROOT / 'tmp-c34-c38-glossary.json', ROOT / 'tmp-c34-c38-pdf.txt'
    if lesson_number >= 29:
        return ROOT / 'tmp-c29-c33-glossary.json', ROOT / 'tmp-c29-c33-pdf.txt'
    if lesson_number >= 24:
        return ROOT / 'tmp-c24-c28-glossary.json', ROOT / 'tmp-c24-c28-pdf.txt'
    if lesson_number >= 19:
        return ROOT / 'tmp-c19-c23-glossary.json', ROOT / 'tmp-c19-c23-pdf.txt'
    if lesson_number >= 14:
        return ROOT / 'tmp-c14-c18-glossary.json', ROOT / 'tmp-c14-c18-pdf.txt'
    return ROOT / 'tmp-c9-c13-glossary.json', ROOT / 'tmp-c9-c13-pdf.txt'


def parse_sidebar(code: str) -> list[tuple[str, str, str, str, str]]:
    gloss_path, pdf_path = _dump_paths(code)
    gloss = json.loads(gloss_path.read_text(encoding='utf-8'))
    raw = pdf_path.read_text(encoding='utf-8')
    section = raw.split(f'======== {code} ========')[1].split('========')[0]
    tiers = {word: tier for word, (tier, _line) in gloss[code]}
    lines = section.splitlines()
    rows: list[tuple[str, str, str, str, str]] = []
    seen: set[str] = set()

    for index, line in enumerate(lines):
        match = re.match(r'^([A-Za-z]+)\s*\[([^\]]+)\]', line.strip())
        if not match:
            continue
        word = match.group(1).lower()
        if word in seen:
            continue
        if index + 1 >= len(lines):
            continue
        pos_def = lines[index + 1].strip()
        pos_match = re.match(r'^([a-z\.]+)\.(.*)$', pos_def)
        if not pos_match:
            continue
        seen.add(word)
        ipa_raw = match.group(2).strip()
        ipa = '/' + re.sub(r'\s+', '', ipa_raw) + '/'
        rows.append(
            (
                word,
                ipa,
                pos_match.group(1) + '.',
                pos_match.group(2).strip(),
                tiers[word],
            ),
        )
    return rows


if __name__ == '__main__':
    for lesson in ['C9', 'C10', 'C11', 'C12', 'C13']:
        rows = parse_sidebar(lesson)
        print(lesson, len(rows))
