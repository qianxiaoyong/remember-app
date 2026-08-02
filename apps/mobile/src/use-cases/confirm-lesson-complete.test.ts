import { describe, expect, it } from 'vitest';
import { buildStudyQueuePlan } from '@remember/domain';
import {
  buildLessonCompleteLearningState,
  LESSON_COMPLETE_SENTINEL,
} from './lesson-complete-sentinel.js';

describe('lesson-complete sentinel', () => {
  it('完成哨兵字段符合约定', () => {
    const row = buildLessonCompleteLearningState({
      knowledgeId: 'p:story:c1',
      packId: 'p',
      clientVersion: 1,
      updatedAt: '2026-08-02T00:00:00.000Z',
    });
    expect(row).toMatchObject(LESSON_COMPLETE_SENTINEL);
  });

  it('已完成 story 课不再进入 new 或 due 队列', () => {
    const knowledgeId = 'story-test-pack:story:c1';
    const now = new Date('2026-08-02T12:00:00.000Z');
    const plan = buildStudyQueuePlan({
      cardKnowledgeIds: [knowledgeId],
      learningStatesById: new Map([
        [
          knowledgeId,
          {
            easiness: LESSON_COMPLETE_SENTINEL.easiness,
            intervalDays: LESSON_COMPLETE_SENTINEL.intervalDays,
            repetitions: LESSON_COMPLETE_SENTINEL.repetitions,
            dueAt: LESSON_COMPLETE_SENTINEL.dueAt,
          },
        ],
      ]),
      now,
      dailyNewCardQuota: 20,
    });
    expect(plan).toHaveLength(0);
  });
});
