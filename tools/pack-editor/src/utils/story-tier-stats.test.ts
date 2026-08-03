import { describe, expect, it } from 'vitest';
import { countStoryTierStats, formatStoryTierLegend } from './story-tier-stats.js';

describe('story-tier-stats', () => {
  it('按 tier 统计 sidebar 词数', () => {
    const stats = countStoryTierStats([
      {
        vocabId: 'a',
        headword: 'a',
        ipa: '',
        pos: '',
        definitionZh: '',
        tier: 'high',
      },
      {
        vocabId: 'b',
        headword: 'b',
        ipa: '',
        pos: '',
        definitionZh: '',
        tier: 'high',
      },
      {
        vocabId: 'c',
        headword: 'c',
        ipa: '',
        pos: '',
        definitionZh: '',
        tier: 'mid',
      },
      {
        vocabId: 'd',
        headword: 'd',
        ipa: '',
        pos: '',
        definitionZh: '',
        tier: 'low',
      },
    ]);
    expect(stats).toEqual({ high: 2, mid: 1, low: 1 });
    expect(formatStoryTierLegend(stats, 'high')).toBe('高频(2)');
  });
});
