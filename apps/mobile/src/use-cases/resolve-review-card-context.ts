import { getInstalledPack } from '../data/repositories/installed-pack-repository';
import { getLearningStateByKnowledgeId } from '../data/repositories/learning-state-repository';
import { getPackCardDetailUseCase } from './get-pack-card-detail';

export function resolveReviewCardContext(knowledgeId: string): {
  cardDetail: ReturnType<typeof getPackCardDetailUseCase>;
  sourcePackId: string;
  sourcePackDisplayName: string;
} | null {
  const state = getLearningStateByKnowledgeId(knowledgeId);
  if (!state?.inReviewPool) {
    return null;
  }

  const sourcePackId = state.firstAddedFromPackId ?? state.packId;
  const installed = getInstalledPack(sourcePackId);
  if (!installed) {
    return null;
  }

  try {
    const cardDetail = getPackCardDetailUseCase(sourcePackId, knowledgeId);
    return {
      cardDetail,
      sourcePackId,
      sourcePackDisplayName: installed.displayName,
    };
  } catch {
    return null;
  }
}
