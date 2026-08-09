#!/usr/bin/env python3
"""Generate MP3 audio for PEP vocabulary packs using edge-tts."""
from __future__ import annotations

import asyncio
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

from pack_tts_config import HEADWORD_TTS_SEGMENTS, PACK_TTS_VOICE
from pep_vocab_common import PACK_CONFIGS, ROOT
from story_audio_repair import resolve_ffmpeg_executable

VOICE = PACK_TTS_VOICE


async def synthesize(text: str, output_path: Path) -> None:
    import edge_tts

    output_path.parent.mkdir(parents=True, exist_ok=True)
    communicate = edge_tts.Communicate(text, VOICE)
    await communicate.save(str(output_path))


async def synthesize_segments(segments: list[str], output_path: Path) -> None:
    if len(segments) == 1:
        await synthesize(segments[0], output_path)
        return

    output_path.parent.mkdir(parents=True, exist_ok=True)
    tmp_paths: list[Path] = []
    list_file: Path | None = None
    try:
        for segment in segments:
            fd, name = tempfile.mkstemp(suffix='.mp3')
            os.close(fd)
            tmp = Path(name)
            tmp_paths.append(tmp)
            await synthesize(segment, tmp)

        fd, name = tempfile.mkstemp(suffix='.txt')
        os.close(fd)
        list_file = Path(name)
        list_file.write_text(
            ''.join(f"file '{path.as_posix()}'\n" for path in tmp_paths),
            encoding='utf-8',
        )
        ffmpeg = resolve_ffmpeg_executable()
        proc = subprocess.run(
            [
                ffmpeg,
                '-y',
                '-f',
                'concat',
                '-safe',
                '0',
                '-i',
                str(list_file),
                '-c',
                'copy',
                str(output_path),
            ],
            capture_output=True,
            text=True,
            check=False,
        )
        if proc.returncode != 0:
            raise RuntimeError(f'ffmpeg concat failed: {proc.stderr.strip()}')
    finally:
        for path in tmp_paths:
            path.unlink(missing_ok=True)
        if list_file is not None:
            list_file.unlink(missing_ok=True)


def resolve_headword_tts_text(headword: str) -> str | list[str]:
    return HEADWORD_TTS_SEGMENTS.get(headword, headword)


async def synthesize_headword(headword: str, output_path: Path) -> None:
    tts_input = resolve_headword_tts_text(headword)
    if isinstance(tts_input, list):
        await synthesize_segments(tts_input, output_path)
    else:
        await synthesize(tts_input, output_path)


async def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit('usage: generate_pep_vocab_audio.py <pack_id> [--force]')
    pack_id = sys.argv[1]
    force = '--force' in sys.argv
    config = PACK_CONFIGS[pack_id]
    source = ROOT / 'tools/pack-builder/source' / config.pack_id
    cards = json.loads((source / 'cards.json').read_text(encoding='utf-8'))
    tasks: list[tuple[str, Path, bool]] = []
    for card in cards:
        prompt = card['content']['prompt']
        tasks.append((prompt['headword'], source / prompt['primaryAudio'], True))
        for example in card['content']['reveal']['examples']:
            tasks.append((example['en'], source / example['audio'], False))

    seen: set[Path] = set()
    unique_tasks: list[tuple[str, Path, bool]] = []
    for text, path, is_headword in tasks:
        if path in seen:
            continue
        seen.add(path)
        unique_tasks.append((text, path, is_headword))

    print(f'pack: {pack_id}')
    print(f'voice: {VOICE}')
    print(f'synthesizing {len(unique_tasks)} mp3 files (force={force})...')
    for index, (text, path, is_headword) in enumerate(unique_tasks, start=1):
        if not force and path.exists() and path.stat().st_size > 4096:
            continue
        if is_headword:
            await synthesize_headword(text, path)
        else:
            await synthesize(text, path)
        if index % 25 == 0 or index == len(unique_tasks):
            print(f'  {index}/{len(unique_tasks)} done')
    print('audio generation complete')


if __name__ == '__main__':
    try:
        asyncio.run(main())
    except ModuleNotFoundError:
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'edge-tts'])
        asyncio.run(main())
