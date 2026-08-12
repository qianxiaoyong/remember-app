import { formatLocalReviewDate } from '@remember/domain';
import {
  countDueReviewPoolItems,
  listDueReviewPoolItems,
} from '../data/repositories/learning-state-repository';
import { getReviewDailyStats } from '../data/repositories/review-daily-stats-repository';
import { getDailyReviewLimit } from '../data/repositories/user-preferences-repository';
import { getDeviceTimeZone } from '../lib/get-device-time-zone';
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

export function getReviewTabSummary(now: Date = new Date()): ReviewTabSummary {
  const timeZone = getDeviceTimeZone();
  const localDate = formatLocalReviewDate(now, timeZone);
  const dailyReviewLimit = getDailyReviewLimit();
  const stats = getReviewDailyStats(localDate);
  const dueItems = listDueReviewPoolItems(now, timeZone);
  const dueTotal = countDueReviewPoolItems(now, timeZone);
  const reviewableDueTotal = countReviewableDueReviewPoolItems(dueItems);
  const todayReviewCompleted = stats.reviewCompletedCount;
  const remainingQuota = Math.max(dailyReviewLimit - todayReviewCompleted, 0);

  return {
    dueTotal,
    reviewableDueTotal,
    dailyReviewLimit,
    todayReviewCompleted,
    remainingQuota,
    joinedPoolCountToday: stats.joinedPoolCount,
  };
}
