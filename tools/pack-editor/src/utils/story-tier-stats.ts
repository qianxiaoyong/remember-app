import type { StorySidebarEntry } from '@remember/contracts';
import type { StoryEditorTier } from './story-sidebar-order.js';

export interface StoryTierStats {
  high: number;
  mid: number;
  low: number;
  normal: number;
}

export function countStoryTierStats(sidebar: StorySidebarEntry[]): StoryTierStats {
  const stats: StoryTierStats = { high: 0, mid: 0, low: 0, normal: 0 };
  for (const entry of sidebar) {
    stats[entry.tier] += 1;
  }
  return stats;
}

export function formatStoryTierLegend(stats: StoryTierStats, tier: StoryEditorTier): string {
  const labels: Record<StoryEditorTier, string> = {
    high: '高频',
    mid: '中频',
    low: '低频',
    normal: '普通',
  };
  return `${labels[tier]}(${String(stats[tier])})`;
}
