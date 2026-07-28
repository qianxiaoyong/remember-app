import { previewReviewIntervals, type ReviewRating } from '@remember/domain';
import { getInstalledPack } from '../data/repositories/installed-pack-repository';
import { getLearningState } from '../data/repositories/learning-state-repository';
import { getPackCard } from '../data/repositories/pack-card-repository';

export function getCurrentCardHeadword(packId: string, knowledgeId: string): string {
  const installedPack = getInstalledPack(packId);
  if (!installedPack) {
    throw new Error(`pack not installed: ${packId}`);
  }
  const card = getPackCard(installedPack.sqlitePath, knowledgeId);
  return card?.headword ?? knowledgeId;
}

export function getReviewIntervalLabels(
  knowledgeId: string,
  now: Date = new Date(),
): Record<ReviewRating, string> {
  const previous = getLearningState(knowledgeId);
  const previousState = previous
    ? {
        easiness: previous.easiness,
        intervalDays: previous.intervalDays,
        repetitions: previous.repetitions,
        dueAt: previous.dueAt,
      }
    : null;
  return previewReviewIntervals(previousState, now);
}
