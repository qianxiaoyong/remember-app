import type { StoryReadingContent, StoryTier } from '@remember/contracts';

export interface TierStats {
  high: number;
  mid: number;
  low: number;
}

export function countTierStats(content: StoryReadingContent): TierStats {
  const stats: TierStats = { high: 0, mid: 0, low: 0 };
  for (const entry of content.sidebar) {
    stats[entry.tier] += 1;
  }
  return stats;
}

export function countSidebarWords(content: StoryReadingContent): number {
  return content.sidebar.length;
}

export function formatTierLegend(stats: TierStats, tier: StoryTier): string {
  const labels: Record<StoryTier, string> = {
    high: '高频',
    mid: '中频',
    low: '低频',
  };
  return `${labels[tier]}(${String(stats[tier])})`;
}
