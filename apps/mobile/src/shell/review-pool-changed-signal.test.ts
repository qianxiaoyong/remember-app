import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../use-cases/get-review-tab-summary', () => ({
  bumpCachedReviewableDueTotal: vi.fn(),
  invalidateReviewTabSummaryCache: vi.fn(),
}));

import {
  bumpCachedReviewableDueTotal,
  invalidateReviewTabSummaryCache,
} from '../use-cases/get-review-tab-summary';
import {
  markReviewPoolChanged,
  resetReviewPoolChangedSignalForTests,
  subscribeReviewPoolChanged,
} from './review-pool-changed-signal';

describe('reviewPoolChangedSignal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetReviewPoolChangedSignalForTests();
  });

  it('join_due 时增量更新缓存并通知 join_due', () => {
    const listener = vi.fn();
    subscribeReviewPoolChanged(listener);

    markReviewPoolChanged('join_due');

    expect(bumpCachedReviewableDueTotal).toHaveBeenCalledWith(1);
    expect(invalidateReviewTabSummaryCache).not.toHaveBeenCalled();
    expect(listener).toHaveBeenCalledWith('join_due');
  });

  it('refresh 时失效缓存并通知 refresh', () => {
    const listener = vi.fn();
    subscribeReviewPoolChanged(listener);

    markReviewPoolChanged('refresh');

    expect(invalidateReviewTabSummaryCache).toHaveBeenCalledOnce();
    expect(bumpCachedReviewableDueTotal).not.toHaveBeenCalled();
    expect(listener).toHaveBeenCalledWith('refresh');
  });
});
