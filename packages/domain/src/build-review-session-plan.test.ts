import { describe, expect, it } from 'vitest';
import { buildReviewSessionPlan } from './build-review-session-plan';

function makeDueItems(count: number): { knowledgeId: string; dueAt: string }[] {
  return Array.from({ length: count }, (_, index) => ({
    knowledgeId: `word-${String(index + 1).padStart(2, '0')}`,
    dueAt: '2026-08-06T00:00:00.000+08:00',
  }));
}

describe('buildReviewSessionPlan', () => {
  const now = new Date('2026-08-06T15:00:00+08:00');
  const timeZone = 'Asia/Shanghai';

  it('limits session size by remaining daily quota', () => {
    const plan = buildReviewSessionPlan({
      dueItems: makeDueItems(10),
      dailyReviewLimit: 20,
      todayReviewCompletedCount: 18,
      now,
      timeZone,
    });

    expect(plan.sessionKnowledgeIds).toHaveLength(2);
    expect(plan.remainingDueCount).toBe(8);
  });

  it('returns empty session when quota is zero', () => {
    const plan = buildReviewSessionPlan({
      dueItems: makeDueItems(5),
      dailyReviewLimit: 20,
      todayReviewCompletedCount: 20,
      now,
      timeZone,
    });

    expect(plan.sessionKnowledgeIds).toEqual([]);
    expect(plan.remainingDueCount).toBe(5);
  });

  it('sorts by dueAt then knowledgeId without changing dueAt values', () => {
    const dueItems = [
      { knowledgeId: 'word-b', dueAt: '2026-08-06T08:00:00.000+08:00' },
      { knowledgeId: 'word-a', dueAt: '2026-08-06T08:00:00.000+08:00' },
      { knowledgeId: 'word-c', dueAt: '2026-08-05T00:00:00.000+08:00' },
    ];

    const plan = buildReviewSessionPlan({
      dueItems,
      dailyReviewLimit: 20,
      todayReviewCompletedCount: 0,
      now,
      timeZone,
    });

    expect(plan.sessionKnowledgeIds).toEqual(['word-c', 'word-a', 'word-b']);
    expect(dueItems.map((item) => item.dueAt)).toEqual([
      '2026-08-06T08:00:00.000+08:00',
      '2026-08-06T08:00:00.000+08:00',
      '2026-08-05T00:00:00.000+08:00',
    ]);
  });

  it('excludes items due after today end', () => {
    const plan = buildReviewSessionPlan({
      dueItems: [
        { knowledgeId: 'due-today', dueAt: '2026-08-06T23:59:00.000+08:00' },
        { knowledgeId: 'due-tomorrow', dueAt: '2026-08-07T00:00:00.000+08:00' },
      ],
      dailyReviewLimit: 20,
      todayReviewCompletedCount: 0,
      now,
      timeZone,
    });

    expect(plan.sessionKnowledgeIds).toEqual(['due-today']);
    expect(plan.remainingDueCount).toBe(0);
  });
});
