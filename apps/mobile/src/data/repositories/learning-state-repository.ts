import type { SQLiteDatabase } from 'expo-sqlite';
import type { StudyState } from '@remember/domain';
import { openUserDatabase } from '../user-db/open-user-database';

export interface LearningStateRow extends StudyState {
  knowledgeId: string;
  packId: string;
  clientVersion: number;
  updatedAt: string;
}

interface LearningStateDbRow {
  knowledgeId: string;
  packId: string;
  easiness: number;
  intervalDays: number;
  repetitions: number;
  dueAt: string;
  clientVersion: number;
  updatedAt: string;
}

function mapRow(row: LearningStateDbRow): LearningStateRow {
  return {
    knowledgeId: row.knowledgeId,
    packId: row.packId,
    easiness: row.easiness,
    intervalDays: row.intervalDays,
    repetitions: row.repetitions,
    dueAt: row.dueAt,
    clientVersion: row.clientVersion,
    updatedAt: row.updatedAt,
  };
}

export function listLearningStatesForPack(
  packId: string,
  db: SQLiteDatabase = openUserDatabase(),
): LearningStateRow[] {
  const rows = db.getAllSync<LearningStateDbRow>(
    `SELECT knowledgeId, packId, easiness, intervalDays, repetitions, dueAt, clientVersion, updatedAt
     FROM learning_states
     WHERE packId = ?
     ORDER BY dueAt ASC`,
    [packId],
  );
  return rows.map(mapRow);
}

export function getLearningState(
  knowledgeId: string,
  db: SQLiteDatabase = openUserDatabase(),
): LearningStateRow | null {
  const row = db.getFirstSync<LearningStateDbRow>(
    `SELECT knowledgeId, packId, easiness, intervalDays, repetitions, dueAt, clientVersion, updatedAt
     FROM learning_states
     WHERE knowledgeId = ?`,
    [knowledgeId],
  );
  return row ? mapRow(row) : null;
}

export function upsertLearningState(
  row: LearningStateRow,
  db: SQLiteDatabase = openUserDatabase(),
): void {
  db.runSync(
    `INSERT INTO learning_states (
       knowledgeId, packId, easiness, intervalDays, repetitions, dueAt, clientVersion, updatedAt
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(knowledgeId) DO UPDATE SET
       packId = excluded.packId,
       easiness = excluded.easiness,
       intervalDays = excluded.intervalDays,
       repetitions = excluded.repetitions,
       dueAt = excluded.dueAt,
       clientVersion = excluded.clientVersion,
       updatedAt = excluded.updatedAt`,
    [
      row.knowledgeId,
      row.packId,
      row.easiness,
      row.intervalDays,
      row.repetitions,
      row.dueAt,
      row.clientVersion,
      row.updatedAt,
    ],
  );
}

export function buildLearningStateMap(rows: readonly LearningStateRow[]): Map<string, StudyState> {
  const map = new Map<string, StudyState>();
  for (const row of rows) {
    map.set(row.knowledgeId, {
      easiness: row.easiness,
      intervalDays: row.intervalDays,
      repetitions: row.repetitions,
      dueAt: row.dueAt,
    });
  }
  return map;
}
