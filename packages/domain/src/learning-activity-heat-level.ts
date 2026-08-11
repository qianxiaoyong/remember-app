export type HeatLevel = 0 | 1 | 2;

/** ADR 0014 §4.3：按 localDate 聚合当日 eventType 列表判定热力档位 */
export function calculateHeatLevel(eventTypes: readonly string[]): HeatLevel {
  if (eventTypes.length === 0) {
    return 0;
  }

  const LEARNING_EVENT_TYPES = new Set([
    'vocabulary_first_reveal',
    'vocabulary_join_review',
    'vocabulary_skip_review',
    'story_completed',
  ]);

  const hasReviewOutcome = eventTypes.includes('review_outcome');
  if (hasReviewOutcome) {
    return 2;
  }

  const hasLearningEvent = eventTypes.some((eventType) => LEARNING_EVENT_TYPES.has(eventType));
  return hasLearningEvent ? 1 : 0;
}
