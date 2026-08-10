import { formatLocalReviewDate } from '@remember/domain';
import { LearningActivityEventType } from '@remember/contracts';
import { getDeviceTimeZone } from '../lib/get-device-time-zone';
import { resolveContentPackId } from './resolve-content-pack-id';
import { insertActivityEvent } from './insert-activity-event';

export function recordStoryCompleted(input: {
  catalogPackId: string;
  knowledgeId: string;
  titleZh: string;
  positionMs?: number;
  durationMs?: number;
  now?: Date;
}): void {
  const now = input.now ?? new Date();
  const timeZone = getDeviceTimeZone();
  const packId = resolveContentPackId(input.catalogPackId);

  insertActivityEvent({
    localDate: formatLocalReviewDate(now, timeZone),
    occurredAt: now.toISOString(),
    eventType: LearningActivityEventType.STORY_COMPLETED,
    packId,
    knowledgeId: input.knowledgeId,
    displayLabel: input.titleZh,
    payload: {
      ...(input.positionMs !== undefined ? { positionMs: input.positionMs } : {}),
      ...(input.durationMs !== undefined ? { durationMs: input.durationMs } : {}),
    },
  });
}
