import { previewBoxReviewOutcomes, type ReviewPoolState } from '@remember/domain';
import { getLearningState } from '../data/repositories/learning-state-repository';
import { getDeviceTimeZone } from '../lib/get-device-time-zone';

export function getReviewOutcomeIntervalLabels(
  knowledgeId: string,
  now: Date = new Date(),
): { passed: string; failed: string } {
  const previous = getLearningState(knowledgeId);
  const poolState: ReviewPoolState | null = previous?.inReviewPool
    ? {
        inReviewPool: true,
        boxLevel: previous.boxLevel,
        dueAt: previous.dueAt,
        consecutiveLevel3Passes: previous.consecutiveLevel3Passes,
      }
    : null;

  return previewBoxReviewOutcomes(poolState, now, getDeviceTimeZone());
}
