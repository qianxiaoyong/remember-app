import type { StorySidebarEntry, StoryTier } from '@remember/contracts';

export interface StoryTierStats {
  high: number;
  mid: number;
  low: number;
}

export function countStoryTierStats(sidebar: StorySidebarEntry[]): StoryTierStats {
  const stats: StoryTierStats = { high: 0, mid: 0, low: 0 };
  for (const entry of sidebar) {
    stats[entry.tier] += 1;
  }
  return stats;
}

export function formatStoryTierLegend(stats: StoryTierStats, tier: StoryTier): string {
  const labels: Record<StoryTier, string> = {
    high: '高频',
    mid: '中频',
    low: '低频',
  };
  return `${labels[tier]}(${String(stats[tier])})`;
}
