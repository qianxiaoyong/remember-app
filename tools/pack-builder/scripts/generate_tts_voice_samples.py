#!/usr/bin/env python3
"""Generate TTS reference samples for multiple edge-tts voices."""
from __future__ import annotations

import asyncio
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

from pack_tts_config import PACK_TTS_VOICE

OUT = ROOT / 'tools/pack-builder/output/tts-voice-samples'

# 候选音色：英/美/澳，男女声各若干（正式包以 pack_tts_config.PACK_TTS_VOICE 为准）
VOICES = [
    (PACK_TTS_VOICE, '英式女声 Libby（项目固定音色）'),
    ('en-GB-SoniaNeural', '英式女声 Sonia'),
    ('en-GB-RyanNeural', '英式男声 Ryan'),
    ('en-US-JennyNeural', '美式女声 Jenny'),
    ('en-US-GuyNeural', '美式男声 Guy'),
    ('en-US-AriaNeural', '美式女声 Aria'),
    ('en-US-AnaNeural', '美式女童 Ana（偏儿童）'),
    ('en-AU-NatashaNeural', '澳式女声 Natasha'),
]

SAMPLES = [
    ('word-from', 'from'),
    ('word-woman', 'woman'),
    ('phrase-where-from', 'Where are you from?'),
    ('sentence-neighbour', 'The woman is my neighbour.'),
    ('sentence-class', 'I see and hear in class.'),
]


async def synthesize(text: str, voice: str, output_path: Path) -> None:
    import edge_tts

    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(str(output_path))


async def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    index_lines = ['# TTS 音色试听样本', '', '固定文本对照，便于选音色。', '']
    total = len(VOICES) * len(SAMPLES)
    done = 0
    for voice_id, label in VOICES:
        index_lines.append(f'## {label}')
        index_lines.append(f'`{voice_id}`')
        index_lines.append('')
        for slug, text in SAMPLES:
            filename = f'{voice_id}__{slug}.mp3'
            path = OUT / filename
            if not path.exists() or path.stat().st_size < 1024:
                await synthesize(text, voice_id, path)
            done += 1
            index_lines.append(f'- **{text}** → `{filename}`')
            if done % 10 == 0 or done == total:
                print(f'  {done}/{total}')
        index_lines.append('')
    (OUT / 'README.md').write_text('\n'.join(index_lines), encoding='utf-8')
    print(OUT)


if __name__ == '__main__':
    try:
        asyncio.run(main())
    except ModuleNotFoundError:
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'edge-tts'])
        asyncio.run(main())
