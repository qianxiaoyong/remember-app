#!/usr/bin/env python3
"""Copy or repair official story mp3 files into primary-1000-stories pack assets.

By default re-encodes via ffmpeg so Windows / browser / mobile / ffprobe agree on duration.
Use --copy-only to keep a raw byte copy (not recommended for these source files).
"""
from __future__ import annotations

import argparse
import glob
import os
import shutil
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(SCRIPT_DIR, '..', '..', '..')
IMPORT_AUDIO_DIR = os.path.join(ROOT, 'imports', '40篇童话故事记完小学1000核心词汇音频')
PACK_AUDIO_DIR = os.path.join(
    ROOT,
    'tools/pack-builder/source/primary-1000-stories/assets/audio',
)
ALIGN_CACHE_DIR = os.path.join(ROOT, 'tools/pack-builder/cache/story-audio-align')

sys.path.insert(0, SCRIPT_DIR)
from story_audio_paths import lesson_code, transcript_cache_path, whisper_wav_cache_path  # noqa: E402
from story_audio_repair import repair_mp3  # noqa: E402


def clear_align_cache(lesson_number: int) -> None:
    code = lesson_code(lesson_number)
    for path in (
        transcript_cache_path(code),
        whisper_wav_cache_path(code),
    ):
        if os.path.isfile(path):
            os.remove(path)


def import_lesson(lesson_number: int, *, repair: bool, dry_run: bool) -> tuple[str, int]:
    source = os.path.join(IMPORT_AUDIO_DIR, f'{lesson_number:02d}.mp3')
    target = os.path.join(PACK_AUDIO_DIR, f'c{lesson_number}.mp3')
    if not os.path.isfile(source):
        raise FileNotFoundError(f'missing import audio: {source}')

    source_size = os.path.getsize(source)
    if dry_run:
        mode = 'repair' if repair else 'copy'
        print(f'[dry-run] {mode} {source} -> {target} ({source_size} bytes)')
        return target, source_size

    os.makedirs(PACK_AUDIO_DIR, exist_ok=True)
    if repair:
        target_size = repair_mp3(source, target)
        clear_align_cache(lesson_number)
        print(f'repaired c{lesson_number}.mp3 ({source_size} -> {target_size} bytes)')
        return target, target_size

    shutil.copy2(source, target)
    print(f'copied c{lesson_number}.mp3 ({source_size} bytes)')
    return target, source_size


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--from', dest='from_lesson', type=int, default=1)
    parser.add_argument('--to', dest='to_lesson', type=int, default=40)
    parser.add_argument(
        '--copy-only',
        action='store_true',
        help='raw copy without ffmpeg repair (legacy; may have duration mismatches)',
    )
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()

    if args.from_lesson < 1 or args.to_lesson > 40 or args.from_lesson > args.to_lesson:
        print('lesson range must be within 1..40', file=sys.stderr)
        return 1

    repair = not args.copy_only
    processed = 0
    for lesson_number in range(args.from_lesson, args.to_lesson + 1):
        import_lesson(lesson_number, repair=repair, dry_run=args.dry_run)
        processed += 1

    if repair and not args.dry_run:
        print('cleared per-lesson whisper/wav align cache for repaired files')
        print('re-run align-primary-1000-audio.py --refresh-transcript before --write')

    print(f'done: {processed} file(s) -> {PACK_AUDIO_DIR}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
