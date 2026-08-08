#!/usr/bin/env python3
"""Run TTS + build + verify for all PEP grade 4–6 vocabulary packs sequentially."""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(SCRIPT_DIR))

from pep_vocab_common import PACK_CONFIGS

PACK_ORDER = [
    'en-grade4-v1-rj',
    'en-grade4-v2-rj',
    'en-grade5-v1-rj',
    'en-grade5-v2-rj',
    'en-grade6-v1-rj',
    'en-grade6-v2-rj',
]


def main() -> None:
    start_from = sys.argv[1] if len(sys.argv) > 1 else PACK_ORDER[0]
    started = start_from not in PACK_ORDER
    for pack_id in PACK_ORDER:
        if not started:
            if pack_id == start_from:
                started = True
            else:
                continue
        config = PACK_CONFIGS[pack_id]
        print(f'\n========== {pack_id} ==========')
        subprocess.check_call([sys.executable, str(SCRIPT_DIR / 'generate_pep_vocab_audio.py'), pack_id], cwd=ROOT)
        subprocess.check_call([sys.executable, str(SCRIPT_DIR / 'pep_vocab_pipeline.py'), pack_id, 'build'], cwd=ROOT)
    print('\nAll packs complete.')


if __name__ == '__main__':
    main()
