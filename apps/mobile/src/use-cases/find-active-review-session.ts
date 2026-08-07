import { findActiveSessionForPack } from '../data/repositories/study-session-repository';
import { REVIEW_POOL_SESSION_PACK_ID } from './review-session-constants';

export function findActiveReviewSession() {
  return findActiveSessionForPack(REVIEW_POOL_SESSION_PACK_ID);
}
