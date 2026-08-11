export type ReviewOutcomeSubCategory = 'remembered' | 'not_familiar';

interface ReviewOutcomeRelatedEvent {
  eventType: string;
  occurredAt: string;
  outcome?: ReviewOutcomeSubCategory;
}

/**
 * ADR 0014：同一 packId+knowledgeId 在目标日可能有多条 review_outcome，
 * 日历子类以最后一次结果为准。
 */
export function resolveLatestReviewOutcomeSubCategory(
  events: readonly ReviewOutcomeRelatedEvent[],
): ReviewOutcomeSubCategory | null {
  let latest: ReviewOutcomeRelatedEvent | null = null;

  for (const event of events) {
    if (event.eventType !== 'review_outcome' || !event.outcome) {
      continue;
    }
    if (!latest || event.occurredAt > latest.occurredAt) {
      latest = event;
    }
  }

  return latest?.outcome ?? null;
}
