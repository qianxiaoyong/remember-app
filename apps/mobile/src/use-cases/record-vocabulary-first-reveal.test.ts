import { describe, expect, it, vi } from 'vitest';

vi.mock('../lib/get-device-time-zone', () => ({
  getDeviceTimeZone: vi.fn(() => 'Asia/Shanghai'),
}));

vi.mock('./resolve-content-pack-id', () => ({
  resolveContentPackId: vi.fn((packId: string) => packId),
}));

vi.mock('./insert-activity-event', () => ({
  insertActivityEvent: vi.fn(),
}));

import { insertActivityEvent } from './insert-activity-event';
import { recordVocabularyFirstReveal } from './record-vocabulary-first-reveal';

describe('recordVocabularyFirstReveal', () => {
  it('writes vocabulary_first_reveal with headword and sortOrder', () => {
    const now = new Date('2026-08-09T10:00:00+08:00');

    recordVocabularyFirstReveal({
      catalogPackId: 'pack-a',
      knowledgeId: 'pack-a:en:word:apple',
      headword: 'apple',
      sortOrder: 5,
      now,
    });

    expect(insertActivityEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'vocabulary_first_reveal',
        packId: 'pack-a',
        knowledgeId: 'pack-a:en:word:apple',
        displayLabel: 'apple',
        localDate: '2026-08-09',
        payload: { sortOrder: 5 },
      }),
    );
  });
});
