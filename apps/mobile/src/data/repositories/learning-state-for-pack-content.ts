import type { SQLiteDatabase } from 'expo-sqlite';
import { openUserDatabase } from '../user-db/open-user-database';
import { listPackCards } from './pack-card-repository';
import {
  listLearningStatesByKnowledgeIds,
  type LearningStateRow,
} from './learning-state-repository';

/** 按包内 card knowledgeId 汇总进度，不受 installed_packs 别名 packId 影响。 */
export function listLearningStatesForPackContent(
  sqlitePath: string,
  db?: SQLiteDatabase,
): LearningStateRow[] {
  const cards = listPackCards(sqlitePath);
  if (cards.length === 0) {
    return [];
  }

  return listLearningStatesByKnowledgeIds(
    cards.map((card) => card.knowledgeId),
    db ?? openUserDatabase(),
  );
}
