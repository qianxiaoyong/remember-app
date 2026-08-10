import type { SQLiteDatabase } from 'expo-sqlite';
import type { LearningActivityEventTypeValue } from '@remember/contracts';
import { openUserDatabase } from '../user-db/open-user-database';

export interface LearningActivityEventRow {
  eventId: string;
  localDate: string;
  occurredAt: string;
  eventType: LearningActivityEventTypeValue;
  packId: string;
  knowledgeId: string | null;
  displayLabel: string | null;
  payload: string;
}

export interface InsertLearningActivityEventInput {
  eventId: string;
  localDate: string;
  occurredAt: string;
  eventType: LearningActivityEventTypeValue;
  packId: string;
  knowledgeId?: string | null;
  displayLabel?: string | null;
  payload?: string;
}

export function hasStoryCompletedEvent(
  packId: string,
  knowledgeId: string,
  db: SQLiteDatabase = openUserDatabase(),
): boolean {
  const row = db.getFirstSync<{ count: number }>(
    `SELECT COUNT(*) AS count
     FROM learning_activity_events
     WHERE packId = ?
       AND knowledgeId = ?
       AND eventType = 'story_completed'`,
    [packId, knowledgeId],
  );
  return (row?.count ?? 0) > 0;
}

export function hasFirstRevealEvent(
  packId: string,
  knowledgeId: string,
  db: SQLiteDatabase = openUserDatabase(),
): boolean {
  const row = db.getFirstSync<{ count: number }>(
    `SELECT COUNT(*) AS count
     FROM learning_activity_events
     WHERE packId = ?
       AND knowledgeId = ?
       AND eventType = 'vocabulary_first_reveal'`,
    [packId, knowledgeId],
  );
  return (row?.count ?? 0) > 0;
}

export function insertLearningActivityEvent(
  input: InsertLearningActivityEventInput,
  db: SQLiteDatabase = openUserDatabase(),
): void {
  db.runSync(
    `INSERT INTO learning_activity_events (
       eventId, localDate, occurredAt, eventType, packId, knowledgeId, displayLabel, payload
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.eventId,
      input.localDate,
      input.occurredAt,
      input.eventType,
      input.packId,
      input.knowledgeId ?? null,
      input.displayLabel ?? null,
      input.payload ?? '{}',
    ],
  );
}

export function listEventsByLocalDate(
  localDate: string,
  db: SQLiteDatabase = openUserDatabase(),
): LearningActivityEventRow[] {
  return db.getAllSync<LearningActivityEventRow>(
    `SELECT eventId, localDate, occurredAt, eventType, packId, knowledgeId, displayLabel, payload
     FROM learning_activity_events
     WHERE localDate = ?
     ORDER BY occurredAt ASC`,
    [localDate],
  );
}

export function listEventsInDateRange(
  startDate: string,
  endDate: string,
  db: SQLiteDatabase = openUserDatabase(),
): LearningActivityEventRow[] {
  return db.getAllSync<LearningActivityEventRow>(
    `SELECT eventId, localDate, occurredAt, eventType, packId, knowledgeId, displayLabel, payload
     FROM learning_activity_events
     WHERE localDate >= ? AND localDate <= ?
     ORDER BY localDate ASC, occurredAt ASC`,
    [startDate, endDate],
  );
}

export function countDistinctActiveDays(
  startDate: string,
  endDate: string,
  db: SQLiteDatabase = openUserDatabase(),
): number {
  const row = db.getFirstSync<{ count: number }>(
    `SELECT COUNT(DISTINCT localDate) AS count
     FROM learning_activity_events
     WHERE localDate >= ? AND localDate <= ?`,
    [startDate, endDate],
  );
  return row?.count ?? 0;
}

export function countEventsByTypeInRange(input: {
  eventType: LearningActivityEventTypeValue;
  startDate: string;
  endDate: string;
  db?: SQLiteDatabase;
}): number {
  const db = input.db ?? openUserDatabase();
  const row = db.getFirstSync<{ count: number }>(
    `SELECT COUNT(*) AS count
     FROM learning_activity_events
     WHERE eventType = ?
       AND localDate >= ?
       AND localDate <= ?`,
    [input.eventType, input.startDate, input.endDate],
  );
  return row?.count ?? 0;
}

export function listEventsForKnowledgeOnDate(input: {
  packId: string;
  knowledgeId: string;
  localDate: string;
  db?: SQLiteDatabase;
}): LearningActivityEventRow[] {
  const db = input.db ?? openUserDatabase();
  return db.getAllSync<LearningActivityEventRow>(
    `SELECT eventId, localDate, occurredAt, eventType, packId, knowledgeId, displayLabel, payload
     FROM learning_activity_events
     WHERE packId = ?
       AND knowledgeId = ?
       AND localDate = ?
     ORDER BY occurredAt ASC`,
    [input.packId, input.knowledgeId, input.localDate],
  );
}

export function listFirstRevealEventsOnDate(
  localDate: string,
  db: SQLiteDatabase = openUserDatabase(),
): LearningActivityEventRow[] {
  return db.getAllSync<LearningActivityEventRow>(
    `SELECT eventId, localDate, occurredAt, eventType, packId, knowledgeId, displayLabel, payload
     FROM learning_activity_events
     WHERE localDate = ?
       AND eventType = 'vocabulary_first_reveal'
     ORDER BY occurredAt ASC`,
    [localDate],
  );
}

export function listReviewOutcomeEventsOnDate(
  localDate: string,
  db: SQLiteDatabase = openUserDatabase(),
): LearningActivityEventRow[] {
  return db.getAllSync<LearningActivityEventRow>(
    `SELECT eventId, localDate, occurredAt, eventType, packId, knowledgeId, displayLabel, payload
     FROM learning_activity_events
     WHERE localDate = ?
       AND eventType = 'review_outcome'
     ORDER BY occurredAt ASC`,
    [localDate],
  );
}

export function listStoryCompletedEventsOnDate(
  localDate: string,
  db: SQLiteDatabase = openUserDatabase(),
): LearningActivityEventRow[] {
  return db.getAllSync<LearningActivityEventRow>(
    `SELECT eventId, localDate, occurredAt, eventType, packId, knowledgeId, displayLabel, payload
     FROM learning_activity_events
     WHERE localDate = ?
       AND eventType = 'story_completed'
     ORDER BY occurredAt ASC`,
    [localDate],
  );
}

export function listFollowUpEventsForFirstReveal(input: {
  packId: string;
  knowledgeId: string;
  fromLocalDate: string;
  db?: SQLiteDatabase;
}): LearningActivityEventRow[] {
  const db = input.db ?? openUserDatabase();
  return db.getAllSync<LearningActivityEventRow>(
    `SELECT eventId, localDate, occurredAt, eventType, packId, knowledgeId, displayLabel, payload
     FROM learning_activity_events
     WHERE packId = ?
       AND knowledgeId = ?
       AND localDate >= ?
       AND eventType IN ('vocabulary_join_review', 'vocabulary_skip_review')
     ORDER BY occurredAt ASC`,
    [input.packId, input.knowledgeId, input.fromLocalDate],
  );
}
