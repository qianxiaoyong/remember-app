import { formatLocalReviewDate } from '@remember/domain';
import { LearningActivityEventType } from '@remember/contracts';
import { getDeviceTimeZone } from '../lib/get-device-time-zone';
import { resolveContentPackId } from './resolve-content-pack-id';
import { insertActivityEvent } from './insert-activity-event';

export function writeJoinReviewActivityEvent(input: {
  catalogPackId: string;
  knowledgeId: string;
  displayLabel: string;
  sortOrder?: number;
  created: boolean;
  source?: 'browse' | 'review_tab' | 'calendar_inspect';
  now?: Date;
}): void {
  const now = input.now ?? new Date();
  const timeZone = getDeviceTimeZone();
  const packId = resolveContentPackId(input.catalogPackId);

  insertActivityEvent({
    localDate: formatLocalReviewDate(now, timeZone),
    occurredAt: now.toISOString(),
    eventType: LearningActivityEventType.VOCABULARY_JOIN_REVIEW,
    packId,
    knowledgeId: input.knowledgeId,
    displayLabel: input.displayLabel,
    payload: {
      ...(input.sortOrder === undefined ? {} : { sortOrder: input.sortOrder }),
      created: input.created,
      ...(input.source ? { source: input.source } : {}),
    },
  });
}

export function writeSkipReviewActivityEvent(input: {
  catalogPackId: string;
  knowledgeId: string;
  displayLabel: string;
  sortOrder?: number;
  source?: 'browse' | 'review_tab' | 'calendar_inspect';
  now?: Date;
}): void {
  const now = input.now ?? new Date();
  const timeZone = getDeviceTimeZone();
  const packId = resolveContentPackId(input.catalogPackId);

  insertActivityEvent({
    localDate: formatLocalReviewDate(now, timeZone),
    occurredAt: now.toISOString(),
    eventType: LearningActivityEventType.VOCABULARY_SKIP_REVIEW,
    packId,
    knowledgeId: input.knowledgeId,
    displayLabel: input.displayLabel,
    payload: {
      ...(input.sortOrder === undefined ? {} : { sortOrder: input.sortOrder }),
      ...(input.source ? { source: input.source } : {}),
    },
  });
}

export function writeReviewOutcomeActivityEvent(input: {
  catalogPackId: string;
  knowledgeId: string;
  displayLabel: string;
  outcome: 'passed' | 'failed';
  boxLevelAfter?: number;
  source?: 'browse' | 'review_tab' | 'calendar_inspect';
  now?: Date;
}): void {
  const now = input.now ?? new Date();
  const timeZone = getDeviceTimeZone();
  const packId = resolveContentPackId(input.catalogPackId);

  insertActivityEvent({
    localDate: formatLocalReviewDate(now, timeZone),
    occurredAt: now.toISOString(),
    eventType: LearningActivityEventType.REVIEW_OUTCOME,
    packId,
    knowledgeId: input.knowledgeId,
    displayLabel: input.displayLabel,
    payload: {
      outcome: input.outcome === 'passed' ? 'remembered' : 'not_familiar',
      modality: 'vocabulary',
      ...(input.boxLevelAfter === undefined ? {} : { boxLevelAfter: input.boxLevelAfter }),
      ...(input.source ? { source: input.source } : {}),
    },
  });
}
