import { describe, expect, it } from 'vitest';
import { resolveLatestReviewOutcomeSubCategory } from './classify-review-outcome.js';

describe('resolveLatestReviewOutcomeSubCategory', () => {
  it('returns remembered for a single outcome event', () => {
    expect(
      resolveLatestReviewOutcomeSubCategory([
        {
          eventType: 'review_outcome',
          occurredAt: '2026-08-14T10:00:00.000Z',
          outcome: 'remembered',
        },
      ]),
    ).toBe('remembered');
  });

  it('uses the latest outcome when a word is re-reviewed on the same day', () => {
    expect(
      resolveLatestReviewOutcomeSubCategory([
        {
          eventType: 'review_outcome',
          occurredAt: '2026-08-14T10:00:00.000Z',
          outcome: 'remembered',
        },
        {
          eventType: 'review_outcome',
          occurredAt: '2026-08-14T11:00:00.000Z',
          outcome: 'not_familiar',
        },
      ]),
    ).toBe('not_familiar');
  });

  it('ignores non review_outcome events', () => {
    expect(
      resolveLatestReviewOutcomeSubCategory([
        {
          eventType: 'vocabulary_first_reveal',
          occurredAt: '2026-08-14T09:00:00.000Z',
        },
        {
          eventType: 'review_outcome',
          occurredAt: '2026-08-14T10:00:00.000Z',
          outcome: 'remembered',
        },
      ]),
    ).toBe('remembered');
  });
});
