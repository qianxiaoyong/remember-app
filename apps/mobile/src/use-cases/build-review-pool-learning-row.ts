import type { ReviewPoolState } from '@remember/domain';
import type { LearningStateRow } from '../data/repositories/learning-state-repository';
import { resolveContentPackId } from './resolve-content-pack-id';

export function buildReviewPoolLearningRow(input: {
  knowledgeId: string;
  catalogPackId: string;
  poolState: ReviewPoolState;
  previous: LearningStateRow | null;
  now: Date;
}): LearningStateRow {
  const updatedAt = input.now.toISOString();
  const contentPackId = resolveContentPackId(input.catalogPackId);

  return {
    knowledgeId: input.knowledgeId,
    packId: contentPackId,
    easiness: input.previous?.easiness ?? 2.5,
    intervalDays: input.previous?.intervalDays ?? 0,
    repetitions: input.previous?.repetitions ?? 0,
    dueAt: new Date(input.poolState.dueAt).toISOString(),
    clientVersion: (input.previous?.clientVersion ?? 0) + 1,
    updatedAt,
    inReviewPool: true,
    boxLevel: input.poolState.boxLevel,
    firstAddedFromPackId: contentPackId,
    lastSeenInPackId: contentPackId,
    consecutiveLevel3Passes: input.poolState.consecutiveLevel3Passes ?? 0,
  };
}
