import { getInstalledPack } from '../data/repositories/installed-pack-repository';
import { listPackCards } from '../data/repositories/pack-card-repository';
import { extractContentPackIdFromKnowledgeId } from '../lib/extract-content-pack-id';

export { extractContentPackIdFromKnowledgeId };

const contentPackIdCache = new Map<string, string>();

export function clearContentPackIdCacheForTests(): void {
  contentPackIdCache.clear();
}

/** 目录 packId（含 bundled 别名）→ 包内 cards 使用的稳定 content packId。 */
export function resolveContentPackId(catalogPackId: string): string {
  const cached = contentPackIdCache.get(catalogPackId);
  if (cached) {
    return cached;
  }

  const installed = getInstalledPack(catalogPackId);
  if (!installed) {
    contentPackIdCache.set(catalogPackId, catalogPackId);
    return catalogPackId;
  }

  const cards = listPackCards(installed.sqlitePath);
  const firstCard = cards[0];
  if (!firstCard) {
    contentPackIdCache.set(catalogPackId, catalogPackId);
    return catalogPackId;
  }

  const contentPackId = extractContentPackIdFromKnowledgeId(firstCard.knowledgeId) ?? catalogPackId;
  contentPackIdCache.set(catalogPackId, contentPackId);
  return contentPackId;
}
