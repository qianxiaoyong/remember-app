import { describe, expect, it, vi } from 'vitest';

vi.mock('expo-sqlite', () => ({
  openDatabaseSync: vi.fn(),
}));

import type { StoryReadingContent } from '@remember/contracts';
import { mapCardRowToDetail } from './pack-card-details.js';

describe('mapCardRowToDetail', () => {
  it('vocabulary 行映射含 cardType 与 headword', () => {
    const detail = mapCardRowToDetail({
      knowledgeId: 'p:en:word:hi',
      cardType: 'vocabulary',
      sortOrder: 1,
      content: JSON.stringify({
        prompt: { headword: 'hi', primaryAudio: 'assets/a.mp3' },
        reveal: { definitions: [{ text: '嗨' }], examples: [{ en: 'Hi.', zh: '嗨。' }] },
      }),
    });
    expect(detail?.cardType).toBe('vocabulary');
    expect(detail?.headword).toBe('hi');
  });

  it('story_reading 行映射含 titleEn 作 headword', () => {
    const content: StoryReadingContent = {
      lesson: {
        code: 'C1',
        titleEn: 'The Pea',
        titleZh: '豌豆',
        coverImage: 'assets/images/c1.png',
        primaryAudio: 'assets/audio/c1.mp3',
      },
      story: { paragraphs: [{ runs: [{ kind: 'text', text: 'Hi.' }] }] },
      sidebar: [
        {
          vocabId: 'hi',
          headword: 'hi',
          ipa: '/haɪ/',
          pos: 'int.',
          definitionZh: '嗨',
          tier: 'high',
        },
      ],
    };
    const detail = mapCardRowToDetail({
      knowledgeId: 'p:story:c1',
      cardType: 'story_reading',
      sortOrder: 1,
      content: JSON.stringify(content),
    });
    expect(detail?.cardType).toBe('story_reading');
    expect(detail?.headword).toBe('The Pea');
  });

  it('非法 content 返回 null', () => {
    const detail = mapCardRowToDetail({
      knowledgeId: 'p:en:word:hi',
      cardType: 'vocabulary',
      sortOrder: 1,
      content: '{not-json',
    });
    expect(detail).toBeNull();
  });
});
