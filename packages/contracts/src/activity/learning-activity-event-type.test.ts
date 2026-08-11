import { describe, expect, it } from 'vitest';
import {
  LearningActivityEventType,
  isLearningActivityEventType,
  parseActivityPayload,
} from './learning-activity-event-type.js';

describe('parseActivityPayload', () => {
  it('parses vocabulary_first_reveal payload', () => {
    const payload = parseActivityPayload(
      LearningActivityEventType.VOCABULARY_FIRST_REVEAL,
      JSON.stringify({ sortOrder: 3 }),
    );
    expect(payload).toEqual({ sortOrder: 3 });
  });

  it('parses review_outcome payload', () => {
    const payload = parseActivityPayload(
      LearningActivityEventType.REVIEW_OUTCOME,
      JSON.stringify({ outcome: 'remembered', modality: 'vocabulary', boxLevelAfter: 1 }),
    );
    expect(payload.outcome).toBe('remembered');
    expect(payload.modality).toBe('vocabulary');
  });

  it('accepts optional source on join_review payload', () => {
    const payload = parseActivityPayload(
      LearningActivityEventType.VOCABULARY_JOIN_REVIEW,
      JSON.stringify({ created: true, source: 'calendar_inspect' }),
    );
    expect(payload.source).toBe('calendar_inspect');
    expect(payload.created).toBe(true);
  });

  it('rejects unknown keys in payload', () => {
    expect(() =>
      parseActivityPayload(
        LearningActivityEventType.VOCABULARY_SKIP_REVIEW,
        JSON.stringify({ sortOrder: 1, extra: true }),
      ),
    ).toThrow(/invalid activity payload/);
  });

  it('rejects invalid JSON', () => {
    expect(() =>
      parseActivityPayload(LearningActivityEventType.STORY_COMPLETED, '{not json'),
    ).toThrow(/not valid JSON/);
  });
});

describe('isLearningActivityEventType', () => {
  it('returns true for learning class events', () => {
    expect(isLearningActivityEventType(LearningActivityEventType.VOCABULARY_FIRST_REVEAL)).toBe(
      true,
    );
    expect(isLearningActivityEventType(LearningActivityEventType.STORY_COMPLETED)).toBe(true);
  });

  it('returns false for review_outcome', () => {
    expect(isLearningActivityEventType(LearningActivityEventType.REVIEW_OUTCOME)).toBe(false);
  });
});
