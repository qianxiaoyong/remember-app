import { describe, expect, it, vi } from 'vitest';

vi.mock('./get-learning-calendar-day-detail', () => ({
  getLearningCalendarDayDetail: vi.fn(() => ({
    localDate: '2026-08-09',
    firstContact: {
      pending: [
        {
          eventId: 'e1',
          packId: 'pack-a',
          knowledgeId: 'kid-1',
          displayLabel: 'apple',
          occurredAt: '2026-08-09T10:00:00.000Z',
          subCategory: 'pending' as const,
        },
      ],
      joinedReview: [],
      skipped: [],
      counts: { pending: 1, joinedReview: 0, skipped: 0, total: 1 },
    },
    review: {
      remembered: [],
      notFamiliar: [],
      counts: { remembered: 0, notFamiliar: 0, total: 0 },
    },
    story: {
      completed: [],
      counts: { completed: 0 },
    },
  })),
}));

import { buildInspectQueue } from './build-inspect-queue';

describe('buildInspectQueue', () => {
  it('returns study queue items for pending first contact', () => {
    const queue = buildInspectQueue({
      localDate: '2026-08-09',
      category: 'first_contact',
      subCategory: 'pending',
    });

    expect(queue).toHaveLength(1);
    expect(queue[0]?.mode).toBe('study');
    expect(queue[0]?.displayLabel).toBe('apple');
  });
});
