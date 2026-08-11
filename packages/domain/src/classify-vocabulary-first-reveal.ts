export type FirstRevealSubCategory = 'pending' | 'joined_review' | 'skipped';

interface FirstRevealRelatedEvent {
  eventType: string;
}

/**
 * ADR 0014 §5.3：对同一 packId+knowledgeId 的 first_reveal 当日相关事件判定子类。
 * 调用方传入该词条在目标日（或截至日末）的事件列表。
 */
export function classifyFirstRevealSubCategory(
  events: readonly FirstRevealRelatedEvent[],
): FirstRevealSubCategory {
  const hasJoin = events.some((event) => event.eventType === 'vocabulary_join_review');
  if (hasJoin) {
    return 'joined_review';
  }

  const hasSkip = events.some((event) => event.eventType === 'vocabulary_skip_review');
  if (hasSkip) {
    return 'skipped';
  }

  return 'pending';
}
