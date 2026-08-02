import { describe, expect, it } from 'vitest';
import { PackVerificationError } from './errors.js';
import { validateStoryReadingCard } from './validate-story-reading-card.js';
import type { PackCardRecord } from './verify-content.js';

const manifestPaths = new Set(['assets/images/c1.png', 'assets/audio/c1.mp3']);

function makeStoryContent(overrides: {
  sidebar?: unknown;
  paragraphs?: unknown;
} = {}): string {
  return JSON.stringify({
    lesson: {
      code: 'C1',
      titleEn: 'The Princess and the Pea',
      titleZh: '公主与豌豆',
      coverImage: 'assets/images/c1.png',
      primaryAudio: 'assets/audio/c1.mp3',
    },
    story: {
      paragraphs: overrides.paragraphs ?? [
        {
          runs: [
            { kind: 'text', text: 'The prince is ' },
            {
              kind: 'word',
              surface: 'not',
              glossZh: '不',
              tier: 'mid',
              vocabId: 'not',
            },
            { kind: 'text', text: ' happy.' },
          ],
        },
      ],
    },
    sidebar: overrides.sidebar ?? [
      {
        vocabId: 'not',
        headword: 'not',
        ipa: '/nɒt/',
        pos: 'adv.',
        definitionZh: '不',
        tier: 'mid',
      },
    ],
  });
}

function makeStoryCard(overrides: Partial<PackCardRecord> = {}): PackCardRecord {
  return {
    knowledgeId: 'story-test-pack:story:c1',
    cardType: 'story_reading',
    sortOrder: 1,
    content: makeStoryContent(),
    ...overrides,
  };
}

describe('validateStoryReadingCard', () => {
  it('合法 story content 校验通过', () => {
    const row = validateStoryReadingCard('story-test-pack', makeStoryCard(), manifestPaths);
    expect(row.cardType).toBe('story_reading');
    expect(row.content.lesson.code).toBe('C1');
  });

  it('word run vocabId 不在 sidebar 时被拒绝', () => {
    expect(() =>
      validateStoryReadingCard(
        'story-test-pack',
        makeStoryCard({
          content: makeStoryContent({
            paragraphs: [
              {
                runs: [
                  {
                    kind: 'word',
                    surface: 'missing',
                    glossZh: '缺',
                    tier: 'high',
                    vocabId: 'missing',
                  },
                ],
              },
            ],
          }),
        }),
        manifestPaths,
      ),
    ).toThrow(
      expect.objectContaining({
        code: 'PACK_CONTENT_INVALID',
      } satisfies Partial<PackVerificationError>),
    );
  });

  it('sidebar 孤儿条目被拒绝', () => {
    expect(() =>
      validateStoryReadingCard(
        'story-test-pack',
        makeStoryCard({
          content: makeStoryContent({
            sidebar: [
              {
                vocabId: 'not',
                headword: 'not',
                ipa: '/nɒt/',
                pos: 'adv.',
                definitionZh: '不',
                tier: 'mid',
              },
              {
                vocabId: 'orphan',
                headword: 'orphan',
                ipa: '/ɔː/',
                pos: 'n.',
                definitionZh: '孤儿',
                tier: 'low',
              },
            ],
          }),
        }),
        manifestPaths,
      ),
    ).toThrow(
      expect.objectContaining({
        code: 'PACK_CONTENT_INVALID',
      } satisfies Partial<PackVerificationError>),
    );
  });

  it('word run tier 与 sidebar 不一致时被拒绝', () => {
    expect(() =>
      validateStoryReadingCard(
        'story-test-pack',
        makeStoryCard({
          content: makeStoryContent({
            paragraphs: [
              {
                runs: [
                  {
                    kind: 'word',
                    surface: 'not',
                    glossZh: '不',
                    tier: 'high',
                    vocabId: 'not',
                  },
                ],
              },
            ],
          }),
        }),
        manifestPaths,
      ),
    ).toThrow(
      expect.objectContaining({
        code: 'PACK_CONTENT_INVALID',
      } satisfies Partial<PackVerificationError>),
    );
  });

  it('knowledgeId 与 lesson.code 不匹配时被拒绝', () => {
    expect(() =>
      validateStoryReadingCard(
        'story-test-pack',
        makeStoryCard({ knowledgeId: 'story-test-pack:story:wrong' }),
        manifestPaths,
      ),
    ).toThrow(
      expect.objectContaining({
        code: 'PACK_CONTENT_INVALID',
      } satisfies Partial<PackVerificationError>),
    );
  });
});
