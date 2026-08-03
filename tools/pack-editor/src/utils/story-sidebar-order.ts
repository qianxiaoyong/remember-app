import type { StorySidebarEntry, StoryTier } from '@remember/contracts';

export const STORY_EDITOR_TIER_ORDER = ['high', 'mid', 'low', 'normal'] as const;
export type StoryEditorTier = (typeof STORY_EDITOR_TIER_ORDER)[number];

const TIER_RANK: Record<StoryTier, number> = {
  high: 0,
  mid: 1,
  low: 2,
  normal: 3,
};

export function compareStoryTierOrder(a: StoryTier, b: StoryTier): number {
  return TIER_RANK[a] - TIER_RANK[b];
}

/** 新词条插入到对应 tier 分组的最上面（数组中该 tier 第一个位置之前）。 */
export function insertSidebarEntryAtTierHead(
  sidebar: StorySidebarEntry[],
  entry: StorySidebarEntry,
): StorySidebarEntry[] {
  const tier = entry.tier;
  for (let index = 0; index < sidebar.length; index += 1) {
    const item = sidebar[index];
    if (!item) {
      continue;
    }
    if (item.tier === tier) {
      return [...sidebar.slice(0, index), entry, ...sidebar.slice(index)];
    }
    if (compareStoryTierOrder(item.tier, tier) > 0) {
      return [...sidebar.slice(0, index), entry, ...sidebar.slice(index)];
    }
  }
  return [...sidebar, entry];
}

export function moveSidebarEntryToTierHead(
  sidebar: StorySidebarEntry[],
  sidebarIndex: number,
  tier: StoryTier,
): StorySidebarEntry[] {
  const existing = sidebar[sidebarIndex];
  if (!existing) {
    return sidebar;
  }
  const entry = { ...existing, tier };
  const without = sidebar.filter((_, index) => index !== sidebarIndex);
  return insertSidebarEntryAtTierHead(without, entry);
}

/** 按 tier 分组排序后的 sidebar 物理下标（组内保持数组原有顺序，新词 prepend 后在组内靠前）。 */
export function sortSidebarIndicesByTier(sidebar: StorySidebarEntry[]): number[] {
  return sidebar
    .map((entry, index) => ({ entry, index }))
    .sort((left, right) => {
      const tierCmp = compareStoryTierOrder(left.entry.tier, right.entry.tier);
      if (tierCmp !== 0) {
        return tierCmp;
      }
      return left.index - right.index;
    })
    .map(({ index }) => index);
}
