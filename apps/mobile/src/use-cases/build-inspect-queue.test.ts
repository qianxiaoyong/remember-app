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
      completed: [
        {
          eventId: 's1',
          packId: 'story-pack',
          knowledgeId: 'story-pack:en:story:c1',
          displayLabel: '第一篇',
          occurredAt: '2026-08-09T11:00:00.000Z',
        },
        {
          eventId: 's2',
          packId: 'story-pack',
          knowledgeId: 'story-pack:en:story:c2',
          displayLabel: '第二篇',
          occurredAt: '2026-08-09T12:00:00.000Z',
        },
      ],
      counts: { completed: 2 },
    },
  })),
}));

import { buildInspectQueue, getInspectSubCategoryLabel } from './build-inspect-queue';

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

  it('uses updated inspect subcategory labels', () => {
    expect(getInspectSubCategoryLabel('pending')).toBe('待回忆');
    expect(getInspectSubCategoryLabel('joined_review')).toBe('已加复习');
    expect(getInspectSubCategoryLabel('skipped')).toBe('不加复习');
    expect(getInspectSubCategoryLabel('completed')).toBe('已听完');
  });

  it('returns story completed queue for the selected day', () => {
    const queue = buildInspectQueue({
      localDate: '2026-08-09',
      category: 'story',
      subCategory: 'completed',
    });

    expect(queue).toHaveLength(2);
    expect(queue[0]?.knowledgeId).toBe('story-pack:en:story:c1');
    expect(queue[1]?.knowledgeId).toBe('story-pack:en:story:c2');
  });
});
