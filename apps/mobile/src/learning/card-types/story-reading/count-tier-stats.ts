import type { StoryReadingContent, StoryLegendTier } from '@remember/contracts';

export interface TierStats {
  high: number;
  mid: number;
  low: number;
}

export function countTierStats(content: StoryReadingContent): TierStats {
  const stats: TierStats = { high: 0, mid: 0, low: 0 };
  for (const entry of content.sidebar) {
    if (entry.tier === 'normal') {
      continue;
    }
    stats[entry.tier] += 1;
  }
  return stats;
}

export function countSidebarWords(content: StoryReadingContent): number {
  return content.sidebar.length;
}

export function formatTierLegend(stats: TierStats, tier: StoryLegendTier): string {
  const labels: Record<StoryLegendTier, string> = {
    high: '高频',
    mid: '中频',
    low: '低频',
  };
  return `${labels[tier]}(${String(stats[tier])})`;
}
