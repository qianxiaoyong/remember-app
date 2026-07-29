import type { SQLiteDatabase } from 'expo-sqlite';
import {
  getInstalledPack,
  listInstalledPacks,
} from '../data/repositories/installed-pack-repository';
import {
  findActiveSessionForPack,
  type StudySessionRow,
} from '../data/repositories/study-session-repository';
import { openUserDatabase } from '../data/user-db/open-user-database';
import { resolveContentPackId } from './resolve-content-pack-id';

function normalizeAliasSessionPackId(
  session: StudySessionRow,
  contentPackId: string,
  db: SQLiteDatabase,
): StudySessionRow {
  if (session.packId === contentPackId) {
    return session;
  }
  db.runSync('UPDATE study_sessions SET packId = ? WHERE sessionId = ?', [
    contentPackId,
    session.sessionId,
  ]);
  return { ...session, packId: contentPackId };
}

/** 查找 installed 包对应的 active session；兼容 bundled 别名遗留 session。 */
export function findActiveStudySessionForInstalledPack(
  catalogPackId: string,
  db: SQLiteDatabase = openUserDatabase(),
): StudySessionRow | null {
  const installed = getInstalledPack(catalogPackId, db);
  if (!installed) {
    return null;
  }

  const contentPackId = resolveContentPackId(catalogPackId);
  return findActiveStudySessionForContentPackId(contentPackId, installed.sqlitePath, db);
}

export function findActiveStudySessionForContentPackId(
  contentPackId: string,
  sqlitePath: string,
  db: SQLiteDatabase = openUserDatabase(),
): StudySessionRow | null {
  const direct = findActiveSessionForPack(contentPackId, db);
  if (direct) {
    return direct;
  }

  for (const pack of listInstalledPacks(db)) {
    if (pack.sqlitePath !== sqlitePath || pack.packId === contentPackId) {
      continue;
    }
    const aliasSession = findActiveSessionForPack(pack.packId, db);
    if (aliasSession) {
      return normalizeAliasSessionPackId(aliasSession, contentPackId, db);
    }
  }

  return null;
}
