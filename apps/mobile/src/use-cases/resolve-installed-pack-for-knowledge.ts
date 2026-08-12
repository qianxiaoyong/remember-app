import { getPackCardDetail } from '../data/pack/pack-card-details';
import {
  getInstalledPack,
  listInstalledPacks,
  type InstalledPackRow,
} from '../data/repositories/installed-pack-repository';
import { extractContentPackIdFromKnowledgeId } from '../lib/extract-content-pack-id';

function packContainsKnowledgeId(pack: InstalledPackRow, knowledgeId: string): boolean {
  return getPackCardDetail(pack.sqlitePath, knowledgeId) !== null;
}

function findPackOnSqlitePath(
  sqlitePath: string,
  knowledgeId: string,
): InstalledPackRow | null {
  for (const pack of listInstalledPacks()) {
    if (pack.sqlitePath !== sqlitePath) {
      continue;
    }
    if (packContainsKnowledgeId(pack, knowledgeId)) {
      return pack;
    }
  }
  return null;
}

function findPackByUniqueSqlitePaths(knowledgeId: string): InstalledPackRow | null {
  const triedSqlitePaths = new Set<string>();
  for (const pack of listInstalledPacks()) {
    if (triedSqlitePaths.has(pack.sqlitePath)) {
      continue;
    }
    triedSqlitePaths.add(pack.sqlitePath);
    if (packContainsKnowledgeId(pack, knowledgeId)) {
      return pack;
    }
  }
  return null;
}

/** 按 learning state 记录的 packId 或 knowledgeId 前缀，解析仍可加载卡面的已安装包。 */
export function resolveInstalledPackForKnowledgeId(
  knowledgeId: string,
  preferredPackId?: string | null,
): InstalledPackRow | null {
  const candidatePackIds = new Set<string>();
  if (preferredPackId) {
    candidatePackIds.add(preferredPackId);
  }

  const contentPackIdFromKnowledgeId = extractContentPackIdFromKnowledgeId(knowledgeId);
  if (contentPackIdFromKnowledgeId) {
    candidatePackIds.add(contentPackIdFromKnowledgeId);
  }

  for (const packId of candidatePackIds) {
    const pack = getInstalledPack(packId);
    if (pack && packContainsKnowledgeId(pack, knowledgeId)) {
      return pack;
    }
  }

  for (const packId of candidatePackIds) {
    const pack = getInstalledPack(packId);
    if (!pack) {
      continue;
    }
    const aliasMatch = findPackOnSqlitePath(pack.sqlitePath, knowledgeId);
    if (aliasMatch) {
      return aliasMatch;
    }
  }

  return findPackByUniqueSqlitePaths(knowledgeId);
}
