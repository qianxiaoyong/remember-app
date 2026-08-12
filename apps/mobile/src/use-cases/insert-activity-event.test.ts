import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../data/user-db/open-user-database', () => ({
  openUserDatabase: vi.fn(),
}));

vi.mock('../data/create-record-id', () => ({
  createRecordId: vi.fn(() => 'activity-test-id'),
}));

vi.mock('../data/repositories/learning-activity-event-repository', () => ({
  hasFirstRevealEvent: vi.fn(),
  hasStoryCompletedEvent: vi.fn(),
  insertLearningActivityEvent: vi.fn(),
}));

vi.mock('../shell/learning-calendar-refresh-signal', () => ({
  markLearningCalendarNeedsRefresh: vi.fn(),
}));

import {
  hasFirstRevealEvent,
  insertLearningActivityEvent,
} from '../data/repositories/learning-activity-event-repository';
import { markLearningCalendarNeedsRefresh } from '../shell/learning-calendar-refresh-signal';
import { insertActivityEvent } from './insert-activity-event';

describe('insertActivityEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('skips duplicate vocabulary_first_reveal for same packId+knowledgeId', () => {
    vi.mocked(hasFirstRevealEvent).mockReturnValue(true);

    insertActivityEvent({
      localDate: '2026-08-09',
      occurredAt: '2026-08-09T10:00:00.000Z',
      eventType: 'vocabulary_first_reveal',
      packId: 'pack-a',
      knowledgeId: 'kid-1',
      displayLabel: 'apple',
    });

    expect(insertLearningActivityEvent).not.toHaveBeenCalled();
  });

  it('inserts when first_reveal does not exist', () => {
    vi.mocked(hasFirstRevealEvent).mockReturnValue(false);

    insertActivityEvent({
      localDate: '2026-08-09',
      occurredAt: '2026-08-09T10:00:00.000Z',
      eventType: 'vocabulary_first_reveal',
      packId: 'pack-a',
      knowledgeId: 'kid-1',
      displayLabel: 'apple',
      payload: { sortOrder: 3 },
    });

    expect(insertLearningActivityEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'vocabulary_first_reveal',
        packId: 'pack-a',
        knowledgeId: 'kid-1',
        payload: JSON.stringify({ sortOrder: 3 }),
      }),
    );
    expect(markLearningCalendarNeedsRefresh).toHaveBeenCalledOnce();
  });

  it('does not throw when insert fails', () => {
    vi.mocked(hasFirstRevealEvent).mockReturnValue(false);
    vi.mocked(insertLearningActivityEvent).mockImplementation(() => {
      throw new Error('db error');
    });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {
      /* suppress expected warning */
    });

    expect(() => {
      insertActivityEvent({
        localDate: '2026-08-09',
        occurredAt: '2026-08-09T10:00:00.000Z',
        eventType: 'vocabulary_join_review',
        packId: 'pack-a',
        knowledgeId: 'kid-1',
      });
    }).not.toThrow();

    expect(warnSpy).toHaveBeenCalled();
    expect(markLearningCalendarNeedsRefresh).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
