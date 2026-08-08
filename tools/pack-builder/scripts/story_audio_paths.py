"""Shared paths for primary-1000-stories audio alignment."""
from __future__ import annotations

import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(SCRIPT_DIR, '..', '..', '..')

IMPORT_AUDIO_DIR = os.path.join(ROOT, 'imports', '40篇童话故事记完小学1000核心词汇音频')
PACK_ROOT = os.path.join(ROOT, 'tools/pack-builder/source/primary-1000-stories')
PACK_AUDIO_DIR = os.path.join(PACK_ROOT, 'assets/audio')
CARDS_PATH = os.path.join(PACK_ROOT, 'cards.json')
CANONICAL_DIR = os.path.join(PACK_ROOT, 'canonical')
ALIGN_CACHE_DIR = os.path.join(ROOT, 'tools/pack-builder/cache/story-audio-align')


def lesson_code(lesson_number: int) -> str:
    return f'C{lesson_number}'


def import_audio_path(lesson_number: int) -> str:
    return os.path.join(IMPORT_AUDIO_DIR, f'{lesson_number:02d}.mp3')


def pack_audio_path(lesson_number: int) -> str:
    return os.path.join(PACK_AUDIO_DIR, f'c{lesson_number}.mp3')


def canonical_path(lesson_code: str) -> str:
    return os.path.join(CANONICAL_DIR, f'{lesson_code}.paragraphs.json')


def transcript_cache_path(lesson_code: str) -> str:
    return os.path.join(ALIGN_CACHE_DIR, f'{lesson_code}.whisper.json')


def whisper_wav_cache_path(lesson_code: str) -> str:
    return os.path.join(ALIGN_CACHE_DIR, f'{lesson_code}.16k.wav')
