import { resolveReviewCardContext } from '../use-cases/resolve-review-card-context';
import type { ReviewTabSummary } from '../use-cases/get-review-tab-summary';
import type { ActiveStudySession } from '../use-cases/study-session-types';

export const EMPTY_REVIEW_SUMMARY: ReviewTabSummary = {
  dueTotal: 0,
  reviewableDueTotal: 0,
  dailyReviewLimit: 20,
  todayReviewCompleted: 0,
  remainingQuota: 20,
  joinedPoolCountToday: 0,
};

export function sessionHasLoadableCurrentItem(session: ActiveStudySession | null): boolean {
  if (!session?.currentItem) {
    return false;
  }
  return resolveReviewCardContext(session.currentItem.knowledgeId)?.cardDetail != null;
}
