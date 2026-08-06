import { joinReviewPool, type JoinReviewPoolResult } from './join-review-pool';

export type RejoinCardReviewResult = JoinReviewPoolResult;

export function rejoinCardReview(input: {
  packId: string;
  knowledgeId: string;
  now?: Date;
}): RejoinCardReviewResult {
  return joinReviewPool({
    knowledgeId: input.knowledgeId,
    catalogPackId: input.packId,
    now: input.now,
  });
}
