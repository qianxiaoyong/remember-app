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
  const sourcePackDisplayName = installed?.displayName ?? '已卸载的学习包';

  try {
    const cardDetail = getPackCardDetailUseCase(sourcePackId, knowledgeId);
    return {
      cardDetail,
      sourcePackId,
      sourcePackDisplayName,
    };
  } catch {
    return null;
  }
}
