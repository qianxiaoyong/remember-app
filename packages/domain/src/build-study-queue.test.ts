import { describe, expect, it } from 'vitest';
import { buildStudyQueuePlan, countNewCardsForAbsentDays } from './build-study-queue';

describe('buildStudyQueuePlan', () => {
  const cards = ['a', 'b', 'c', 'd', 'e'];

  it('有未完成队列时原样继承', () => {
    const inherited = [
      { knowledgeId: 'b', itemType: 'new' as const },
      { knowledgeId: 'c', itemType: 'review' as const },
    ];
    const plan = buildStudyQueuePlan({
      cardKnowledgeIds: cards,
      learningStatesById: new Map(),
      now: new Date('2026-07-28T12:00:00.000Z'),
      dailyNewCardQuota: 2,
      inheritedPendingItems: inherited,
    });
    expect(plan).toEqual(inherited);
  });

  it('先到期复习再补充新卡', () => {
    const now = new Date('2026-07-28T12:00:00.000Z');
    const plan = buildStudyQueuePlan({
      cardKnowledgeIds: cards,
      learningStatesById: new Map([
        [
          'a',
          {
            easiness: 2.5,
            intervalDays: 1,
            repetitions: 1,
            dueAt: '2026-07-27T12:00:00.000Z',
          },
        ],
      ]),
      now,
      dailyNewCardQuota: 2,
    });
    expect(plan[0]).toEqual({ knowledgeId: 'a', itemType: 'review' });
    expect(plan.slice(1)).toEqual([
      { knowledgeId: 'b', itemType: 'new' },
      { knowledgeId: 'c', itemType: 'new' },
    ]);
  });

  it('缺席天数不累积每日新任务额度', () => {
    expect(countNewCardsForAbsentDays(100, 10, 0)).toBe(10);
    expect(countNewCardsForAbsentDays(100, 10, 5)).toBe(10);
    expect(countNewCardsForAbsentDays(3, 10, 30)).toBe(3);
  });
});
