import { execFileSync, execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

let cachedFfprobePath: string | undefined;

function candidateFfprobePaths(): string[] {
  const localAppData = process.env.LOCALAPPDATA?.trim();
  return [
    process.env.FFPROBE_PATH?.trim(),
    localAppData ? join(localAppData, 'Microsoft', 'WinGet', 'Links', 'ffprobe.exe') : undefined,
    'C:\\ffmpeg\\bin\\ffprobe.exe',
    'C:\\Program Files\\ffmpeg\\bin\\ffprobe.exe',
  ].filter((value): value is string => Boolean(value));
}

function resolveFfprobeExecutable(): string {
  if (cachedFfprobePath) {
    return cachedFfprobePath;
  }

  for (const candidate of candidateFfprobePaths()) {
    if (existsSync(candidate)) {
      cachedFfprobePath = candidate;
      return candidate;
    }
  }

  try {
    const discovered = execSync('where ffprobe', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => line && existsSync(line));
    if (discovered) {
      cachedFfprobePath = discovered;
      return discovered;
    }
  } catch {
    // where ffprobe unavailable in this process PATH
  }

  throw new Error(
    'ffprobe not found. Install ffmpeg (winget install Gyan.FFmpeg) or set FFPROBE_PATH.',
  );
}

function readFfprobeDurationMs(absolutePath: string): number {
  const ffprobe = resolveFfprobeExecutable();
  const output = execFileSync(
    ffprobe,
    [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'default=noprint_wrappers=1:nokey=1',
      absolutePath,
    ],
    { encoding: 'utf8' },
  ).trim();
  const seconds = Number.parseFloat(output);
  if (!Number.isFinite(seconds) || seconds <= 0) {
    throw new Error(`ffprobe returned invalid duration for ${absolutePath}: ${output}`);
  }
  return Math.round(seconds * 1000);
}

export function readAudioDurationMs(absolutePath: string): number {
  return readFfprobeDurationMs(absolutePath);
}
