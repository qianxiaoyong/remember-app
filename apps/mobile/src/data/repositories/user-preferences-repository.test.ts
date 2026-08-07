import { describe, expect, it, vi } from 'vitest';

vi.mock('../user-db/open-user-database', () => ({
  openUserDatabase: vi.fn(),
}));

import {
  getDailyReviewLimit,
  getPackOpenPosition,
  getUserPreference,
  PREFERENCE_DAILY_REVIEW_LIMIT,
  PREFERENCE_PACK_OPEN_POSITION,
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
});
