import { describe, expect, it } from 'vitest';
import type { StoryReadingContent } from '@remember/contracts';
import { countTierStats } from './count-tier-stats.js';

const sampleContent: StoryReadingContent = {
  lesson: {
    code: 'C1',
    titleEn: 'Test',
    titleZh: '测试',
    coverImage: 'assets/images/c1.png',
    primaryAudio: 'assets/audio/c1.mp3',
  },
  story: { paragraphs: [{ runs: [{ kind: 'text', text: 'Hi.' }] }] },
  sidebar: [
    {
      vocabId: 'a',
      headword: 'a',
      ipa: '/a/',
      pos: 'n.',
      definitionZh: 'a',
      tier: 'high',
    },
    {
      vocabId: 'b',
      headword: 'b',
      ipa: '/b/',
      pos: 'n.',
      definitionZh: 'b',
      tier: 'high',
    },
    {
      vocabId: 'c',
      headword: 'c',
      ipa: '/c/',
      pos: 'n.',
      definitionZh: 'c',
      tier: 'mid',
    },
    {
      vocabId: 'd',
      headword: 'd',
      ipa: '/d/',
      pos: 'n.',
      definitionZh: 'd',
      tier: 'low',
    },
  ],
};

describe('countTierStats', () => {
  it('按 sidebar tier 统计数量', () => {
    expect(countTierStats(sampleContent)).toEqual({ high: 2, mid: 1, low: 1 });
  });

  it('normal 不计入红蓝绿频次图例', () => {
    const content: StoryReadingContent = {
      ...sampleContent,
      sidebar: [
        ...sampleContent.sidebar,
        {
          vocabId: 'n',
          headword: 'n',
          ipa: '/n/',
          pos: 'n.',
          definitionZh: 'n',
          tier: 'normal',
        },
      ],
    };
    expect(countTierStats(content)).toEqual({ high: 2, mid: 1, low: 1 });
  });
});
