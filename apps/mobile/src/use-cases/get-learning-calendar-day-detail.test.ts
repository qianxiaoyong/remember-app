import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../data/repositories/learning-activity-event-repository', () => ({
  listEventsByLocalDate: vi.fn(),
}));

import { listEventsByLocalDate } from '../data/repositories/learning-activity-event-repository';
import { getLearningCalendarDayDetail } from './get-learning-calendar-day-detail';

describe('getLearningCalendarDayDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
    expect(detail.firstContact.counts.total).toBe(2);
    expect(
      detail.firstContact.counts.pending +
        detail.firstContact.counts.joinedReview +
        detail.firstContact.counts.skipped,
    ).toBe(detail.firstContact.counts.total);
    expect(detail.review.counts.remembered).toBe(1);
  });

  it('uses latest review outcome per word on the same day', () => {
    vi.mocked(listEventsByLocalDate).mockReturnValue([
      {
        eventId: 'e1',
        localDate: '2026-08-14',
        occurredAt: '2026-08-14T10:00:00.000Z',
        eventType: 'review_outcome',
        packId: 'pack-a',
        knowledgeId: 'kid-1',
        displayLabel: 'am',
        payload: JSON.stringify({ outcome: 'remembered', modality: 'vocabulary' }),
      },
      {
        eventId: 'e2',
        localDate: '2026-08-14',
        occurredAt: '2026-08-14T11:00:00.000Z',
        eventType: 'review_outcome',
        packId: 'pack-a',
        knowledgeId: 'kid-1',
        displayLabel: 'am',
        payload: JSON.stringify({ outcome: 'not_familiar', modality: 'vocabulary' }),
      },
      {
        eventId: 'e3',
        localDate: '2026-08-14',
        occurredAt: '2026-08-14T12:00:00.000Z',
        eventType: 'review_outcome',
        packId: 'pack-a',
        knowledgeId: 'kid-2',
        displayLabel: 'go',
        payload: JSON.stringify({ outcome: 'remembered', modality: 'vocabulary' }),
      },
    ]);

    const detail = getLearningCalendarDayDetail('2026-08-14');

    expect(detail.review.counts.remembered).toBe(1);
    expect(detail.review.counts.notFamiliar).toBe(1);
    expect(detail.review.counts.total).toBe(2);
    expect(detail.review.remembered[0]?.knowledgeId).toBe('kid-2');
    expect(detail.review.notFamiliar[0]?.knowledgeId).toBe('kid-1');
  });

  it('loads same-day events once per section when classifying first contact words', () => {
    vi.mocked(listEventsByLocalDate).mockReturnValue(
      Array.from({ length: 5 }, (_, index) => ({
        eventId: `reveal-${String(index)}`,
        localDate: '2026-08-09',
        occurredAt: `2026-08-09T10:0${String(index)}:00.000Z`,
        eventType: 'vocabulary_first_reveal',
        packId: 'pack-a',
        knowledgeId: `kid-${String(index)}`,
        displayLabel: `word-${String(index)}`,
        payload: '{}',
      })),
    );

    getLearningCalendarDayDetail('2026-08-09');

    expect(listEventsByLocalDate).toHaveBeenCalledTimes(3);
  });
});
