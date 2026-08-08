"""Whisper transcription helpers for story audio alignment."""
from __future__ import annotations

import json
import os
import re
import subprocess
from dataclasses import asdict, dataclass

from story_audio_repair import resolve_ffmpeg_executable, resolve_ffprobe_executable

MIN_TRANSCRIPT_COVERAGE = 0.75


@dataclass(frozen=True)
class WordSpan:
    word: str
    start_ms: int
    end_ms: int


@dataclass(frozen=True)
class TranscriptResult:
    language: str
    duration_ms: int
    words: list[WordSpan]


def get_audio_duration_ms(audio_path: str) -> int:
    """Return audio duration in ms using ffprobe."""
    proc = subprocess.run(
        [
            resolve_ffprobe_executable(),
            '-v',
            'error',
            '-show_entries',
            'format=duration',
            '-of',
            'default=noprint_wrappers=1:nokey=1',
            audio_path,
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    seconds = float(proc.stdout.strip())
    return max(1, int(round(seconds * 1000)))


def normalize_token(word: str) -> str:
    return re.sub(r'[^a-z0-9]', '', word.lower())


_FUZZY_TOKEN_GROUPS: tuple[frozenset[str], ...] = (
    frozenset({'pea', 'pee'}),
    frozenset({'mmm', 'hmm', 'mm'}),
    frozenset({'oh', 'o'}),
)


def tokens_equivalent(expected: str, spoken: str) -> bool:
    if expected == spoken:
        return True
    for group in _FUZZY_TOKEN_GROUPS:
        if expected in group and spoken in group:
            return True
    return False


def transcript_covers_audio(transcript: TranscriptResult) -> bool:
    if not transcript.words:
        return False
    last_end_ms = transcript.words[-1].end_ms
    return last_end_ms >= int(transcript.duration_ms * MIN_TRANSCRIPT_COVERAGE)


def prepare_whisper_wav(audio_path: str, wav_cache_path: str) -> str:
    """Convert mp3 to 16 kHz mono wav; faster-whisper reads mp3 unreliably on some files."""
    if os.path.isfile(wav_cache_path):
        if os.path.getmtime(wav_cache_path) >= os.path.getmtime(audio_path):
            return wav_cache_path

    os.makedirs(os.path.dirname(wav_cache_path), exist_ok=True)
    proc = subprocess.run(
        [
            resolve_ffmpeg_executable(),
            '-y',
            '-i',
            audio_path,
            '-ar',
            '16000',
            '-ac',
            '1',
            wav_cache_path,
        ],
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        raise RuntimeError(
            f'ffmpeg wav conversion failed for {audio_path}: {proc.stderr.strip()}',
        )
    return wav_cache_path


def load_cached_transcript(cache_path: str) -> TranscriptResult | None:
    if not os.path.isfile(cache_path):
        return None
    payload = json.loads(open(cache_path, encoding='utf-8').read())
    words = [WordSpan(**item) for item in payload['words']]
    return TranscriptResult(
        language=payload['language'],
        duration_ms=payload['duration_ms'],
        words=words,
    )


def save_cached_transcript(cache_path: str, transcript: TranscriptResult) -> None:
    os.makedirs(os.path.dirname(cache_path), exist_ok=True)
    payload = {
        'language': transcript.language,
        'duration_ms': transcript.duration_ms,
        'words': [asdict(word) for word in transcript.words],
    }
    with open(cache_path, 'w', encoding='utf-8') as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)
        handle.write('\n')


def _load_whisper_model(model_size: str):
    try:
        from faster_whisper import WhisperModel
    except ImportError as error:
        raise RuntimeError(
            'faster-whisper is not installed. Run: pip install faster-whisper',
        ) from error
    except OSError as error:
        raise RuntimeError(
            'faster-whisper failed to load (often Python 3.14 + torch DLL on Windows). '
            'Use Python 3.11 or 3.12, then: pip install faster-whisper',
        ) from error
    try:
        return WhisperModel(model_size, device='cpu', compute_type='int8')
    except OSError as error:
        raise RuntimeError(
            'faster-whisper failed to load (often Python 3.14 + torch DLL on Windows). '
            'Use Python 3.11 or 3.12, then: pip install faster-whisper',
        ) from error


def transcribe_with_whisper(
    audio_path: str,
    *,
    wav_cache_path: str | None = None,
    model_size: str = 'base',
    language: str = 'en',
) -> TranscriptResult:
    """Transcribe mp3 with faster-whisper; requires ffmpeg in PATH."""
    duration_ms = get_audio_duration_ms(audio_path)
    whisper_input = audio_path
    if wav_cache_path is not None:
        whisper_input = prepare_whisper_wav(audio_path, wav_cache_path)

    model = _load_whisper_model(model_size)
    segments, info = model.transcribe(
        whisper_input,
        language=language,
        word_timestamps=True,
        vad_filter=False,
        condition_on_previous_text=True,
    )

    words: list[WordSpan] = []
    for segment in segments:
        if segment.words:
            for item in segment.words:
                token = normalize_token(item.word)
                if not token:
                    continue
                words.append(
                    WordSpan(
                        word=token,
                        start_ms=max(0, int(round(item.start * 1000))),
                        end_ms=max(1, int(round(item.end * 1000))),
                    ),
                )
            continue
        token = normalize_token(segment.text)
        if token:
            words.append(
                WordSpan(
                    word=token,
                    start_ms=max(0, int(round(segment.start * 1000))),
                    end_ms=max(1, int(round(segment.end * 1000))),
                ),
            )

    if not words:
        raise RuntimeError(f'whisper returned no words for {audio_path}')

    transcript = TranscriptResult(
        language=info.language or language,
        duration_ms=duration_ms,
        words=words,
    )
    if not transcript_covers_audio(transcript):
        last_end_ms = words[-1].end_ms
        raise RuntimeError(
            f'whisper transcript too short for {audio_path}: '
            f'last word ends at {last_end_ms}ms / {duration_ms}ms',
        )
    return transcript


def load_or_transcribe(
    audio_path: str,
    cache_path: str,
    *,
    wav_cache_path: str | None = None,
    model_size: str = 'base',
    refresh: bool = False,
) -> TranscriptResult:
    if not refresh:
        cached = load_cached_transcript(cache_path)
        if cached is not None and transcript_covers_audio(cached):
            return cached
    transcript = transcribe_with_whisper(
        audio_path,
        wav_cache_path=wav_cache_path,
        model_size=model_size,
    )
    save_cached_transcript(cache_path, transcript)
    return transcript
