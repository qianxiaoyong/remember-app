import { describe, expect, it, vi } from 'vitest';

vi.mock('../data/repositories/learning-activity-event-repository', () => ({
  listEventsByLocalDate: vi.fn(),
}));

import { listEventsByLocalDate } from '../data/repositories/learning-activity-event-repository';
import { getLearningCalendarDayDetail } from './get-learning-calendar-day-detail';

describe('getLearningCalendarDayDetail', () => {
  it('groups first contact by subcategory on same day', () => {
    vi.mocked(listEventsByLocalDate).mockReturnValue([
      {
        eventId: 'e1',
        localDate: '2026-08-09',
        occurredAt: '2026-08-09T10:00:00.000Z',
        eventType: 'vocabulary_first_reveal',
        packId: 'pack-a',
        knowledgeId: 'kid-1',
        displayLabel: 'apple',
        payload: '{}',
      },
      {
        eventId: 'e2',
        localDate: '2026-08-09',
        occurredAt: '2026-08-09T10:05:00.000Z',
        eventType: 'vocabulary_join_review',
        packId: 'pack-a',
        knowledgeId: 'kid-1',
        displayLabel: 'apple',
        payload: '{}',
      },
      {
        eventId: 'e3',
        localDate: '2026-08-09',
        occurredAt: '2026-08-09T11:00:00.000Z',
        eventType: 'vocabulary_first_reveal',
        packId: 'pack-a',
        knowledgeId: 'kid-2',
        displayLabel: 'banana',
        payload: '{}',
      },
      {
        eventId: 'e4',
        localDate: '2026-08-09',
        occurredAt: '2026-08-09T12:00:00.000Z',
        eventType: 'review_outcome',
        packId: 'pack-a',
        knowledgeId: 'kid-3',
        displayLabel: 'cat',
        payload: JSON.stringify({ outcome: 'remembered', modality: 'vocabulary' }),
      },
    ]);

    const detail = getLearningCalendarDayDetail('2026-08-09');

    expect(detail.firstContact.counts.joinedReview).toBe(1);
    expect(detail.firstContact.counts.pending).toBe(1);
    expect(detail.review.counts.remembered).toBe(1);
  });
});
