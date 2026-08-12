import { formatLocalReviewDate } from '@remember/domain';
import {
  countDueReviewPoolItems,
  listDueReviewPoolItems,
} from '../data/repositories/learning-state-repository';
import { getReviewDailyStats } from '../data/repositories/review-daily-stats-repository';
import { getDailyReviewLimit } from '../data/repositories/user-preferences-repository';
import { getDeviceTimeZone } from '../lib/get-device-time-zone';
import { getReviewPoolVersion } from '../shell/review-pool-changed-signal';
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

let summaryCache: ReviewTabSummary | null = null;
let summaryCacheVersion = -1;

export function invalidateReviewTabSummaryCache(): void {
  summaryCache = null;
  summaryCacheVersion = -1;
}

export function bumpCachedReviewableDueTotal(delta: number): void {
  if (!summaryCache || delta === 0) {
    return;
  }
  summaryCache = {
    ...summaryCache,
    reviewableDueTotal: Math.max(0, summaryCache.reviewableDueTotal + delta),
  };
}

export function getReviewTabSummary(now: Date = new Date()): ReviewTabSummary {
  const version = getReviewPoolVersion();
  if (summaryCache && summaryCacheVersion === version) {
    return summaryCache;
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

  summaryCache = {
    dueTotal,
    reviewableDueTotal,
    dailyReviewLimit,
    todayReviewCompleted,
    remainingQuota,
    joinedPoolCountToday: stats.joinedPoolCount,
  };
  summaryCacheVersion = version;
  return summaryCache;
}
