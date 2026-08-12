import { formatLocalReviewDate } from '@remember/domain';
import {
  countDueReviewPoolItems,
  listDueReviewPoolItems,
} from '../data/repositories/learning-state-repository';
import { getReviewDailyStats } from '../data/repositories/review-daily-stats-repository';
import { getDailyReviewLimit } from '../data/repositories/user-preferences-repository';
import { getDeviceTimeZone } from '../lib/get-device-time-zone';
import { getReviewPoolVersion } from '../shell/review-pool-changed-signal';
import {
  bumpCachedReviewableDueTotal,
  invalidateReviewTabSummaryCache,
  readReviewTabSummaryCache,
  writeReviewTabSummaryCache,
} from '../shell/review-tab-summary-cache';
import { countReviewableDueReviewPoolItems } from './count-reviewable-pool-items';

export interface ReviewTabSummary {
  /** 复习池内到期词条总数（含已卸载包） */
  dueTotal: number;
  /** 当前可实际复习的到期词条数 */
  reviewableDueTotal: number;
  dailyReviewLimit: number;
  todayReviewCompleted: number;
  remainingQuota: number;
  joinedPoolCountToday: number;
}

export { bumpCachedReviewableDueTotal, invalidateReviewTabSummaryCache };

export function getReviewTabSummary(now: Date = new Date()): ReviewTabSummary {
  const version = getReviewPoolVersion();
  const cached = readReviewTabSummaryCache(version);
  if (cached) {
    return cached;
  }

  const timeZone = getDeviceTimeZone();
  const localDate = formatLocalReviewDate(now, timeZone);
  const dailyReviewLimit = getDailyReviewLimit();
  const stats = getReviewDailyStats(localDate);
  const dueItems = listDueReviewPoolItems(now, timeZone);
  const dueTotal = countDueReviewPoolItems(now, timeZone);
  const reviewableDueTotal = countReviewableDueReviewPoolItems(dueItems);
  const todayReviewCompleted = stats.reviewCompletedCount;
  const remainingQuota = Math.max(dailyReviewLimit - todayReviewCompleted, 0);

  const summary: ReviewTabSummary = {
    dueTotal,
    reviewableDueTotal,
    dailyReviewLimit,
    todayReviewCompleted,
    remainingQuota,
    joinedPoolCountToday: stats.joinedPoolCount,
  };
  writeReviewTabSummaryCache(summary, version);
  return summary;
}
