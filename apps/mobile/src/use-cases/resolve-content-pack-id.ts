import { getInstalledPack } from '../data/repositories/installed-pack-repository';
import { listPackCards } from '../data/repositories/pack-card-repository';
import { extractContentPackIdFromKnowledgeId } from '../lib/extract-content-pack-id';

export { extractContentPackIdFromKnowledgeId };

/** 目录 packId（含 bundled 别名）→ 包内 cards 使用的稳定 content packId。 */
export function resolveContentPackId(catalogPackId: string): string {
  const installed = getInstalledPack(catalogPackId);
  if (!installed) {
    return catalogPackId;
  }

  const cards = listPackCards(installed.sqlitePath);
  const firstCard = cards[0];
  if (!firstCard) {
    return catalogPackId;
  }

  return extractContentPackIdFromKnowledgeId(firstCard.knowledgeId) ?? catalogPackId;
}
