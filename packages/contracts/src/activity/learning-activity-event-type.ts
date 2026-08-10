import { z } from 'zod';

/** user.sqlite learning_activity_events.eventType — 第一期冻结 */
export const LearningActivityEventType = {
  VOCABULARY_FIRST_REVEAL: 'vocabulary_first_reveal',
  VOCABULARY_JOIN_REVIEW: 'vocabulary_join_review',
  VOCABULARY_SKIP_REVIEW: 'vocabulary_skip_review',
  REVIEW_OUTCOME: 'review_outcome',
  STORY_COMPLETED: 'story_completed',
} as const;

export type LearningActivityEventTypeValue =
  (typeof LearningActivityEventType)[keyof typeof LearningActivityEventType];

export const learningActivityEventTypeSchema = z.enum([
  LearningActivityEventType.VOCABULARY_FIRST_REVEAL,
  LearningActivityEventType.VOCABULARY_JOIN_REVIEW,
  LearningActivityEventType.VOCABULARY_SKIP_REVIEW,
  LearningActivityEventType.REVIEW_OUTCOME,
  LearningActivityEventType.STORY_COMPLETED,
]);

export const activityPayloadSourceSchema = z.enum(['browse', 'review_tab', 'calendar_inspect']);

export const activityPayloadBaseSchema = z
  .object({
    source: activityPayloadSourceSchema.optional(),
  })
  .strict();

export const vocabularyFirstRevealPayloadSchema = activityPayloadBaseSchema.extend({
  sortOrder: z.number().int().min(0).optional(),
});

export const vocabularyJoinReviewPayloadSchema = activityPayloadBaseSchema.extend({
  sortOrder: z.number().int().min(0).optional(),
  created: z.boolean().optional(),
});

export const vocabularySkipReviewPayloadSchema = activityPayloadBaseSchema.extend({
  sortOrder: z.number().int().min(0).optional(),
});

export const reviewOutcomeActivityPayloadSchema = activityPayloadBaseSchema.extend({
  outcome: z.enum(['remembered', 'not_familiar']),
  modality: z.literal('vocabulary'),
  boxLevelAfter: z.number().int().min(0).max(3).optional(),
});

export const storyCompletedPayloadSchema = activityPayloadBaseSchema.extend({
  positionMs: z.number().int().min(0).optional(),
  durationMs: z.number().int().min(0).optional(),
});

export type ActivityPayloadSource = z.infer<typeof activityPayloadSourceSchema>;
export type VocabularyFirstRevealPayload = z.infer<typeof vocabularyFirstRevealPayloadSchema>;
export type VocabularyJoinReviewPayload = z.infer<typeof vocabularyJoinReviewPayloadSchema>;
export type VocabularySkipReviewPayload = z.infer<typeof vocabularySkipReviewPayloadSchema>;
export type ReviewOutcomeActivityPayload = z.infer<typeof reviewOutcomeActivityPayloadSchema>;
export type StoryCompletedPayload = z.infer<typeof storyCompletedPayloadSchema>;

export interface ActivityPayloadByEventType {
  [LearningActivityEventType.VOCABULARY_FIRST_REVEAL]: VocabularyFirstRevealPayload;
  [LearningActivityEventType.VOCABULARY_JOIN_REVIEW]: VocabularyJoinReviewPayload;
  [LearningActivityEventType.VOCABULARY_SKIP_REVIEW]: VocabularySkipReviewPayload;
  [LearningActivityEventType.REVIEW_OUTCOME]: ReviewOutcomeActivityPayload;
  [LearningActivityEventType.STORY_COMPLETED]: StoryCompletedPayload;
}

const payloadSchemaByEventType = {
  [LearningActivityEventType.VOCABULARY_FIRST_REVEAL]: vocabularyFirstRevealPayloadSchema,
  [LearningActivityEventType.VOCABULARY_JOIN_REVIEW]: vocabularyJoinReviewPayloadSchema,
  [LearningActivityEventType.VOCABULARY_SKIP_REVIEW]: vocabularySkipReviewPayloadSchema,
  [LearningActivityEventType.REVIEW_OUTCOME]: reviewOutcomeActivityPayloadSchema,
  [LearningActivityEventType.STORY_COMPLETED]: storyCompletedPayloadSchema,
} as const;

export function parseActivityPayload<T extends LearningActivityEventTypeValue>(
  eventType: T,
  json: string,
): ActivityPayloadByEventType[T] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json) as unknown;
  } catch {
    throw new Error('activity payload is not valid JSON');
  }

  const schema = payloadSchemaByEventType[eventType];
  const result = schema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`invalid activity payload for ${eventType}`);
  }
  return result.data as ActivityPayloadByEventType[T];
}

/** 学习类事件（用于热力格档位判定） */
export const LEARNING_ACTIVITY_EVENT_TYPES: readonly LearningActivityEventTypeValue[] = [
  LearningActivityEventType.VOCABULARY_FIRST_REVEAL,
  LearningActivityEventType.VOCABULARY_JOIN_REVIEW,
  LearningActivityEventType.VOCABULARY_SKIP_REVIEW,
  LearningActivityEventType.STORY_COMPLETED,
];

export function isLearningActivityEventType(eventType: string): boolean {
  return (LEARNING_ACTIVITY_EVENT_TYPES as readonly string[]).includes(eventType);
}
