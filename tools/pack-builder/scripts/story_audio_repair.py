"""ffmpeg helpers for story audio repair/transcode."""
from __future__ import annotations

import os
import subprocess
from shutil import which


def resolve_ffprobe_executable() -> str:
    env_path = os.environ.get('FFPROBE_PATH', '').strip()
    if env_path and os.path.isfile(env_path):
        return env_path

    local_app_data = os.environ.get('LOCALAPPDATA', '').strip()
    if local_app_data:
        winget_path = os.path.join(
            local_app_data,
            'Microsoft',
            'WinGet',
            'Links',
            'ffprobe.exe',
        )
        if os.path.isfile(winget_path):
            return winget_path

    discovered = which('ffprobe')
    if discovered:
        return discovered

    raise RuntimeError(
        'ffprobe not found. Install ffmpeg (winget install Gyan.FFmpeg) or set FFPROBE_PATH.',
    )


def resolve_ffmpeg_executable() -> str:
    env_path = os.environ.get('FFMPEG_PATH', '').strip()
    if env_path and os.path.isfile(env_path):
        return env_path

    local_app_data = os.environ.get('LOCALAPPDATA', '').strip()
    if local_app_data:
        winget_path = os.path.join(
            local_app_data,
            'Microsoft',
            'WinGet',
            'Links',
            'ffmpeg.exe',
        )
        if os.path.isfile(winget_path):
            return winget_path

    discovered = which('ffmpeg')
    if discovered:
        return discovered

    raise RuntimeError(
        'ffmpeg not found. Install ffmpeg (winget install Gyan.FFmpeg) or set FFMPEG_PATH.',
    )


def repair_mp3(source_path: str, target_path: str) -> int:
    """Re-encode mp3 to fix corrupt frames; returns output size in bytes."""
    ffmpeg = resolve_ffmpeg_executable()
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    proc = subprocess.run(
        [
            ffmpeg,
            '-y',
            '-hide_banner',
            '-loglevel',
            'error',
            '-i',
            source_path,
            '-c:a',
            'libmp3lame',
            '-b:a',
            '32k',
            '-minrate',
            '32k',
            '-maxrate',
            '32k',
            '-bufsize',
            '32k',
            '-ar',
            '44100',
            '-ac',
            '1',
            # Xing/LAME VBR headers make Windows Explorer under-report duration (~4%).
            '-write_xing',
            '0',
            '-id3v2_version',
            '3',
            target_path,
        ],
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        raise RuntimeError(
            f'ffmpeg repair failed for {source_path}: {proc.stderr.strip()}',
        )
    return os.path.getsize(target_path)
