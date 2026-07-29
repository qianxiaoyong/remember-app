import type { SQLiteDatabase } from 'expo-sqlite';
import { listPackCards } from './pack-card-repository';
import { getLearningState, type LearningStateRow } from './learning-state-repository';

/** 按包内 card knowledgeId 汇总进度，不受 installed_packs 别名 packId 影响。 */
export function listLearningStatesForPackContent(
  sqlitePath: string,
  db?: SQLiteDatabase,
): LearningStateRow[] {
  const cards = listPackCards(sqlitePath);
  const states: LearningStateRow[] = [];

  for (const card of cards) {
    const state = getLearningState(card.knowledgeId, db);
    if (state) {
      states.push(state);
    }
  }

  return states;
}
