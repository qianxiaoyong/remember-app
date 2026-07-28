import type { StudyQueueItemRow } from '../data/repositories/study-session-repository';

export interface ActiveStudySession {
  sessionId: string;
  packId: string;
  queueItems: StudyQueueItemRow[];
  currentItem: StudyQueueItemRow | null;
  completedCount: number;
  totalCount: number;
}

export function buildActiveStudySession(
  sessionId: string,
  packId: string,
  queueItems: StudyQueueItemRow[],
): ActiveStudySession {
  const currentItem = queueItems.find((item) => item.status === 'pending') ?? null;
  const completedCount = queueItems.filter((item) => item.status === 'done').length;
  return {
    sessionId,
    packId,
    queueItems,
    currentItem,
    completedCount,
    totalCount: queueItems.length,
  };
}
