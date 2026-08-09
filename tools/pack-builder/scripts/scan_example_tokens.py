#!/usr/bin/env python3
"""Scan vocabulary cards / EXAMPLES for headword token violations."""
import importlib
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

TOKEN_RE = re.compile(r"[a-zA-Z']+")


def normalize_surface(form: str) -> str:
    return form.lower().strip(".,!?;:'\"()[]")


def headword_emphasis_forms(headword: str) -> list[str]:
    hw = headword.split("=")[0].strip()
    return [normalize_surface(t) for t in TOKEN_RE.findall(hw)]


def sentence_contains(headword: str, sentence: str) -> bool:
    forms = headword_emphasis_forms(headword)
    if not forms:
        return False
    tokens = [normalize_surface(t) for t in TOKEN_RE.findall(sentence)]
    return any(f in tokens for f in forms)


def scan_examples_module(module_name: str) -> list[tuple[str, str]]:
    mod = importlib.import_module(module_name)
    failures: list[tuple[str, str]] = []
    for hw, examples in mod.EXAMPLES.items():
        for en, _zh in examples:
            if not sentence_contains(hw, en):
                failures.append((hw, en))
    return failures


def scan_cards(pack_id: str) -> list[tuple[str, str]]:
    cards_path = Path(__file__).resolve().parents[1] / "source" / pack_id / "cards.json"
    cards = json.loads(cards_path.read_text(encoding="utf-8"))
    failures: list[tuple[str, str]] = []
    for card in cards:
        hw = card["content"]["prompt"]["headword"]
        for ex in card["content"]["reveal"].get("examples", []):
            if not sentence_contains(hw, ex["en"]):
                failures.append((hw, ex["en"]))
    return failures


if __name__ == "__main__":
    if len(sys.argv) >= 2 and sys.argv[1].endswith("_examples_data"):
        failures = scan_examples_module(sys.argv[1])
        label = sys.argv[1]
    else:
        pack_id = sys.argv[1] if len(sys.argv) > 1 else "en-grade3-v2-rj"
        failures = scan_cards(pack_id)
        label = pack_id
    print(f"{label} failures={len(failures)}")
    for hw, en in failures:
        print(f"  {hw!r} -> {en!r}")
