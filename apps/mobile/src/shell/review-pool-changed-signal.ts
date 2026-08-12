import {
  bumpCachedReviewableDueTotal,
  invalidateReviewTabSummaryCache,
} from './review-tab-summary-cache';

export type ReviewPoolChangeReason = 'refresh' | 'join_due';

let reviewPoolVersion = 0;
const listeners = new Set<(reason: ReviewPoolChangeReason) => void>();

export function markReviewPoolChanged(reason: ReviewPoolChangeReason = 'refresh'): void {
  reviewPoolVersion += 1;
  if (reason === 'join_due') {
    bumpCachedReviewableDueTotal(1);
  } else {
    invalidateReviewTabSummaryCache();
  }
  for (const listener of listeners) {
    listener(reason);
  }
}

export function getReviewPoolVersion(): number {
  return reviewPoolVersion;
}

export function subscribeReviewPoolChanged(
  listener: (reason: ReviewPoolChangeReason) => void,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function resetReviewPoolChangedSignalForTests(): void {
  reviewPoolVersion = 0;
  listeners.clear();
}
