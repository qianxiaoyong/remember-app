import { describe, expect, it, vi } from 'vitest';

vi.mock('expo-sqlite', () => ({
  openDatabaseSync: vi.fn(),
}));

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
});
