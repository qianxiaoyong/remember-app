import { describe, expect, it } from 'vitest';
import { formatAudioTimeMs, formatSegmentDurationSeconds } from './format-audio-time.js';

describe('formatAudioTimeMs', () => {
  it('格式化为 M:SS', () => {
    expect(formatAudioTimeMs(0)).toBe('0:00');
    expect(formatAudioTimeMs(9826)).toBe('0:09.8');
    expect(formatAudioTimeMs(123_600)).toBe('2:03.6');
    expect(formatAudioTimeMs(137_561)).toBe('2:17.5');
  });

  it('无效值返回占位', () => {
    expect(formatAudioTimeMs(undefined)).toBe('--:--');
    expect(formatAudioTimeMs(Number.NaN)).toBe('--:--');
  });
});

describe('formatSegmentDurationSeconds', () => {
  it('计算本段时长（秒）', () => {
    expect(formatSegmentDurationSeconds(0, 9826)).toBe('9.8秒');
    expect(formatSegmentDurationSeconds(123_600, 137_561)).toBe('14.0秒');
  });

  it('缺值或非法区间返回 null', () => {
    expect(formatSegmentDurationSeconds(undefined, 1000)).toBeNull();
    expect(formatSegmentDurationSeconds(1000, 500)).toBeNull();
  });
});
