import { formatLocalReviewDate } from '@remember/domain';
import { countDueReviewPoolItems } from '../data/repositories/learning-state-repository';
import { getReviewDailyStats } from '../data/repositories/review-daily-stats-repository';
import { getDailyReviewLimit } from '../data/repositories/user-preferences-repository';
import { getDeviceTimeZone } from '../lib/get-device-time-zone';

export interface ReviewTabSummary {
  dueTotal: number;
  dailyReviewLimit: number;
  todayReviewCompleted: number;
  remainingQuota: number;
  joinedPoolCountToday: number;
}

export function getReviewTabSummary(now: Date = new Date()): ReviewTabSummary {
  const timeZone = getDeviceTimeZone();
  const localDate = formatLocalReviewDate(now, timeZone);
  const dailyReviewLimit = getDailyReviewLimit();
  const stats = getReviewDailyStats(localDate);
  const dueTotal = countDueReviewPoolItems(now, timeZone);
  const todayReviewCompleted = stats.reviewCompletedCount;
  const remainingQuota = Math.max(dailyReviewLimit - todayReviewCompleted, 0);

  return {
    dueTotal,
    dailyReviewLimit,
    todayReviewCompleted,
    remainingQuota,
    joinedPoolCountToday: stats.joinedPoolCount,
  };
}
