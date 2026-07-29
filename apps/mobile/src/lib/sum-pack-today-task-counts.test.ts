import { describe, expect, it } from 'vitest';
import { sumPackTodayTaskCounts } from './sum-pack-today-task-counts';

describe('sumPackTodayTaskCounts', () => {
  it('累加各资料包行的今日待复习数', () => {
    expect(sumPackTodayTaskCounts([1, 1, 1])).toBe(3);
  });

  it('空列表返回 0', () => {
    expect(sumPackTodayTaskCounts([])).toBe(0);
  });
});
