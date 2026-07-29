import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../data/repositories/study-session-repository', () => ({
  findActiveSessionWithPendingItems: vi.fn(() => null),
}));

import { findActiveSessionWithPendingItems } from '../data/repositories/study-session-repository';
import { resolveAppLaunchTarget } from './resolve-app-launch-target';

describe('resolveAppLaunchTarget', () => {
  beforeEach(() => {
    vi.mocked(findActiveSessionWithPendingItems).mockReturnValue(null);
  });

  it('无活跃任务时进入我的知识库', () => {
    expect(resolveAppLaunchTarget()).toEqual({ kind: 'library' });
  });

  it('有 pending 任务时进入学习页', () => {
    vi.mocked(findActiveSessionWithPendingItems).mockReturnValue({
      sessionId: 'session-1',
      packId: 'remember-test-pack',
      status: 'active',
      createdAt: '2026-07-28T00:00:00.000Z',
      updatedAt: '2026-07-28T00:00:00.000Z',
    });
    expect(resolveAppLaunchTarget()).toEqual({
      kind: 'study',
      packId: 'remember-test-pack',
    });
  });
});
