import { endOfLocalReviewDay } from './local-review-day.js';

export interface ReviewSessionDueItem {
  knowledgeId: string;
  dueAt: string;
}

export interface BuildReviewSessionPlanInput {
  dueItems: ReviewSessionDueItem[];
  dailyReviewLimit: number;
  todayReviewCompletedCount: number;
  now: Date;
  timeZone: string;
}

export interface ReviewSessionPlan {
  sessionKnowledgeIds: string[];
  remainingDueCount: number;
}

function compareDueItems(left: ReviewSessionDueItem, right: ReviewSessionDueItem): number {
  const dueCompare = left.dueAt.localeCompare(right.dueAt);
  if (dueCompare !== 0) {
    return dueCompare;
  }
  return left.knowledgeId.localeCompare(right.knowledgeId);
}

export function buildReviewSessionPlan(input: BuildReviewSessionPlanInput): ReviewSessionPlan {
  const endOfDay = endOfLocalReviewDay(input.now, input.timeZone);
  const endOfDayMs = endOfDay.getTime();

  const dueNowItems = [...input.dueItems]
    .filter((item) => new Date(item.dueAt).getTime() <= endOfDayMs)
    .sort(compareDueItems);

  const remainingQuota = Math.max(input.dailyReviewLimit - input.todayReviewCompletedCount, 0);
  const sessionKnowledgeIds = dueNowItems.slice(0, remainingQuota).map((item) => item.knowledgeId);

  return {
    sessionKnowledgeIds,
    remainingDueCount: Math.max(dueNowItems.length - sessionKnowledgeIds.length, 0),
  };
}
