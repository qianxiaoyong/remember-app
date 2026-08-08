#!/usr/bin/env python3
"""Auto-generate ordered vocabulary marks for story paragraphs."""
from __future__ import annotations

import re

Mark = tuple[str, str]

SUFFIX_RULES: list[tuple[str, str]] = [
    ('ies', 'y'),
    ('ied', 'y'),
    ('ing', ''),
    ('ies', 'y'),
    ('es', ''),
    ('ed', ''),
    ('s', ''),
]

IRREGULAR: dict[str, str] = {
    'cuts': 'cut',
    'finds': 'find',
    'drinks': 'drink',
    'sees': 'see',
    'works': 'work',
    'lives': 'live',
    'runs': 'run',
    'tells': 'tell',
    'asks': 'ask',
    'thinks': 'think',
    'takes': 'take',
    'walks': 'walk',
    'follows': 'follow',
    'jumps': 'jump',
    'eats': 'eat',
    'helps': 'help',
    'puts': 'put',
    'catches': 'catch',
    'says': 'say',
    'goes': 'go',
    'comes': 'come',
    'wants': 'want',
    'knows': 'know',
    'looks': 'look',
    'gives': 'give',
    'starts': 'start',
    'stops': 'stop',
    'puts': 'put',
    'wakes': 'wake',
    'flies': 'fly',
    'swims': 'swim',
    'loves': 'love',
    'likes': 'like',
    'makes': 'make',
    'gets': 'get',
    'runs': 'run',
    'falls': 'fall',
    'roars': 'roar',
    'touches': 'touch',
    'changes': 'change',
    'chases': 'chase',
    'rides': 'ride',
    'swims': 'swim',
    'climbs': 'climb',
    'hides': 'hide',
    'throws': 'throw',
    'cleans': 'clean',
    'tries': 'try',
    'steals': 'steal',
    'ties': 'tie',
    'forgets': 'forget',
    'teaches': 'teach',
    'buys': 'buy',
    'spends': 'spend',
    'washes': 'wash',
    'saves': 'save',
    'grows': 'grow',
    'dies': 'die',
    'plays': 'play',
    'follows': 'follow',
    'closes': 'close',
    'catches': 'catch',
    'opens': 'open',
    'leaves': 'leave',
    'brings': 'bring',
    'argues': 'argue',
    'braver': 'brave',
    'answers': 'answer',
    'chases': 'chase',
    'stands': 'stand',
    'wakes': 'wake',
    'marries': 'marry',
    'reading': 'read',
    'riding': 'ride',
    'sings': 'sing',
    'scratches': 'scratch',
    'shoots': 'shoot',
    'hits': 'hit',
    'writes': 'write',
    'reads': 'read',
    'breaks': 'break',
    'meets': 'meet',
    'sitting': 'sit',
    'cut': 'cut',
    'cuts': 'cut',
    'jumps': 'jump',
    'runs': 'run',
    'uses': 'use',
    'picking': 'pick',
    'making': 'make',
    'dead': 'dead',
    'surprised': 'surprise',
    'chases': 'chase',
    'surprised': 'surprise',
    'prettier': 'pretty',
    'prettiest': 'pretty',
    'dead': 'dead',
    'dying': 'die',
    'men': 'man',
    'women': 'woman',
    'teeth': 'tooth',
    'mice': 'mouse',
    'feet': 'foot',
    'children': 'child',
    'geese': 'goose',
    'running': 'run',
    'afraid': 'afraid',
    'dying': 'die',
}


def lemma_for_surface(surface: str, vocab_ids: set[str]) -> str | None:
    lower = surface.lower()
    if lower in vocab_ids:
        return lower
    if lower in IRREGULAR and IRREGULAR[lower] in vocab_ids:
        return IRREGULAR[lower]

    for suffix, repl in SUFFIX_RULES:
        if not lower.endswith(suffix):
            continue
        stem = lower[: -len(suffix)] + repl
        if stem in vocab_ids:
            return stem
        if stem + 'e' in vocab_ids:
            return stem + 'e'

    return None


def auto_marks_for_paragraph(text: str, vocab_ids: set[str]) -> list[Mark]:
    marks: list[Mark] = []
    for match in re.finditer(r"[A-Za-z']+", text):
        surface = match.group(0)
        lemma = lemma_for_surface(surface, vocab_ids)
        if lemma is None:
            continue
        marks.append((surface, lemma))
    return marks


def auto_marks_for_lesson(paragraphs: list[str], vocab_ids: set[str]) -> list[list[Mark]]:
    return [auto_marks_for_paragraph(text, vocab_ids) for text in paragraphs]
