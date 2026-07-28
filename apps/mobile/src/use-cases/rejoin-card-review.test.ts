import { describe, expect, it } from 'vitest';

export function shouldSkipRejoinBecauseAlreadyPending(
  alreadyPending: boolean,
  addedToQueue: boolean,
): boolean {
  return alreadyPending && !addedToQueue;
}

describe('rejoin-card-review helpers', () => {
  it('已在队列中的卡片不再重复加入', () => {
    expect(shouldSkipRejoinBecauseAlreadyPending(true, false)).toBe(true);
    expect(shouldSkipRejoinBecauseAlreadyPending(false, true)).toBe(false);
  });
});
