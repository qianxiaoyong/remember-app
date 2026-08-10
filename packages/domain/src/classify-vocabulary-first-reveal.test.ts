import { describe, expect, it } from 'vitest';
import { classifyFirstRevealSubCategory } from './classify-vocabulary-first-reveal.js';

describe('classifyFirstRevealSubCategory', () => {
  it('returns pending when only first_reveal', () => {
    expect(classifyFirstRevealSubCategory([{ eventType: 'vocabulary_first_reveal' }])).toBe(
      'pending',
    );
  });

  it('returns joined_review when join event exists', () => {
    expect(
      classifyFirstRevealSubCategory([
        { eventType: 'vocabulary_first_reveal' },
        { eventType: 'vocabulary_join_review' },
      ]),
    ).toBe('joined_review');
  });

  it('returns skipped when skip event exists without join', () => {
    expect(
      classifyFirstRevealSubCategory([
        { eventType: 'vocabulary_first_reveal' },
        { eventType: 'vocabulary_skip_review' },
      ]),
    ).toBe('skipped');
  });

  it('prefers joined_review over skipped when both exist', () => {
    expect(
      classifyFirstRevealSubCategory([
        { eventType: 'vocabulary_skip_review' },
        { eventType: 'vocabulary_join_review' },
      ]),
    ).toBe('joined_review');
  });
});
