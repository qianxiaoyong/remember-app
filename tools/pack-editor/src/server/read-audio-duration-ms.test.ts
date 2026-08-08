import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getPackBuilderRoot } from './paths.js';
import { isFfprobeAvailable, readAudioDurationMs } from './read-audio-duration-ms.js';

const ffprobeAvailable = isFfprobeAvailable();

describe.skipIf(!ffprobeAvailable)('readAudioDurationMs', () => {
  it('读取 story-test-pack c1.mp3 时长', () => {
    const audioPath = join(
      getPackBuilderRoot(),
      'source',
      'story-test-pack',
      'assets',
      'audio',
      'c1.mp3',
    );
    const durationMs = readAudioDurationMs(audioPath);
    expect(durationMs).toBeGreaterThan(60_000);
    expect(durationMs).toBeLessThan(180_000);
  });

  it('读取 primary-1000-stories c3.mp3 完整时长（官方 mp3 含坏帧，不能用帧计数）', () => {
    const audioPath = join(
      getPackBuilderRoot(),
      'source',
      'primary-1000-stories',
      'assets',
      'audio',
      'c3.mp3',
    );
    if (!existsSync(audioPath)) {
      return;
    }

    const durationMs = readAudioDurationMs(audioPath);
    expect(durationMs).toBeGreaterThan(120_000);
    expect(durationMs).toBeLessThan(140_000);
  });
});
