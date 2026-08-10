import type { ActivityPayloadByEventType, LearningActivityEventTypeValue } from '@remember/contracts';
import { LearningActivityEventType } from '@remember/contracts';
import { createRecordId } from '../data/create-record-id';
import {
  hasFirstRevealEvent,
  insertLearningActivityEvent,
} from '../data/repositories/learning-activity-event-repository';
import { openUserDatabase } from '../data/user-db/open-user-database';

export interface InsertActivityEventInput<T extends LearningActivityEventTypeValue> {
  localDate: string;
  occurredAt: string;
  eventType: T;
  packId: string;
  knowledgeId?: string | null;
  displayLabel?: string | null;
  payload?: ActivityPayloadByEventType[T];
}

export function insertActivityEvent<T extends LearningActivityEventTypeValue>(
  input: InsertActivityEventInput<T>,
): void {
  try {
    if (
      input.eventType === LearningActivityEventType.VOCABULARY_FIRST_REVEAL &&
      input.knowledgeId
    ) {
      if (hasFirstRevealEvent(input.packId, input.knowledgeId)) {
        return;
      }
    }

    insertLearningActivityEvent({
      eventId: createRecordId('activity'),
      localDate: input.localDate,
      occurredAt: input.occurredAt,
      eventType: input.eventType,
      packId: input.packId,
      knowledgeId: input.knowledgeId,
      displayLabel: input.displayLabel,
      payload: JSON.stringify(input.payload ?? {}),
    });
  } catch (error) {
    console.warn('[insertActivityEvent] failed:', error);
  }
}

export function insertActivityEventInTransaction<T extends LearningActivityEventTypeValue>(
  input: InsertActivityEventInput<T>,
  db: ReturnType<typeof openUserDatabase>,
): void {
  try {
    if (
      input.eventType === LearningActivityEventType.VOCABULARY_FIRST_REVEAL &&
      input.knowledgeId
    ) {
      if (hasFirstRevealEvent(input.packId, input.knowledgeId, db)) {
        return;
      }
    }

    insertLearningActivityEvent(
      {
        eventId: createRecordId('activity'),
        localDate: input.localDate,
        occurredAt: input.occurredAt,
        eventType: input.eventType,
        packId: input.packId,
        knowledgeId: input.knowledgeId,
        displayLabel: input.displayLabel,
        payload: JSON.stringify(input.payload ?? {}),
      },
      db,
    );
  } catch (error) {
    console.warn('[insertActivityEventInTransaction] failed:', error);
  }
}
