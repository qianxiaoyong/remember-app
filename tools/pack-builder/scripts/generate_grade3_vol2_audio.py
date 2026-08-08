#!/usr/bin/env python3
"""Generate MP3 audio for en-grade3-v2-rj using edge-tts."""
from __future__ import annotations

import asyncio
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

from pack_tts_config import PACK_TTS_VOICE

SOURCE = ROOT / 'tools/pack-builder/source/en-grade3-v2-rj'
VOICE = PACK_TTS_VOICE


async def synthesize(text: str, output_path: Path) -> None:
    import edge_tts

    output_path.parent.mkdir(parents=True, exist_ok=True)
    communicate = edge_tts.Communicate(text, VOICE)
    await communicate.save(str(output_path))


async def main() -> None:
    force = '--force' in sys.argv
    cards = json.loads((SOURCE / 'cards.json').read_text(encoding='utf-8'))
    tasks: list[tuple[str, Path]] = []
    for card in cards:
        prompt = card['content']['prompt']
        tasks.append((prompt['headword'], SOURCE / prompt['primaryAudio']))
        for example in card['content']['reveal']['examples']:
            tasks.append((example['en'], SOURCE / example['audio']))

    seen: set[Path] = set()
    unique_tasks: list[tuple[str, Path]] = []
    for text, path in tasks:
        if path in seen:
            continue
        seen.add(path)
        unique_tasks.append((text, path))

    print(f'voice: {VOICE}')
    print(f'synthesizing {len(unique_tasks)} mp3 files (force={force})...')
    for index, (text, path) in enumerate(unique_tasks, start=1):
        if not force and path.exists() and path.stat().st_size > 4096:
            continue
        await synthesize(text, path)
        if index % 20 == 0 or index == len(unique_tasks):
            print(f'  {index}/{len(unique_tasks)} done')

    print('audio generation complete')


if __name__ == '__main__':
    try:
        asyncio.run(main())
    except ModuleNotFoundError:
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'edge-tts'])
        asyncio.run(main())
