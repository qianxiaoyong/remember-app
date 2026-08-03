import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getPackBuilderRoot } from './paths.js';
import { readAudioDurationMs } from './read-audio-duration-ms.js';

describe('readAudioDurationMs', () => {
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
});
