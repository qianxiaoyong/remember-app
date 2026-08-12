import { describe, expect, it } from 'vitest';
import {
  flushLearningCalendarNeedsRefresh,
  markLearningCalendarNeedsRefresh,
  resetLearningCalendarRefreshSignalForTests,
  subscribeLearningCalendarRefresh,
} from './learning-calendar-refresh-signal';

describe('learning-calendar-refresh-signal', () => {
  it('mark 仅设 dirty，flush 时才通知订阅者', () => {
    let count = 0;
    const unsubscribe = subscribeLearningCalendarRefresh(() => {
      count += 1;
    });

    markLearningCalendarNeedsRefresh();
    expect(count).toBe(0);

    flushLearningCalendarNeedsRefresh();
    expect(count).toBe(1);

    flushLearningCalendarNeedsRefresh();
    expect(count).toBe(1);

    markLearningCalendarNeedsRefresh();
    flushLearningCalendarNeedsRefresh();
    expect(count).toBe(2);

    unsubscribe();
    resetLearningCalendarRefreshSignalForTests();
  });

  it('unsubscribe 后不再通知', () => {
    let count = 0;
    const unsubscribe = subscribeLearningCalendarRefresh(() => {
      count += 1;
    });

    unsubscribe();
    markLearningCalendarNeedsRefresh();
    flushLearningCalendarNeedsRefresh();
    expect(count).toBe(0);

    resetLearningCalendarRefreshSignalForTests();
  });
});
