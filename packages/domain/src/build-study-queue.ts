import type { StudyState } from './review-scheduler.js';

export type QueueItemType = 'new' | 'review' | 'relearn';

export interface QueuePlanItem {
  knowledgeId: string;
  itemType: QueueItemType;
}

export interface BuildStudyQueueInput {
  cardKnowledgeIds: readonly string[];
  learningStatesById: ReadonlyMap<string, StudyState>;
  now: Date;
  dailyNewCardQuota: number;
  inheritedPendingItems?: readonly QueuePlanItem[];
}

export function buildStudyQueuePlan(input: BuildStudyQueueInput): QueuePlanItem[] {
  if (input.inheritedPendingItems && input.inheritedPendingItems.length > 0) {
    return [...input.inheritedPendingItems];
  }

  const nowIso = input.now.toISOString();
  const dueItems: QueuePlanItem[] = [];

  for (const knowledgeId of input.cardKnowledgeIds) {
    const state = input.learningStatesById.get(knowledgeId);
    if (!state) {
      continue;
    }
    if (state.dueAt <= nowIso) {
      dueItems.push({
        knowledgeId,
        itemType: state.repetitions === 0 || state.intervalDays === 0 ? 'relearn' : 'review',
      });
    }
  }

  dueItems.sort((left, right) => {
    const leftDue = input.learningStatesById.get(left.knowledgeId)?.dueAt ?? '';
    const rightDue = input.learningStatesById.get(right.knowledgeId)?.dueAt ?? '';
    return leftDue.localeCompare(rightDue);
  });

  const learnedIds = new Set(input.learningStatesById.keys());
  const newItems: QueuePlanItem[] = [];
  for (const knowledgeId of input.cardKnowledgeIds) {
    if (learnedIds.has(knowledgeId)) {
      continue;
    }
    newItems.push({ knowledgeId, itemType: 'new' });
    if (newItems.length >= input.dailyNewCardQuota) {
      break;
    }
  }

  return [...dueItems, ...newItems];
}

export function countNewCardsForAbsentDays(
  unlearnedCount: number,
  dailyNewCardQuota: number,
  absentDays: number,
): number {
  if (absentDays <= 0) {
    return Math.min(unlearnedCount, dailyNewCardQuota);
  }
  return Math.min(unlearnedCount, dailyNewCardQuota);
}
