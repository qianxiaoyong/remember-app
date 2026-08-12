import type { BoxLevel, StudyState } from '@remember/domain';
import { endOfLocalReviewDay } from '@remember/domain';
import type { SQLiteDatabase } from 'expo-sqlite';
import { openUserDatabase } from '../user-db/open-user-database';

export interface LearningStateRow {
  knowledgeId: string;
  packId: string;
  easiness: number;
  intervalDays: number;
  repetitions: number;
  dueAt: string;
  clientVersion: number;
  updatedAt: string;
  inReviewPool: boolean;
  boxLevel: BoxLevel;
  firstAddedFromPackId: string | null;
  lastSeenInPackId: string | null;
  consecutiveLevel3Passes: number;
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
  inReviewPool: number;
  boxLevel: number;
  firstAddedFromPackId: string | null;
  lastSeenInPackId: string | null;
  consecutiveLevel3Passes: number;
}

const LEARNING_STATE_SELECT = `SELECT
  knowledgeId,
  packId,
  easiness,
  intervalDays,
  repetitions,
  dueAt,
  clientVersion,
  updatedAt,
  inReviewPool,
  boxLevel,
  firstAddedFromPackId,
  lastSeenInPackId,
  consecutiveLevel3Passes
FROM learning_states`;

function clampBoxLevel(value: number): BoxLevel {
  if (value <= 0) {
    return 0;
  }
  if (value >= 3) {
    return 3;
  }
  return value as BoxLevel;
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
    inReviewPool: row.inReviewPool === 1,
    boxLevel: clampBoxLevel(row.boxLevel),
    firstAddedFromPackId: row.firstAddedFromPackId,
    lastSeenInPackId: row.lastSeenInPackId,
    consecutiveLevel3Passes: row.consecutiveLevel3Passes,
  };
}

function isDueByEndOfLocalDay(dueAt: string, now: Date, timeZone: string): boolean {
  return new Date(dueAt).getTime() <= endOfLocalReviewDay(now, timeZone).getTime();
}

export function listLearningStatesForPack(
  packId: string,
  db: SQLiteDatabase = openUserDatabase(),
): LearningStateRow[] {
  const rows = db.getAllSync<LearningStateDbRow>(
    `${LEARNING_STATE_SELECT}
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
  return getLearningStateByKnowledgeId(knowledgeId, db);
}

export function getLearningStateByKnowledgeId(
  knowledgeId: string,
  db: SQLiteDatabase = openUserDatabase(),
): LearningStateRow | null {
  const row = db.getFirstSync<LearningStateDbRow>(
    `${LEARNING_STATE_SELECT}
     WHERE knowledgeId = ?`,
    [knowledgeId],
  );
  return row ? mapRow(row) : null;
}

const KNOWLEDGE_ID_IN_CHUNK_SIZE = 500;

export function listLearningStatesByKnowledgeIds(
  knowledgeIds: readonly string[],
  db: SQLiteDatabase = openUserDatabase(),
): LearningStateRow[] {
  if (knowledgeIds.length === 0) {
    return [];
  }

  const rows: LearningStateRow[] = [];
  for (let offset = 0; offset < knowledgeIds.length; offset += KNOWLEDGE_ID_IN_CHUNK_SIZE) {
    const chunk = knowledgeIds.slice(offset, offset + KNOWLEDGE_ID_IN_CHUNK_SIZE);
    const placeholders = chunk.map(() => '?').join(', ');
    const chunkRows = db.getAllSync<LearningStateDbRow>(
      `${LEARNING_STATE_SELECT}
       WHERE knowledgeId IN (${placeholders})`,
      [...chunk],
    );
    rows.push(...chunkRows.map(mapRow));
  }
  return rows;
}

export function upsertLearningState(
  row: LearningStateRow,
  db: SQLiteDatabase = openUserDatabase(),
): void {
  db.runSync(
    `INSERT INTO learning_states (
       knowledgeId,
       packId,
       easiness,
       intervalDays,
       repetitions,
       dueAt,
       clientVersion,
       updatedAt,
       inReviewPool,
       boxLevel,
       firstAddedFromPackId,
       lastSeenInPackId,
       consecutiveLevel3Passes
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(knowledgeId) DO UPDATE SET
       packId = excluded.packId,
       easiness = excluded.easiness,
       intervalDays = excluded.intervalDays,
       repetitions = excluded.repetitions,
       dueAt = excluded.dueAt,
       clientVersion = excluded.clientVersion,
       updatedAt = excluded.updatedAt,
       inReviewPool = excluded.inReviewPool,
       boxLevel = excluded.boxLevel,
       firstAddedFromPackId = excluded.firstAddedFromPackId,
       lastSeenInPackId = excluded.lastSeenInPackId,
       consecutiveLevel3Passes = excluded.consecutiveLevel3Passes`,
    [
      row.knowledgeId,
      row.packId,
      row.easiness,
      row.intervalDays,
      row.repetitions,
      row.dueAt,
      row.clientVersion,
      row.updatedAt,
      row.inReviewPool ? 1 : 0,
      row.boxLevel,
      row.firstAddedFromPackId,
      row.lastSeenInPackId,
      row.consecutiveLevel3Passes,
    ],
  );
}

export function upsertReviewPoolState(
  row: LearningStateRow,
  db: SQLiteDatabase = openUserDatabase(),
): void {
  upsertLearningState(row, db);
}

export function listDueReviewPoolItems(
  now: Date,
  timeZone: string,
  db: SQLiteDatabase = openUserDatabase(),
): LearningStateRow[] {
  const rows = db.getAllSync<LearningStateDbRow>(
    `${LEARNING_STATE_SELECT}
     WHERE inReviewPool = 1
     ORDER BY dueAt ASC, knowledgeId ASC`,
  );

  return rows.map(mapRow).filter((row) => isDueByEndOfLocalDay(row.dueAt, now, timeZone));
}

export function listInReviewPoolItems(db: SQLiteDatabase = openUserDatabase()): LearningStateRow[] {
  const rows = db.getAllSync<LearningStateDbRow>(
    `${LEARNING_STATE_SELECT}
     WHERE inReviewPool = 1
     ORDER BY dueAt ASC, knowledgeId ASC`,
  );
  return rows.map(mapRow);
}

export function countDueReviewPoolItems(
  now: Date,
  timeZone: string,
  db: SQLiteDatabase = openUserDatabase(),
): number {
  const endOfDayIso = endOfLocalReviewDay(now, timeZone).toISOString();
  const row = db.getFirstSync<{ count: number }>(
    `SELECT COUNT(*) AS count
     FROM learning_states
     WHERE inReviewPool = 1
       AND dueAt <= ?`,
    [endOfDayIso],
  );
  return row?.count ?? 0;
}

export function countInReviewPoolTotal(db: SQLiteDatabase = openUserDatabase()): number {
  const row = db.getFirstSync<{ count: number }>(
    `SELECT COUNT(*) AS count FROM learning_states WHERE inReviewPool = 1`,
  );
  return row?.count ?? 0;
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
