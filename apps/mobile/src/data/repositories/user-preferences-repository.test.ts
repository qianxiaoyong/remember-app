import { describe, expect, it, vi } from 'vitest';

vi.mock('../user-db/open-user-database', () => ({
  openUserDatabase: vi.fn(),
}));

import {
  getDailyReviewLimit,
  getPackOpenPosition,
  getRecallAutoPlayCount,
  getUserPreference,
  PREFERENCE_DAILY_REVIEW_LIMIT,
  PREFERENCE_PACK_OPEN_POSITION,
  PREFERENCE_RECALL_AUTO_PLAY,
  setUserPreference,
} from './user-preferences-repository';

describe('user-preferences-repository', () => {
  it('读取默认值', () => {
    const db = {
      getFirstSync: vi.fn(() => null),
      runSync: vi.fn(),
    };

    expect(getUserPreference('missing', 'default', db as never)).toBe('default');
    expect(getDailyReviewLimit(db as never)).toBe(20);
    expect(getPackOpenPosition(db as never)).toBe('bookmark');
    expect(getRecallAutoPlayCount(db as never)).toBe(2);
  });

  it('写入并读取用户偏好', () => {
    const store = new Map<string, string>();
    const db = {
      getFirstSync: vi.fn((_sql: string, params: readonly unknown[]) => {
        const value = store.get(String(params[0]));
        return value ? { value } : null;
      }),
      runSync: vi.fn((_sql: string, params: readonly unknown[]) => {
        store.set(String(params[0]), String(params[1]));
      }),
    };

    setUserPreference({
      key: PREFERENCE_DAILY_REVIEW_LIMIT,
      value: '30',
      updatedAt: '2026-08-06T00:00:00.000Z',
      db: db as never,
    });
    setUserPreference({
      key: PREFERENCE_PACK_OPEN_POSITION,
      value: 'start',
      updatedAt: '2026-08-06T00:00:00.000Z',
      db: db as never,
    });

    expect(getDailyReviewLimit(db as never)).toBe(30);
    expect(getPackOpenPosition(db as never)).toBe('start');
  });

  it('回忆页自动发音次数读写与旧布尔值迁移', () => {
    const store = new Map<string, string>();
    const db = {
      getFirstSync: vi.fn((_sql: string, params: readonly unknown[]) => {
        const value = store.get(String(params[0]));
        return value ? { value } : null;
      }),
      runSync: vi.fn((_sql: string, params: readonly unknown[]) => {
        store.set(String(params[0]), String(params[1]));
      }),
    };

    expect(getRecallAutoPlayCount(db as never)).toBe(2);

    setUserPreference({
      key: PREFERENCE_RECALL_AUTO_PLAY,
      value: 'false',
      updatedAt: '2026-08-06T00:00:00.000Z',
      db: db as never,
    });
    expect(getRecallAutoPlayCount(db as never)).toBe(0);

    setUserPreference({
      key: PREFERENCE_RECALL_AUTO_PLAY,
      value: 'true',
      updatedAt: '2026-08-06T00:00:00.000Z',
      db: db as never,
    });
    expect(getRecallAutoPlayCount(db as never)).toBe(2);

    setUserPreference({
      key: PREFERENCE_RECALL_AUTO_PLAY,
      value: '5',
      updatedAt: '2026-08-06T00:00:00.000Z',
      db: db as never,
    });
    expect(getRecallAutoPlayCount(db as never)).toBe(5);
  });
});
