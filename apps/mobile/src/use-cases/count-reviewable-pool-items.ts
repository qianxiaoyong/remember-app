import { listInstalledPacks } from '../data/repositories/installed-pack-repository';
import { listInReviewPoolItems } from '../data/repositories/learning-state-repository';
import { resolveReviewCardContext } from './resolve-review-card-context';

function buildInstalledPackIdSet(): Set<string> {
  return new Set(listInstalledPacks().map((pack) => pack.packId));
}

function resolveReviewSourcePackId(packId: string, firstAddedFromPackId: string | null): string {
  return firstAddedFromPackId ?? packId;
}

/** 复习池内、所属学习包仍安装的词条数（不含已卸载包遗留进度）。 */
export function countReviewableInReviewPoolTotal(): number {
  const installedPackIds = buildInstalledPackIdSet();
  return listInReviewPoolItems().filter((item) =>
    installedPackIds.has(resolveReviewSourcePackId(item.packId, item.firstAddedFromPackId)),
  ).length;
}

/** 到期且可加载复习内容的词条数。 */
export function countReviewableDueReviewPoolItems(
  dueItems: readonly { knowledgeId: string; packId: string; firstAddedFromPackId: string | null }[],
): number {
  const installedPackIds = buildInstalledPackIdSet();
  let count = 0;
  for (const item of dueItems) {
    const sourcePackId = resolveReviewSourcePackId(item.packId, item.firstAddedFromPackId);
    if (!installedPackIds.has(sourcePackId)) {
      continue;
    }
    if (resolveReviewCardContext(item.knowledgeId) !== null) {
      count += 1;
    }
  }
  return count;
}
