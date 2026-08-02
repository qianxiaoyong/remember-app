export const LESSON_COMPLETE_DUE_AT = '9999-12-31T23:59:59.999Z' as const;

export const LESSON_COMPLETE_SENTINEL = {
  easiness: 2.5,
  intervalDays: 36500,
  repetitions: 1,
  dueAt: LESSON_COMPLETE_DUE_AT,
} as const;

export interface LessonCompleteStateInput {
  knowledgeId: string;
  packId: string;
  clientVersion: number;
  updatedAt: string;
}

export function buildLessonCompleteLearningState(input: LessonCompleteStateInput): {
  knowledgeId: string;
  packId: string;
  easiness: number;
  intervalDays: number;
  repetitions: number;
  dueAt: string;
  clientVersion: number;
  updatedAt: string;
} {
  return {
    knowledgeId: input.knowledgeId,
    packId: input.packId,
    ...LESSON_COMPLETE_SENTINEL,
    clientVersion: input.clientVersion,
    updatedAt: input.updatedAt,
  };
}
