import { describe, expect, it } from 'vitest';
import {
  suggestExampleAudioPath,
  suggestLessonAudioPath,
  suggestPrimaryAudioPath,
  slugifyAudioSegment,
} from '../utils/suggest-audio-path.js';

describe('slugifyAudioSegment', () => {
  it('规范化 headword 为路径段', () => {
    expect(slugifyAudioSegment('Nice to meet you!')).toBe('nice-to-meet-you');
  });

  it('空字符串回退 audio', () => {
    expect(slugifyAudioSegment('   !!! ')).toBe('audio');
  });
});

describe('suggest audio paths', () => {
  it('主音频路径', () => {
    expect(suggestPrimaryAudioPath('Name')).toBe('assets/audio/name.mp3');
  });

  it('例句音频路径', () => {
    expect(suggestExampleAudioPath('name', 0)).toBe('assets/audio/examples/name-1.mp3');
  });

  it('story 课号音频路径', () => {
    expect(suggestLessonAudioPath('C1')).toBe('assets/audio/c1.mp3');
  });
});
