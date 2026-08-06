import { describe, expect, it, vi } from 'vitest';

vi.mock('./join-review-pool', () => ({
  joinReviewPool: vi.fn(),
}));

import { joinReviewPool } from './join-review-pool';
import { rejoinCardReview } from './rejoin-card-review';

describe('rejoinCardReview', () => {
  it('委托 joinReviewPool 幂等入池', () => {
    vi.mocked(joinReviewPool).mockReturnValue({ status: 'already_in_pool' });

    const result = rejoinCardReview({
      packId: 'remember-test-pack',
      knowledgeId: 'remember-test-pack:en:word:hello',
    });

    expect(joinReviewPool).toHaveBeenCalledWith({
      knowledgeId: 'remember-test-pack:en:word:hello',
      catalogPackId: 'remember-test-pack',
      now: undefined,
    });
    expect(result).toEqual({ status: 'already_in_pool' });
  });
});
