"""Vocabulary fixes for en-grade3-v2-rj — parse output already complete."""

from __future__ import annotations

import copy


def apply_vocab_fixes(rows: list[dict]) -> list[dict]:
    return [copy.deepcopy(r) for r in rows]
