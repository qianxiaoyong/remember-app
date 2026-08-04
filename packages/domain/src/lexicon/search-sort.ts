export type LemmaSearchStatus = 'draft' | 'published' | 'archived';

const STATUS_RANK: Record<LemmaSearchStatus, number> = {
  published: 0,
  draft: 1,
  archived: 2,
};

export function lemmaStatusRank(status: LemmaSearchStatus): number {
  return STATUS_RANK[status];
}

export function compareLemmaStatusForSearch(
  left: LemmaSearchStatus,
  right: LemmaSearchStatus,
): number {
  return lemmaStatusRank(left) - lemmaStatusRank(right);
}
