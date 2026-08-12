import { endOfLocalReviewDay } from '@remember/domain';
import { resolveReviewCardContext } from './resolve-review-card-context';

/** join 后该词是否应计入 Tab 角标「到期可复习」数。 */
export function countsAsReviewableDueBadgeItem(input: {
  knowledgeId: string;
  dueAt: string;
  now: Date;
  timeZone: string;
}): boolean {
  const endOfDayMs = endOfLocalReviewDay(input.now, input.timeZone).getTime();
  if (new Date(input.dueAt).getTime() > endOfDayMs) {
    return false;
  }
  return resolveReviewCardContext(input.knowledgeId) !== null;
}
