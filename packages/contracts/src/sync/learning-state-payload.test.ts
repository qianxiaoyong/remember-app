import { describe, expect, it } from 'vitest';
import {
  reviewOutcomeSchema,
  syncLearningStatePayloadSchema,
} from './learning-state-payload.js';

const sampleV2Payload = {
  inReviewPool: true,
  boxLevel: 1,
  dueAt: '2026-08-06T16:00:00.000Z',
  firstAddedFromPackId: 'remember-test-pack',
  updatedAt: '2026-08-06T07:00:00.000Z',
};

describe('syncLearningStatePayloadSchema v2', () => {
  it('parses review pool fields', () => {
    const payload = syncLearningStatePayloadSchema.parse({
      ...sampleV2Payload,
      outcome: 'passed',
      lastSeenInPackId: 'story-test-pack',
    });
    expect(payload.boxLevel).toBe(1);
    expect(payload.outcome).toBe('passed');
  });

  it('accepts optional legacy SM-2 read-only fields', () => {
    const payload = syncLearningStatePayloadSchema.parse({
      ...sampleV2Payload,
      legacyEasiness: 2.5,
      legacyIntervalDays: 6,
      legacyRepetitions: 2,
    });
    expect(payload.legacyRepetitions).toBe(2);
  });

  it('rejects removed SM-2 top-level fields', () => {
    expect(() =>
      syncLearningStatePayloadSchema.parse({
        packId: 'remember-test-pack',
        easiness: 2.5,
        intervalDays: 1,
        repetitions: 1,
        dueAt: '2026-08-06T16:00:00.000Z',
        updatedAt: '2026-08-06T07:00:00.000Z',
      }),
    ).toThrow();

    expect(() =>
      syncLearningStatePayloadSchema.parse({
        ...sampleV2Payload,
        rating: 'good',
      }),
    ).toThrow();
  });

  it('rejects unknown fields', () => {
    expect(() =>
      syncLearningStatePayloadSchema.parse({
        ...sampleV2Payload,
        extra: true,
      }),
    ).toThrow();
  });
});

describe('reviewOutcomeSchema', () => {
  it('accepts passed and failed', () => {
    expect(reviewOutcomeSchema.parse('passed')).toBe('passed');
    expect(reviewOutcomeSchema.parse('failed')).toBe('failed');
  });
});
