import { describe, expect, it, vi } from 'vitest';

vi.mock('../user-db/open-user-database', () => ({
  openUserDatabase: vi.fn(),
}));

import {
  countDistinctActiveDays,
  countEventsByTypeInRange,
  hasFirstRevealEvent,
  insertLearningActivityEvent,
  listEventsByLocalDate,
} from './learning-activity-event-repository';

describe('learning-activity-event-repository', () => {
  it('hasFirstRevealEvent 查询 packId+knowledgeId 是否存在 first_reveal', () => {
    const db = {
      getFirstSync: vi.fn(() => ({ count: 1 })),
      runSync: vi.fn(),
      getAllSync: vi.fn(),
    };

    expect(hasFirstRevealEvent('pack-a', 'kid-1', db as never)).toBe(true);
    expect(db.getFirstSync).toHaveBeenCalledWith(
      expect.stringContaining("eventType = 'vocabulary_first_reveal'"),
      ['pack-a', 'kid-1'],
    );
  });

  it('insertLearningActivityEvent 写入一行', () => {
    const runSync = vi.fn();
    const db = { runSync, getFirstSync: vi.fn(), getAllSync: vi.fn() };

    insertLearningActivityEvent(
      {
        eventId: 'evt-1',
        localDate: '2026-08-09',
        occurredAt: '2026-08-09T10:00:00.000Z',
        eventType: 'vocabulary_first_reveal',
        packId: 'pack-a',
        knowledgeId: 'kid-1',
        displayLabel: 'apple',
        payload: '{}',
      },
      db as never,
    );

    expect(runSync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO learning_activity_events'),
      expect.arrayContaining(['evt-1', '2026-08-09', 'pack-a', 'kid-1', 'apple']),
    );
  });

  it('listEventsByLocalDate 按日期查询', () => {
    const rows = [{ eventId: 'evt-1', localDate: '2026-08-09' }];
    const db = {
      getAllSync: vi.fn(() => rows),
      getFirstSync: vi.fn(),
      runSync: vi.fn(),
    };

    expect(listEventsByLocalDate('2026-08-09', db as never)).toEqual(rows);
  });

  it('countDistinctActiveDays 统计去重天数', () => {
    const db = {
      getFirstSync: vi.fn(() => ({ count: 5 })),
      runSync: vi.fn(),
      getAllSync: vi.fn(),
    };

    expect(countDistinctActiveDays('2026-05-01', '2026-08-09', db as never)).toBe(5);
  });

  it('countEventsByTypeInRange 按类型计数', () => {
    const db = {
      getFirstSync: vi.fn(() => ({ count: 12 })),
      runSync: vi.fn(),
      getAllSync: vi.fn(),
    };

    expect(
      countEventsByTypeInRange({
        eventType: 'review_outcome',
        startDate: '2026-05-01',
        endDate: '2026-08-09',
        db: db as never,
      }),
    ).toBe(12);
  });
});
