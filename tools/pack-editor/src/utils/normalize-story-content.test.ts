import type { StoryReadingContent } from '@remember/contracts';
import { describe, expect, it } from 'vitest';
import { normalizeStoryContent } from './normalize-story-content.js';
import { runsToPlainText } from './story-runs-markup.js';

const sidebar = [
  {
    vocabId: 'not',
    headword: 'not',
    ipa: '/nɒt/',
    pos: 'adv.',
    definitionZh: '不',
    tier: 'mid' as const,
  },
  {
    vocabId: 'happy',
    headword: 'happy',
    ipa: '/ˈhæpi/',
    pos: 'adj.',
    definitionZh: '高兴',
    tier: 'high' as const,
  },
];

describe('normalizeStoryContent', () => {
  it('保存时保留词间空格 text run', () => {
    const content: StoryReadingContent = {
      lesson: {
        code: 'C1',
        titleEn: 'The Princess and the Pea',
        titleZh: '公主与豌豆',
        coverImage: 'assets/images/c1.png',
        primaryAudio: 'assets/audio/c1.mp3',
      },
      story: {
        paragraphs: [
          {
            runs: [
              { kind: 'text', text: 'The prince is' },
              { kind: 'word', surface: 'not', glossZh: '不', tier: 'mid', vocabId: 'not' },
              { kind: 'word', surface: 'happy', glossZh: '高兴', tier: 'high', vocabId: 'happy' },
              { kind: 'text', text: '.' },
            ],
          },
        ],
      },
      sidebar,
    };

    const normalized = normalizeStoryContent(content);
    const runs = normalized.story.paragraphs[0]?.runs ?? [];
    expect(runsToPlainText(runs)).toBe('The prince is not happy.');
    expect(runs.some((run) => run.kind === 'text' && run.text === ' ')).toBe(true);
  });
});
