import { getPackCardDetail } from '../data/pack/pack-card-details';
import { getLearningStateByKnowledgeId } from '../data/repositories/learning-state-repository';
import { getReviewPoolVersion } from '../shell/review-pool-changed-signal';
import type { getPackCardDetailUseCase } from './get-pack-card-detail';
import { resolveInstalledPackForKnowledgeId } from './resolve-installed-pack-for-knowledge';

export interface ReviewCardContext {
  cardDetail: ReturnType<typeof getPackCardDetailUseCase>;
  sourcePackId: string;
  sourcePackDisplayName: string;
}

const contextCache = new Map<string, ReviewCardContext | null>();
let contextCacheVersion = -1;

export function resetReviewCardContextCacheForTests(): void {
  contextCache.clear();
  contextCacheVersion = -1;
}

function resolveReviewCardContextUncached(knowledgeId: string): ReviewCardContext | null {
  const state = getLearningStateByKnowledgeId(knowledgeId);
  if (!state?.inReviewPool) {
    return null;
  }

  const preferredPackId = state.firstAddedFromPackId ?? state.packId;
  const installed = resolveInstalledPackForKnowledgeId(knowledgeId, preferredPackId);
  if (!installed) {
    return null;
  }

  const cardDetail = getPackCardDetail(installed.sqlitePath, knowledgeId);
  if (!cardDetail) {
    return null;
  }

  return {
    cardDetail,
    sourcePackId: installed.packId,
    sourcePackDisplayName: installed.displayName,
  };
}

export function resolveReviewCardContext(knowledgeId: string): ReviewCardContext | null {
  const version = getReviewPoolVersion();
  if (version !== contextCacheVersion) {
    contextCache.clear();
    contextCacheVersion = version;
  }

  if (contextCache.has(knowledgeId)) {
    return contextCache.get(knowledgeId) ?? null;
  }

  const resolved = resolveReviewCardContextUncached(knowledgeId);
  contextCache.set(knowledgeId, resolved);
  return resolved;
}
