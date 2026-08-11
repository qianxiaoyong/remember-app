import { describe, expect, it } from 'vitest';
import { calculateHeatLevel } from './learning-activity-heat-level.js';

describe('calculateHeatLevel', () => {
  it('returns 0 when no events', () => {
    expect(calculateHeatLevel([])).toBe(0);
  });

  it('returns 1 for learning events without review_outcome', () => {
    expect(calculateHeatLevel(['vocabulary_first_reveal'])).toBe(1);
    expect(calculateHeatLevel(['vocabulary_join_review', 'vocabulary_skip_review'])).toBe(1);
  });

  it('returns 2 when review_outcome present even with learning events', () => {
    expect(calculateHeatLevel(['vocabulary_first_reveal', 'review_outcome'])).toBe(2);
  });

  it('returns 0 for unknown event types only', () => {
    expect(calculateHeatLevel(['unknown_event'])).toBe(0);
  });
});
