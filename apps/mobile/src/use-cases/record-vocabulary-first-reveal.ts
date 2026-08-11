import { formatLocalReviewDate } from '@remember/domain';
import { LearningActivityEventType } from '@remember/contracts';
import { getDeviceTimeZone } from '../lib/get-device-time-zone';
import { resolveContentPackId } from './resolve-content-pack-id';
import { insertActivityEvent } from './insert-activity-event';

export function recordVocabularyFirstReveal(input: {
  catalogPackId: string;
  knowledgeId: string;
  headword: string;
  sortOrder?: number;
  now?: Date;
}): void {
  const now = input.now ?? new Date();
  const timeZone = getDeviceTimeZone();
  const packId = resolveContentPackId(input.catalogPackId);

  insertActivityEvent({
    localDate: formatLocalReviewDate(now, timeZone),
    occurredAt: now.toISOString(),
    eventType: LearningActivityEventType.VOCABULARY_FIRST_REVEAL,
    packId,
    knowledgeId: input.knowledgeId,
    displayLabel: input.headword,
    payload: input.sortOrder === undefined ? {} : { sortOrder: input.sortOrder },
  });
}
