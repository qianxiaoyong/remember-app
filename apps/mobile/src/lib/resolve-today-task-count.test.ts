import { describe, expect, it } from 'vitest';
import { resolveTodayTaskCount } from './resolve-today-task-count';

describe('resolveTodayTaskCount', () => {
  it('有进行中 session 时优先用队列剩余数', () => {
    expect(resolveTodayTaskCount({ pendingSessionCount: 2, sm2DueCount: 5 })).toBe(2);
  });

  it('无 session 队列时使用 SM-2 到期数', () => {
    expect(resolveTodayTaskCount({ pendingSessionCount: 0, sm2DueCount: 3 })).toBe(3);
  });

  it('两者均为 0 时返回 0', () => {
    expect(resolveTodayTaskCount({ pendingSessionCount: 0, sm2DueCount: 0 })).toBe(0);
  });
});
