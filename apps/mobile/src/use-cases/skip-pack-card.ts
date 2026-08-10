import { writeSkipReviewActivityEvent } from './write-activity-event-from-review';

export function skipPackCard(input: {
  packId: string;
  knowledgeId: string;
  displayLabel?: string;
  sortOrder?: number;
  activitySource?: 'browse' | 'review_tab' | 'calendar_inspect';
  now?: Date;
}): void {
  if (!input.displayLabel) {
    return;
  }

  writeSkipReviewActivityEvent({
    catalogPackId: input.packId,
    knowledgeId: input.knowledgeId,
    displayLabel: input.displayLabel,
    ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
    ...(input.activitySource ? { source: input.activitySource } : {}),
    ...(input.now ? { now: input.now } : {}),
  });
}
