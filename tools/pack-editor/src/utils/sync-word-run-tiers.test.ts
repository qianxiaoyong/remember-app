import type { StoryReadingContent } from '@remember/contracts';
import { describe, expect, it } from 'vitest';
import { syncWordRunTiersFromSidebar } from './sync-word-run-tiers.js';

describe('syncWordRunTiersFromSidebar', () => {
  it('将 sidebar tier 同步到所有 word run', () => {
    const content: StoryReadingContent = {
      lesson: {
        code: 'C1',
        titleEn: 'Title',
        titleZh: '标题',
        coverImage: 'assets/images/c1.png',
        primaryAudio: 'assets/audio/c1.mp3',
      },
      story: {
        paragraphs: [
          {
            runs: [
              { kind: 'text', text: 'a ' },
              {
                kind: 'word',
                surface: 'princess',
                glossZh: '公主',
                tier: 'low',
                vocabId: 'princess',
              },
              { kind: 'text', text: '.' },
            ],
          },
        ],
      },
      sidebar: [
        {
          vocabId: 'princess',
          headword: 'princess',
          ipa: '/ˈprɪnses/',
          pos: 'n.',
          definitionZh: '公主',
          tier: 'normal',
        },
      ],
    };

    const synced = syncWordRunTiersFromSidebar(content);
    const wordRun = synced.story.paragraphs[0]?.runs[1];
    expect(wordRun?.kind).toBe('word');
    if (wordRun?.kind === 'word') {
      expect(wordRun.tier).toBe('normal');
    }
  });
});
