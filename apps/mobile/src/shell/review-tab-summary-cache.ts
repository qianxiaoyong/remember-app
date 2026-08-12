export interface CachedReviewTabSummary {
  dueTotal: number;
  reviewableDueTotal: number;
  dailyReviewLimit: number;
  todayReviewCompleted: number;
  remainingQuota: number;
  joinedPoolCountToday: number;
}

let summaryCache: CachedReviewTabSummary | null = null;
let summaryCacheVersion = -1;

export function readReviewTabSummaryCache(version: number): CachedReviewTabSummary | null {
  if (summaryCache && summaryCacheVersion === version) {
    return summaryCache;
  }
  return null;
}

export function writeReviewTabSummaryCache(summary: CachedReviewTabSummary, version: number): void {
  summaryCache = summary;
  summaryCacheVersion = version;
}

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

export function resetReviewTabSummaryCacheForTests(): void {
  summaryCache = null;
  summaryCacheVersion = -1;
}
