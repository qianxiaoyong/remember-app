#!/usr/bin/env python3
"""Extract textbook example sentences from PEP PDFs for vocabulary packs."""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

import pymupdf

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

from pep_vocab_common import PACK_CONFIGS, PackConfig, default_examples, detect_vocab_page_indices

ROOT = Path(__file__).resolve().parents[3]
SENTENCE_SPLIT = re.compile(r'(?<=[.!?])\s+')
WORD_BOUNDARY = re.compile(r"[a-zA-Z']+")
NOISE = re.compile(
    r'^(Unit|Part|Lesson|Page|p\.|Listen|Look|Read|Write|Say|Tick|Circle|Match|Role-play|Let\'?s|Repeat|Chant|Song|Story|Review|Appendix|Words in each unit|单元词汇表|\d+)$',
    re.I,
)


def collect_body_sentences(config: PackConfig) -> list[str]:
    pdf_path = ROOT / config.pdf_rel
    doc = pymupdf.open(pdf_path)
    appendix_indices = set(config.vocab_page_indices or detect_vocab_page_indices(doc))
    sentences: list[str] = []
    seen: set[str] = set()
    for index in range(doc.page_count):
        if index in appendix_indices:
            continue
        text = doc[index].get_text()
        for raw in SENTENCE_SPLIT.split(text.replace('\n', ' ')):
            sentence = ' '.join(raw.split())
            if len(sentence) < 8 or len(sentence) > 120:
                continue
            if not re.search(r'[A-Za-z]', sentence):
                continue
            if NOISE.match(sentence):
                continue
            if sentence.count('/') > 2:
                continue
            key = sentence.lower()
            if key in seen:
                continue
            seen.add(key)
            sentences.append(sentence)
    return sentences


def contains_term(sentence: str, term: str) -> bool:
    lower = sentence.lower()
    if ' ' in term:
        return term.lower() in lower
    return re.search(rf'\b{re.escape(term.lower())}\b', lower) is not None


def zh_for_sentence(en: str, definition_zh: str, headword: str) -> str:
    short = definition_zh.split('；')[0].split('，')[0]
    if en.endswith('?'):
        return f'（课文）与 {headword}（{short}）有关的问句。'
    if en.endswith('!'):
        return f'（课文）与 {headword}（{short}）有关的感叹句。'
    return f'（课文）{short}。'


def extract_examples(config: PackConfig) -> dict[str, list[tuple[str, str]]]:
    cache_path = ROOT / 'tools/pack-builder/cache' / config.cache_name
    rows = json.loads(cache_path.read_text(encoding='utf-8'))
    sentences = collect_body_sentences(config)
    examples: dict[str, list[tuple[str, str]]] = {}
    for row in rows:
        headword = row['headword']
        key = headword.lower()
        matches: list[str] = []
        for sentence in sentences:
            if contains_term(sentence, headword):
                matches.append(sentence)
            if len(matches) >= 5:
                break
        if not matches:
            examples[key] = default_examples(headword, row['definition_zh'])
            continue
        matches.sort(key=len)
        picked = matches[:3]
        examples[key] = [(en, zh_for_sentence(en, row['definition_zh'], headword)) for en in picked]
    return examples


def write_examples_module(config: PackConfig, examples: dict[str, list[tuple[str, str]]]) -> Path:
    module_path = SCRIPT_DIR / f'{config.pack_id.replace("-", "_")}_examples.py'
    lines = [
        f'"""Auto-extracted examples for {config.pack_id}."""',
        '',
        'EXAMPLES: dict[str, list[tuple[str, str]]] = {',
    ]
    for key in sorted(examples):
        lines.append(f'    "{key}": [')
        for en, zh in examples[key]:
            lines.append(f'        ({en!r}, {zh!r}),')
        lines.append('    ],')
    lines.append('}')
    lines.append('')
    module_path.write_text('\n'.join(lines), encoding='utf-8')
    return module_path


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('pack_id', choices=sorted(PACK_CONFIGS))
    args = parser.parse_args()
    config = PACK_CONFIGS[args.pack_id]
    cache_path = ROOT / 'tools/pack-builder/cache' / config.cache_name
    if not cache_path.exists():
        from pep_vocab_common import parse_vocab

        parse_vocab(config)
    examples = extract_examples(config)
    out = write_examples_module(config, examples)
    pdf_hits = sum(1 for key, vals in examples.items() if not vals[0][0].startswith('This is') and not vals[0][0].startswith('We use'))
    print(f'wrote {out} ({pdf_hits}/{len(examples)} headwords with PDF sentences)')


if __name__ == '__main__':
    main()
