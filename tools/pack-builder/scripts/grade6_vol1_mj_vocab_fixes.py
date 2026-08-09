"""Curated vocabulary fixes for en-grade6-v1-mj PDF parse output."""

from __future__ import annotations

import copy

RENAME: dict[str, str] = {}

REMOVE: set[str] = set()

# Unit 8 与部分词条在 PDF 中落在 Word List 页，Words and Expressions 单页未收录
ADD: list[dict] = [
    {'unit': 7, 'headword': 'help yourselves', 'ipa': '', 'definition_zh': '请自便', 'page': 70, 'kind': 'phrase'},
    {'unit': 7, 'headword': 'corn', 'ipa': '', 'definition_zh': '玉米', 'page': 70, 'kind': 'word'},
    {'unit': 7, 'headword': 'soup', 'ipa': '', 'definition_zh': '汤', 'page': 70, 'kind': 'word'},
    {'unit': 7, 'headword': 'hope', 'ipa': '', 'definition_zh': '希望', 'page': 70, 'kind': 'word'},
    {'unit': 7, 'headword': 'better', 'ipa': '', 'definition_zh': '更好的', 'page': 70, 'kind': 'word'},
    {'unit': 7, 'headword': 'luck', 'ipa': '', 'definition_zh': '运气', 'page': 70, 'kind': 'word'},
    {'unit': 8, 'headword': 'moon', 'ipa': '', 'definition_zh': '月亮', 'page': 80, 'kind': 'word'},
    {'unit': 8, 'headword': 'shine', 'ipa': '', 'definition_zh': '发光；照耀', 'page': 80, 'kind': 'word'},
    {'unit': 8, 'headword': 'its', 'ipa': '', 'definition_zh': '它的', 'page': 80, 'kind': 'word'},
    {'unit': 8, 'headword': 'sun', 'ipa': '', 'definition_zh': '太阳', 'page': 80, 'kind': 'word'},
    {'unit': 8, 'headword': 'real', 'ipa': '', 'definition_zh': '真实的', 'page': 80, 'kind': 'word'},
    {'unit': 8, 'headword': 'because', 'ipa': '', 'definition_zh': '因为', 'page': 80, 'kind': 'word'},
    {'unit': 8, 'headword': 'earth', 'ipa': '', 'definition_zh': '地球', 'page': 80, 'kind': 'word'},
    {'unit': 8, 'headword': 'go around', 'ipa': '', 'definition_zh': '绕着……转', 'page': 80, 'kind': 'phrase'},
    {'unit': 8, 'headword': 'Mid-Autumn Festival', 'ipa': '', 'definition_zh': '中秋节', 'page': 80, 'kind': 'phrase'},
    {'unit': 8, 'headword': 'evening', 'ipa': '', 'definition_zh': '晚上', 'page': 80, 'kind': 'word'},
]


def _normalize_row(row: dict) -> dict:
    row = copy.deepcopy(row)
    head = row['headword'].strip()
    if head.startswith('*'):
        head = head.lstrip('*').strip()
        row['headword'] = head
    return row


def apply_vocab_fixes(rows: list[dict]) -> list[dict]:
    by_headword: dict[str, dict] = {}
    for row in rows:
        row = _normalize_row(row)
        key = row['headword'].lower()
        if key in REMOVE:
            continue
        if key in RENAME:
            row['headword'] = RENAME[key]
            key = row['headword'].lower()
        if key == 'began':
            row['definition_zh'] = '开始（过去式）'
        if key == 'woman':
            row['definition_zh'] = '妇女'
        if key == 'teeth':
            row['definition_zh'] = '牙齿（复数）'
        if key == 'team':
            row['definition_zh'] = '（体育的）队'
        if key not in by_headword or row['unit'] < by_headword[key]['unit']:
            by_headword[key] = row
    for row in ADD:
        row = _normalize_row(row)
        key = row['headword'].lower()
        by_headword[key] = row
    fixed = list(by_headword.values())
    fixed.sort(key=lambda r: (r['unit'], r['page'], r['headword'].lower()))
    return fixed
